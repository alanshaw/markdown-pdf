var markdownpdf = require("../")
  , assert = require("assert")
  , fs = require("fs")
  , tmp = require("tmp")
  , through = require("through")

tmp.setGracefulCleanup()

// TODO: Remove when 0.12 is released
var encoding = process.version.indexOf("0.8") == -1 ? {encoding: "utf8"} : "utf8"

describe("markdownpdf", function() {

  it("should generate a nonempty PDF from ipsum.md", function (done) {

    this.timeout(5000)

    tmp.file({postfix: ".pdf"}, function (er, tmpPdfPath, tmpPdfFd) {
      assert.ifError(er)
      fs.close(tmpPdfFd)

      markdownpdf().from(__dirname + "/fixtures/ipsum.md").to(tmpPdfPath, function (er) {
        assert.ifError(er)

        // Read the file
        fs.readFile(tmpPdfPath, encoding, function (er, data) {
          assert.ifError(er)
          // Test not empty
          assert.ok(data.length > 0)
          done()
        })
      })
    })
  })

  it("should call preProcessMd hook", function (done) {

    this.timeout(5000)

    var throughCount = 0
      , preProcessMd = through(function (data) { throughCount++; this.queue(data) })

    markdownpdf({preProcessMd: preProcessMd}).from(__dirname + "/fixtures/ipsum.md").to.string(function (er, pdfStr) {
      assert.ifError(er)

      // Test not empty
      assert.ok(pdfStr.length > 0)
      assert(throughCount > 0, "Through count expected to be > 0")
      done()
    })
  })

  it("should call preProcessHtml hook", function (done) {

    this.timeout(5000)

    var throughCount = 0
      , preProcessHtml = through(function (data) { throughCount++; this.queue(data) })

    markdownpdf({preProcessHtml: preProcessHtml}).from(__dirname + "/fixtures/ipsum.md").to.string(function (er, pdfStr) {
      assert.ifError(er)

      // Test not empty
      assert.ok(pdfStr.length > 0)
      assert(throughCount > 0, "Through count expected to be > 0")
      done()
    })
  })
/*
  it("should concatenate source files", function (done) {

    this.timeout(5000)

    var files = [
        __dirname + "/fixtures/first.md"
      , __dirname + "/fixtures/second.md"
    ]

    markdownpdf(files, {concatFiles: true}, function(er, pdf) {
      assert.ifError(er)

      // Only one PDF should be created
      if (Object.prototype.toString.call(pdf) == '[object Array]')
        throw "concatenated source files should return one pdf"

      // Read the file
      fs.readFile(pdf, {encoding: "utf-8"}, function (er, data) {
        assert.ifError(er)
        // Test not empty
        assert.ok(data.length > 0)
        done()
      })
    })
  })

  it("should return array of paths when converting multiple files", function (done) {

    this.timeout(5000)

    var files = [
        __dirname + "/fixtures/first.md"
      , __dirname + "/fixtures/second.md"
    ]

    markdownpdf(files, function(er, pdfs) {
      assert.ifError(er)

      // Two PDFs should be created
      if (Object.prototype.toString.call(pdfs) == '[object String]')
        throw "converting multiple files should return multiple paths"

      assert.equal(pdfs.length, 2, "should return two file paths")

      // Read the files
      for (var i = 0; i < pdfs.length; i++) {
        fs.readFile(pdfs[i], {encoding: "utf-8"}, function (er, data) {
          assert.ifError(er)
          // Test not empty
          assert.ok(data.length > 0)
        })
      }

      done()
    })
  })
*/
})
