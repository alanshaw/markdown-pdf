_         = require 'lodash'
class Phantom
  constructor: (dependencies={}) ->
    @page = dependencies.page || require 'webpage'
    @fs = dependencies.fs || require 'fs'
    @setTemplatePath()
    @setCssPaths()
    @setRenderdelay()
    @setHTMLContent()
    @setPaperSize()
    @setOutputPath()
    @setInputPath()

  setTemplatePath: (@templatePath='') =>
  setCssPaths: (@cssPaths=[]) =>
  setRenderdelay: (@renderDelay=500) =>
  setHTMLContent: (@htmlContent='') =>
  setOutputPath: (@outputPath='') =>
  setInputPath: (@inputPath='') =>
  setPaperSize: (@paperObject={}) =>
    @page.paperSize = @paperObject

  start: (callback=->)=>
    @open (error) =>
      return console.error error if error?
      @addThingsToPage =>
        @render callback

  render: (callback=->) =>
    done = =>
      @page.render @outputPath
      @page.close()
      phantom.exit 0
    _.delay done, @renderDelay

  open: (callback=->) =>
    @page.open @templatePath, (status) =>
      if status == 'fail'
        @page.close()
        phantom.exit 1
        return callback new Error('Failed to launch renderer')
      callback()

  addThingsToPage: (callback=->) =>
    @addCSSLinksToPage =>
      @addHTMLToPage callback

  addCSSLinksToPage: (callback=->) =>
    @page.evaluate (cssPaths) =>
      head = document.querySelector "head"
      _.each cssPaths, (cssPath) =>
        css = document.createElement "link"
        css.rel = "stylesheet"
        css.href = cssPath
        head.appendChild css
      callback()
    , @cssPaths

  addHTMLToPage: (callback=->)=>
    @page.evaluate (html) =>
      body = document.querySelector "body"
      body.removeChild document.querySelector "p"

      container = document.createElement "div"
      container.innerHTML = html

      body.appendChild container
      callback()
    , @fs.read @inputPath

module.exports = Phantom
