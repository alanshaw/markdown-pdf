debug = require('debug')('html5-to-pdf:spawner')

class Spawner
  constructor: (@file, @args={}, dependencies={})->
    @childProcess = dependencies.childProcess ? require 'child_process'

  start: (callback=->) =>
    @childProcess.execFile @file, @args, (error, stdout, stderr) =>
      return callback error if error?
      debug 'stdout', stdout
      debug 'stderr', stderr
      callback()

module.exports = Spawner
