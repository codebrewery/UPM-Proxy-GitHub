/**
 * @api {post} /echo/ Echo
 * @apiName Echo
 * @apiGroup Test
 * @apiVersion 0.0.1
 * @apiDescription Cached
 *
 * @apiParam {String} [info] Optional info to echo
 *
 */
'use strict'

const Joi = require('joi')
const schema = Joi.object({
  scope: Joi.required()
})
const utils = require('../../logic/utils')
const { getOrgPackageData } = require('../../logic/retrievePackageData')

function controller (req, res) {
  const token = req.token || process.env.GITHUB_TOKEN
  const { scope } = req.params

  const host = req.secure ? `https://${req.headers.host}` : `http://${req.headers.host}`
  getOrgPackageData(scope, token, host).then((result) => {
    utils.successfulJsonResponse(req, res, result)
  }).catch((err) => {
    res.status(500).json(err.message)
  })
}

module.exports = {
  schema,
  controller
}
