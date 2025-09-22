import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api.js'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Try to refresh the token to check if user is authenticated
      const response = await api.refresh()
      if (response && response.user) {
        setUser(response.user)
      } else {
        // If refresh doesn't return user data, set a basic authenticated state
        setUser({ authenticated: true })
      }
    } catch (error) {
      console.log('User not authenticated')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await api.login(credentials)
      if (response && response.user) {
        setUser(response.user)
      } else {
        // Fallback to basic user data
        setUser({ authenticated: true, role: credentials.role })
      }
      return response
    } catch (error) {
      throw error
    }
  }

  const signup = async (credentials) => {
    try {
      const response = await api.signup(credentials)
      if (response && response.user) {
        setUser(response.user)
      } else {
        // Fallback to basic user data
        setUser({ authenticated: true, role: credentials.role })
      }
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await api.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      // Clear user state anyway
      setUser(null)
    }
  }

  const completeProfile = async (profileData) => {
    try {
      const response = await api.completeProfile(profileData)
      return response
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    completeProfile,
    checkAuth
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext