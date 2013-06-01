module.exports = process.env.MARKDOWNPDF_COV
   ? require('./lib-cov/markdown-pdf')
   : require('./lib/markdown-pdf')