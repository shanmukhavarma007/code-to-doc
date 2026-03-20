const VALID_EXTENSIONS = {
  py: 'Python',
  js: 'JavaScript',
  jsx: 'JavaScript',
  ts: 'TypeScript',
  tsx: 'TypeScript',
  go: 'Go',
  rs: 'Rust',
  java: 'Java',
  cs: 'C#',
  cpp: 'C++',
  c: 'C',
  rb: 'Ruby',
  php: 'PHP',
  swift: 'Swift',
  kt: 'Kotlin'
}

const VALID_MIME_TYPES = [
  'text/plain',
  'text/x-python',
  'text/javascript',
  'text/typescript',
  'text/x-java',
  'text/x-csharp',
  'text/x-c++src',
  'text/x-go',
  'text/x-rust',
  'text/x-ruby',
  'text/x-php',
  'text/x-swift',
  'text/x-kotlin'
]

export const validateFile = (file) => {
  const errors = []

  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !VALID_EXTENSIONS[extension]) {
    errors.push(`Invalid file extension. Supported: ${Object.keys(VALID_EXTENSIONS).join(', ')}`)
  }

  if (!VALID_MIME_TYPES.includes(file.type) && !file.type.startsWith('text/')) {
    errors.push('Invalid file type. Expected a text-based code file.')
  }

  const maxSize = 50 * 1024
  if (file.size > maxSize) {
    errors.push('File too large. Maximum size is 50KB.')
  }

  return { valid: errors.length === 0, errors }
}

export const getLanguageFromFile = (filename) => {
  const extension = filename.split('.').pop()?.toLowerCase()
  return VALID_EXTENSIONS[extension] || 'Unknown'
}
