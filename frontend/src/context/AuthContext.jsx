import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const API_BASE = '/api'

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('user')
      return u ? JSON.parse(u) : null
    } catch { return null }
  })

  const setToken = useCallback((newToken, userData) => {
    setTokenState(newToken)
    setUser(userData)
    if (newToken) {
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData || {}))
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err || 'Login failed')
    }
    const data = await res.json()
    setToken(data.token, { email: data.email, name: data.name })
    return data
  }, [setToken])

  const register = useCallback(async (email, password, name) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err || 'Registration failed')
    }
    const data = await res.json()
    setToken(data.token, { email: data.email, name: data.name })
    return data
  }, [setToken])

  const logout = useCallback(() => setToken(null, null), [setToken])

  const api = useCallback((path, options = {}) => {
    const headers = { ...options.headers }
    if (token) headers['Authorization'] = `Bearer ${token}`
    return fetch(`${API_BASE}${path}`, { ...options, headers })
  }, [token])

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, api }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
