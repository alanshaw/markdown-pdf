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
  }
}