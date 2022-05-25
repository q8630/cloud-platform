'use strict'
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin')
const PrerenderSPAPlugin = require('prerender-spa-plugin')

const utils = require('./utils')
const config = require('../config')
const settings = require('../src/settings')
const baseWebpackConfig = require('./webpack.base.conf')

function resolve(dir) {
    return path.join(__dirname, '..', dir)
}

const NODE_ENV = process.env.NODE_ENV
let env

switch(NODE_ENV) {
  case 'production':
    env = require('../config/prod.env')
    break
  case 'preproduction':
    env = require('../config/preprod.env')
    break
  case 'test':
    env = require('../config/test.env')
    break
  case 'development':
    env = require('../config/dev.env')
    break
  default:
    env = require('../config/prod.env')
}

const webpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.cssSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash:8].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash:8].js')
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        default: false,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'initial',
          priority: 10
        },
        commons: {
          test: /src[\\/]utils[\\/]|src[\\/]components[\\/]/,
          name: 'commons',
          minChunks: 2,
          chunks: 'all',
          priority: 1,
          reuseExistingChunk: true
        }
      }
    },
    runtimeChunk: {
      name: 'manifest'
    },
    minimizer: [
      new UglifyJsPlugin({
        exclude: /\.min\.js$/,
        cache: true,
        uglifyOptions: {
          warnings: false,
          compress: {
            drop_console: NODE_ENV === 'production'
          }
        },
        sourceMap: config.build.productionSourceMap,
        parallel: true
      }),
      // Compress extracted CSS. We are using this plugin so that possible
      // duplicated CSS from different components can be deduped.
      new OptimizeCSSPlugin({
        cssProcessorOptions: config.build.cssSourceMap
          ? { safe: true, map: { inline: false }/*, autoprefixer: { remove: false, disable: true }*/ }
          : { safe: true/*, autoprefixer: { remove: false, disable: true }*/ }
      })
    ]
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'APP_ENV': env.APP_ENV,
      'process.env': env
    }),
    // extract css into its own file
    new MiniCssExtractPlugin({
      filename: utils.assetsPath('css/[name].[contenthash:8].css'),
      chunkFilename: utils.assetsPath('css/[id].[contenthash:8].css')
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      title: settings.title,
      filename: config.build.index,
      template: resolve('public/index.html'),
      inject: true,
      chunks: ['manifest', 'vendors', 'elementUI', 'commons', 'main'],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    new InlineManifestWebpackPlugin('manifest'),
    // prerender
    new PrerenderSPAPlugin({
      // Required - The path to the webpack-outputted app to prerender.
      staticDir: config.build.assetsRoot,
      // Required - Routes to render.
      routes: settings.prerenderRoutes,
    }),
    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
    // copy custom static assets
    new CopyWebpackPlugin([{
      from: resolve('public'),
      to: config.build.assetsRoot,
      ignore: ['.*']
    }])
  ]
})

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp('\\.(' + config.build.productionGzipExtensions.join('|') + ')$'),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
