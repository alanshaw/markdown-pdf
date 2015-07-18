Options  = require '../../src/options'
path     = require 'path'

describe 'Options', ->
  beforeEach ->
    @sut = new Options

  it 'should of type Options', ->
    expect(@sut).to.be.an.instanceOf Options

  describe '->set', ->
    describe 'when called with nothing', ->
      beforeEach ->
        @sut.set()

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
            cssPath: path.resolve __dirname +  '/../../pdf.css'
            highlightCssPath: path.resolve __dirname +  '/../../highlight.css'
          })
        )

    describe 'when called with something', ->
      beforeEach ->
        @sut.set
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
            cssPath: path.resolve __dirname +  '/../../pdf.css'
            highlightCssPath: path.resolve __dirname +  '/../../highlight.css'
          })
        )
