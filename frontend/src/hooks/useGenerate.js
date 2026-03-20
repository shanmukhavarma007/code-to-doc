import { useState, useCallback, useRef, useEffect } from 'react'
import api from '../api'

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

export const useGenerate = () => {
  const [output, setOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  const generate = async (code, language) => {
    setIsGenerating(true)
    setError(null)
    try {
      const response = await api.post('/generate', { code, language })
      setOutput(response.data.output)
      if (window.storage?.set) {
        window.storage.set('lastOutput', response.data.output)
      }
      return { success: true, cached: response.data.cached }
    } catch (err) {
      const status = err.response?.status
      let message = err.response?.data?.error || 'Generation failed'
      let isAuthError = false

      if (status === 401) {
        message = 'Session expired. Please refresh to continue.'
        isAuthError = true
      }

      setError(message)
      return { success: false, error: message, isAuthError, status }
    } finally {
      setIsGenerating(false)
    }
  }

  const clearOutput = () => {
    setOutput('')
    setError(null)
  }

  return { output, setOutput, isGenerating, error, generate, clearOutput }
}
