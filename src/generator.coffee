_             = require 'lodash'
express       = require 'express'
enableDestroy = require 'server-destroy'
Nightmare     = require 'nightmare'
debug         = require('debug')('html5-to-pdf:nightmare')

class Generator
  constructor: (@options) ->
    @nightmare = new Nightmare {}

  build: (callback) =>
    @startServer (error, url) =>
      return callback error, null if error?
      @nightmare.goto url
      @includeAssets()
      @nightmare.evaluate @addBody, @options.get('inputBody')?.toString()
      @nightmare.wait @options.get('renderDelay')
      outputPath = @options.get('outputPath')
      options    = @options.get('options')
      debug {outputPath, options}
      @nightmare.pdf options unless outputPath?
      @nightmare.pdf outputPath, options if outputPath?
      @nightmare.end()
        .then @doneSuccess(callback)
        .catch @doneError(callback)

  doneSuccess: (callback) =>
    return (buf) =>
      @_server?.destroy?()
      callback null, buf

  doneError: (callback) =>
    return (error) =>
      @_server?.destroy?()
      callback error, null

  includeAssets: =>
    _.each @options.get('include'), ({ type, filePath }={}) =>
      @nightmare.inject type, filePath
      return

  addBody: (html) ->
    try
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
    @_server = app.listen 0, (error) =>
      return callback error, null if error?
      enableDestroy @_server
      callback null, "http://localhost:#{@_server.address().port}"

module.exports = Generator
