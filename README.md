markdown-pdf
===

Node module that converts Markdown files to PDFs.

The PDF looks great because it is styled by HTML5 Boilerplate. What? - Yes! Your Markdown is first converted to HTML, then pushed into the HTML5 Boilerplate index.html. Phantomjs renders the page and saves it to a PDF. You can even cusomtise the style of the PDF by passing an optional path to your CSS.

Getting started
---

    npm install markdown-pdf

Example Usage
---

```javascript
var markdownpdf = require("markdown-pdf")
  , fs = require("fs")

markdownpdf("/path/to/document.md", function (er, pdfs) {
  if (er) return console.error(er)
  
  // Move the pdf from the tmp path to where you want it
  fs.rename(pdfs[0], "/path/to/document.pdf", function() {
    console.log("done")
  })
})
```