var fs = require("fs")
  , async = require("async")
  , phantomjs = require("phantomjs")
  , markdown = require("markdown").markdown
  , tmp = require('tmp')
  , childProcess = require('child_process')
  , path = require("path")

tmp.setGracefulCleanup();

module.exports = function (filenames, opts, cb) {
  
  if (!cb) cb = opts; opts = {}
  
  opts.phantomPath = opts.phantomPath || phantomjs.path
  opts.cssPath = opts.cssPath || "../pdf.css"
  
  var tasks = filenames.map(function (filename) {
    return markdownToPdfTask(filename, opts)
  })
  
  async.parallel(tasks, cb)
}

function markdownToPdfTask (filename, opts) {
  return function (cb) {
    
    fs.stat(filename, function (er, stats) {
      if (er) return cb(er)

      if (!stats.isFile()) return cb(new Error(filename + " is not a file"))
      
      // Read the markdown
      fs.readFile(filename, {encoding: 'utf-8'}, function (er, data) {
        
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
              var childArgs = [path.join(__dirname, "pdf.phantom.js"), tmpHtmlPath, tmpPdfPath, opts.cssPath]
              
              childProcess.execFile(opts.phantomPath, childArgs, function(er, stdout, stderr) {
                
                if (stdout) console.log(stdout)
                if (stderr) console.error(stderr)
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