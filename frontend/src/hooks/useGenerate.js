import { useState, useCallback, useRef, useEffect } from 'react'
import api from '../api'

const STORAGE_KEY = 'code_to_doc_state'
const MAX_RETRIES = 3
const BASE_DELAY = 1000

export const useRateLimit = () => {
  const [cooldown, setCooldown] = useState(0)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const startCooldown = useCallback(() => {
    setIsRateLimited(true)
    setCooldown(30)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          setIsRateLimited(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const checkRateLimit = useCallback((error) => {
    if (error.response?.status === 429) {
      return true
    }
    return false
  }, [])

  return { cooldown, isRateLimited, startCooldown, checkRateLimit }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const useGenerate = () => {
  const [output, setOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const abortRef = useRef(false)

  useEffect(() => {
    return () => {
      abortRef.current = true
    }
  }, [])

  const saveToStorage = useCallback((data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        output: data.output || '',
        code: data.code || '',
        language: data.language || '',
        timestamp: Date.now()
      }))
    } catch (e) {
      console.warn('Failed to save to localStorage:', e)
    }
  }, [])

  const loadFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed
        }
      }
    } catch (e) {
      console.warn('Failed to load from localStorage:', e)
    }
    return null
  }, [])

  const generate = useCallback(async (code, language, options = {}) => {
    const { forceRetry = false } = options
    setIsGenerating(true)
    setError(null)
    abortRef.current = false

    let attempt = forceRetry ? 1 : 0
    let lastError = null

    while (attempt < MAX_RETRIES && !abortRef.current) {
      try {
        const response = await api.post('/generate', { code, language }, {
          timeout: 60000
        })
        
        setOutput(response.data.output)
        saveToStorage({ output: response.data.output, code, language })
        setRetryCount(0)
        return { success: true, cached: response.data.cached, attempt }
      } catch (err) {
        lastError = err
        const status = err.response?.status
        const networkError = !err.response

        if (status === 401 || status === 403) {
          setError('Session expired. Please login again.')
          setRetryCount(0)
          return { success: false, error: 'Session expired', isAuthError: true, status }
        }

        if (networkError || status === 504 || status === 500) {
          attempt++
          setRetryCount(attempt)
          
          if (attempt < MAX_RETRIES) {
            const delay = BASE_DELAY * Math.pow(2, attempt - 1)
            await sleep(delay)
            continue
          }
        }

        const message = err.response?.data?.error || 'Generation failed. Please try again.'
        setError(message)
        setRetryCount(0)
        return { success: false, error: message, attempt }
      }
    }

    if (abortRef.current) {
      setError('Request cancelled')
      return { success: false, error: 'Request cancelled' }
    }

    setError(lastError?.response?.data?.error || 'Generation failed after multiple attempts')
    return { success: false, error: 'Generation failed', attempt }
  }, [saveToStorage])

  const retry = useCallback(async (code, language) => {
    return generate(code, language, { forceRetry: true })
  }, [generate])

  const clearOutput = useCallback(() => {
    setOutput('')
    setError(null)
    setRetryCount(0)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.warn('Failed to clear localStorage:', e)
    }
  }, [])

  const softReset = useCallback(async () => {
    abortRef.current = true
    setOutput('')
    setError(null)
    setRetryCount(0)
    setIsGenerating(false)
    
    try {
      const response = await api.get('/auth/me')
      if (response.data.user) {
        return { success: true, user: response.data.user }
      }
    } catch (e) {
      // Session invalid, return false
    }
    return { success: false }
  }, [])

  return { 
    output, 
    setOutput, 
    isGenerating, 
    error, 
    retryCount,
    generate, 
    retry,
    clearOutput,
    softReset,
    saveToStorage,
    loadFromStorage
  }
}
