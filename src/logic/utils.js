'use strict'

const { https } = require('follow-redirects')
const logger = require('./winston')

const clearToken = process.env.CLEAR_TOKEN || ''
const cacheTTL = parseInt(process.env.CACHE_TTL || 7200, 10)

const NodeCache = require('node-cache')
const cache = new NodeCache({ stdTTL: cacheTTL, checkperiod: 0 })

const generateCacheKey = function (req) {
  return `${req.url}.${req.token}`
}

const cacheGet = function (req) {
  return cache.get(generateCacheKey(req))// undefined if a miss
}

const successfulJsonResponse = function (req, res, json) {
  res.status(200).json(json)
  cache.set(generateCacheKey(req), json)
}

const invalidateCache = function (token) {
  if (clearToken === token) {
    logger.info('cache invalidation request')
    logger.info(JSON.stringify(cache.getStats()))
    cache.flushAll()
    return true
  }
  return false
}

const request = function (url, token, host) {
  logger.debug('outgoing request: ' + url)

  return new Promise((resolve, reject) => {
    const options = {
      url: url,
      method: 'GET',
      headers: {
        Accept: 'application/json;',
        'Accept-Encoding': 'gzip',
        'User-Agent': 'npm',
        authorization: `Bearer ${token}`
      },
      encoding: null,
      gzip: true,
      timeout: 30000,
      strictSSL: true,
      agentOptions: {}
    }

    const responseHandler = function (response) {
      let data = ''

      response.on('data', function (chunk) {
        data += chunk
      })

      response.on('end', function () {
        if (response.statusCode !== 200) {
          return reject(JSON.parse(data))
        }

        const result = data.split('https://npm.pkg.github.com/download/').join(`${host}/upm/download/`)
        let json = {}

        try {
          json = JSON.parse(result)
        } catch (e) {
          return reject(e)
        }
        for (const version in json.versions) {
          const url = json.versions[version].repository.url
          const name = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.git'))
          json.displayName = name
          json.versions[version].displayName = name
        }
        resolve(json)
      })
    }

    const request = https.request(url, options, responseHandler)

    request.on('error', reject)

    request.end()
  })
}

const requestTarBall = function (url, token, packageName, res) {
  const options = {
    url: url,
    method: 'GET',
    followAllRedirects: true,
    headers: {
      Accept: 'application/*',
      'User-Agent': 'npm',
      authorization: `Bearer ${token}`
    },
    encoding: null,
    gzip: true,
    timeout: 30000,
    strictSSL: true,
    agentOptions: {}
  }

  res.setHeader('Content-type', 'application/x-gzip')
  res.setHeader('Content-Disposition', `attachment; filename="${packageName}.tar.gz"`)

  const responseHandler = function (response) {
    response.on('data', function (chunk) {
      res.write(chunk)
    })
    response.on('end', function () {
      res.end()
    })
  }

  const request = https.request(url, options, responseHandler)
  request.on('error', (err) => {
    res.status(500).json(err)
  })
  request.end()
}

module.exports = {
  request,
  requestTarBall,
  successfulJsonResponse,
  cacheGet,
  invalidateCache
}
