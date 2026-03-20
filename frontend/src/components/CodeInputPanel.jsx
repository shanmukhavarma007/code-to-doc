import { useState, useRef, useCallback } from 'react'
import { sanitizeInput } from '../utils/sanitize'
import { validateFile, getLanguageFromFile } from '../utils/fileValidator'
import { detectLanguage } from '../utils/languageDetect'

const MAX_CHARS = 8000
const WARN_THRESHOLD = 7000

const LanguageSelector = ({ value, onChange }) => {
  const languages = [
    'Python',
    'JavaScript',
    'TypeScript',
    'Go',
    'Rust',
    'Java',
    'C#',
    'C++',
    'Ruby',
    'PHP',
    'Swift',
    'Kotlin'
  ]

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-2 bg-bg-elevated border border-border rounded-lg text-text-primary font-mono text-sm focus:border-accent transition-colors"
    >
      <option value="">Auto-detect</option>
      {languages.map((lang) => (
        <option key={lang} value={lang}>
          {lang}
        </option>
      ))}
    </select>
  )
}

const CodeInputPanel = ({ code, setCode, language, setLanguage }) => {
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  const charCount = code.length
  const isNearLimit = charCount >= WARN_THRESHOLD
  const isAtLimit = charCount >= MAX_CHARS

  const handleCodeChange = useCallback(
    (e) => {
      const newCode = e.target.value
      if (newCode.length <= MAX_CHARS) {
        setCode(sanitizeInput(newCode))
        setError('')
      }
    },
    [setCode]
  )

  const handlePaste = useCallback(
    (e) => {
      const pastedText = e.clipboardData.getData('text')
      const newLength = code.length + pastedText.length

      if (newLength > MAX_CHARS) {
        e.preventDefault()
        setError(`Would exceed ${MAX_CHARS} character limit`)
        return
      }

      const detected = detectLanguage(pastedText)
      if (detected && !language) {
        setLanguage(detected)
      }
    },
    [code.length, language, setLanguage]
  )

  const handleFileUpload = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      if (!file) return

      const validation = validateFile(file)
      if (!validation.valid) {
        setError(validation.errors.join('. '))
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result
        if (typeof content === 'string') {
          if (content.length > MAX_CHARS) {
            setError(`File content exceeds ${MAX_CHARS} characters`)
            return
          }
          setCode(sanitizeInput(content))
          const detectedLang = getLanguageFromFile(file.name)
          if (detectedLang && !language) {
            setLanguage(detectedLang)
          }
          setError('')
        }
      }
      reader.readAsText(file)
    },
    [setCode, language, setLanguage]
  )

  const getCharCountColor = () => {
    if (isAtLimit) return 'text-status-danger'
    if (isNearLimit) return 'text-status-warn'
    return 'text-text-muted'
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono text-lg font-semibold text-text-primary">Code Input</h2>
        <LanguageSelector value={language} onChange={setLanguage} />
      </div>

      <div className="relative flex-1 min-h-0">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleCodeChange}
          onPaste={handlePaste}
          placeholder="Paste your code here or upload a file..."
          className="w-full h-full min-h-[300px] p-4 bg-bg-elevated border border-border rounded-lg text-text-code font-mono text-sm resize-none focus:border-accent transition-colors placeholder-text-muted"
          spellCheck={false}
        />

        {isAtLimit && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-status-danger/20 border border-status-danger/40 rounded text-status-danger font-mono text-xs">
            LIMIT REACHED
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-bg-elevated border border-border rounded-lg text-text-muted hover:text-text-primary hover:border-accent font-mono text-xs transition-colors"
          >
            Upload File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".py,.js,.jsx,.ts,.tsx,.go,.rs,.java,.cs,.cpp,.c,.rb,.php,.swift,.kt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <div className={`font-mono text-xs ${getCharCountColor()}`}>
          {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </div>
      </div>

      {error && (
        <div className="mt-2 text-status-danger font-mono text-xs bg-status-danger/10 border border-status-danger/20 rounded px-3 py-2">
          {error}
        </div>
      )}
    </div>
  )
}

export { CodeInputPanel, LanguageSelector }
