Paper = require '../../src/paper'

describe 'Paper', ->
  beforeEach ->
    @sut = new Paper

  it 'should of type Paper', ->
    expect(@sut).to.be.an.instanceOf Paper

  describe '->setOptions', ->
    describe 'when called with nothing', ->
      beforeEach ->
        @sut.setOptions()

      it 'should set the default options', ->
        expect(@sut.options).to.deep.equal
          paperFormat: 'A4'
          paperOrientation: 'portrait'
          paperBorder: '1cm'
          renderDelay: 500
          template: 'html5bp'

    describe 'when called with something', ->
      beforeEach ->
        @sut.setOptions
          paperFormat: 'A5'
          paperOrientation: 'landscape'
          paperBorder: '2cm'
          renderDelay: 5000

      it 'should set the default options', ->
        expect(@sut.options).to.deep.equal
          paperFormat: 'A5'
          paperOrientation: 'landscape'
          paperBorder: '2cm'
          renderDelay: 5000
          template: 'html5bp'
