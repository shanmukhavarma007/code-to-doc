import { useState, useCallback } from 'react'
import { CodeInputPanel } from '../components/CodeInputPanel'
import GenerateButton from '../components/GenerateButton'
import OutputPanel from '../components/OutputPanel'
import SecurityStatusBar from '../components/SecurityStatusBar'
import HistoryDrawer from '../components/HistoryDrawer'
import Navbar from '../components/Navbar'
import { useGenerate, useRateLimit } from '../hooks/useGenerate'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const { user } = useAuth()
  const { output, setOutput, isGenerating, error, generate, clearOutput } = useGenerate()
  const { cooldown, startCooldown, checkRateLimit } = useRateLimit()

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
            <OutputPanel output={output} error={error} />
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
