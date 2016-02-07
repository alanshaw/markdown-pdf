html5pdf = require '../index.coffee'
fs       = require 'fs'

describe 'FullTest', ->
  beforeEach (done) ->
    @timeout 5000
    html5pdf(renderDelay: 5)
      .from __dirname + '/full-test.html'
      .to __dirname + '/test.pdf', => done()

  it 'should have created a test.pdf', ->
    expect(fs.existsSync(__dirname + '/test.pdf')).to.be.true
