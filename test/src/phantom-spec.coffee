Phantom = require '../../src/phantom'
Options = require '../../src/options'
path    = require 'path'

describe 'Phantom', ->
  beforeEach ->
    @page =
      set: sinon.stub().yields null
    @ph =
      createPage: sinon.stub().yields @page
      exit: sinon.spy()
    @phantom =
      create: sinon.stub().yields @ph
    @fs =
      readFileSync: sinon.stub()
    @sut = new Phantom new Options(), phantom: @phantom, fs: @fs

  it 'should of type Phantom', ->
    expect(@sut).to.be.an.instanceOf Phantom

  describe '->open', ->
    beforeEach ->
      @sut.addThingsToPage = sinon.stub().yields null
      @sut.setRenderdelay 5

    describe 'when called with a callback', ->
      beforeEach (done) ->
        @sut.setTemplatePath 'template'
        @page.open = sinon.stub().yields null
        @page.close = sinon.spy()
        @sut.open (@error) => done()

      it 'should call page.open with the template path', ->
        expect(@page.open).to.have.been.calledWith path.resolve __dirname + '/../../templates/template/index.html'

      it 'should not call page.close', ->
        expect(@page.close).to.not.have.been.called

      it 'should call ph.exit with 0', ->
        expect(@ph.exit).to.not.have.been.called

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

      it 'should call ph.exit', ->
        expect(@ph.exit).to.have.been.calledWith 1

      it 'should yield an error', ->
        expect(@error).to.exist

    describe 'when called with a different template', ->
      beforeEach (done) ->
        @sut.setTemplatePath 'another-template'
        @page.open = sinon.stub().yields null
        @sut.open (@error) => done()

      it 'should call page.open with the template path', ->
        expect(@page.open).to.have.been.calledWith path.resolve __dirname + '/../../templates/another-template/index.html'

      it 'should not yield an error', ->
        expect(@error).to.not.exist

  describe '->addCSSLinksToPage', ->
    beforeEach ->
      @sut.page = {}
      @sut.page.evaluate = sinon.spy()

    describe 'when called with css', ->
      beforeEach ->
        @sut.addCSSLinksToPage()

      it 'should call page.evaluate', ->
        expect(@sut.page.evaluate).to.have.been.called

  describe '->addHTMLToPage', ->
    beforeEach ->
      @sut.page = {}
      @sut.page.evaluate = sinon.spy()
      @fs.readFileSync = sinon.spy()

    describe 'when called with css', ->
      beforeEach ->
        @sut.addHTMLToPage()

      it 'should call page.evaluate', ->
        expect(@sut.page.evaluate).to.have.been.called

      it 'should call fs.read', ->
        expect(@fs.readFileSync).to.have.been.calledWith @sut.inputPath
