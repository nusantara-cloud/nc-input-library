## Abstract
This repo showcases a simplest way of doing NodeJS-style programming
in web frontend.

## Libraries Used:
1. browserify: Allows node-style 'require' module-management.
2. browserify-shim: Allows using non-NPM modules with browserify
3. babelify: JS Transpiler
4. babel-presets-es2015: ES6 -> ES5 presets.

## Project Structure:
1. Coding entry-point is main.js
2. Transpilation is done through run.js
3. bundle.js is the final result to be included by the browser

# Commands
1. npm start: spawns a nodemon that kics run.js when any file changes
