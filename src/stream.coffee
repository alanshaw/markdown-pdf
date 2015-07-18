_  = require 'lodash'
path = require 'path'
debug = require('debug')('html5-to-pdf:stream')
through = require 'through'

class Stream
  constructor: (options={})->
    defaults =
      phantomPath: require('phantomjs').path
      runningsPath: "runnings.js"
      cssPath: '../pdf.css'
      highlightCssPath: '../highlight.css'
      preProcessHtml: -> through()
    @options = _.defaults options, defaults
    @options.runningsPath = @convertPath @options.runningsPath
    @options.cssPath = @convertCWDPath @options.cssPath
    @options.highlightCssPath = @convertCWDPath @options.highlightCssPath

  convertPath: (filePath) =>
    path.resolve __dirname + '/' + filePath

  convertCWDPath: (filePath) =>
    path.resolve process.cwd(), __dirname + '/' + filePath


module.exports = Stream
