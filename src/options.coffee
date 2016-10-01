_       = require 'lodash'
fs      = require 'fs-extra'
path    = require 'path'
debug   = require('debug')('html5-to-pdf:options')

class Options
  constructor: (options) ->
    debug 'pre-options', options
    @_set options
    debug 'post-options', @options

  set: (key, value) =>
    return _.set @options, key, value

  get: (key) =>
    return _.get @options, key

  _set: (options={}) =>
    unless options.inputPath? or options.inputBody?
      throw new Error 'Missing inputPath or inputBody'
    throw new Error 'Missing outputPath' unless options.outputPath?
    defaults =
      options: {}
      renderDelay: 0
      template: 'html5bp'

    @options = _.defaults defaults, options

    unless @options.templatePath?
      @options.templatePath = @templatePath @options.template
    @options.inputPath = @convertPath @options.inputPath unless @options.inputBody?
    @options.outputPath = @convertPath @options.outputPath
    @options.inputBody ?= fs.readFileSync(@options.inputPath)

    @options.include = _.map @options.include, ({ type, filePath }) =>
      throw new Error 'Invalid include item, must be type css or js' unless type in ['css', 'js']
      return {
        type,
        filePath: @convertPath(filePath)
      }

    @options.include.push {
      filePath: @templatePath('pdf.css')
      type: 'css'
    }
    @options.include.push {
      filePath: @templatePath('highlight.css')
      type: 'css'
    }

  templatePath: (filePath) =>
    return path.resolve path.join(__dirname, '../', 'templates', filePath)

  convertPath: (filePath) =>
    debug 'convertPath', filePath
    return filePath if path.isAbsolute filePath
    return path.resolve process.cwd(), filePath

module.exports = Options
