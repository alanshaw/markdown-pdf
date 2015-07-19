class TmpFile
  constructor: (dependencies={}) ->
    @fs = dependencies.fs ? require 'fs'
    @tmp = dependencies.tmp ? require 'tmp'

  clean: =>
    @tmp.setGracefulCleanup()
    
  open: (postfix, callback=->)=>
    @tmp.file {postfix: postfix}, (error, tmpFile, tmpFileFd) =>
      return callback error if error?
      @fs.close tmpFileFd
      callback null, tmpFile

module.exports = TmpFile
