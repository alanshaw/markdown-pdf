var markdownpdf = require("../")
  , fs = require("fs")

module.exports = {
  
  "Test generated ipsum.pdf from ipsum.md is not empty": function (test) {
    
    markdownpdf(__dirname + "/fixtures/ipsum.md", function (er, pdfs) {
      test.ifError(er)
      
      // Read the file
      fs.readFile(pdfs[0], {encoding: "utf-8"}, function (er, data) {
        test.ifError(er)
        // Test not empty
        test.ok(data.length > 0)
        test.done()
      })
    })
  },
  
  "Test preProcessMd hook is invoked": function (test) {
    
    test.expect(4)
    
    function preProcessMd (data) {
      // Should pass Markdown for us to process before it is converted to HTML
      test.deepEqual(fs.readFileSync(__dirname + "/fixtures/ipsum.md", {encoding: 'utf-8'}), data)
      return data
    }
    
    markdownpdf(__dirname + "/fixtures/ipsum.md", {preProcessMd: preProcessMd}, function (er, pdfs) {
      test.ifError(er)
      
      // Read the file
      fs.readFile(pdfs[0], {encoding: "utf-8"}, function (er, data) {
        test.ifError(er)
        // Test not empty
        test.ok(data.length > 0)
        test.done()
      })
    })
  },
  
  "Test preProcessHtml hook is invoked": function (test) {
    
    test.expect(4)
    
    function preProcessHtml (html) {
      // Should pass HTML for us to process before it is converted to PDF
      test.deepEqual(fs.readFileSync(__dirname + "/fixtures/ipsum.html", {encoding: 'utf-8'}), html)
      return html
    }
    
    markdownpdf(__dirname + "/fixtures/ipsum.md", {preProcessHtml: preProcessHtml}, function (er, pdfs) {
      test.ifError(er)
      
      // Read the file
      fs.readFile(pdfs[0], {encoding: "utf-8"}, function (er, data) {
        test.ifError(er)
        // Test not empty
        test.ok(data.length > 0)
        test.done()
      })
    })
  }
}