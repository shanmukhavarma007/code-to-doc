import logger from '../utils/logger.js'

export const errorHandler = (err, _req, res, _next) => {
  logger.error('Error:', err.message)

  if (err.code === 'LIMIT_REQUEST_SIZE') {
    return res.status(413).json({ error: 'Request body too large' })
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body too large' })
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'An error occurred. Please try again later.'
  })
}

export const notFoundHandler = (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
}
