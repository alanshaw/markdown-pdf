path = require 'path'
extend = require 'extend'
Options = require './options'
TmpFile = require './tmp-file'
Runner = require './runner'
debug = require('debug')('html5-to-pdf:stream')

class Stream
  constructor: (options={}, dependencies={})->
    @through  = dependencies.through ? require 'through'
    @tmpFile  = dependencies.tmpFile ? new TmpFile
    @streamft = dependencies.streamft ? require 'stream-from-to'
    @duplexer = dependencies.duplexer ? require 'duplexer'
    @fs       = dependencies.fs ? require 'fs'
    @options  = new Options()
    @options.setAll(options)
    debug 'starting stream', @options.getAll()

  afterOpen: (htmlTmpFile, pdfTmpFile) =>
    debug 'afterOpen'
    @options.set 'inputPath', htmlTmpFile
    @options.set 'outputPath', pdfTmpFile
    htmlFileStream = @fs.createWriteStream(htmlTmpFile)
    htmlFileStream.on 'finish', =>
      debug 'on html file stream finish'
      @spawner = new Runner @options.getAll()
      @spawner.start (error) =>
        debug 'done with spawn'
        return @outputStream.emit "error", error if error?
        @fs.createReadStream(pdfTmpFile).pipe(@outputStream)

    @inputStream.pipe(@options.get('preProcessHtml')()).pipe(htmlFileStream)
    @inputStream.resume()

  start: =>
    debug 'starting stream'
    @tmpFile.open '.html', (error, htmlTmpFile) =>
      debug 'opened tmp html', error, htmlTmpFile
      return @outputStream.emit "error", error if error?
      @tmpFile.open '.pdf', (error, pdfTmpFile) =>
        debug 'opened tmp pdf', error, pdfTmpFile
        return @outputStream.emit "error", error if error?
        @afterOpen htmlTmpFile, pdfTmpFile

  create: =>
    debug 'creating stream'
    @inputStream  = @through()
    @outputStream = @through()
    @inputStream.pause()
    @start()
    duplexed = @duplexer @inputStream, @outputStream
    streamToFrom = @streamft => new Stream(@options.getAll()).create()
    return extend duplexed, streamToFrom

module.exports = Stream
