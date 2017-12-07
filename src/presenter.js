var log = require('../lib/logger')

const TAG = 'Presenter'
class Presenter {
  constructor (model, view, conf) {
    this._model = model
    this._view = view
    this._conf = Object.assign({
      design: {
        title: 'Subject Header'
      },
      table: {
        // i.e.: {id: 'subject', desc: 'Subject', dataTable: true, input: 'text', disabled: false},
        ui: [],
        conf: {
          orderBy: null,
          getURL: '',
          onRowClicked: null
        }
      },
      buttons: {
        // i.e.: {desc: 'Add', postTo: 'addSubject'},
        ui: []
      }
    }, conf)
  }

  reloadTable () {
    // Initialize table with given URL
    this._view.startProgressbar()
    this._model.getRequest(this._conf.table.conf.getURL()).then(resp => {
      log.debug(TAG, 'reloadTable(): getRequest.resp=' + JSON.stringify(resp))
      if (resp.status) {
        this._view.setRows(resp.data)
        this._view.clearNotif()
      } else {
        log.error(TAG, 'Failed to fetch data! resp=' + JSON.stringify(resp))
        this._view.setNotif('Failed to fetch data: ' + resp.errMessage, true)
      }
    }).catch(err => {
      log.error(TAG, err)
      this._view.setNotif('Failed to reload table: ' + err.message, true)
    }).then(() => {
      this._view.finishProgressbar()
    })
  }

  initialize () {
    // Initialize the view
    this._view.initialize(this._conf)

    // Initialize the table with data
    // this.reloadTable()

    // Hook buttons to POST action
    this._view.setOnButtonClickedListener((id, postTo, event) => {
      const data = this._view.getInputFormData()
      log.debug(TAG, 'presenter.onButtonClickedListener(): data=' + JSON.stringify(data))
      // While POST request is happening, give some UI feedback
      this._view.startProgressbar()
      this._view.disableButtons()
      this._model.submitData(postTo(), data).then(resp => {
        if (resp.status) {
          this._view.setNotif('Success!')
          this._view.clearInputHighlight()
          // Refresh the table
          this.reloadTable()
        } else {
          log.error(TAG, 'Failed to submit data! errCode=' + resp.errCode + ' errMessage=' + resp.errMessage)
          this._view.setNotif(`Failed: ${resp.errMessage}`, true)
          // Highlight error on inputs
          if (resp.errData && resp.errData.errorFields) {
            this._view.setInputHighlight(resp.errData.errorFields)
          }
        }
      }).catch(err => {
        log.error(TAG, err)
        this._view.setNotif(err.message || 'Internal Error...', true)
      }).then(() => {
        this._view.finishProgressbar()
        this._view.enableButtons()
      })
    })

    // Set row listener
    this._view.setOnRowClickedListener((data) => {
      // log.debug(`data=${JSON.stringify(data)}`)
      this._conf.table.conf.onRowClicked(data)
      this._view.setInputFormData(data)
    })
  }
}

module.exports = Presenter
