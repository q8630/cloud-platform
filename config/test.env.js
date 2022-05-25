'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  APP_ENV: '"TEST"',
  NODE_ENV: '"test"'
})
