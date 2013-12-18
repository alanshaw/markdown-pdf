var fs = require("fs")
  , async = require("async")
  , marked = require("marked")
  , tmp = require('tmp')
  , childProcess = require('child_process')
  , path = require("path")

tmp.setGracefulCleanup()
m2p = {};
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
 * @param {Boolean} [opts.concatFiles] Concat contents of filePaths to create a single PDF 
 * @param {Function} cb Callback function invoked when the files have been generated. Passed Error and an Array of
 * file paths - a list of PDF files containing your PDF content. These are stored in a temp folder so if you want to
 * keep them, you MUST move or copy them or they will be deleted when the process exits.
 */
module.exports = m2p;
m2p.new = function (filePaths, opts, cb) {
  filePaths = Array.isArray(filePaths) ? filePaths : [filePaths]

  if (!cb) {
    cb = opts
    opts = {}
  }
  
  opts = options(opts);

  if (opts.concatFiles) {
    concatFiles(filePaths, function(er, concatenatedFile) {
      if (er) return cb(er)

      run([ concatenatedFile ], opts, cb)
    })
  }
  else {
    run(filePaths, opts, cb)
  }
}


/**
 * render options
 * 
 * @param  {Object} opts Rendering options
 * @return {Object}
 */
function options (opts){
  opts.phantomPath = opts.phantomPath || require("phantomjs").path
  opts.cssPath = path.relative(__dirname + "/../html5bp/", path.resolve(opts.cssPath || __dirname + "/../pdf.css"))
  opts.paperFormat = opts.paperFormat || "A4"
  opts.paperOrientation = opts.paperOrientation || "portrait"
  opts.paperBorder = opts.paperBorder || "1cm"
  opts.renderDelay = opts.renderDelay || 500
  opts.concatFiles = opts.concatFiles || false

  return opts;
}

/**
 * Run the coversion tasks.
 *
 * @param  {Array} filePaths Paths of files to convert
 * @param  {Object} opts Render options
 * @param {Function} cb Callback function invoked when the files have been generated
 */
function run (filePaths, opts, cb) {
  var tasks = filePaths.map(function (filename) {
    return markdownToPdfTask(path.resolve(filename), opts)
  })
  
  async.parallel(tasks, function(er, results) {
    if (er) return cb(er)

    if (results.length == 1) return cb(null, results[0])

    return cb(null, results)
  })
}

/**
 * Concatenate files into a single file.
 *
 * @param  {Array} filePaths Paths to files to concatenate together
 * @param  {Function} cb Callback function invoked when the files have been concatenated. Passed Error and a String
 * path to the new file.
 */
function concatFiles (filePaths, cb) {
  filePaths = filePaths.slice(0);
  tmp.file(function (er, tmpMdPath, tmpMdFd) {
    if (er) return cb(er)
    fs.close(tmpMdFd)

    var writeStream = fs.createWriteStream(tmpMdPath)

    function iterate () {
      if (filePaths.length === 0) {
        writeStream.end();
        return cb(null, tmpMdPath)
      }

      var path = filePaths.shift()
      var readStream = fs.createReadStream(path)
      readStream.on('end', function () {
        iterate()
      })
      readStream.pipe(writeStream, { end: false })
    }

    iterate()
  })
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

      // TODO: Remove when 0.12 is released
      var encoding = process.version.indexOf("0.8") == -1 ? {encoding: "utf8"} : "utf8"
      
      // Read the markdown
      fs.readFile(filePath, encoding, function (er, data) {
        
        data = opts.preProcessMd ? opts.preProcessMd(data) : data
        
        // Convert to HTML
        var html = marked(data)
        
        html = opts.preProcessHtml ? opts.preProcessHtml(html) : html
        
        // Save HTML to tmp file
        tmp.file(function (er, tmpHtmlPath, tmpHtmlFd) {
          if (er) return cb(er)
          fs.close(tmpHtmlFd)
          
          fs.writeFile(tmpHtmlPath, html, function (er) {
            if (er) return cb(er)
            
            // Create tmp file to save PDF to
            tmp.file({postfix: '.pdf'}, function (er, tmpPdfPath, tmpPdfFd) {
              if (er) return cb(er)
              fs.close(tmpPdfFd)

              // Invoke phantom and to generate the PDF
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



/**
 * covert markdown or html content to pdf file
 * 
 * @param {String} markdown or html content to convert
 * @param {Object} opts Render options
 * @param {Function} callback function
 * @returns {Function}
 */
m2p.markdownToPdfByContent = function (content, opts, cb)
{

  // TODO: Remove when 0.12 is released
  var encoding = process.version.indexOf("0.8") == -1 ? {encoding: "utf8"} : "utf8"

    
  content = opts.preProcessMd ? opts.preProcessMd(content) : content
  
  // Convert to HTML
  var html = marked(content)  
  html = opts.preProcessHtml ? opts.preProcessHtml(html) : html
  
  // Save HTML to tmp file
  tmp.file(function (er, tmpHtmlPath, tmpHtmlFd) {
    if (er) return cb(er)
    fs.close(tmpHtmlFd)
    
    fs.writeFile(tmpHtmlPath, html, function (er) {
      if (er) return cb(er)
      
      // Create tmp file to save PDF to
      tmp.file({postfix: '.pdf'}, function (er, tmpPdfPath, tmpPdfFd) {
        if (er) return cb(er)
        fs.close(tmpPdfFd)
        
        opts = options(opts);
        // Invoke phantom and to generate the PDF
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
          if (er) return cb(er)
          cb(null, tmpPdfPath)
        })
      })
    })
  })
}
