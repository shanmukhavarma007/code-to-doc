import { validateFile, getLanguageFromFile } from '../utils/fileValidator'

describe('validateFile', () => {
  test('accepts valid code files', () => {
    const file = new File(['print("hello")'], 'test.py', { type: 'text/x-python' })
    const result = validateFile(file)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('rejects invalid file extensions', () => {
    const file = new File(['content'], 'test.exe', { type: 'application/x-msdownload' })
    const result = validateFile(file)
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('Invalid file extension')
  })

  test('rejects oversized files', () => {
    const largeContent = 'a'.repeat(51 * 1024)
    const file = new File([largeContent], 'test.py', { type: 'text/x-python' })
    const result = validateFile(file)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('50KB'))).toBe(true)
  })
})

describe('getLanguageFromFile', () => {
  test('detects Python files', () => {
    expect(getLanguageFromFile('test.py')).toBe('Python')
  })

  test('detects JavaScript files', () => {
    expect(getLanguageFromFile('test.js')).toBe('JavaScript')
    expect(getLanguageFromFile('test.jsx')).toBe('JavaScript')
  })

  test('detects TypeScript files', () => {
    expect(getLanguageFromFile('test.ts')).toBe('TypeScript')
    expect(getLanguageFromFile('test.tsx')).toBe('TypeScript')
  })

  test('returns Unknown for unsupported extensions', () => {
    expect(getLanguageFromFile('test.xyz')).toBe('Unknown')
  })
})
