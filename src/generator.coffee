_             = require 'lodash'
path          = require 'path'
fs            = require 'fs'
express       = require 'express'
enableDestroy = require 'server-destroy'
Nightmare     = require 'nightmare'
debug         = require('debug')('html5-to-pdf:nightmare')

class Generator
  constructor: (@options) ->
    @nightmare = new Nightmare {}

  build: (callback) =>
    @startServer (error, url) =>
      return callback error if error?
      @nightmare.goto url
      @includeAssets()
      @nightmare.evaluate @addBody, @options.get('inputBody')?.toString()
      @nightmare.wait @options.get('renderDelay')
      @nightmare.pdf @options.get('outputPath'), @options.get('options')
      @nightmare.end()
        .then =>
          @_server?.destroy?()
          callback null
        .catch (error) =>
          @_server?.destroy?()
          callback error

  includeAssets: =>
    _.each @options.get('include'), ({ type, filePath }={}) =>
      @nightmare.inject type, filePath
      return

  addBody: (html) ->
    body = document.querySelector "body"
    body.removeChild document.querySelector "p"
    container = document.createElement "div"
    container.innerHTML = html
    body.appendChild container
    return document

  startServer: (callback) =>
    return callback null, @options.get('templateUrl') if @options.get('templateUrl')?
    app = express()
    app.use express.static(@options.get('templatePath'))
    @_server = app.listen undefined, (error) =>
      return callback error if error?
      enableDestroy @_server
      callback null, "http://localhost:#{@_server.address().port}"

module.exports = Generator
