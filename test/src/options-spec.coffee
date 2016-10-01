Options  = require '../../src/options'
_        = require 'lodash'
path     = require 'path'

describe 'Options', ->
  describe 'when called with the requirments', ->
    beforeEach ->
      @sut = new Options {
        inputBody: 'input-body'
        outputPath: path.join(__dirname, 'output')
      }

    it 'should set the default options', ->
      templatePath = (file) =>
        return path.resolve __dirname, '../../', 'templates', "#{file}"

      expect(@sut.options).to.deep.equal
        options: {},
        inputBody: 'input-body'
        outputPath: path.join(__dirname, 'output')
        renderDelay: 0
        template: 'html5bp'
        templatePath: templatePath 'html5bp'
        include: [
          {
            type: 'css',
            filePath: templatePath 'pdf.css'
          }
          {
            type: 'css',
            filePath: templatePath 'highlight.css'
          }
        ]

