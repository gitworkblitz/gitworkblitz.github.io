import React, { Suspense } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageSkeleton } from '../components/SkeletonLoader'

export default function AuthLayout() {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Outlet />
    </Suspense>
  )
}
