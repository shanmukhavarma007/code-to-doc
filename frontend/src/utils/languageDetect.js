const LANGUAGE_PATTERNS = {
  Python: [/\bdef\s+\w+\s*\(/, /\bimport\s+\w+/, /\bclass\s+\w+/, /if\s+__name__\s*==\s*['"]__main__['"]/],
  JavaScript: [/\bfunction\s+\w+\s*\(/, /\bconst\s+\w+\s*=/, /\blet\s+\w+\s*=/, /=>/],
  TypeScript: [/\binterface\s+\w+/, /\btype\s+\w+\s*=/, /:\s*(string|number|boolean)\b/],
  Go: [/\bfunc\s+\w+\s*\(/, /\bpackage\s+\w+/, /\bimport\s+\(/, /:=\s/],
  Rust: [/\bfn\s+\w+/, /\blet\s+mut\s+/, /\buse\s+\w+/, /\bimpl\s+\w+/],
  Java: [/\bpublic\s+class\s+\w+/, /\bvoid\s+\w+\s*\(/, /System\.out/],
  'C#': [/\bnamespace\s+\w+/, /\busing\s+\w+/, /Console\.Write/],
  'C++': [/#include\s*</, /std::/, /\bcout\s*<</],
  Ruby: [/\bdef\s+\w+/, /\bend\b/, /\bputs\s+/, /\brequire\s+/],
  PHP: [/<\?php/, /\becho\s+/, /\bfunction\s+\w+\s*\(/],
  Swift: [/\bfunc\s+\w+/, /\bvar\s+\w+/, /\blet\s+\w+/, /\bimport\s+\w+/],
  Kotlin: [/\bfun\s+\w+/, /\bval\s+\w+/, /\bvar\s+\w+/, /data\s+class/]
}

export const detectLanguage = (code) => {
  if (!code || typeof code !== 'string') return null

  const scores = {}

  for (const [language, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    scores[language] = 0
    for (const pattern of patterns) {
      if (pattern.test(code)) {
        scores[language]++
      }
    }
  }

  let maxScore = 0
  let detected = null

  for (const [language, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      detected = language
    }
  }

  return maxScore >= 2 ? detected : null
}
