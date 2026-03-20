import app from '../src/app.js'
import connectDB from '../src/utils/database.js'

let dbConnected = false

export default async function handler(req, res) {
  if (req.url === '/health') {
    return app(req, res)
  }

  if (!dbConnected) {
    try {
      await connectDB()
      dbConnected = true
    } catch (error) {
      console.error('DB connection failed:', error.message)
      return res.status(503).json({ error: 'Database connection failed' })
    }
  }
  return app(req, res)
}
