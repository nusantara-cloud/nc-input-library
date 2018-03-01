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
          orderType: 'asc',
          orderBy: null,
          getURL: '',
          onRowClicked: null,
          numColumn: 4
        }
      },
      buttons: {
        // i.e.: {desc: 'Add', postTo: 'addSubject'},
        ui: [],
        conf: {
          networkTimeout: 2000
        }
      }
    }, conf)
  }

  reloadTable (clearNotif) {
    // Initialize table with given URL
    this._view.startProgressbar()
    var getURL
    if (typeof this._conf.table.conf.getURL === 'function') {
      getURL = this._conf.table.conf.getURL()
    } else {
      getURL = this._conf.table.conf.getURL
    }
    this._model.getRequest(getURL, this._conf.buttons.conf).then(resp => {
      log.debug(TAG, 'reloadTable(): getRequest.resp=' + JSON.stringify(resp))
      if (resp.status) {
        this._view.setRows(resp.data)
        if (clearNotif) {
          this._view.clearNotif()
        }
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

  clearNotif () {
    this._view.clearNotif()
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
      var postURL
      if (typeof postTo === 'function') {
        postURL = postTo()
      } else if (typeof postTo === 'string') {
        postURL = postTo
      } else {
        throw new Error('postTo paramater is not defined correctly. It should be function/string')
      }

      this._model.submitData(postURL, data, this._conf.buttons.conf).then(resp => {
        if (resp.status) {
          if (!resp.successMessage) {
            this._view.setNotif('Success!')
          } else {
            this._view.setNotif(resp.successMessage)
          }
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
        this._view.setNotif('Failed: ' + err.message || 'Internal Error...', true)
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
