import { createContext, useContext, useReducer, useEffect } from 'react'
import api from '../api'

const AuthContext = createContext(null)

const initialState = {
  user: null,
  isLoading: true,
  error: null
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload, isLoading: false, error: null }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'LOGOUT':
      return { ...state, user: null, isLoading: false, error: null }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me')
        dispatch({ type: 'SET_USER', payload: response.data.user })
      } catch {
        dispatch({ type: 'SET_USER', payload: null })
      }
    }
    checkAuth()
  }, [])

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await api.post('/auth/login', { email, password })
      dispatch({ type: 'SET_USER', payload: response.data.user })
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed'
      dispatch({ type: 'SET_ERROR', payload: message })
      return { success: false, error: message }
    }
  }

  const register = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await api.post('/auth/register', { email, password })
      dispatch({ type: 'SET_USER', payload: response.data.user })
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed'
      dispatch({ type: 'SET_ERROR', payload: message })
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
    } finally {
      dispatch({ type: 'LOGOUT' })
    }
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
