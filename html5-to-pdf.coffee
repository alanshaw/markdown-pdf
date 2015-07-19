commander   = require 'commander'
path        = require 'path'
_           = require 'lodash'
html5pdf    = require './index.coffee'
packageJSON = require './package.json'

class Command
  run: =>
    commander
      .version packageJSON.version
      .option '-p, --phantom-path [path]', 'Path to phantom binary'
      .option '-h, --runnings-path [path]', 'Path to runnings (header, footer)'
      .option '-s, --css-path [path]', 'Path to custom CSS file'
      .option '-z, --highlight-css-path [path]', 'Path to custom highlight-CSS file'
      .option '-f, --paper-format [format]', "'A3', 'A4', 'A5', 'Legal', 'Letter' or 'Tabloid'"
      .option '-r, --paper-orientation [orientation]', "'portrait' or 'landscape'"
      .option '-b, --paper-border [measurement]', "Supported dimension units are: 'mm', 'cm', 'in', 'px'"
      .option '-d, --template [html5bp]', "The template to use. Either 'html5bp' or 'htmlbootstrap'"
      .option '-d, --render-delay [millis]', 'Delay before rendering the PDF (give HTML and CSS a chance to load)'
      .option '-o, --output-path [path]', 'Path of where to save the PDF'
      .usage '[options] <path/to/html-file-path>'
      .parse process.argv

    htmlFile = _.first commander.args
    unless htmlFile
      commander.outputHelp()
      process.exit 1

    pdfFile = path.resolve(commander.outputPath ? htmlFile.replace('.html', '.pdf'))
    console.log '* Building pdf from html file...'
    html5pdf(commander)
      .from path.resolve htmlFile
      .to pdfFile, => console.log '* PDF file generated'

(new Command()).run()
