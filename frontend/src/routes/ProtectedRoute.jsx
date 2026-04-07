import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly = false, allowedRoles = [] }) {
  const { user, userProfile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <div className="w-6 h-6 border-[3px] border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-2 text-center">
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
            <div className="h-2 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Admin-only check
  if (adminOnly && userProfile?.user_type !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  // Role-based access check
  if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile?.user_type)) {
    return <Navigate to="/dashboard" replace />
  }

  // Check if user is suspended
  if (userProfile?.suspended) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-card p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Account Suspended</h2>
          <p className="text-gray-500 text-sm mb-6">Your account has been temporarily suspended. Please contact support for assistance.</p>
          <a href="mailto:support@worksphere.com" className="btn-primary inline-block">Contact Support</a>
        </div>
      </div>
    )
  }

  return children
}
