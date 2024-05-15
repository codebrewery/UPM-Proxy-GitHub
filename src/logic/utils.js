'use strict'

const { https } = require('follow-redirects')
const logger = require('./winston')

const cacheTTL = parseInt(process.env.CACHE_TTL || 7200, 10)

const NodeCache = require('node-cache')
const cache = new NodeCache({ stdTTL: cacheTTL, checkperiod: 0 })

let memoryData = {}

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

const cachePackageData = function (token, json) {
  memoryData[token] = json
}

const getCachedLatestVersions = function (token) {
  return memoryData[token].all
}

const hasCachedPackageData = function (token) {
  return memoryData[token] !== undefined
}

const getCachedPackageData = function (token, packageName) {
  return memoryData[token].packages[packageName]
}

const flushCache = function () {
  logger.info('Cache invalidation request. Current cache:')
  logger.info(JSON.stringify(cache.getStats()))
  cache.flushAll()
  memoryData = {}
  logger.info('Cache after request:')
  logger.info(JSON.stringify(cache.getStats()))
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

        let json = {}

        try {
          json = JSON.parse(data)
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

module.exports = {
  request,
  successfulJsonResponse,
  cacheGet,
  flushCache,
  cachePackageData,
  hasCachedPackageData,
  getCachedLatestVersions,
  getCachedPackageData
}
