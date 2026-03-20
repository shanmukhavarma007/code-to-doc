import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import app from '../src/app.js'
import User from '../src/models/User.js'
import Generation from '../src/models/Generation.js'

let mongoServer
let authCookie

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
  await Generation.deleteMany({})

  await request(app)
    .post('/api/auth/register')
    .send({ email: 'test@example.com', password: 'Password123!' })

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@example.com', password: 'Password123!' })

  authCookie = loginRes.headers['set-cookie']?.[0]
})

describe('Generate Endpoint', () => {
  describe('POST /api/generate', () => {
    test('returns 401 without auth', async () => {
      const res = await request(app)
        .post('/api/generate')
        .send({ code: 'print("hello")', language: 'python' })

      expect(res.status).toBe(401)
    })

    test('validates code length', async () => {
      const res = await request(app)
        .post('/api/generate')
        .set('Cookie', authCookie)
        .send({ code: 'a'.repeat(9000), language: 'python' })

      expect(res.status).toBe(400)
      expect(res.body.error).toContain('8000')
    })

    test('requires language', async () => {
      const res = await request(app)
        .post('/api/generate')
        .set('Cookie', authCookie)
        .send({ code: 'print("hello")' })

      expect(res.status).toBe(400)
    })

    test('rejects empty code', async () => {
      const res = await request(app)
        .post('/api/generate')
        .set('Cookie', authCookie)
        .send({ code: '', language: 'python' })

      expect(res.status).toBe(400)
    })
  })
})

describe('History Endpoint', () => {
  describe('GET /api/history', () => {
    test('returns 401 without auth', async () => {
      const res = await request(app).get('/api/history')
      expect(res.status).toBe(401)
    })

    test('returns empty array for new user', async () => {
      const res = await request(app)
        .get('/api/history')
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.generations).toEqual([])
    })

    test('paginates results', async () => {
      const res = await request(app)
        .get('/api/history?page=1&limit=10')
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.pagination).toBeDefined()
      expect(res.body.pagination.page).toBe(1)
      expect(res.body.pagination.limit).toBe(10)
    })
  })

  describe('DELETE /api/history/:id', () => {
    test('returns 401 without auth', async () => {
      const res = await request(app).delete('/api/history/someid')
      expect(res.status).toBe(401)
    })

    test('returns 404 for non-existent generation', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      const res = await request(app)
        .delete(`/api/history/${fakeId}`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(404)
    })
  })
})

describe('MongoDB Sanitization', () => {
  test('strips $ operators from query', async () => {
    const res = await request(app)
      .post('/api/generate')
      .set('Cookie', authCookie)
      .send({
        code: 'print("hello")',
        language: 'python',
        '$where': 'function() { return true; }'
      })

    expect(res.status).not.toBe(200)
  })
})
