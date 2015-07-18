_    = require 'lodash'

class Paper
  constructor: () ->

  setOptions: (options={}) =>
    defaults =
      paperFormat: 'A4'
      paperOrientation: 'portrait'
      paperBorder: '1cm'
      renderDelay: 500
      template: 'html5bp'

    keys = ['paperFormat', 'paperOrientation', 'paperBorder', 'renderDelay', 'template']
    @options = _.pick _.defaults(options, defaults), keys

module.exports = Paper
