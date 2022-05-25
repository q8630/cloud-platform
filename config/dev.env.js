'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  APP_ENV: '"DEV"',
  NODE_ENV: '"development"',
  BABEL_ENV: '"development"'
})
