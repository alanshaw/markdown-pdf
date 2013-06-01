var markdownpdf = require("../")
  , assert = require("assert")
  , fs = require("fs")

describe("markdownpdf", function() {
  
  it("should generate a nonempty PDF from ipsum.md", function (done) {
    
    markdownpdf(__dirname + "/fixtures/ipsum.md", function (er, pdfs) {
      assert.ifError(er)
      
      // Read the file
      fs.readFile(pdfs[0], {encoding: "utf-8"}, function (er, data) {
        assert.ifError(er)
        // Test not empty
        assert.ok(data.length > 0)
        done()
      })
    })
  })
  
  it("should call preProcessMd hook", function (done) {
    
    function preProcessMd (data) {
      // Should pass Markdown for us to process before it is converted to HTML
      assert.strictEqual(fs.readFileSync(__dirname + "/fixtures/ipsum.md", {encoding: 'utf-8'}), data)
      return data
    }
    
    markdownpdf(__dirname + "/fixtures/ipsum.md", {preProcessMd: preProcessMd}, function (er, pdfs) {
      assert.ifError(er)
      
      // Read the file
      fs.readFile(pdfs[0], {encoding: "utf-8"}, function (er, data) {
        assert.ifError(er)
        // Test not empty
        assert.ok(data.length > 0)
        done()
      })
    })
  })
  
  it("should call preProcessHtml hook", function (done) {
    
    function preProcessHtml (html) {
      // Should pass HTML for us to process before it is converted to PDF
      assert.strictEqual(fs.readFileSync(__dirname + "/fixtures/ipsum.html", {encoding: 'utf-8'}), html)
      return html
    }
    
    markdownpdf(__dirname + "/fixtures/ipsum.md", {preProcessHtml: preProcessHtml}, function (er, pdfs) {
      assert.ifError(er)
      
      // Read the file
      fs.readFile(pdfs[0], {encoding: "utf-8"}, function (er, data) {
        assert.ifError(er)
        // Test not empty
        assert.ok(data.length > 0)
        done()
      })
    })
  })

  it("should concatenate source files", function (done) {

    var files = [
        __dirname + "/fixtures/first.md"
      , __dirname + "/fixtures/second.md"
    ]

    markdownpdf(files, {concatFiles: true}, function(er, pdfs) {
      assert.ifError(er)

      // Only one PDF should be created
      assert.equal(pdfs.length, 1)

      // Read the file
      fs.readFile(pdfs[0], {encoding: "utf-8"}, function (er, data) {
        assert.ifError(er)
        // Test not empty
        assert.ok(data.length > 0)
        done()
      })
    })
  })
})
