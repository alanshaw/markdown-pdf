var fs = require("fs")
  , path = require("path")
  , childProcess = require("child_process")
  , through = require("through2")
  , extend = require("extend")
  , Remarkable = require("remarkable")
  , hljs = require("highlight.js")
  , tmp = require("tmp")
  , duplexer = require("duplexer")
  , streamft = require("stream-from-to")

tmp.setGracefulCleanup()

function markdownpdf (opts) {
  opts = opts || {}
  opts.cwd = opts.cwd ? path.resolve(opts.cwd) : process.cwd()
  opts.phantomPath = opts.phantomPath || require("phantomjs").path
  opts.runningsPath = opts.runningsPath ? path.resolve(opts.runningsPath) : path.join(__dirname, "runnings.js")
  opts.cssPath = opts.cssPath ? path.resolve(opts.cssPath) : path.join(__dirname, "css", "pdf.css")
  opts.highlightCssPath = opts.highlightCssPath ? path.resolve(opts.highlightCssPath) : path.join(__dirname, "css", "highlight.css")
  opts.paperFormat = opts.paperFormat || "A4"
  opts.paperOrientation = opts.paperOrientation || "portrait"
  opts.paperBorder = opts.paperBorder || "1cm"
  opts.renderDelay = opts.renderDelay == null ? 0 : opts.renderDelay
  opts.loadTimeout = opts.loadTimeout == null ? 10000 : opts.loadTimeout
  opts.preProcessMd = opts.preProcessMd || function () { return through() }
  opts.preProcessHtml = opts.preProcessHtml || function () { return through() }
  opts.remarkable = opts.remarkable || {}
  opts.remarkable.plugins = opts.remarkable.plugins || []

  var md = ""

  var mdToHtml = through(
    function transform (chunk, enc, cb) {
      md += chunk
      cb()
    },
    function flush (cb) {
      var self = this

      var mdParser = new Remarkable(extend({
        highlight: function (str, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(lang, str).value
            } catch (er) {}
          }

          try {
            return hljs.highlightAuto(str).value
          } catch (er) {}

          return ""
        }
      }, opts.remarkable))

      opts.remarkable.plugins.forEach(function(plugin)
      {
        if (plugin && typeof(plugin) == 'function') {
          mdParser.use(plugin)
        } 
      })

      self.push(mdParser.render(md))
      self.push(null)
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
            path.join(__dirname, "phantom", "render.js")
          , tmpHtmlPath
          , tmpPdfPath
          , opts.cwd
          , opts.runningsPath
          , opts.cssPath
          , opts.highlightCssPath
          , opts.paperFormat
          , opts.paperOrientation
          , opts.paperBorder
          , opts.renderDelay
          , opts.loadTimeout
        ]

        childProcess.execFile(opts.phantomPath, childArgs, function (er, stdout, stderr) {
          //if (stdout) console.log(stdout)
          //if (stderr) console.error(stderr)
          if (er) return outputStream.emit("error", er)
          fs.createReadStream(tmpPdfPath).pipe(outputStream)
        })
      })

      // Setup the pipeline
      inputStream
        .pipe(opts.preProcessMd())
        .pipe(mdToHtml)
        .pipe(opts.preProcessHtml())
        .pipe(htmlToTmpHtmlFile)

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