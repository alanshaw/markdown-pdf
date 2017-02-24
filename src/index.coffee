Options   = require './options'
Generator = require './generator'

class HTMLToPDF
  constructor: (@args={})->
    @options = new Options @args

  build: (callback) =>
    generator = new Generator @options
    generator.build callback

module.exports = HTMLToPDF
