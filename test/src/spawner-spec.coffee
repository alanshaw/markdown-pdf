Spawner = require '../../src/spawner'

describe 'Spawner', ->
  describe '->start', ->
    beforeEach ->
      @childProcess =
        execFile: sinon.stub()

    describe 'when called', ->
      beforeEach ->
        @sut = new Spawner {cssPath: '/path/to/css', phantomPath: '/path/to/phantom'}, childProcess: @childProcess
        @sut.start()

      it 'should call childProcess execFile with phantomPath and childArgs', ->
        expect(@childProcess.execFile).to.have.been.calledWith '/path/to/phantom', [JSON.stringify(cssPath: '/path/to/css')]

    describe 'when called with different parameters', ->
      beforeEach ->
        @sut = new Spawner {cssPath: '/path/to/css2', phantomPath: '/path/to/phantom2'}, childProcess: @childProcess
        @sut.start()

      it 'should call childProcess execFile with phantomPath and childArgs', ->
        expect(@childProcess.execFile).to.have.been.calledWith '/path/to/phantom2', [JSON.stringify(cssPath: '/path/to/css2')]
