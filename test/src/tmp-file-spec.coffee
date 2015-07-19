TmpFile = require '../../src/tmp-file'

describe 'TmpFile', ->
  beforeEach ->
    @tmp =
      file: sinon.stub()
      setGracefulCleanup: sinon.spy()
    @fs =
      close: sinon.spy()
    @sut = new TmpFile tmp: @tmp, fs: @fs

  it 'should of type TmpFile', ->
    expect(@sut).to.be.an.instanceOf TmpFile

  describe '->open', ->
    describe 'when called with html and yields correct data', ->
      beforeEach (done) ->
        @tmp.file.yields null, 'tmp-file.html', 'tmp-file-fd'
        @sut.open '.html', (@error, @tmpFile) => done()

      it 'should call tmp.file', ->
        expect(@tmp.file).to.have.been.calledWith postfix: '.html'

      it 'should call fs.close with fd', ->
        expect(@fs.close).to.have.been.calledWith 'tmp-file-fd'

      it 'should yield a tmp file', ->
        expect(@tmpFile).to.deep.equal 'tmp-file.html'

      it 'should not have an error', ->
        expect(@error).to.not.exist

    describe 'when called with html and yields different data', ->
      beforeEach (done) ->
        @tmp.file.yields null, 'tmp-file-2.html', 'tmp-file-fd-2'
        @sut.open '.pdf', (@error, @tmpFile) => done()

      it 'should call tmp.file', ->
        expect(@tmp.file).to.have.been.calledWith postfix: '.pdf'

      it 'should call fs.close with fd', ->
        expect(@fs.close).to.have.been.calledWith 'tmp-file-fd-2'

      it 'should yield a tmp file', ->
        expect(@tmpFile).to.deep.equal 'tmp-file-2.html'

      it 'should not have an error', ->
        expect(@error).to.not.exist

    describe 'when called with html and yields an error', ->
      beforeEach (done) ->
        @tmp.file.yields new Error('bad tmp file')
        @sut.open '.bad', (@error) => done()

      it 'should call tmp.file', ->
        expect(@tmp.file).to.have.been.calledWith postfix: '.bad'

      it 'should not have an error', ->
        expect(@error.message).to.deep.equal 'bad tmp file'

  describe '->clean', ->
    beforeEach ->
      @sut.clean()

    it 'should call tmp.setGracefulCleanup', ->
      expect(@tmp.setGracefulCleanup).to.have.been.called
