import { Router } from 'express'
import { register, login, logout } from '../controllers/authController.js'
import { validate, registerSchema, loginSchema } from '../middleware/inputValidator.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { authRateLimiter } from '../middleware/rateLimiter.js'

const router = Router()

router.post('/register', authRateLimiter, validate(registerSchema), register)
router.post('/login', authRateLimiter, validate(loginSchema), login)
router.post('/logout', authMiddleware, logout)
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: { id: req.user.id, email: req.user.email } })
})

export default router
