var fs = require('fs')
var browserify = require('browserify')

browserify('./main.js')
  .transform({global: true}, 'browserify-shim')
  .transform('babelify', {presets: ['es2015']})
  // .transform('uglifyify', {global: true})
  .bundle()
  .pipe(fs.createWriteStream('dist/bundle.js'))
