'use strict'

const cluster = require('cluster')
const WORKERS = parseInt(process.env.WEB_CONCURRENCY || 1)

console.log('WORKERS: ', WORKERS)

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`)

  // Fork workers.
  for (let i = 0; i < WORKERS; i++) {
    cluster.fork()
  }

  cluster.on('online', function (worker) {
    console.log('Worker ' + worker.process.pid + ' is online')
  })

  cluster.on('exit', function (worker, code, signal) {
    console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal)
    console.log('Starting a new worker')
    cluster.fork()
  })
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  require('./web')

  console.log(`Worker ${process.pid} started`)
}
