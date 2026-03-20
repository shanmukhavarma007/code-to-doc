import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import logger from '../utils/logger.js'

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

const isProduction = process.env.NODE_ENV === 'production'
const FRONTEND_URL = process.env.FRONTEND_URL || ''
const frontendDomain = FRONTEND_URL ? new URL(FRONTEND_URL).hostname : null

const cookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  domain: frontendDomain || undefined,
  path: '/'
}

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const user = new User({ email, passwordHash: password })
    await user.save()

    const token = signToken(user)

    res.cookie('token', token, cookieOptions)

    logger.info(`User registered: ${email}`)

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user._id, email: user.email }
    })
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+passwordHash')
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isValid = await user.comparePassword(password)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = signToken(user)

    res.cookie('token', token, cookieOptions)

    logger.info(`User logged in: ${email}`)

    res.json({
      message: 'Login successful',
      user: { id: user._id, email: user.email }
    })
  } catch (error) {
    next(error)
  }
}

export const logout = (_req, res) => {
  res.clearCookie('token', cookieOptions)
  res.json({ message: 'Logout successful' })
}

export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({ user: { id: user._id, email: user.email } })
  } catch (error) {
    next(error)
  }
}
