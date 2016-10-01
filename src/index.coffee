Options   = require './options'
Generator = require './generator'
debug     = require('debug')('html5-to-pdf:runner')

class HTMLToPDF
  constructor: (@args={})->
    @options = new Options @args

  build: (callback) =>
    generator = new Generator @options
    generator.build callback

module.exports = HTMLToPDF
