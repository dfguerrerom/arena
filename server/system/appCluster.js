const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')

const sessionMiddleware = require('./sessionMiddleware')
const headerMiddleware = require('./headerMiddleware')
const accessControlMiddleware = require('./accessControlMiddleware')
const authConfig = require('../auth/authConfig')
const authApi = require('../auth/authApi')
const apiRouter = require('./apiRouter')
const WebSocketManager = require('../webSocket/webSocketManager')
const RecordPreviewCleanup = require('./recordPreviewCleanup')

module.exports = async () => {

  const app = express()

// ====== app initializations
  app.use(bodyParser.json({limit: '5000kb'}))
  app.use(cookieParser())
  app.use(fileUpload({
    //limit upload to 10MB
    limits: {fileSize: 10 * 1024 * 1024},
    abortOnLimit: true
  }))

  headerMiddleware.init(app)
  app.use(sessionMiddleware)
  authConfig.init(app)
//accessControlMiddleware must be initialized after authConfig
  accessControlMiddleware.init(app)

  app.use(compression({threshold: 512}))

  app.use('/', express.static(`${__dirname}/../../dist`))
  app.use('/app*', express.static(`${__dirname}/../../dist`))
  app.use('/img/', express.static(`${__dirname}/../../web-resources/img`))
// app.use('/css/', express.static(`${__dirname}/../web-resources/css`))

// ====== apis
  authApi.init(app)
  app.use('/api', apiRouter.router)

// ====== server
  const httpServerPort = process.env.PORT || '9090'

  const server = app.listen(httpServerPort, () => {
    console.log('server listening on port', httpServerPort)
  })

// ====== socket middleware
  WebSocketManager.init(server, sessionMiddleware)

// ====== scheduler
  await RecordPreviewCleanup.init()
}