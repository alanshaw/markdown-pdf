var spawn = require('child_process').spawn
var path = require('path')
var test = require('tape')
var fs = require('fs')
var tmp = require('tmp')
var concat = require('concat-stream')
var async = require('async')

tmp.setGracefulCleanup()

// Helpers for running the command-line program and creating input files

var executablePath = path.join(__dirname, '..', 'bin', 'markdown-pdf')

var execute = function (args, options, callback) {
  if ((typeof options) === 'function') {
    callback = options
    options = {}
  }
  var process = spawn(executablePath, args, options)
  process.stdout.pipe(concat(function (output) {
    callback(output.toString('utf8'))
  }))
}

// Tests start here

test('CLI: --help emits a usage text', function (t) {
  t.plan(2)
  ;[ ['-h'], ['--help'] ].forEach(function (argList) {
    execute(argList, function (output) {
      t.ok(output.match(/^\s+Usage.*/), 'contains usage with ' + argList)
    })
  })
})

test('CLI: --version emits correct version number', function (t) {
  t.plan(2)
  ;[ ['-V'], ['--version'] ].forEach(function (argList) {
    execute(argList, function (output) {
      t.equals(output, require('../package.json').version + '\n')
    })
  })
})

test('CLI: compiles 1 file', function (t) {
  t.plan(5)
  tmp.dir({ unsafeCleanup: true }, function (er, tmpDir, cleanup) {
    t.ifError(er, 'tmp dir created')

    var content = '[test](http://example.com)'
    var inputFileName = 'test.md'
    var expectedOutputFileName = 'test.pdf'
    var inputFile = path.join(tmpDir, inputFileName)
    var expectedOutputFile = path.join(tmpDir, expectedOutputFileName)

    fs.writeFile(inputFile, content, function (er) {
      t.ifError(er, 'wrote to ' + inputFile)

      execute([ inputFileName ], { cwd: tmpDir }, function (output) {
        t.equals(output, '')
        fs.stat(expectedOutputFile, function (er, stat) {
          t.ifError(er, expectedOutputFile + ' exists')
          t.ok(stat.size)

          cleanup()
        })
      })
    })
  })
})

test('CLI: compiles 3 files', function (t) {
  t.plan(3)
  tmp.dir({ unsafeCleanup: true }, function (er, tmpDir, cleanup) {
    t.ifError(er, 'tmp dir created')

    var content = '[test](http://example.com)' // written to each test file

    var names = [ 'test1', 'test2', 'test3' ]
    var namesMd = names.map(function (n) { return n + '.md' })
    var namesPdf = names.map(function (n) { return n + '.pdf' })

    var createInputFiles = function (callback) {
      async.each(
          namesMd.map(function (n) { return path.join(tmpDir, n) }),
          function (name, cb) { fs.writeFile(name, content, cb) },
          callback)
    }

    var convertFiles = function (callback) {
      execute(namesMd, { cwd: tmpDir }, function (output) {
        t.equals(output, '')
        callback()
      })
    }

    var checkOutputFiles = function (callback) {
      var filesPdf = namesPdf.map(function (n) { return path.join(tmpDir, n) })
      async.every(filesPdf, fs.exists, function (result, cb) {
        t.ok(result, 'all output files exist')
        callback()
      })
    }

    async.series([
      createInputFiles,
      convertFiles,
      checkOutputFiles,
      cleanup
    ])
  })
})
