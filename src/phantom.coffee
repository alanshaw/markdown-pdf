class Phantom
  constructor: (dependencies={}) ->
    @page = dependencies.page || require 'webpage'

  setTemplatePath: (@templatePath='') =>

  open: (callback=->) =>
    @page.open '/path/to/template.html', callback

module.exports = Phantom
