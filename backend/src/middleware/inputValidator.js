import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required')
})

export const generateSchema = z.object({
  code: z.string().max(8000, 'Code must be 8000 characters or less'),
  language: z.enum(['auto', 'Python', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'Java', 'C#', 'C++', 'Ruby', 'PHP', 'Swift', 'Kotlin'])
})

export const objectIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')
})

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body)
    next()
  } catch (error) {
    const errors = error.errors?.map((e) => e.message).join(', ') || 'Validation failed'
    return res.status(400).json({ error: errors })
  }
}

export const validateParams = (schema) => (req, res, next) => {
  try {
    schema.parse(req.params)
    next()
  } catch (error) {
    const errors = error.errors?.map((e) => e.message).join(', ') || 'Validation failed'
    return res.status(400).json({ error: errors })
  }
}
