Options  = require '../../src/options'
path     = require 'path'

describe 'Options', ->
  beforeEach ->
    @sut = new Options

  it 'should of type Options', ->
    expect(@sut).to.be.an.instanceOf Options

  describe '->setAll', ->
    describe 'when called with nothing', ->
      beforeEach ->
        @sut.setAll()

      it 'should set the default options', ->
        expect(JSON.stringify(@sut.options)).to.deep.equal(
          JSON.stringify({
            paperFormat: 'A4'
            paperOrientation: 'portrait'
            paperBorder: '1cm'
            renderDelay: 500
            template: 'html5bp'
            phantomPath: require('phantomjs').path
            runningsPath: path.resolve __dirname + '/../../src/runnings.js'
            cssPath: path.resolve __dirname +  '/../../templates/pdf.css'
            highlightCssPath: path.resolve __dirname +  '/../../templates/highlight.css'
            inputPath: ''
            outputPath: ''
          })
        )

    describe 'when called with something', ->
      beforeEach ->
        @sut.setAll
          paperFormat: 'A5'
          paperOrientation: 'landscape'
          paperBorder: '2cm'
          renderDelay: 5000

      it 'should set the default options', ->
        expect(JSON.stringify(@sut.options)).to.deep.equal(
          JSON.stringify({
            paperFormat: 'A5'
            paperOrientation: 'landscape'
            paperBorder: '2cm'
            renderDelay: 5000
            template: 'html5bp'
            phantomPath: require('phantomjs').path
            runningsPath: path.resolve __dirname + '/../../src/runnings.js'
            cssPath: path.resolve __dirname +  '/../../templates/pdf.css'
            highlightCssPath: path.resolve __dirname +  '/../../templates/highlight.css'
            inputPath: ''
            outputPath: ''
          })
        )
