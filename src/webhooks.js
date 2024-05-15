'use strict'

// Webhook setup
const { Webhooks, createNodeMiddleware } = require('@octokit/webhooks')
const webhooks = new Webhooks({ secret: process.env.GITHUB_SECRET || '' })
const logger = require('./logic/winston')

// Webhooks
const { packageHandler } = require('./controllers/webhook/package')

// Endpoint is /api/github/webhooks
const register = function (app) {
  // Webhooks
  webhooks.on(['package', 'registry_package'], packageHandler)
  webhooks.onAny((obj) => {
    logger.debug(`A GitHhub webhook was received with id [${obj.id}], name [${obj.name}]`)
  })
  app.use(createNodeMiddleware(webhooks))
}

module.exports = {
  register
}
