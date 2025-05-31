import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setUser(session.user)
        
        // Fetch company data
        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
        
        if (companyData) {
          setCompany(companyData)
        }
      }
      
      setLoading(false)
    }
    
    checkSession()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user)
          
          // Fetch company data
          const { data: companyData } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
          
          if (companyData) {
            setCompany(companyData)
          }
        } else {
          setUser(null)
          setCompany(null)
        }
        
        setLoading(false)
      }
    )
    
    return () => {
      subscription?.unsubscribe()
    }
  }, [])
  
  const signUp = async (email, password, companyData) => {
    try {
      // Create user with email confirmation disabled
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            company_name: companyData.name
          }
        }
      })
      
      if (authError) throw authError
      
      // Create company record
      const { error: companyError } = await supabase
        .from('companies')
        .insert({
          user_id: authData.user.id,
          name: companyData.name,
          address: companyData.address,
          phone: companyData.phone
        })
      
      if (companyError) throw companyError
      
      return { success: true, user: authData.user }
    } catch (error) {
      console.error('Error signing up:', error)
      return { success: false, error }
    }
  }
  
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      return { success: true, user: data.user }
    } catch (error) {
      console.error('Error signing in:', error)
      return { success: false, error }
    }
  }
  
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error signing out:', error)
      return { success: false, error }
    }
  }
  
  const value = {
    user,
    company,
    loading,
    signUp,
    signIn,
    signOut
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
