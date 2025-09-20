import React, { createContext, useContext, useMemo, useState } from 'react'

const LanguageContext = createContext(null)

const translations = {
  en: {
    nav: {
      home: 'Home',
      howItWorks: 'How it works',
      signIn: 'Sign in',
      signUpFarmer: 'Sign up as Farmer',
    },
  },
  hi: {
    nav: {
      home: 'होम',
      howItWorks: 'यह कैसे काम करता है',
      signIn: 'साइन इन',
      signUpFarmer: 'फार्मर के रूप में साइन अप',
    },
  },
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en')
  const value = useMemo(() => ({ language, setLanguage, t: translations[language] }), [language])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}


