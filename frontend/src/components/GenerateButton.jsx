const GenerateButton = ({ onClick, disabled, isLoading, cooldown, isRateLimited }) => {
  const isDisabled = disabled || isLoading || isRateLimited || cooldown > 0

  const getButtonContent = () => {
    if (cooldown > 0) {
      return (
        <>
          <span className="animate-cursor">_</span> RETRY IN {cooldown}s
        </>
      )
    }
    if (isRateLimited) {
      return 'RATE LIMITED'
    }
    if (isLoading) {
      return (
        <>
          <span className="animate-cursor">_</span> GENERATING...
        </>
      )
    }
    return 'GENERATE DOCS'
  }

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`w-full py-4 font-mono text-sm font-bold uppercase tracking-widest rounded-lg transition-all ${
        isDisabled
          ? 'bg-bg-elevated text-text-muted cursor-not-allowed border border-border'
          : 'bg-accent text-bg-primary hover:bg-accent-dim hover:shadow-lg hover:shadow-accent/20'
      }`}
      aria-busy={isLoading}
    >
      {getButtonContent()}
    </button>
  )
}

export default GenerateButton
