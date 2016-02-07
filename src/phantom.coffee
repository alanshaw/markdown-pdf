_         = require 'lodash'
path      = require 'path'
debug     = require('debug')('html5-to-pdf:phantom')

class Phantom
  constructor: (@options, dependencies={}) ->
    @fs        = dependencies.fs ? require 'fs'
    @phantom   = dependencies.phantom ? require 'phantom'
    @setTemplatePath @options.get 'template'
    @setCssPaths([@options.get('cssPath'), @options.get('highlightCssPath')])
    @setRenderdelay @options.get 'renderDelay'
    @setOutputPath @options.get 'outputPath'
    @setInputPath @options.get 'inputPath'
    @setRunningsPath @options.get 'runningsPath'

  setRunningsPath: (@runningsPath='') =>
  setTemplatePath: (template='') =>
    @templatePath = path.resolve "#{__dirname}/../templates/#{template}/index.html"
  setCssPaths: (@cssPaths=[]) =>
  setRenderdelay: (@renderDelay=500) =>
  setOutputPath: (@outputPath='') =>
  setInputPath: (@inputPath='') =>
  setPaperSize: (@paperObject={}, callback=->) =>
    @page.set 'paperSize', @paperObject, callback
    # callback()

  start: (callback=->)=>
    debug 'starting'
    @open (error) =>
      debug 'opened'
      return console.error error if error?
      @addThingsToPage =>
        @render callback

  render: (callback=->) =>
    debug 'rendering'
    done = =>
      debug 'output path', @outputPath
      @page.render @outputPath, {}, =>
        debug 'after render'
        @page.close()
        @ph.exit 0
        callback()
    _.delay done, @renderDelay

  open: (callback=->) =>
    debug 'open'
    createPhantom = (@ph) =>
      @ph.createPage (@page) =>
        @setPaperSize @options.getPaper(), =>
          @page.open @templatePath, (status) =>
            if status == 'fail'
              @page.close()
              @ph.exit 1
              return callback new Error('Failed to launch renderer')
            callback()

    binary = @options.get 'phantomPath'
    binPath = path.dirname binary
    port = @options.get 'phantomPort'
    hostname = @options.get 'phantomHost'
    debug 'phantom path', binPath
    phantomOptions =
      path: binPath
      binary: binary
      hostname: hostname
      port: port
      dnodeOpts: weak: false
    @phantom.create createPhantom, phantomOptions

  addThingsToPage: (callback=->)=>
    @addCSSLinksToPage =>
      @addHTMLToPage callback

  addCSSLinksToPage: (callback=->) =>
    debug 'adding css links', @cssPaths
    @page.evaluate (cssPaths) ->
      head = document.querySelector "head"
      cssPaths.forEach (cssPath) =>
        css = document.createElement "link"
        css.rel = "stylesheet"
        css.href = "file://#{cssPath}"
        head.appendChild css
    , callback, @cssPaths

  addHTMLToPage: (callback=->) =>
    file = @fs.readFileSync @inputPath, 'utf8'
    debug 'adding html to page', @inputPath
    debug 'html to add is: ', file
    @page.evaluate (html) ->
      body = document.querySelector "body"
      body.removeChild document.querySelector "p"

      container = document.createElement "div"
      container.innerHTML = html
      body.appendChild container
    , callback, file

module.exports = Phantom
