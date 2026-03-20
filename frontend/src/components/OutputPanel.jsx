import { useState, useMemo } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const OutputPanel = ({ output, error }) => {
  const [viewMode, setViewMode] = useState('rendered')
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(null)

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
          <div className="text-status-danger font-mono text-sm bg-status-danger/10 border border-status-danger/20 rounded-lg px-4 py-3">
            {error}
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
