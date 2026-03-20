import { useState, useMemo } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const OutputPanel = ({ output, error, isLoading, onRetry, onSessionExpired }) => {
  const [viewMode, setViewMode] = useState('rendered')
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(null)

  const isAuthError = error && (
    error.toLowerCase().includes('authentication') ||
    error.toLowerCase().includes('auth') ||
    error.toLowerCase().includes('unauthorized') ||
    error.toLowerCase().includes('session')
  )

  marked.setOptions({
    breaks: true,
    gfm: true
  })

  const sanitizedHtml = useMemo(() => {
    if (!output) return ''
    const html = marked.parse(output)
    return DOMPurify.sanitize(html)
  }, [output])

  const handleCopy = async () => {
    setCopyError(null)
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setCopyError('Clipboard API failed, using fallback')
      const textarea = document.createElement('textarea')
      textarea.value = output
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setCopyError(null)
      }, 2000)
      setTimeout(() => setCopyError(null), 3000)
    }
  }

  const handleExport = () => {
    const blob = new Blob([output], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'documentation.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-lg font-semibold text-text-primary">Documentation</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-status-danger/10 border border-status-danger/20 mb-4">
              <svg className="w-6 h-6 text-status-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-status-danger font-mono text-sm mb-4">{error}</p>
            {isAuthError ? (
              <button
                onClick={onSessionExpired || (() => window.location.reload())}
                className="px-4 py-2 bg-accent hover:bg-accent/80 text-bg-primary font-mono text-sm rounded-lg transition-colors"
              >
                Session expired - Click to reload
              </button>
            ) : onRetry ? (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-bg-elevated border border-border hover:border-accent text-text-primary font-mono text-sm rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-lg font-semibold text-text-primary">Documentation</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-text-muted font-mono text-sm">Generating documentation...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!output) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-lg font-semibold text-text-primary">Documentation</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-text-muted font-mono text-sm">
            Generated documentation will appear here
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono text-lg font-semibold text-text-primary">Documentation</h2>
        <div className="flex items-center gap-2 relative">
          <div className="flex bg-bg-elevated border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('rendered')}
              className={`px-3 py-1.5 font-mono text-xs transition-colors ${
                viewMode === 'rendered'
                  ? 'bg-accent text-bg-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Rendered
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-3 py-1.5 font-mono text-xs transition-colors ${
                viewMode === 'raw'
                  ? 'bg-accent text-bg-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Raw
            </button>
          </div>

          <div className="relative">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-bg-elevated border border-border rounded-lg text-text-muted hover:text-text-primary hover:border-accent font-mono text-xs transition-colors"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
            {copyError && (
              <div className="absolute top-full left-0 mt-1 text-status-danger font-mono text-xs bg-status-danger/10 border border-status-danger/20 rounded px-2 py-1 whitespace-nowrap z-10">
                {copyError}
              </div>
            )}
          </div>

          <button
            onClick={handleExport}
            className="px-3 py-1.5 bg-bg-elevated border border-border rounded-lg text-text-muted hover:text-text-primary hover:border-accent font-mono text-xs transition-colors"
          >
            Export .md
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {viewMode === 'rendered' ? (
          <div
            className="prose prose-invert prose-sm max-w-none p-4 bg-bg-elevated border border-border rounded-lg min-h-full"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            aria-live="polite"
          />
        ) : (
          <pre className="p-4 bg-bg-elevated border border-border rounded-lg text-text-code font-mono text-sm whitespace-pre-wrap min-h-full">
            {output}
          </pre>
        )}
      </div>
    </div>
  )
}

export default OutputPanel
