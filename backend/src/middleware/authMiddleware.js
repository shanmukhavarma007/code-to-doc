import jwt from 'jsonwebtoken'
import logger from '../utils/logger.js'

export const authMiddleware = (req, res, next) => {
  let token = req.cookies?.token

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: decoded.id, email: decoded.email }
    next()
  } catch (error) {
    logger.warn('JWT verification failed:', error.message)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
