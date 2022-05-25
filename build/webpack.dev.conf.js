'use strict'
const utils = require('./utils')
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin')

const config = require('../config')
const settings = require('../src/settings')
const baseWebpackConfig = require('./webpack.base.conf')
const env = require('../config/dev.env')

const host = process.env.HOST || config.dev.host
const port = process.env.PORT && Number(process.env.PORT) || config.dev.port

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = merge(baseWebpackConfig, {
  mode: 'development',
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [{
        from: /.*/,
        to: path.posix.join(config.dev.assetsPublicPath, 'index.html')
      }]
    },
    hot: true,
    contentBase: resolve('public'), // since we use CopyWebpackPlugin.
    compress: true,
    host: host,
    port: port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll,
    },
    disableHostCheck: true
  },
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
  },
  plugins: [
    new webpack.DefinePlugin({
      'APP_ENV': env.APP_ENV,
      'process.env': env
    }),
    new webpack.HotModuleReplacementPlugin(),
    new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: [`Your application is running here: http://${host}:${port}`],
      }
    }),
    new CopyWebpackPlugin([{
      from: resolve('dist/vendor.dll.js'),
      to: config.dev.assetsSubDirectory
    }]),
    new webpack.DllReferencePlugin({
      manifest: resolve('dist/vendor-manifest.json')
    }),
    new HtmlWebpackPlugin({
      title: settings.title,
      filename: 'index.html',
      template: resolve('public/index.html'),
      inject: true
    }),
    new HtmlWebpackIncludeAssetsPlugin({
      assets: [config.dev.assetsSubDirectory + '/vendor.dll.js'],
      append: false
    })
  ]
})
