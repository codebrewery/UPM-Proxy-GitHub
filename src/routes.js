'use strict'

const home = require('./controllers/home')
const upm = require('./controllers/api/upm')
const upmAll = require('./controllers/api/upm-all')
const upmDownload = require('./controllers/api/upm-download')
const upmClear = require('./controllers/api/upm-clear')

// Contains all routes and config
const method = {
  POST: 'post',
  GET: 'get'
}

const routes = [
  { route: '/', method: method.GET, controller: home },
  { route: '/error', method: method.GET, render: 'errors/error' },
  { route: '/upm/:scope/:packageName', method: method.GET, controller: upm },
  { route: '/upm/@:scope/-/all', method: method.GET, controller: upmAll },
  { route: '/upm/download/:scope/:packageName/:version/:hash', method: method.GET, controller: upmDownload },
  { route: '/upm/@:scope/cache/invalidate/:token', method: method.GET, controller: upmClear }
]

module.exports = {
  method,
  routes
}
