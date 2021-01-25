// FILE: <project>/backend/src/app.js
'use strict'

const path = require('path')
const cors = require('cors')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const express = require('express')

const app = express()

const config = require('./config')
const LanguageServerService = require('./services/LanguageServerService.js')

/*
 * To be able to the proxy method for the web editor request,
 * we have to enable Cross-Origin Resource Sharing (CORS).
 * What is CORS: http://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
 */
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, origin)
    },
    credentials: true
  })
)

// log output format
app.use(morgan('combined'))
// converts the request and responses automatically into the JSON format
app.use(bodyParser.json())

require('./routes')(app)
async function run () {
  const port = 8085 // configure your port
  const languageServerPath = path.resolve(
    process.cwd(),
    config.paths.languageServer
  )
  await LanguageServerService.startLanguageServer(languageServerPath)
  app.listen(port) // start the backend
  console.log(`listening http://localhost:${port}`)
}

run()
