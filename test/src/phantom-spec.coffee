Phantom = require '../../src/phantom'

describe 'Phantom', ->
  beforeEach ->
    global.phantom =
      exit: sinon.spy()
    @page = {}
    @fs = {}
    @sut = new Phantom page: @page, fs: @fs

  it 'should of type Phantom', ->
    expect(@sut).to.be.an.instanceOf Phantom

  describe '->open', ->
    beforeEach ->
      @sut.setRenderdelay 5

    describe 'when called with a callback', ->
      beforeEach (done) ->
        @sut.setTemplatePath '/path/to/template.html'
        @page.open = sinon.stub().yields null
        @page.close = sinon.spy()
        @sut.open (@error) => done()

      it 'should call page.open with the template path', ->
        expect(@page.open).to.have.been.calledWith '/path/to/template.html'

      it 'should not call page.close', ->
        expect(@page.close).to.not.have.been.called

      it 'should call phantom.exit with 0', ->
        expect(global.phantom.exit).to.not.have.been.called

      it 'should not yield an error', ->
        expect(@error).to.not.exist

    describe 'when called and it fails', ->
      beforeEach (done) ->
        @sut.setTemplatePath  '/path/to/template.html'
        @page.open = sinon.stub().yields "fail"
        @page.close = sinon.spy()
        @sut.open (@error) => done()

      it 'should call page.close', ->
        expect(@page.close).to.have.been.called

      it 'should call phantom.exit', ->
        expect(global.phantom.exit).to.have.been.calledWith 1

      it 'should yield an error', ->
        expect(@error).to.exist

    describe 'when called with a different template', ->
      beforeEach (done) ->
        @sut.setTemplatePath '/path/to/another-template.html'
        @page.open = sinon.stub().yields null
        @sut.open (@error) => done()

      it 'should call page.open with the template path', ->
        expect(@page.open).to.have.been.calledWith '/path/to/another-template.html'

      it 'should not yield an error', ->
        expect(@error).to.not.exist

  describe '->addCSSLinksToPage', ->
    beforeEach ->
      @page.evaluate = sinon.spy()

    describe 'when called with css', ->
      beforeEach ->
        @sut.addCSSLinksToPage()

      it 'should call page.evaluate', ->
        expect(@page.evaluate).to.have.been.called

  describe '->addHTMLToPage', ->
    beforeEach ->
      @fs.read = sinon.spy()
      @page.evaluate = sinon.spy()

    describe 'when called with css', ->
      beforeEach ->
        @sut.addHTMLToPage()

      it 'should call page.evaluate', ->
        expect(@page.evaluate).to.have.been.called

      it 'should call fs.read', ->
        expect(@fs.read).to.have.been.calledWith @sut.inputPath
