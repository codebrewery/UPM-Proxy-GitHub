'use strict'

const express = require('express')
const bearerToken = require('express-bearer-token')
const path = require('path')
const helmet = require('helmet')
const cors = require('cors')
const routeMapper = require('./routeMapper')
const webhooks = require('../webhooks')
const logger = require('./winston')

// middleware
const cache = require('./middleware-cache')

const PATH = path.join(__dirname, '/..')
const app = express()

app.set('views', path.join(PATH, 'views'))
app.set('view engine', 'pug')
app.set('trust proxy', 1)
app.disable('etag')
app.disable('x-powered-by')

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(PATH, 'public')))
app.use(helmet())
app.use(bearerToken())
app.use(cache)

// Routes
routeMapper.mapRoutes(app)

// WebHooks
webhooks.register(app)

// Error handlers
app.use(function (req, res) {
  logger.debug(req.url)
  res.status(404).render('errors/not-found')
})

app.use(function (err, req, res) {
  res.locals.message = err.message
  res.locals.error = err
  res.status(err.status || 500)
  if (req.method === 'POST') {
    return res.json(err)
  }
  if ((process.env.NODE_ENV || 'dev').toLowerCase() !== 'production') {
    res.render('errors/error-dev')
  } else {
    res.render('errors/error')
  }
})

module.exports = app
