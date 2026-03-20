import { sanitizeInput } from '../utils/sanitize'

describe('sanitizeInput', () => {
  test('strips null bytes', () => {
    const input = 'hello\x00world'
    expect(sanitizeInput(input)).toBe('helloworld')
  })

  test('strips control characters', () => {
    const input = 'hello\x1Fworld\x7Ftest'
    expect(sanitizeInput(input)).toBe('helloworldtest')
  })

  test('strips script tags', () => {
    const input = 'hello<script>alert("xss")</script>world'
    expect(sanitizeInput(input)).toBe('helloworld')
  })

  test('trims whitespace', () => {
    const input = '  hello world  '
    expect(sanitizeInput(input)).toBe('hello world')
  })

  test('handles non-string input', () => {
    expect(sanitizeInput(null)).toBe('')
    expect(sanitizeInput(undefined)).toBe('')
    expect(sanitizeInput(123)).toBe('')
  })
})
