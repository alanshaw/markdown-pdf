var fs = require("fs")
  , path = require("path")
  , through = require("through")
  , CombineStream = require("combine-stream")
  , extend = require("extend")
  , async = require("async")
  , concatStream = require("concat-stream")
  , StringStream = require("string-stream")
  , marked = require("marked")
  , tmp = require("tmp")
  , childProcess = require("child_process")
  , duplexer = require("duplexer")

tmp.setGracefulCleanup()

function markdownpdf (opts) {
  opts = opts || {}
  opts.phantomPath = opts.phantomPath || require("phantomjs").path
  opts.cssPath = path.relative(__dirname + "/../html5bp/", path.resolve(opts.cssPath || __dirname + "/../pdf.css"))
  opts.paperFormat = opts.paperFormat || "A4"
  opts.paperOrientation = opts.paperOrientation || "portrait"
  opts.paperBorder = opts.paperBorder || "1cm"
  opts.renderDelay = opts.renderDelay || 500
  opts.preProcessMd = opts.preProcessMd || through()
  opts.preProcessHtml = opts.preProcessHtml || through()

  var md = ""

  // Argh! marked, why you no stream?
  var mdToHtml = through(
    function write (data) {
      md += data
    },
    function end () {
      var html = marked(md)
      this.queue(html)
      this.queue(null)
    }
  )

  var inputStream = through()
    , outputStream = through()

  // Stop input stream emitting data events until we're ready to read them
  inputStream.pause()

  // Create tmp file to save HTML for phantom to process
  tmp.file({postfix: ".html"}, function (er, tmpHtmlPath, tmpHtmlFd) {
    if (er) return outputStream.emit("error", er)
    fs.close(tmpHtmlFd)

    // Create tmp file to save PDF to
    tmp.file({postfix: ".pdf"}, function (er, tmpPdfPath, tmpPdfFd) {
      if (er) return outputStream.emit("error", er)
      fs.close(tmpPdfFd)

      var htmlToTmpHtmlFile = fs.createWriteStream(tmpHtmlPath)

      htmlToTmpHtmlFile.on("finish", function () {
        // Invoke phantom to generate the PDF
        var childArgs = [
            path.join(__dirname, "..", "lib-phantom", "markdown-pdf.js")
          , tmpHtmlPath
          , tmpPdfPath
          , opts.cssPath
          , opts.paperFormat
          , opts.paperOrientation
          , opts.paperBorder
          , opts.renderDelay
        ]

        childProcess.execFile(opts.phantomPath, childArgs, function(er, stdout, stderr) {
          //if (stdout) console.log(stdout)
          //if (stderr) console.error(stderr)
          if (er) return inputStream.emit("error", er)
          fs.createReadStream(tmpPdfPath).pipe(outputStream)
        })
      })

      // Setup the pipeline
      inputStream.pipe(opts.preProcessMd).pipe(mdToHtml).pipe(opts.preProcessHtml).pipe(htmlToTmpHtmlFile)
      inputStream.resume()
    })
  })

  return extend(duplexer(inputStream, outputStream), createFromInterface(opts))
}

function createFromInterface (opts) {
  var exports = {}

  exports.from = function fromPath (paths) {
    paths = Array.isArray(paths) ? paths : [paths]

    var srcStreams = paths.map(function (p) {
      return fs.createReadStream(p)
    })

    return createToInterface(srcStreams, opts)
  }

  exports.from.path = exports.from
  exports.from.string = function fromString (strings) {
    strings = Array.isArray(strings) ? strings : [strings]

    var srcStreams = strings.map(function (s) {
      return new StringStream(s)
    })

    return createToInterface(srcStreams, opts)
  }

  exports.concat = {}
  exports.concat.from = function concatFromPath (paths) {
    paths = Array.isArray(paths) ? paths : [paths]

    var srcStream = new CombineStream(paths.map(function (p) {
      return fs.createReadStream(p)
    }))

    return createToInterface([srcStream], opts)
  }

  exports.concat.from.path = exports.concat.from
  exports.concat.from.string = function concatFromString (strings) {
    strings = Array.isArray(strings) ? strings : [strings]
    return createToInterface([new StringStream(strings.join(""))], opts)
  }

  return exports
}

function createToInterface (srcStreams, opts) {
  var exports = {}

  exports.to = function toPath (paths, cb) {
    paths = Array.isArray(paths) ? paths : [paths]

    var tasks = paths.map(function (p, i) {
      return function (cb) {
        var ws = fs.createWriteStream(p)

        ws.on("finish", function () {
          cb()
        })

        srcStreams[i].pipe(markdownpdf(opts)).pipe(ws)
      }
    })

    async.parallel(tasks, cb)
  }

  exports.to.path = exports.to
  exports.to.buffer = function toBuffer (cb) {

    var tasks = srcStreams.map(function (ss) {
      return function (cb) {
        ss.pipe(markdownpdf(opts)).pipe(concatStream(function (buf) { cb(null, buf) }))
      }
    })

    async.parallel(tasks, cb)
  }
  exports.to.string = function toString (opts, cb) {
    if (!cb) {
      cb = opts
      opts = {}
    }

    exports.to.buffer(function (er, bufs) {
      if (er) return cb(er)

      var strs = bufs.map(function (buf) {
        return buf.toString(opts.encoding, opts.start, opts.end)
      })

      cb(null, strs)
    })
  }

  return exports
}

module.exports = markdownpdf