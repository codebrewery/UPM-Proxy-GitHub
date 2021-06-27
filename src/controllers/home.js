'use strict'

const info = require('../../package.json')

const controller = function (req, res) {
  const host = req.secure ? `https://${req.headers.host}` : `http://${req.headers.host}`
  const site = {
    scope: process.env.SCOPE || '',
    host: `${host}/upm/`,
    packageScope: process.env.PACKAGE_SCOPE
  }
  res.render('home', { info, site })
}

module.exports = {
  controller
}
