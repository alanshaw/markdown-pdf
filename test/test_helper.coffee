chai      = require 'chai'
sinon     = require 'sinon'
sinonChai = require 'sinon-chai'

chai.use sinonChai

global.expect = chai.expect
global.sinon  = sinon

