var fs = require("fs")
  , path = require("path")
  , through = require("through")
  , extend = require("extend")
  , tmp = require("tmp")
  , childProcess = require("child_process")
  , duplexer = require("duplexer")
  , streamft = require("stream-from-to")

tmp.setGracefulCleanup()

function html5pdf (opts) {
  opts = opts || {}
  opts.phantomPath = opts.phantomPath || require("phantomjs").path
  opts.runningsPath = path.resolve(__dirname + "/..", opts.runningsPath || '') || __dirname + "/runnings.js"
  opts.cssPath = opts.cssPath || __dirname + "/../pdf.css"
  opts.paperFormat = opts.paperFormat || "A4"
  opts.paperOrientation = opts.paperOrientation || "portrait"
  opts.paperBorder = opts.paperBorder || "1cm"
  opts.renderDelay = opts.renderDelay || 500
  opts.preProcessHtml = opts.preProcessHtml || function () { return through() }

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

        var childArgs = [];

        childArgs.push(path.join(__dirname, "..", "lib-phantom", "html5-to-pdf.js"));
        childArgs.push(tmpHtmlPath);
        childArgs.push(tmpPdfPath);
        childArgs.push(opts.runningsPath);
        if(opts.cssPath instanceof Array){
            for(var x in opts.cssPath)
                childArgs.push(opts.cssPath[x]);
        }else{
            childArgs.push(opts.cssPath);
        }
        childArgs.push(opts.paperFormat);
        childArgs.push(opts.paperOrientation);
        childArgs.push(opts.paperBorder);
        childArgs.push(opts.renderDelay);

        childProcess.execFile(opts.phantomPath, childArgs, function(er, stdout, stderr) {
          //if (stdout) console.log(stdout)
          //if (stderr) console.error(stderr)
          if (er) return outputStream.emit("error", er)
          fs.createReadStream(tmpPdfPath).pipe(outputStream)
        })
      })

      // Setup the pipeline
      inputStream.pipe(opts.preProcessHtml()).pipe(htmlToTmpHtmlFile)
      inputStream.resume()
    })
  })

  return extend(
    duplexer(inputStream, outputStream),
    streamft(function () {
      return html5pdf(opts)
    })
  )
}

module.exports = html5pdf
