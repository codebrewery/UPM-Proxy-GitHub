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

const schema = Joi.object({
  scope: Joi.required()
})
const { graphql } = require('@octokit/graphql')

const logger = require('../../logic/winston')
const utils = require('../../logic/utils')

function controller (req, res) {
  const token = req.token || process.env.GITHUB_TOKEN
  const { scope } = req.params
  const context = (process.env.SCOPE_TYPE === 'USER') ? 'user' : 'organization' // defaults to organization

  query(scope, token, context).then((result) => {
    utils.successfulJsonResponse(req, res, transformJson(result, context))
    logger.debug(result)
  }).catch((err) => {
    res.status(500).json(err.message)
  })
}

/**
 * Create a JSON response for /-/all endpoint
 * @param queryResult
 * @param context
 * @returns {{_updated: number}}
 */
function transformJson (queryResult, context) {
  const json = {
    _updated: 99999
  }
  queryResult[context].packages.nodes.forEach(element => {
    if (element.packageType === 'NPM') {
      json[element.name] = element.latestVersion
    }
  })
  return json
}

async function query (scope, token, context) {
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `bearer ${token}`
    }
  })
  const query = {
    query: ` query {
        ${context}(login: "${scope}") {
          packages(first: 100) {
            totalCount
            nodes {
              name
              latestVersion {
                version
                package {
                  name
                }
              }
              packageType
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      }
      `
  }
  return await graphqlWithAuth(query)
}

module.exports = {
  schema,
  controller
}
