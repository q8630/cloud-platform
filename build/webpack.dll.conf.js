const path = require('path')
const webpack = require('webpack')
const pkg = require('../package.json')

const excludes = ['element-ui', 'normalize.css']

function resolve (dir) {
    return path.join(__dirname, '..', dir)
}

module.exports = {
  mode: 'development',
  context: path.resolve(__dirname, '../'),
  entry: {
    vendor: Object.keys(pkg.dependencies).filter(item => excludes.indexOf(item) === -1)
  },
  output: {
    path: resolve('dist'),
    filename: '[name].dll.js',
    library: '_dll_[name]'
  },
  plugins: [
    new webpack.DllPlugin({
      name: '_dll_[name]',
      path: resolve('dist/[name]-manifest.json'),
      context: path.resolve(__dirname, '../')
    })
  ]
}
