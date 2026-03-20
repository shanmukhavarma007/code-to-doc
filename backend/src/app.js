import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import slowDown from 'express-slow-down'


import authRoutes from './routes/auth.js'
import generateRoutes from './routes/generate.js'
import historyRoutes from './routes/history.js'
import connectDB, { sanitizeRequest } from './utils/database.js'
import logger from './utils/logger.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'





const app = express()
const PORT = process.env.PORT || 3001
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'
const CORS_ORIGIN = process.env.NODE_ENV === 'production'
  ? process.env.CORS_ORIGIN
  : [/^http:\/\/localhost:\d+$/, /^https:\/\/.*\.app\.github\.dev$/]

const speedLimiter = slowDown({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  delayAfter: parseInt(process.env.SLOW_DOWN_AFTER_REQUESTS) || 6,
  delayMs: () => parseInt(process.env.SLOW_DOWN_DELAY_MS) || 500,
  validate: { delayMs: false }
})

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", ...CORS_ORIGIN, 'wss:', 'ws:'],
        fontSrc: ["'self'", 'fonts.gstatic.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    xFrameOptions: { action: 'deny' },
    xContentTypeOptions: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
  })
)

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

app.use(express.json({ limit: '32kb' }))
app.use(express.urlencoded({ extended: true, limit: '32kb' }))
app.use(cookieParser())
app.use(sanitizeRequest)
app.use(speedLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/generate', generateRoutes)
app.use('/api/history', historyRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use(notFoundHandler)
app.use(errorHandler)

if (process.env.NODE_ENV !== 'test') {
  connectDB()
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`)
  })
}

export default app
