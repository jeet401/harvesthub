import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api.js'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // Start with true to check for existing auth

  // Check for existing authentication on app load
  useEffect(() => {
    checkAuth();
    
    // Listen for storage events (cross-tab communication)
    const handleStorageChange = (e) => {
      // If auth-related storage changed, re-check auth
      if (e.key === 'auth_changed' || e.key === 'logout_event') {
        console.log('Auth changed in another tab, re-checking...');
        checkAuth();
      }
    };
    
    // Listen for window focus (when user switches back to this tab)
    const handleFocus = () => {
      console.log('Tab focused, re-checking auth...');
      checkAuth();
    };
    
    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Check auth function - try to get user from server only
  const checkAuth = async () => {
    try {
      setLoading(true);
      
      // Try to refresh token with backend
      const response = await api.refresh();
      if (response && response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      // Handle different types of errors
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        console.error('Connection error during auth check:', error.message);
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.log('No valid auth token found');
      } else {
        console.error('Auth check error:', error.message);
      }
      
      // Clear any old localStorage data
      localStorage.removeItem('demoUser');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.login(credentials)
      if (response && response.user) {
        setUser(response.user)
        // Notify other tabs about auth change
        localStorage.setItem('auth_changed', Date.now().toString());
        return response
      } else {
        throw new Error('Invalid login response')
      }
    } catch (error) {
      console.error('Login API error:', error)
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
      localStorage.removeItem('demoUser')
      // Notify other tabs about logout
      localStorage.setItem('logout_event', Date.now().toString());
    } catch (error) {
      console.error('Logout error:', error)
      // Clear user state anyway
      setUser(null)
      localStorage.removeItem('demoUser')
      // Notify other tabs about logout even on error
      localStorage.setItem('logout_event', Date.now().toString());
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