_       = require 'lodash'
path    = require 'path'
through = require 'through'

class Options
  constructor: () ->

  get: => @options

  set: (options={}) =>
    defaults =
      paperFormat: 'A4'
      paperOrientation: 'portrait'
      paperBorder: '1cm'
      renderDelay: 500
      template: 'html5bp'
      phantomPath: require('phantomjs').path
      runningsPath: "runnings.js"
      cssPath: '../pdf.css'
      highlightCssPath: '../highlight.css'
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
