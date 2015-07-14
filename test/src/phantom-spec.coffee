Phantom = require '../../src/phantom'

describe 'Phantom', ->
  beforeEach ->
    @page = {}
    @sut = new Phantom page: @page

  it 'should of type Phantom', ->
    expect(@sut).to.be.an.instanceOf Phantom

  describe '->open', ->
    describe 'when called with a callback', ->
      beforeEach (done) ->
        @sut.setTemplatePath  '/path/to/template.html'
        @page.open = sinon.stub().yields null
        @sut.open => done()

      it 'should call page.open with the template path', ->
        expect(@page.open).to.have.been.calledWith '/path/to/template.html'

    describe 'when called with a different template', ->
      beforeEach (done) ->
        @sut.setTemplatePath '/path/to/another-template.html'
        @page.open = sinon.stub().yields null
        @sut.open => done()

      it 'should call page.open with the template path', ->
        expect(@page.open).to.have.been.calledWith '/path/to/template.html'
