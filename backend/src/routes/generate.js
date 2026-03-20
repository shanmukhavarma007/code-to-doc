import { Router } from 'express'
import { generate } from '../controllers/generateController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { generateRateLimiter } from '../middleware/rateLimiter.js'
import { validate, generateSchema } from '../middleware/inputValidator.js'
import { sanitizeInput } from '../middleware/sanitize.js'

const router = Router()

router.post(
  '/',
  authMiddleware,
  generateRateLimiter,
  validate(generateSchema),
  sanitizeInput,
  generate
)

export default router
