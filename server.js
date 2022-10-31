const fs = require('fs')
const path = require('path')
const express = require('express')
const https = require('https')
const http = require('http')
const compression = require('compression')
const morgan = require('morgan')
const helmet = require('helmet')
const { createRequestHandler } = require('@remix-run/express')

const BUILD_DIR = path.join(process.cwd(), 'build')

// load the .env variables
require('dotenv').config()

const app = express()

app.use(compression())

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by')

// http://expressjs.com/en/advanced/best-practice-security.html#use-helmet
app.use(helmet())

// Remix fingerprints its assets so we can cache forever.
app.use(
  '/build',
  express.static('public/build', { immutable: true, maxAge: '1y' })
)

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static('public', { maxAge: '1h' }))

// https://github.com/expressjs/morgan
app.use(morgan('tiny'))

app.all(
  '*',
  process.env.NODE_ENV === 'development'
    ? (req, res, next) => {
        purgeRequireCache()

        return createRequestHandler({
          build: require(BUILD_DIR),
          mode: process.env.NODE_ENV,
        })(req, res, next)
      }
    : createRequestHandler({
        build: require(BUILD_DIR),
        mode: process.env.NODE_ENV,
      })
)

const port = process.env.PORT || 3000
const host = process.env.HOST || 'localhost'
const useSSL = process.env.HTTPS === 'true' || false

if (useSSL) {
  const options = {
    key: fs.readFileSync(process.env.SSL_KEY_FILE, 'utf8'),
    cert: fs.readFileSync(process.env.SSL_CRT_FILE, 'utf8'),
  }

  https.createServer(options, app).listen(port, host, () => {
    console.log(`Express server listening on https://${host}:${port}`)
  })
} else
  http.createServer(app).listen(port, host, () => {
    console.log(`Express server listening on http://${host}:${port}`)
  })

function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, but then you'll have to reconnect to databases/etc on each
  // change. We prefer the DX of this, so we've included it for you by default
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key]
    }
  }
}
