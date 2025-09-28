import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api.js'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // Start with true to check for existing auth

  // Check for existing authentication on app load
  useEffect(() => {
    checkAuth();
  }, []);

  // Check auth function - try to get user from server or localStorage
  const checkAuth = async () => {
    try {
      setLoading(true);
      
      // First try to refresh token with backend
      const response = await api.refresh();
      if (response && response.user) {
        setUser(response.user);
        console.log('Auth restored from server:', response.user);
      }
    } catch (error) {
      console.log('No valid auth token found');
      // Check localStorage for demo fallback
      const savedUser = localStorage.getItem('demoUser');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          console.log('Auth restored from localStorage:', parsedUser);
        } catch (e) {
          console.log('Invalid saved user data');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.login(credentials)
      console.log('Login response:', response)
      if (response && response.user) {
        setUser(response.user)
        // Save to localStorage for persistence
        localStorage.setItem('demoUser', JSON.stringify(response.user))
        return response
      } else {
        // Fallback to basic user data
        const fallbackUser = { authenticated: true, role: credentials.role, email: credentials.email }
        setUser(fallbackUser)
        localStorage.setItem('demoUser', JSON.stringify(fallbackUser))
        return { user: fallbackUser }
      }
    } catch (error) {
      console.error('Login API error:', error)
      // For demo purposes, allow fallback login
      const fallbackUser = { authenticated: true, role: credentials.role, email: credentials.email }
      setUser(fallbackUser)
      localStorage.setItem('demoUser', JSON.stringify(fallbackUser))
      return { user: fallbackUser }
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
      localStorage.removeItem('demoUser')
    } catch (error) {
      console.error('Logout error:', error)
      // Clear user state anyway
      setUser(null)
      localStorage.removeItem('demoUser')
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