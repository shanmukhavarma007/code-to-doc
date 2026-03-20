import mongoose from 'mongoose'
import mongoSanitize from 'mongo-sanitize'
import logger from '../utils/logger.js'

let memoryServer = null

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    })
    logger.info(`MongoDB Connected: ${mongoose.connection.host}`)
  } catch (error) {
    logger.error('MongoDB connection error:', error.message)
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      process.exit(1)
    }
    if (process.env.VERCEL) {
      throw error
    }
    logger.warn('Falling back to in-memory MongoDB...')
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server')
      memoryServer = await MongoMemoryServer.create()
      const uri = memoryServer.getUri()
      await mongoose.connect(uri)
      logger.info(`In-memory MongoDB Connected: ${uri}`)
    } catch (memErr) {
      logger.error('In-memory MongoDB failed:', memErr.message)
    }
  }
}

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB runtime error:', err.message)
})

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected')
})

export const sanitizeRequest = (req, _res, next) => {
  if (req.body) {
    req.body = mongoSanitize(req.body)
  }
  if (req.query) {
    req.query = mongoSanitize(req.query)
  }
  if (req.params) {
    req.params = mongoSanitize(req.params)
  }
  next()
}

export default connectDB
