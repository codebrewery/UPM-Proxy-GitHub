'use strict'

const isAllowed = function (req) {
  const allowedScope = process.env.SCOPE
  if (allowedScope === undefined) {
    return true
  }

  if (req.params.scope !== undefined) {
    const scope = (req.params.scope.indexOf('@') < 0) ? `@${req.params.scope}` : req.params.scope
    return scope === allowedScope
  }

  return true
}

const middleWare = function (req, res, next) {
  if (!isAllowed(req)) {
    next('Not allowed')
  } else {
    next()
  }
}

module.exports = middleWare
