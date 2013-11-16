var markdownpdf = require("../")
  , assert = require("assert")
  , fs = require("fs")

// TODO: Remove when 0.12 is released
var encoding = process.version.indexOf("0.8") == -1 ? {encoding: "utf8"} : "utf8"

describe("markdownpdf", function() {
  
  it("should generate a nonempty PDF from ipsum.md", function (done) {
    
    this.timeout(5000)
    
    markdownpdf(__dirname + "/fixtures/ipsum.md", function (er, pdf) {
      assert.ifError(er)
      
      // Read the file
      fs.readFile(pdf, encoding, function (er, data) {
        assert.ifError(er)
        // Test not empty
        assert.ok(data.length > 0)
        done()
      })
    })
  })
  
  it("should call preProcessMd hook", function (done) {
    
    this.timeout(5000)
    
    function preProcessMd (data) {
      // Should pass Markdown for us to process before it is converted to HTML
      assert.strictEqual(fs.readFileSync(__dirname + "/fixtures/ipsum.md", encoding), data)
      return data
    }
    
    markdownpdf(__dirname + "/fixtures/ipsum.md", {preProcessMd: preProcessMd}, function (er, pdf) {
      assert.ifError(er)
      
      // Read the file
      fs.readFile(pdf, encoding, function (er, data) {
        assert.ifError(er)
        // Test not empty
        assert.ok(data.length > 0)
        done()
      })
    })
  })
  
  it("should call preProcessHtml hook", function (done) {
    
    this.timeout(5000)
    
    function preProcessHtml (html) {
      // Should pass HTML for us to process before it is converted to PDF
      // Note: test does not pass on windows because of different line endings.
      assert.strictEqual(fs.readFileSync(__dirname + "/fixtures/ipsum.html", encoding), html)
      return html
    }
    
    markdownpdf(__dirname + "/fixtures/ipsum.md", {preProcessHtml: preProcessHtml}, function (er, pdf) {
      assert.ifError(er)
      
      // Read the file
      fs.readFile(pdf, encoding, function (er, data) {
        assert.ifError(er)
        // Test not empty
        assert.ok(data.length > 0)
        done()
      })
    })
  })

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
})
