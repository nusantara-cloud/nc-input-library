var $ = require('jquery')
var dt = require('datatables.net')(window, $)
// var dt = null
var moment = require('moment')
// var moment = null

class View {
  constructor (rootElement) {
    this._rootElement = rootElement
  }

  // --------------------------------------------------------------
  // PUBLIC FUNCTIONS
  // --------------------------------------------------------------
  initialize (conf) {
    // console.log(`rootElement=${JSON.stringify(this.rootElement)}`)
    // console.log(`conf=${JSON.stringify(conf)}`)
    const tableConf = conf.table
    const buttonsConf = conf.buttons
    const designConf = conf.design
    this._htmlElements = this._initLayout(this._rootElement, tableConf, designConf)
    // Bootstrap alert
    this._notification = this._htmlElements.notif
    this._initInputForm(this._htmlElements.inputForm, tableConf, buttonsConf)
    this._initTable(this._htmlElements.table, tableConf)
    this._dataTable = this._initDataTable(this._htmlElements.table, tableConf)
  }

  setOnRowClickedListener (fn) {
    // fn(rowData)
    this._onRowClickedListener = fn
  }

  setOnButtonClickedListener (fn) {
    // fn(postTo)
    this._onButtonClicked = fn
  }

  setNotif (text, error = false) {
    this._notification.removeClass('alert-success')
    this._notification.removeClass('alert-danger')
    this._notification.show()
    this._notification.html(text)
    this._notification.addClass(`alert-${error ? 'danger' : 'success'}`)
  }

  getCurrentRow (fn) {
    // fn(rowData)
    // When a row is selected, keep track of the selected row
    // This method then just returns it
    return this._selectedData
  }

  // Serialize input form
  getInputFormData () {
    return this._htmlElements.inputForm.serialize()
  }

  setInputFormData (json) {
    Object.keys(json).forEach(key => {
      this._htmlElements.inputForm.find(`[name=${key}]`).val(json[key])
    })
  }

  // rows: [{name: 'Bugs', type: 'Bunny'}]
  // Invariant, keys has to match one in tableConf
  setRows (rows) {
    rows.reduce((dt, row) => {
      // https://datatables.net/reference/api/row.add()
      return dt.row.add(row)
    }, this._dataTable.clear()).draw()
  }

  addRow (row) {
    this._dataTable.row.add(row).draw()
  }
  // --------------------------------------------------------------

  _initDataTable (tableElement, tableConf) {
    const columns = []
    const orderBy = tableConf.conf.orderBy
    var orderIndex = -1
    for (var i = 0; i < tableConf.ui.length; i++) {
      const colConf = {
        data: tableConf.ui[i].id,
        name: tableConf.ui[i].id // used to refer to this column, instead of using index
      }
      if (tableConf.ui[i].input === 'date') {
        colConf.render = function (data, type, full, meta) {
          return moment(data).utc().format('YYYY-MM-DD hh:mm:ss')
        }
      }

      if (tableConf.ui[i].dataTable === true) {
        columns.push(colConf)
      }
      orderIndex = (orderBy === tableConf.ui[i].id) ? columns.length - 1 : orderIndex
    }

    const dataTable = tableElement.DataTable({
      columns
    })

    var selectedRow = null
    const self = this
    tableElement.find('tbody').on('click', 'tr', function () {
      self._selectedData = dataTable.row(this).data()
      if (selectedRow) {
        selectedRow.removeClass('highlight-dt-row')
      }
      selectedRow = $(this).closest('tr')
      selectedRow.addClass('highlight-dt-row')
      self._onRowClickedListener(self._selectedData)
    })

    return dataTable
  }

  _initInputForm (formElement, tableConf, buttonsConf) {
    var row = $('<div class="row" />')
    formElement.append(row)
    // Inputs
    for (let i = 0; i < tableConf.ui.length; i++) {
      if (tableConf.ui[i].input === 'text') {
        const formGroup = $('<div class="col-md-6 form-group" />')
        row.append(formGroup)
        const label = $('<label/>')
        label.html(tableConf.ui[i].desc)
        formGroup.append(label)
        const input = $(`<input class="form-control input-md" name=${tableConf.ui[i].id} type="text" placeholder="${tableConf.ui[i].placeholder || ''}" ${tableConf.ui[i].disabled ? ' readonly' : ''} />`)
        formGroup.append(input)
      } else if (tableConf.ui[i].input === 'textArea') {
        const formGroup = $('<div class="col-md-6 form-group" />')
        row.append(formGroup)
        const label = $('<label/>')
        label.html(tableConf.ui[i].desc)
        formGroup.append(label)
        const input = $(`<textarea class="form-control input-md" name="${tableConf.ui[i].id}" rows="2" placeholder="${tableConf.ui[i].placeholder || ''}" '/>`)
        formGroup.append(input)
      } else if (tableConf.ui[i].input === 'hidden') {
        const formGroup = $('<div class="col-md-6 form-group" />')
        row.append(formGroup)
        const label = $('<label/>')
        label.html(tableConf.ui[i].desc)
        formGroup.append(label)
        const input = $(`<input class="form-control input-md" name="${tableConf.ui[i].id}" type="hidden"/>`)
        formGroup.append(input)
      }
    }

    // Buttons
    row = $('<div class="row" />')
    for (let i = 0; i < buttonsConf.ui.length; i++) {
      const id = buttonsConf.ui[i].id
      var col = $('<div class="col-md-3" />')
      row.append(col)
      var button = $('<button class="btn btn-default btn-block" type="button">' +
          buttonsConf.ui[i].desc + '</button>')
      button.click(event => this._onButtonClicked && this._onButtonClicked(id, buttonsConf.ui[i].postTo, event))
      col.append(button)
    }
    formElement.append(row)
  }

  _initTable (tableElement, tableConf) {
    // Create and append table head
    var thead = $('<thead />')
    var tr = $('<tr />')
    for (let i = 0; i < tableConf.ui.length; i++) {
      if (tableConf.ui[i].dataTable) {
        var th = $('<th>' + tableConf.ui[i].desc + '</th>')
        tr.append(th)
      }
    }
    thead.append(tr)
    tableElement.append(thead)
  }

  // Initialize HTML layout to place the elemtn
  // (i.e. empty div for inputs, empty div for buttons, and empty table)
  _initLayout (rootElement, tableConf, designConf) {
    const initialized = {}
    // Initialze bootstrap panel
    var panel = $('<div class="panel panel-info" />')
    rootElement.append(panel)
    var panelHeading = $('<div class="panel-heading"/>')
    panel.append(panelHeading)
    var panelTitle = $(`<h3 class="panel-title">${designConf.title || 'Input Form'}</h3>`)
    panelHeading.append(panelTitle)
    var panelBody = $('<div class="panel-body" />')
    panel.append(panelBody)

    // Initialize HTML form used for inputs
    var row = $('<div class="row" />')
    panelBody.append(row)
    var col = $('<div class="col-md-12" />')
    initialized.inputForm = $('<form class="ncInputForm" />')
    row.append(col)
    col.append(initialized.inputForm)

    row = $('<div class="row" />')
    panelBody.append(row)
    col = $('<div class="col-md-12" style="padding: 2%"/>')
    row.append(col)
    initialized.notif = $('<div class="alert alert-success" style="text-align: center; display: none; margin: auto" role="alert"/>')
    col.append(initialized.notif)

    // Iniitialize HTML table used for DataTable
    row = $('<div class="row" />')
    panelBody.append(row)
    col = $('<div class="col-md-12" />')
    initialized.table = $('<table class="custom-table table-stripped table-bordered table-hover" />')
    row.append(col)
    col.append(initialized.table)

    return initialized
  }
}

module.exports = View
