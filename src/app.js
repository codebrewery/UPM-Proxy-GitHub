'use strict'

const PORT = process.env.PORT || '8080'

const server = require('./logic/server')
const logger = require('./logic/winston')

server.listen(PORT, () => logger.info(`App listening on port ${PORT}`))
