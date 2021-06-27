/**
 * @api {post} /echo/ Echo
 * @apiName Echo
 * @apiGroup Test
 * @apiVersion 0.0.1
 * @apiDescription Cached
 *
 * @apiParam {String} [info] Optional info to echo
 *
 */
'use strict'

const Joi = require('@hapi/joi')
const schema = Joi.object()

const utils = require('../../logic/utils')

function controller (req, res) {
  const { token } = req.params
  if (utils.invalidateCache(token)) {
    res.status(200).json({ cache: 'cleared' })
  } else {
    res.status(401).json({ cache: 'not-cleared' })
  }
}

module.exports = {
  schema,
  controller
}
