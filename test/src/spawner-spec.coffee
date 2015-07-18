Spawner = require '../../src/spawner'

describe 'Spawner', ->
  describe '->start', ->
    beforeEach ->
      @childProcess =
        execFile: sinon.stub()

    describe 'when called', ->
      beforeEach ->
        @sut = new Spawner '/path/to/phantom', {cssPath: '/path/to/css'}, childProcess: @childProcess
        @sut.start()

      it 'should call childProcess execFile with phantomPath and childArgs', ->
        expect(@childProcess.execFile).to.have.been.calledWith '/path/to/phantom', cssPath: '/path/to/css'

    describe 'when called with different parameters', ->
      beforeEach ->
        @sut = new Spawner '/path/to/phantom2', {cssPath: '/path/to/css2'}, childProcess: @childProcess
        @sut.start()

      it 'should call childProcess execFile with phantomPath and childArgs', ->
        expect(@childProcess.execFile).to.have.been.calledWith '/path/to/phantom2', cssPath: '/path/to/css2'
