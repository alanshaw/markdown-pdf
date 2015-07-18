debug = require('debug')('html5-to-pdf:spawner')

class Spawner
  constructor: (@args={}, dependencies={})->
    @childProcess = dependencies.childProcess ? require 'child_process'

  start: (callback=->) =>
    path = @args.phantomPath
    delete @args.phantomPath
    @childProcess.execFile path, [JSON.stringify(@args)], (error, stdout, stderr) =>
      return callback error if error?
      debug 'stdout', stdout
      debug 'stderr', stderr
      callback()

module.exports = Spawner
