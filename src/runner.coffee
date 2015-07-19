debug   = require('debug')('html5-to-pdf:spawner')
path    = require 'path'
Phantom = require './phantom'
Options = require './options'

class Runner
  constructor: (@args={})->

  start: (callback=->) =>
    debug 'starting runner'
    options = new Options()
    options.setAll(@args)
    phantom = new Phantom(options)
    phantom.start (error) =>
      debug 'end phantom start', error
      callback error

module.exports = Runner
