markdown-pdf [![Build Status](https://travis-ci.org/alanshaw/markdown-pdf.png)](https://travis-ci.org/alanshaw/markdown-pdf) [![Dependency Status](https://david-dm.org/alanshaw/markdown-pdf.png)](https://david-dm.org/alanshaw/markdown-pdf) [![Coverage Status](https://coveralls.io/repos/alanshaw/markdown-pdf/badge.png)](https://coveralls.io/r/alanshaw/markdown-pdf)
===

Node module that converts Markdown files to PDFs.

The PDF looks great because it is styled by HTML5 Boilerplate. What? - Yes! Your Markdown is first converted to HTML, then pushed into the HTML5 Boilerplate `index.html`. Phantomjs renders the page and saves it to a PDF. You can even customise the style of the PDF by passing an optional path to your CSS _and_ you can pre-process your markdown file before it is converted to a PDF by passing in a pre-processing function, for templating.

Getting started
---

    npm install markdown-pdf

Example Usage
---

Pass markdown-pdf a path to a markdown document or an array of paths and you'll be given back a path or an array of paths to temporary files that contain your converted PDFs.

```javascript
var markdownpdf = require("markdown-pdf")
  , fs = require("fs")

markdownpdf("/path/to/document.md", function (er, pdfPath) {
  if (er) return console.error(er)

  // Move the pdf from the tmp path to where you want it
  fs.rename(pdfPath, "/path/to/document.pdf", function() {
    console.log("done")
  })
})
```

### Options

Pass options to markdown-pdf like so:

```javascript
var markdownpdf = require("markdown-pdf")
  , opts = {/* options */}

markdownpdf("/path/to/document.md", opts, function (er, pdfs) {})
```

#### options.phantomPath
Type: `String`
Default value: `Path provided by phantomjs module`

Path to phantom binary

#### options.concatFiles
Type: `Boolean`
Default value: `false`

If set to true, a single PDF will be created containing the contents of all of the Markdown files.

#### options.cssPath
Type: `String`
Default value: `../pdf.css`

Path to custom CSS file, relative to the current working directory

#### options.paperFormat
Type: `String`
Default value: `A4`

'A3', 'A4', 'A5', 'Legal', 'Letter' or 'Tabloid'

#### options.paperOrientation
Type: `String`
Default value: `portrait`

'portrait' or 'landscape'

#### options.paperBorder
Type: `String`
Default value: `1cm`

Supported dimension units are: 'mm', 'cm', 'in', 'px'

#### options.renderDelay
Type: `Number`
Default value: `1000`

Delay in millis before rendering the PDF (give HTML and CSS a chance to load)

#### options.preProcessMd
Type: `Function`
Default value: `null`

Function to call before Markdown is converted to HTML. It is passed the Markdown file contents and _must_ return a string

#### options.preProcessHtml
Type: `Function`
Default value: `null`

Function to call after Markdown has been converted to HTML but before it is converted to PDF. It is passed the Markdown file contents and _must_ return a string

CLI Interface
---

### Installation

To use markdown-pdf as a standalone program from the terminal run

```sh
npm install -g markdown-pdf
```

### Usage

```sh
Usage: markdown-pdf [options] <markdown-file-path>

Options:

  -h, --help                             output usage information
  -V, --version                          output the version number
  <markdown-file-path>                   Path of the markdown file to convert
  -p, --phantom-path [path]              Path to phantom binary
  -s, --css-path [path]                  Path to custom CSS file
  -f, --paper-format [format]            'A3', 'A4', 'A5', 'Legal', 'Letter' or 'Tabloid'
  -r, --paper-orientation [orientation]  'portrait' or 'landscape'
  -b, --paper-border [measurement]       Supported dimension units are: 'mm', 'cm', 'in', 'px'
  -d, --render-delay [millis]            Delay before rendering the PDF (give HTML and CSS a chance to load)
  -o, --out [path]                       Path of where to save the PDF
```

Dream code
===

```javascript

// Streaming interface
fs.createReadStream(src).pipe(markdownpdf()).pipe(fs.createWriteStream(dest))

// From file path(s) to destination file path(s)
markdownpdf().from.path(src).to.path(dest, cb)

// ...as shorthand:
markdownpdf().from(src).to(dest, cb)

// From file path(s) to string(s)
markdownpdf().from.path(src).to.string(cb)

// From string(s) to string(s)
markdownpdf().from.string(md).to.string(cb)

// From string(s) to path(s)
markdownpdf().from.string(md).to.path(dest, cb)

// Concat from path(s) to path
markdownpdf().concat.from.path(src).to.path(dest, cb)

// Concat from path(s) to string
markdownpdf().concat.from.path(src).to.string(cb)

// From file path(s) to buffer(s)
markdownpdf().from.path(src).to.buffer(cb)

// For the common case, `from`/`to` is just an alias for `from.path`/`to.path`
// Behind the scenes, we're just creating the read streams and piping them through to the desired destinations

```