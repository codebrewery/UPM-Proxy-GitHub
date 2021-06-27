'use strict'

const Joi = require('@hapi/joi')
const utils = require('../../logic/utils')
const config = require('../../../package.json').config

const schema = Joi.object({
  scope: Joi.required(),
  packageName: Joi.required()
})

function controller (req, res) {
  const token = req.token || process.env.GITHUB_TOKEN
  const { scope, packageName } = req.params

  const host = req.secure ? `https://${req.headers.host}` : `http://${req.headers.host}`

  utils.request(`${config.registry}/${scope}%2F${packageName}`, token, host)
    .then(result => {
      utils.successfulJsonResponse(req, res, result)
    })
    .catch(err => {
      res.status(500).json(err)
    })
}

module.exports = {
  schema,
  controller
}
