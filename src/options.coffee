_       = require 'lodash'
path    = require 'path'
through = require 'through'
phantom = require 'phantomjs'

class Options
  constructor: () -> @setAll()
  set: (key, value) => @options[key] = value
  get: (key) => @options[key]
  getAll: => @options
  getPaper: =>
    object =
      format: @options.paperFormat
      orientation: @options.paperOrientation
      margin: @options.paperBorder
    object
  setAll: (options={}) =>
    defaults =
      paperFormat: 'A4'
      paperOrientation: 'portrait'
      paperBorder: '1cm'
      renderDelay: 500
      template: 'html5bp'
      phantomPath: phantom.path
      runningsPath: "runnings.js"
      cssPath: '../templates/pdf.css'
      highlightCssPath: '../templates/highlight.css'
      inputPath: ''
      outputPath: ''
      preProcessHtml: -> through()

    @options = _.defaults(options, defaults)
    @options.runningsPath = @convertPath @options.runningsPath
    @options.cssPath = @convertCWDPath @options.cssPath
    @options.highlightCssPath = @convertCWDPath @options.highlightCssPath

  convertPath: (filePath) =>
    path.resolve __dirname + '/' + filePath

  convertCWDPath: (filePath) =>
    path.resolve process.cwd(), __dirname + '/' + filePath

module.exports = Options
