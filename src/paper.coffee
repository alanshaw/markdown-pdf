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

    @options = _.extend {}, defaults, options

module.exports = Paper
