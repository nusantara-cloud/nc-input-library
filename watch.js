var fs = require('fs')
var browserify = require('browserify')
var watchify = require('watchify')

// const b = browserify('./main.js', {cache: {}, packageCache: {}, plugin: [watchify]})
const b = browserify('./main.js', {cache: {}, packageCache: {}})
  .transform({global: true}, 'browserify-shim')
  .transform('babelify', {presets: ['es2015']})
  .transform('uglifyify', {global: true})
  .plugin(watchify)
  .on('update', bundle)
  .on('error', err => console.log(err))

function bundle () {
  console.log('Bundling...')
  console.time('bundling-finished')
  b.bundle()
    .on('error', err => console.error(err.message))
    .pipe(fs.createWriteStream('dist/bundle.js'))
    .on('finish', () => {
      console.timeEnd('bundling-finished')
    })
}

// When the command is frist run, execute bundle
bundle()
