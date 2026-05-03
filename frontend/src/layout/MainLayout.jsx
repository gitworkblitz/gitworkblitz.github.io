import React, { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { PageSkeleton } from '../components/SkeletonLoader'

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      {/* Footer hidden on mobile — BottomNav replaces it */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  )
}
