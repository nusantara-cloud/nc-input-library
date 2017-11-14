// var path = require('path')
var $ = require('jquery')

var Presenter = require('./src/presenter.js')
var Model = require('./src/model.js')
var View = require('./src/view.js')
var log = require('./lib/logger')
log.setLogLevel('debug')

$.fn.NCInputLibrary = function (conf) {
  const rootId = $(this)
  const view = new View(rootId)
  const model = new Model()
  const presenter = new Presenter(model, view, conf)
  // Start everything!
  presenter.initialize()
  return {
    reloadTable: presenter.reloadTable.bind(presenter)
  }
}
