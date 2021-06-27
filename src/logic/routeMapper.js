'use strict'

const express = require('express')
const router = express.Router()
const routes = require('../routes')
const logger = require('./winston')
const scope = require('./middleware-scope')

const schemaValidation = function (script, config, req, res, next) {
  if (script.schema === undefined) {
    return {}
  }
  const data = (config.method === routes.method.POST) ? req.body : req.params
  return script.schema.validate(data)
}

const configureRoute = function (route, config) {
  // Create the action
  const routerAction = function (req, res) {
    if (config.controller !== undefined) {
      const script = config.controller
      const act = config.act || 'controller'
      script[act](req, res, config.context)
    }

    if (config.render !== undefined) {
      res.render(config.render)
    }
  }

  // Create the middleware
  const routerMiddleware = function (req, res, next) {
    if (config.controller === undefined) {
      return next()
    }

    // Validation
    const { error } = schemaValidation(config.controller, config, req, res, next)
    if (error) {
      return next(error)
    }

    scope(req, res, next)
  }

  switch (config.method) {
    case routes.method.GET:
      router.get(route, routerMiddleware, routerAction)
      break
    case routes.method.POST:
      router.post(route, routerMiddleware, routerAction)
      break
  }
}

const mapRoutes = function (app) {
  routes.routes.forEach(entry => {
    logger.info(`Registering Route ${entry.route}`)
    configureRoute(entry.route, entry)
  })

  app.use('/', router)

  const scopeType = process.env.SCOPE_TYPE || 'ORG'
  logger.info(`Scope type is set to ${scopeType}`)
}

module.exports = {
  mapRoutes
}
