var _ = require('lodash')

var log = require('../lib/logger')

const TAG = 'Presenter'
const DEFAULT_NETWORK_TIMEOUT = 2000
class Presenter {
  constructor (model, view, conf) {
    this._model = model
    this._view = view
    // Note that Object assign only does shallow copy, not a deep one!
    this._conf = Object.assign({
      design: {
        title: 'Subject Header'
      },
      table: {
        // i.e.: {id: 'subject', desc: 'Subject', dataTable: true, input: 'text', disabled: false},
        ui: [],
        conf: {
          order: [['date', 'desc'], ['lastModified', 'desc']],
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

    // Default value for networkTimeout
    this._networkTimeout = (this._conf.buttons && this._conf.buttons.conf && this._conf.buttons.conf.networkTimeout) || DEFAULT_NETWORK_TIMEOUT
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
    this._model.getRequest(getURL, this._networkTimeout).then(resp => {
      log.debug(TAG, 'reloadTable(): getRequest.resp=' + JSON.stringify(resp))
      if (typeof resp === 'object' && 'status' in resp) {
        if (resp.status) {
          this._view.setRows(resp.data)
          if (clearNotif) {
            this._view.clearNotif()
          }
        } else {
          log.error(TAG, 'Failed to fetch data! resp=' + JSON.stringify(resp))
          this._view.setNotif('Failed to fetch data: ' + resp.errMessage, true)
        }
      } else {
        log.error(TAG, 'Server doesn\'t return expected response! Has your session timeout? resp=' + JSON.stringify(resp))
        this._view.setNotif('Server doesn\'t return expected response! Has your session timeout?', true)
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

  setFirstCustomView (htmlElement) {
    this._view.setFirstCustomView(htmlElement)
  }

  setSecondCustomView (htmlElement) {
    this._view.setSecondCustomView(htmlElement)
  }

  getRow (element) {
    return this._dataTable.row(element)
  }

  initialize () {
    // Initialize the view
    this._dataTable = this._view.initialize(this._conf)

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

      this._model.submitData(postURL, data, this._networkTimeout).then(resp => {
        if (this._conf.buttons && this._conf.buttons.onPostFinished) {
          this._conf.buttons.onPostFinished(id, true, resp)
        }
        if (typeof resp === 'object' && 'status' in resp) {
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
            log.error(TAG, 'Failed to submit data! resp=' + JSON.stringify(resp))
            this._view.setNotif(`Failed: ${resp.errMessage}`, true)
            // Highlight error on inputs
            if (resp.errData && resp.errData.errorFields) {
              this._view.setInputHighlight(resp.errData.errorFields)
            }
          }
        } else {
        log.error(TAG, 'Server doesn\'t return expected response! Has your session timeout? resp=' + JSON.stringify(resp))
        this._view.setNotif('Server doesn\'t return expected response! Has your session timeout?', true)
        }
      }).catch(err => {
        log.error(TAG, err)
        if (this._conf.buttons && this._conf.buttons.onPostFinished) {
          this._conf.buttons.onPostFinished(id, false, err)
        }
        this._view.setNotif('Failed: ' + err.message || 'Internal Error...', true)
      }).then(() => {
        this._view.finishProgressbar()
        this._view.enableButtons()
      })
    })

    // Set row listener
    this._view.setOnRowClickedListener((data) => {
      log.debug(`data=${JSON.stringify(data)}`)
      if (this._conf.table.conf.onRowClicked) {
        this._conf.table.conf.onRowClicked(data)
      }
      this._view.setInputFormData(data)
    })

    this._view.setOnTableDrawnListener(_.debounce((appliedRows) => {
      // console.log('appliedRows=' + JSON.stringify(appliedRows[0]))
      const listener = this._conf.table.conf.onTableDrawn
      if (listener) {
        listener(appliedRows)
      }
    }, 100))
  }
}

module.exports = Presenter
