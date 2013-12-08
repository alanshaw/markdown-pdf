var fs = require("fs")
  , path = require("path")
  , through = require("through")
  , CombineStream = require("combine-stream")
  , extend = require("extend")
  , async = require("async")
  , concatStream = require("concat-stream")
  , StringStream = require("string-stream")
  , marked = require("marked")

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

  var htmlToPdf = through()

  return extend(
    opts.preProcessMd.pipe(mdToHtml).pipe(opts.preProcessHtml).pipe(htmlToPdf),
    createFromInterface(opts)
  )
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

  exports.from.path = fromPath
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
  exports.to.string = function toString (cb) {

    var tasks = srcStreams.map(function (ss) {
      return function (cb) {
        ss.pipe(markdownpdf(opts)).pipe(concatStream(cb))
      }
    })

    async.parallel(tasks, cb)
  }

  return exports
}

module.exports = markdownpdf