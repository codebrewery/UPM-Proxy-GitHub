'use strict'

const Joi = require('@hapi/joi')
const utils = require('../../logic/utils')
const schema = Joi.object()
const config = require('../../../package.json').config

function controller (req, res) {
  const token = req.token || process.env.GITHUB_TOKEN
  const { scope, packageName, version, hash } = req.params

  const url = `${config.registry}/download/${scope}/${packageName}/${version}/${hash}`

  utils.requestTarBall(url, token, packageName, res)
}

module.exports = {
  schema,
  controller
}
