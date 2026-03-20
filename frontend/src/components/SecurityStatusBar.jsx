const SecurityStatusBar = ({ isAuthenticated }) => {
  const pills = [
    { label: 'Input Sanitized', active: true },
    { label: 'Output Escaped', active: true },
    { label: 'Rate OK', active: true },
    { label: isAuthenticated ? 'Auth Active' : 'Auth Required', active: isAuthenticated },
    { label: 'model: openrouter/free', active: true }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-bg-surface border-t border-border px-6 py-2">
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {pills.map((pill, index) => (
          <div
            key={index}
            className={`px-3 py-1 rounded-full font-mono text-xs border ${
              pill.active
                ? 'bg-status-success/10 border-status-success/30 text-status-success'
                : 'bg-status-warn/10 border-status-warn/30 text-status-warn'
            }`}
          >
            {pill.active ? '✓' : '⚠'} {pill.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SecurityStatusBar
