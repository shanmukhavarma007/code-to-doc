import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AuthCard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')
  const { login, register, error, isLoading } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (!email || !password) {
      setLocalError('All fields are required')
      return
    }



    if (activeTab === 'register') {
      if (password.length < 8) {
        setLocalError('Password must be at least 8 characters')
        return
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        setLocalError('Password must contain at least one special character')
        return
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match')
        return
      }
    }

    const result = activeTab === 'login' ? await login(email, password) : await register(email, password)

    if (result.success) {
      navigate('/')
    } else {
      setLocalError(result.error)
    }
  }

  const displayError = localError || error

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-mono text-3xl font-bold text-accent">{'</>'}</h1>
          <p className="font-mono text-lg text-text-muted mt-2">Code-to-Doc Generator</p>
        </div>

        <div className="bg-bg-surface border border-border rounded-xl p-6">
          <div className="flex border-b border-border mb-6">
            <button
              onClick={() => {
                setActiveTab('login')
                setLocalError('')
              }}
              className={`flex-1 py-2 font-mono text-sm font-semibold transition-colors ${
                activeTab === 'login'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setActiveTab('register')
                setLocalError('')
              }}
              className={`flex-1 py-2 font-mono text-sm font-semibold transition-colors ${
                activeTab === 'register'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-text-muted font-mono text-xs mb-2">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-bg-elevated border border-border rounded-lg text-text-primary font-mono text-sm focus:border-accent transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-text-muted font-mono text-xs mb-2">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-elevated border border-border rounded-lg text-text-primary font-mono text-sm focus:border-accent transition-colors pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs font-mono"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {activeTab === 'register' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-text-muted font-mono text-xs mb-2">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-elevated border border-border rounded-lg text-text-primary font-mono text-sm focus:border-accent transition-colors"
                  placeholder="••••••••"
                />
              </div>
            )}

            {displayError && (
              <div className="text-status-danger font-mono text-xs bg-status-danger/10 border border-status-danger/20 rounded-lg px-3 py-2">
                {displayError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-accent text-bg-primary font-mono text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-accent-dim transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : activeTab === 'login' ? 'Login' : 'Register'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-text-muted font-mono text-xs">
              {activeTab === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button onClick={() => setActiveTab('register')} className="text-accent hover:underline">
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={() => setActiveTab('login')} className="text-accent hover:underline">
                    Login
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        <p className="text-center text-text-muted font-mono text-xs mt-6">
          Powered by{' '}
          <a href="https://openrouter.ai/openrouter/free" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            OpenRouter Free
          </a>
        </p>
      </div>
    </div>
  )
}

export default AuthCard
