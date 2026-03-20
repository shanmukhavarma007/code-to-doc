import { useState, useCallback, useEffect } from 'react'
import { CodeInputPanel } from '../components/CodeInputPanel'
import GenerateButton from '../components/GenerateButton'
import OutputPanel from '../components/OutputPanel'
import SecurityStatusBar from '../components/SecurityStatusBar'
import HistoryDrawer from '../components/HistoryDrawer'
import Navbar from '../components/Navbar'
import { useGenerate, useRateLimit } from '../hooks/useGenerate'
import { useAuth } from '../context/AuthContext'

const STORAGE_KEY = 'code_to_doc_state'

const Home = () => {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const { user, isLoading: authLoading } = useAuth()
  const { output, setOutput, isGenerating, error, generate } = useGenerate()
  const { cooldown, startCooldown, checkRateLimit } = useRateLimit()

  useEffect(() => {
    const loadSavedState = () => {
      if (window.storage?.get) {
        const saved = window.storage.get(STORAGE_KEY)
        if (saved) {
          try {
            const parsed = typeof saved === 'string' ? JSON.parse(saved) : saved
            if (parsed.code) setCode(parsed.code)
            if (parsed.language) setLanguage(parsed.language)
            if (parsed.output) setOutput(parsed.output)
          } catch (e) {
            console.warn('Failed to parse saved state:', e)
          }
        }
      }
      setIsInitialLoading(false)
    }

    if (!authLoading) {
      loadSavedState()
    }
  }, [authLoading, setOutput])

  useEffect(() => {
    if (!isInitialLoading && !authLoading) {
      const stateToSave = { code, language, output }
      if (window.storage?.set) {
        window.storage.set(STORAGE_KEY, JSON.stringify(stateToSave))
      }
    }
  }, [code, language, output, isInitialLoading, authLoading])

  const handleSessionExpired = useCallback(() => {
    window.location.reload()
  }, [])

  const handleRetry = useCallback(() => {
    if (code.trim()) {
      generate(code, language || 'auto')
    }
  }, [code, language, generate])

  const handleGenerate = useCallback(async () => {
    if (!code.trim()) return

    const result = await generate(code, language || 'auto')

    if (!result.success && checkRateLimit(result.error)) {
      startCooldown()
    }
  }, [code, language, generate, checkRateLimit, startCooldown])

  const handleHistorySelect = (selectedOutput) => {
    setCode('')
    setLanguage('')
    setOutput(selectedOutput)
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
              setCode={setCode}
              language={language}
              setLanguage={setLanguage}
            />
          </div>

          <div className="bg-bg-surface border border-border rounded-xl p-6">
            {isInitialLoading || authLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-text-muted font-mono text-sm">Loading...</p>
                </div>
              </div>
            ) : (
              <OutputPanel
                output={output}
                error={error}
                isLoading={isGenerating}
                onRetry={handleRetry}
                onSessionExpired={handleSessionExpired}
              />
            )}
          </div>
        </div>

        <div className="mt-6 max-w-xl mx-auto">
          <GenerateButton
            onClick={handleGenerate}
            disabled={!code.trim()}
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
    </div>
  )
}

export default Home
