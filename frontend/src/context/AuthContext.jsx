import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AuthContext = createContext(null)

function loadUser() {
  try {
    const raw = localStorage.getItem('cap_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)

  const login = useCallback((token, userData) => {
    localStorage.setItem('cap_token', token)
    localStorage.setItem('cap_user', JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('cap_token')
    localStorage.removeItem('cap_user')
    setUser(null)
  }, [])

  // Auto-logout when the API client detects a 401 (expired/invalid token)
  useEffect(() => {
    window.addEventListener('cap:session-expired', logout)
    return () => window.removeEventListener('cap:session-expired', logout)
  }, [logout])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// oxlint-disable-next-line only-export-components -- hook must be co-located with its context
export function useAuth() {
  return useContext(AuthContext)
}
