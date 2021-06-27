'use strict'

const utils = require('./utils')

const middleWare = function (req, res, next) {
  const cachedResponse = utils.cacheGet(req)
  if (cachedResponse !== undefined) {
    res.status(200).json(cachedResponse)
  } else {
    next()
  }
}

module.exports = middleWare
