import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import app from '../src/app.js'
import User from '../src/models/User.js'

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()
  process.env.MONGODB_URI = mongoUri
  await mongoose.connect(mongoUri)
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

beforeEach(async () => {
  await User.deleteMany({})
})

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    test('creates a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'Password123!' })

      expect(res.status).toBe(201)
      expect(res.body.message).toBe('Registration successful')
      expect(res.body.user.email).toBe('test@example.com')
      expect(res.headers['set-cookie']).toBeDefined()
    })

    test('rejects duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'Password123!' })

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'Password123!' })

      expect(res.status).toBe(409)
      expect(res.body.error).toBe('Email already registered')
    })

    test('validates email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid-email', password: 'Password123!' })

      expect(res.status).toBe(400)
    })

    test('validates password length', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'short' })

      expect(res.status).toBe(400)
    })

    test('validates password special character', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'PasswordNoSpecial' })

      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'Password123!' })
    })

    test('logs in with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'Password123!' })

      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Login successful')
      expect(res.headers['set-cookie']).toBeDefined()
    })

    test('rejects wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'WrongPassword!' })

      expect(res.status).toBe(401)
      expect(res.body.error).toBe('Invalid credentials')
    })

    test('rejects non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'Password123!' })

      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/auth/logout', () => {
    test('clears the cookie', async () => {
      // First register to get a cookie
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'Password123!' })
      const cookie = registerRes.headers['set-cookie']?.[0]
      expect(cookie).toBeDefined()

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookie)

      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Logout successful')
    })
  })

  describe('GET /api/auth/me', () => {
    test('returns 401 without auth', async () => {
      const res = await request(app).get('/api/auth/me')
      expect(res.status).toBe(401)
    })

    test('returns user with valid auth', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'Password123!' })

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'Password123!' })

      const cookie = loginRes.headers['set-cookie']?.[0]

      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookie)

      expect(meRes.status).toBe(200)
      expect(meRes.body.user.email).toBe('test@example.com')
    })
  })
})

describe('Security Headers', () => {
  test('includes security headers', async () => {
    const res = await request(app).get('/health')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
    expect(res.headers['x-frame-options']).toBe('DENY')
  })
})

describe('Body Size Limit', () => {
  test('rejects oversized body', async () => {
    const largeBody = { code: 'a'.repeat(33 * 1024), language: 'python' }

    const res = await request(app)
      .post('/api/generate')
      .send(largeBody)

    expect([413]).toContain(res.status)
  })
})
