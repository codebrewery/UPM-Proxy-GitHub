'use strict'

const utils = require('../../logic/utils')

function packageHandler (eventObject) {
  utils.flushCache()
}

module.exports = {
  packageHandler
}
