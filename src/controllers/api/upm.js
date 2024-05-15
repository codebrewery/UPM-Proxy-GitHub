'use strict'

const Joi = require('joi')
const utils = require('../../logic/utils')
const { getOrgPackageData } = require('../../logic/retrievePackageData')
const schema = Joi.object({
  scope: Joi.required(),
  packageName: Joi.required()
})

function controller (req, res) {
  const { packageName, scope } = req.params
  const host = req.secure ? `https://${req.headers.host}` : `http://${req.headers.host}`
  const token = req.token || process.env.GITHUB_TOKEN

  getPackageData(scope, token, host).then(() => {
    const packageData = utils.getCachedPackageData(token, packageName)
    utils.successfulJsonResponse(req, res, packageData)
  })
}

async function getPackageData (scope, token, host) {
  if (utils.hasCachedPackageData(token) === false) {
    // The package data for this user is not cached, retrieve the data
    await getOrgPackageData(scope, token, host)
  }
}

module.exports = {
  schema,
  controller
}
