var fs = require("fs")
  , path = require("path")
  , through = require("through2")
  , extend = require("extend")
  , marked = require("marked")
  , pygments = require('pygmentize-bundled')
  , tmp = require("tmp")
  , childProcess = require("child_process")
  , duplexer = require("duplexer")
  , streamft = require("stream-from-to")

tmp.setGracefulCleanup()

function markdownpdf (opts) {
  opts = opts || {}
  opts.phantomPath = opts.phantomPath || require("phantomjs").path
  opts.runningsPath = opts.runningsPath ? path.resolve(opts.runningsPath) : path.join(__dirname, "runnings.js")
  opts.cssPath = opts.cssPath ? path.resolve(opts.cssPath) : path.join(__dirname, "..", "pdf.css")
  opts.highlightCssPath = opts.highlightCssPath ? path.resolve(opts.highlightCssPath) : path.join(__dirname, "..", "highlight.css")
  opts.paperFormat = opts.paperFormat || "A4"
  opts.paperOrientation = opts.paperOrientation || "portrait"
  opts.paperBorder = opts.paperBorder || "1cm"
  opts.renderDelay = opts.renderDelay || 500
  opts.preProcessMd = opts.preProcessMd || function () { return through() }
  opts.preProcessHtml = opts.preProcessHtml || function () { return through() }

  var md = ""

  // Argh! marked, why you no stream?
  var mdToHtml = through(
    function transform (data, enc, cb) {
      md += data
      cb()
    },
    function flush (cb) {
      var self = this

      // set options for marked
      var markedOptions = {
        highlight: function (code, lang, cb) {
          pygments({lang: lang, format: "html"}, code, function (er, result) {
            cb(null, result ? result.toString() : code)
          })
        }
      }

      marked(md, markedOptions, function (er, html) {
        self.push(html)
        self.push(null)
        cb()
      })
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
          , opts.runningsPath
          , opts.cssPath
          , opts.highlightCssPath
          , opts.paperFormat
          , opts.paperOrientation
          , opts.paperBorder
          , opts.renderDelay
        ]

        childProcess.execFile(opts.phantomPath, childArgs, function(er, stdout, stderr) {
          //if (stdout) console.log(stdout)
          //if (stderr) console.error(stderr)
          if (er) return outputStream.emit("error", er)
          fs.createReadStream(tmpPdfPath).pipe(outputStream)
        })
      })

      // Setup the pipeline
      inputStream.pipe(opts.preProcessMd()).pipe(mdToHtml).pipe(opts.preProcessHtml()).pipe(htmlToTmpHtmlFile)
      inputStream.resume()
    })
  })

  return extend(
    duplexer(inputStream, outputStream),
    streamft(function () {
      return markdownpdf(opts)
    })
  )
}

module.exports = markdownpdf