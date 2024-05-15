'use strict'

const home = require('./controllers/home')
const upm = require('./controllers/api/upm')
const upmAll = require('./controllers/api/upm-all')

// Contains all routes and config
const method = {
  POST: 'post',
  GET: 'get'
}

const routes = [
  { route: '/', method: method.GET, controller: home },
  { route: '/error', method: method.GET, render: 'errors/error' },
  { route: '/upm/@:scope/:packageName', method: method.GET, controller: upm },
  { route: '/upm/@:scope/-/all', method: method.GET, controller: upmAll }
]

module.exports = {
  method,
  routes
}
