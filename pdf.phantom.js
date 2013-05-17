var system = require("system")
  , page = require("webpage").create()
  , fs = require("fs")

// Read in arguments
var args = ["in", "out", "cssPath"].reduce(function (args, name, i) {
  args[name] = system.args[i + 1]
  return args
}, {})

page.open("./html5bp/index.html", function (status) {
  
  if (status == "fail") {
    page.close()
    phantom.exit(1)
    return
  }
  
  page.evaluate(function(html) {
    
    var body = document.querySelector("body")

    // Remove the paragraph HTML5 boilerplate adds
    body.removeChild(document.querySelector("p"))
    
    var container = document.createElement("div")
    container.innerHTML = html
    
    body.appendChild(container)
    
  }, fs.read(args.in));
  
  page.evaluate(function(cssPath) {
    
    var head = document.querySelector("head")
    var css = document.createElement("link")
    
    css.rel = "stylesheet"
    css.href = cssPath
    
    head.appendChild(css)
    
  }, args.cssPath)
  
  setTimeout(function () {
    console.log(page.content)
    page.render(args.out)
    page.close()
    phantom.exit(0)
  }, 1000)
})

