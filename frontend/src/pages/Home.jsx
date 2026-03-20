import { useState, useCallback, useEffect } from 'react'
import { CodeInputPanel } from '../components/CodeInputPanel'
import GenerateButton from '../components/GenerateButton'
import OutputPanel from '../components/OutputPanel'
import SecurityStatusBar from '../components/SecurityStatusBar'
import HistoryDrawer from '../components/HistoryDrawer'
import Navbar from '../components/Navbar'
import { Toast, SessionExpiredBanner } from '../components/Toast'
import { useGenerate, useRateLimit } from '../hooks/useGenerate'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [showSessionBanner, setShowSessionBanner] = useState(false)
  const { user, isLoading: authLoading } = useAuth()
  const { 
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
  } = useGenerate()
  const { cooldown, startCooldown, checkRateLimit } = useRateLimit()

  useEffect(() => {
    if (isInitialLoading || authLoading) return

    const savedState = loadFromStorage()
    if (savedState) {
      if (savedState.code) setCode(savedState.code)
      if (savedState.language) setLanguage(savedState.language)
      if (savedState.output) setOutput(savedState.output)
    }
    setIsInitialLoading(false)
  }, [authLoading])

  useEffect(() => {
    if (!isInitialLoading && !authLoading && (code || output)) {
      saveToStorage({ code, language, output })
    }
  }, [code, language, output, isInitialLoading, authLoading, saveToStorage])

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type })
  }, [])

  const handleSoftReset = useCallback(async () => {
    setShowSessionBanner(false)
    const result = await softReset()
    
    if (result.success) {
      showToast('Session reconnected successfully', 'success')
    } else {
      showToast('Session expired. Please login again.', 'warning')
      setShowSessionBanner(true)
    }
  }, [softReset, showToast])

  const handleRetry = useCallback(() => {
    if (code.trim()) {
      retry(code, language || 'auto')
    }
  }, [code, language, retry])

  const handleGenerate = useCallback(async () => {
    if (!code.trim()) return

    const result = await generate(code, language || 'auto')

    if (!result.success) {
      if (result.isAuthError) {
        setShowSessionBanner(true)
        showToast('Session expired. Click "Reconnect" to continue.', 'warning')
      } else if (checkRateLimit(result.error)) {
        startCooldown()
      } else if (result.attempt > 1) {
        showToast(`Generation failed after ${result.attempt} attempts. Please try again.`, 'error')
      }
    } else if (result.cached) {
      showToast('Loaded from cache', 'info')
    }
  }, [code, language, generate, checkRateLimit, startCooldown, showToast])

  const handleHistorySelect = (selectedOutput) => {
    setCode('')
    setLanguage('')
    setOutput(selectedOutput)
  }

  const handleCodeChange = (newCode) => {
    setCode(newCode)
    saveToStorage({ code: newCode, language, output })
  }

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    saveToStorage({ code, language: newLanguage, output })
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-10">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-mono text-2xl font-bold text-text-primary">
              Documentation Generator
            </h1>
            <p className="text-text-muted font-mono text-sm mt-1">
              Transform your code into professional Markdown documentation
              {retryCount > 0 && (
                <span className="ml-2 text-accent">
                  (Retry {retryCount}/{3})
                </span>
              )}
            </p>
          </div>

          {user && (
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="px-4 py-2 bg-bg-elevated border border-border rounded-lg text-text-muted hover:text-text-primary hover:border-accent font-mono text-sm transition-colors"
            >
              History
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-bg-surface border border-border rounded-xl p-6">
            <CodeInputPanel
              code={code}
              setCode={handleCodeChange}
              language={language}
              setLanguage={handleLanguageChange}
            />
          </div>

          <div className="bg-bg-surface border border-border rounded-xl p-6">
            {isInitialLoading || authLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-text-muted font-mono text-sm">Loading session...</p>
                </div>
              </div>
            ) : (
              <OutputPanel
                output={output}
                error={error}
                isLoading={isGenerating}
                onRetry={handleRetry}
                onSessionExpired={handleSoftReset}
              />
            )}
          </div>
        </div>

        <div className="mt-6 max-w-xl mx-auto">
          <GenerateButton
            onClick={handleGenerate}
            disabled={!code.trim() || isGenerating}
            isLoading={isGenerating}
            cooldown={cooldown}
            isRateLimited={false}
          />
        </div>
      </main>

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelect={handleHistorySelect}
      />

      <SecurityStatusBar isAuthenticated={!!user} />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {showSessionBanner && (
        <SessionExpiredBanner
          onLogin={handleSoftReset}
          onDismiss={() => setShowSessionBanner(false)}
        />
      )}
    </div>
  )
}

export default Home
