var fs = require("fs")
  , async = require("async")
  , markdown = require("markdown").markdown
  , tmp = require('tmp')
  , childProcess = require('child_process')
  , path = require("path")

tmp.setGracefulCleanup()

/**
 * Converts the passed Markdown files to PDF files.
 * 
 * @param {String|Array} filePaths Paths of markdown files to convert
 * @param {Object} [opts] Rendering options
 * @param {String} [opts.phantomPath] Path to phantom binary
 * @param {String} [opts.cssPath] Path to custom CSS file
 * @param {String} [opts.paperFormat] 'A3', 'A4', 'A5', 'Legal', 'Letter' or 'Tabloid'
 * @param {String} [opts.paperOrientation] 'portrait' or 'landscape'
 * @param {String} [opts.paperBorder] Supported dimension units are: 'mm', 'cm', 'in', 'px'
 * @param {Number} [opts.renderDelay] Delay before rendering the PDF (give HTML and CSS a chance to load)
 * @param {Function} cb Callback function invoked when the files have been generated. Passed Error and an Array of
 * file paths - a list of PDF files containing your PDF content. These are stored in a temp folder so if you want to
 * keep them, you MUST move or copy them or they will be deleted when the process exits.
 */
module.exports = function (filePaths, opts, cb) {
  
  if (Object.prototype.toString.call(filePaths) == '[object String]') {
    filePaths = [filePaths]
  }
  
  if (!cb) {
    cb = opts
    opts = {}
  }
  
  opts.phantomPath = opts.phantomPath || require("phantomjs").path
  opts.cssPath = opts.cssPath || "../pdf.css"
  opts.paperFormat = opts.paperFormat || "A4"
  opts.paperOrientation = opts.paperOrientation || "portrait"
  opts.paperBorder = opts.paperBorder || "1cm"
  opts.renderDelay = opts.renderDelay || 500
  
  var tasks = filePaths.map(function (filename) {
    return markdownToPdfTask(filename, opts)
  })
  
  async.parallel(tasks, cb)
}

/**
 * Create a function that can be passed to async.parallel that performs the conversion.
 * 
 * @param {String} filePath File to convert
 * @param {Object} opts Render options
 * @returns {Function}
 */
function markdownToPdfTask (filePath, opts) {
  return function (cb) {
    
    fs.stat(filePath, function (er, stats) {
      if (er) return cb(er)
      
      if (!stats.isFile()) return cb(new Error(filePath + " is not a file"))
      
      // Read the markdown
      fs.readFile(filePath, {encoding: 'utf-8'}, function (er, data) {
        
        // Convert to HTML
        var html = markdown.toHTML(data)
        
        // Save HTML to tmp file
        tmp.file(function (er, tmpHtmlPath) {
          if (er) return cb(er)
          
          fs.writeFile(tmpHtmlPath, html, function (er) {
            if (er) return cb(er)
            
            // Create tmp file to save PDF to
            tmp.file({postfix: '.pdf'}, function (er, tmpPdfPath) {
              if (er) return cb(er)
              
              // Invoke phantom and to generate the PDF
              var childArgs = [
                  path.join(__dirname, "pdf.phantom.js")
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
                if (er) return cb(er)
                cb(null, tmpPdfPath)
              })
            })
          })
        })
      })
    })
  }
}