'use strict'

const { Octokit } = require('@octokit/core')
const utils = require('./utils')
const config = require('../../package.json').config

async function getOrgPackageData (scope, token, host) {
  // This is the object all the data is added to and cached in memory once
  let resultObject = {
    all: {},
    packages: {}
  }

  // Set-up octokit with PAT
  const octokit = new Octokit({ auth: token })

  // Get all org packages
  const packages = await octokit.request('GET /orgs/{org}/packages', {
    org: scope,
    package_type: 'npm',
    per_page: 100
  })

  // Create all parallel requests
  const promises = packages.data.map(element => {
    return getPackage(scope, element.name, token, host, resultObject)
  })

  // Run all parallel requests
  await Promise.all(promises)

  // Save the data in memory
  utils.cachePackageData(token, resultObject)

  // Return the data from memory
  return utils.getCachedLatestVersions(token)
}

async function getPackage (scope, packageName, token, host, resultObject) {
  // Run the async request
  const packageData = await utils.request(`${config.registry}/@${scope}/${packageName}`, token, host)

  // Append to the result object
  resultObject.all[`${packageName}`] = packageData['dist-tags'].latest
  resultObject.packages[`${packageName}`] = packageData
  return packageData
}

module.exports = {
  getOrgPackageData
}
