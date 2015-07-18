Stream = require '../../src/stream'
path   = require 'path'

describe 'Stream', ->
  beforeEach ->
    @sut = new Stream

  it 'should of type Stream', ->
    expect(@sut).to.be.an.instanceOf Stream

  it 'should contain the full runningsPath', ->
    expect(@sut.options.runningsPath).to.deep.equal path.resolve __dirname + '/../../src/runnings.js'

  it 'should contain the full cssPath', ->
    expect(@sut.options.cssPath).to.deep.equal path.resolve __dirname +  '/../../pdf.css'

  it 'should contain the full path', ->
    expect(@sut.options.highlightCssPath).to.deep.equal path.resolve __dirname +  '/../../highlight.css'
