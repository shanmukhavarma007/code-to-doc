import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  useEffect(() => {
    if (!isMenuOpen) return

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  if (!user) return null

  return (
    <nav className="bg-bg-surface border-b border-border px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-mono text-2xl font-bold text-accent">{'</>'}</span>
          <span className="font-mono text-lg font-bold text-text-primary">Code-to-Doc</span>
        </Link>

        <div className="flex items-center gap-4" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-elevated border border-border hover:border-accent transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-bg-primary font-mono font-bold text-sm">
              {user.email[0].toUpperCase()}
            </div>
            <span className="text-text-primary font-mono text-sm hidden sm:block">
              {user.email.split('@')[0]}
            </span>
          </button>

          {isMenuOpen && (
            <div className="absolute right-6 top-16 mt-2 w-48 bg-bg-elevated border border-border rounded-lg shadow-lg overflow-hidden z-50">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-text-primary text-sm font-mono">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-status-danger hover:bg-bg-surface transition-colors font-mono text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
