HTMLToPDF = require '../'
fs        = require 'fs-extra'
path      = require 'path'

describe 'Integration', ->
  beforeEach  ->
    @outputPath = path.join __dirname, '..', 'tmp', 'test.pdf'
    fs.mkdirpSync path.dirname @outputPath
    try
      fs.unlinkSync @outputPath

  beforeEach (done) ->
    @timeout 50000

    @sut = new HTMLToPDF {
      renderDelay: 5,
      @outputPath,
      inputBody: '<h1>Hello my friend</h1>'
    }

    @sut.build (error) => done error

  it 'should have created a test.pdf', ->
    expect(fs.existsSync(@outputPath)).to.be.true
