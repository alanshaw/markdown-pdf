Converter = require '../../src/converter'

describe 'Converter', ->
  beforeEach ->
    @sut = new Converter

  it 'should of type Converter', ->
    expect(@sut).to.be.an.instanceOf Converter
