_  = require 'lodash'
path = require 'path'
debug = require('debug')('html5-to-pdf:stream')
extend = require 'extend'
Options = require './options'
TmpFile = require './tmp-file'
Spawner = require './spawner'

class Stream
  constructor: (options={}, dependencies={})->
    @through = dependencies.through ? require 'through'
    @tmpFile = dependencies.tmpFile ? new TmpFile
    @streamft = dependencies.streamft ? require 'stream-from-to'
    @duplexer = dependencies.duplexer ? require 'duplexer'
    @fs = dependencies.fs ? require 'fs'
    @options = new Options()
    @options.set(options)

  afterOpen: =>
    htmlFileStream = @fs.createWriteStream(htmlTmpFile)
    htmlFileStream.on 'finish', =>
      @spawner = new Spawner @options.get()
      @spawner.start (error) =>
        return @outputStream.emit "error", error if error?
        @fs.createReadStream(pdfTmpFile).pipe(@outputStream)
    
    @inputStream.pipe(@options.get().preProcessHtml()).pipe(htmlFileStream)
    @inputStream.resume()

  start: =>
    @tmpFile.open '.html', (error, htmlTmpFile) =>
      return @outputStream.emit "error", error if error?
      @tmpFile.open '.pdf', (error, pdfTmpFile) =>
        return @outputStream.emit "error", error if error?
          @afterOpen()

  create: =>
    @inputStream = @through()
    @outputStream = @through()
    @inputStream.pause()
    @start()
    duplexed = @duplexer @inputStream, @outputStream
    streamToFrom = @streamft => new Stream(@options).create()
    return extend duplexed, streamToFrom

module.exports = Stream
