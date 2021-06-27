'use strict'

const { createLogger, format, transports } = require('winston')
const { combine, timestamp, label, printf } = format

const myFormat = printf(info => {
  return `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`
})

const logger = createLogger({
  format: combine(
    label({ label: 'Generic' }),
    timestamp(),
    myFormat
  ),
  transports: []
})

function getConsoleTransport () {
  if ((process.env.NODE_ENV || 'dev').toLowerCase() !== 'production') {
    return new transports.Console({
      level: 'debug',
      colorize: true
    })
  }

  // Production logger
  return new transports.Console({
    level: 'info',
    colorize: true
  })
}

logger.add(getConsoleTransport())

module.exports = logger
