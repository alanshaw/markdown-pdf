var system = require("system")
  , page = require("webpage").create()
  , fs = require("fs")

// Read in arguments
var args = ["in", "out", "cssPath", "paperFormat", "paperOrientation", "paperBorder", "renderDelay"].reduce(function (args, name, i) {
  args[name] = system.args[i + 1]
  return args
}, {})

page.open(page.libraryPath + "/../html5bp/index.html", function (status) {
  
  if (status == "fail") {
    page.close()
    phantom.exit(1)
    return
  }
  
  // Add custom CSS to the page
  page.evaluate(function(cssPath) {
    
    var head = document.querySelector("head")
    var css = document.createElement("link")
    
    css.rel = "stylesheet"
    css.href = cssPath
    
    head.appendChild(css)
    
  }, args.cssPath)
  
  // Add the HTML to the page
  page.evaluate(function(html) {
    
    var body = document.querySelector("body")

    // Remove the paragraph HTML5 boilerplate adds
    body.removeChild(document.querySelector("p"))
    
    var container = document.createElement("div")
    container.innerHTML = html
    
    body.appendChild(container)
    
  }, fs.read(args.in))
  
  // Set the PDF paper size
  page.paperSize = {format: args.paperFormat, orientation: args.paperOrientation, border: args.paperBorder}
  
  // Render the page
  setTimeout(function () {
    page.render(args.out)
    page.close()
    phantom.exit(0)
  }, parseInt(args.renderDelay, 10))
})

