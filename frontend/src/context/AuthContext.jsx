import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import toast from 'react-hot-toast'
import { PageSkeleton } from '../components/SkeletonLoader'

export const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'worksphere@gmail.com'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        try {
          const snap = await getDoc(doc(db, 'users', u.uid))
          if (snap.exists()) {
            const profile = { ...snap.data(), uid: u.uid }
            setUserProfile(profile)
          } else {
            setUserProfile(null)
          }
        } catch (err) {
          console.error('Error fetching profile:', err)
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const login = useCallback(async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    // Fetch profile for role-based redirect
    const snap = await getDoc(doc(db, 'users', cred.user.uid))
    let profile = null
    if (snap.exists()) {
      profile = { ...snap.data(), uid: cred.user.uid }
      setUserProfile(profile)
    }
    toast.success('Welcome back!')
    return { user: cred.user, profile }
  }, [])

  const signup = useCallback(async ({ name, email, password, phone, location, userType = 'customer' }) => {
    // Block admin signup from public form
    if (userType === 'admin') {
      throw new Error('Admin accounts cannot be created via signup')
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })

    // Auto-assign admin role if email matches ADMIN_EMAIL
    const finalRole = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : userType

    const profile = {
      uid: cred.user.uid,
      name,
      email,
      phone: phone || '',
      location: location || '',
      user_type: finalRole,
      skills: [],
      bio: '',
      rating: 0,
      total_reviews: 0,
      experience_years: 0,
      completion_rate: 100,
      suspended: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await setDoc(doc(db, 'users', cred.user.uid), profile)
    setUserProfile(profile)
    toast.success('Account created successfully!')
    return { user: cred.user, profile }
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
    setUser(null)
    setUserProfile(null)
    toast.success('Logged out')
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    try {
      const snap = await getDoc(doc(db, 'users', user.uid))
      if (snap.exists()) setUserProfile({ ...snap.data(), uid: user.uid })
    } catch (err) {
      console.error('Error refreshing profile:', err)
    }
  }, [user])

  const updateUserProfile = useCallback(async (data) => {
    if (!user) return
    const updateData = { ...data, updatedAt: new Date().toISOString() }
    await setDoc(doc(db, 'users', user.uid), updateData, { merge: true })
    setUserProfile(p => ({ ...p, ...updateData }))
  }, [user])

  const isAdmin = userProfile?.user_type === 'admin'
  const isWorker = userProfile?.user_type === 'worker'
  const isEmployer = userProfile?.user_type === 'employer'
  const isCustomer = userProfile?.user_type === 'customer'

  const getRedirectPath = useCallback((profile) => {
    if (!profile) return '/dashboard'
    switch (profile.user_type) {
      case 'admin': return '/admin'
      case 'worker': return '/dashboard'
      case 'employer': return '/dashboard'
      case 'customer': return '/dashboard'
      default: return '/dashboard'
    }
  }, [])

  const contextValue = useMemo(() => ({
    user, userProfile, loading,
    login, signup, logout,
    refreshProfile, updateUserProfile,
    isAdmin, isWorker, isEmployer, isCustomer,
    getRedirectPath
  }), [user, userProfile, loading, login, signup, logout, refreshProfile, updateUserProfile, isAdmin, isWorker, isEmployer, isCustomer, getRedirectPath])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
