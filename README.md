[![Build Status](https://travis-ci.org/peterdemartini/html5-to-pdf.svg?branch=master)](https://travis-ci.org/peterdemartini/html5-to-pdf)

Node module that converts HTML files to PDFs.

The PDF looks great because it is styled by HTML5 Boilerplate or Bootstrap. What? - Yes! HTML is pushed into the HTML5 template `index.html`. Phantomjs renders the page and saves it to a PDF. You can even customize the style of the PDF by passing an optional path to your CSS _and_ you can pre-process your html file before it is converted to a PDF by passing in a pre-processing function, for creating templates.

# v2 (BREAKING CHANGES)

* Uses [Nightmare](https://github.com/segmentio/nightmare) - an Electron based headless browser.
* Simple API
* No more streams

Getting started
---------------

```sh
npm install --save html5-to-pdf
```

Example usage
--------------

```coffee
HTMLToPDF = require 'html5-to-pdf'
htmlToPDF = new HTMLToPDF {
  inputPath: './path/to/input.html',
  outputPath: './path/to/output.pdf',
}

htmlToPDF.build (error) =>
  throw error if error?
  # Done!
```

### Options

Options are passed into the constructor.

#### options.inputPath
Type: `String`
Required: true

Path to the input HTML

#### options.inputBody
Type: `String` or `Buffer`

Path to the input html as a `String`, or `Buffer`. If specified this will override inputPath.

#### options.outputPath
Type: `String`
Required: true

Path to the output pdf file.

#### options.include
Type: `Array<Object>`

An array of objects containing a type of ['css', 'js'] and a filePath pointing to the asset.

**Example:**

```javascript
[
  {
    "type": "css",
    "filePath": "/path/to/asset.css"
  }
  // ...
]
```


#### options.options.pageSize
Type: `String`
Default value: `A4`

'A3', 'A4', 'Legal', 'Letter' or 'Tabloid'

#### options.options.landscape
Type: `Boolean`
Default value: `false`

true for landscape, false for portait.

#### options.options.marginsType
Type: `Number`
Default value: `0`

* 0 - default
* 1 - none
* 2 - minimum

#### options.options.printBackground
Type: `Boolean`
Default value: `false`

Whether to print CSS backgrounds.

#### options.renderDelay
Type: `Number`
Default value: `0`

Delay in milli-seconds before rendering the PDF (give HTML and CSS a chance to load)

#### options.template
Type: `String`
Default value: `html5bp`

The template to use when rendering the html. You can choose between `html5bp` (HTML5 Boilerplate) or `htmlbootstrap` (Boostrap 3.1.1)

#### options.templatePath
Type: `String`
Default value: the `html5-to-pdf/templates/#{options.template}`

The template to use for rendering the html. If this is set, it will use this instead of the template path.

#### options.templateUrl
Type: `String`

The url to use for rendering the html. If this is set, this will be used for serving up the html. This will override `options.templatePath` and `options.template` 

CLI interface
---

### Installation

To use html5-to-pdf as a standalone program from the terminal run

```sh
npm install --global html5-to-pdf
```

### Usage

```sh
Usage: command [options] <path/to/html-file-path>

Options:

  -h, --help                   output usage information
  -V, --version                output the version number
  -i --include <path>..<path>  path to either a javascript asset, or a css asset
  --page-size [size]           'A3', 'A4', 'Legal', 'Letter' or 'Tabloid'
  --margin-type [n]            Specify the type of margins to use: 0 - default, 1 - none, 2 - minimum
  --landscape                  If set it will change orientation to landscape from portriat
  --print-background           Whether to print CSS backgrounds
  -t --template [template]     The template to used. Defaults to html5bp.
  -d --render-delay [millis]   Delay before rendering the PDF (give HTML and CSS a chance to load)
  -o --output <path>           Path of where to save the PDF
```
