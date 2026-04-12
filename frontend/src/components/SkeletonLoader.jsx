import React from 'react'

const shimmerAnimation = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`

export function Pulse({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
}

export function Shimmer({ className = '' }) {
  return (
    <div 
      className={`relative overflow-hidden rounded ${className}`}
      style={{ background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }}
    >
      <style>{shimmerAnimation}</style>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 overflow-hidden">
      <Shimmer className="h-40 rounded-none" />
      <div className="p-5 space-y-3">
        <Shimmer className="h-5 w-3/4" />
        <Shimmer className="h-4 w-full" />
        <Shimmer className="h-4 w-5/6" />
        <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <Shimmer className="h-4 w-16" />
          <Shimmer className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

export function JobCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5 flex flex-col h-full">
      <div className="flex gap-3 items-start mb-3">
        <Shimmer className="w-12 h-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <Shimmer className="h-4 w-3/4" />
          <Shimmer className="h-3 w-1/2" />
        </div>
        <Shimmer className="h-5 w-16 rounded-md flex-shrink-0" />
      </div>
      <div className="flex items-center mb-3">
        <Shimmer className="w-3 h-3 rounded-full mr-2" />
        <Shimmer className="h-3 w-24" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700/50">
        <div className="space-y-1.5">
          <Shimmer className="h-2 w-16" />
          <Shimmer className="h-3 w-20" />
        </div>
        <div className="space-y-1.5">
          <Shimmer className="h-2 w-16" />
          <Shimmer className="h-3 w-12" />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        <Shimmer className="h-6 w-16 rounded-full" />
        <Shimmer className="h-6 w-20 rounded-full" />
        <Shimmer className="h-6 w-14 rounded-full" />
      </div>
      <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
        <Shimmer className="h-6 w-24 rounded-full" />
        <Shimmer className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  )
}

export function GigCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 gap-2">
        <Shimmer className="h-6 w-24 rounded-full" />
        <Shimmer className="h-5 w-16 rounded-md" />
      </div>
      <Shimmer className="h-5 w-full mb-1" />
      <Shimmer className="h-5 w-2/3 mb-3" />
      <Shimmer className="h-3 w-32 mb-3" />
      <div className="space-y-2 mb-4">
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-5/6" />
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
        <Shimmer className="h-6 w-16 rounded-full" />
        <Shimmer className="h-6 w-20 rounded-full" />
        <Shimmer className="h-6 w-12 rounded-full" />
      </div>
      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Shimmer className="w-8 h-8 rounded-lg" />
          <div className="space-y-1">
            <Shimmer className="h-2 w-10" />
            <Shimmer className="h-3 w-16" />
          </div>
        </div>
        <Shimmer className="h-9 w-24 rounded-xl" />
      </div>
    </div>
  )
}

export function WorkerCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 flex flex-col items-center text-center">
      <Shimmer className="w-20 h-20 rounded-full mb-4" />
      <Shimmer className="h-4 w-32 mb-2" />
      <Shimmer className="h-3 w-24 mb-3" />
      <div className="flex items-center gap-2 mb-3">
        <Shimmer className="h-4 w-12" />
        <Shimmer className="h-3 w-16" />
      </div>
      <div className="flex gap-2 mb-4">
        <Shimmer className="h-6 w-20 rounded-full" />
        <Shimmer className="h-6 w-20 rounded-full" />
      </div>
      <Shimmer className="h-9 w-full rounded-xl" />
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-center gap-3 mb-3">
        <Shimmer className="w-10 h-10 rounded-xl" />
      </div>
      <Shimmer className="h-7 w-16 mb-2" />
      <Shimmer className="h-3 w-20" />
    </div>
  )
}

export function CardGridSkeleton({ count = 6, cols = 3, type = 'service' }) {
  const colClass = cols === 4 ? 'lg:grid-cols-4' : cols === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
  
  const SkeletonComponent = type === 'job' ? JobCardSkeleton : type === 'gig' ? GigCardSkeleton : type === 'worker' ? WorkerCardSkeleton : CardSkeleton

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${colClass} gap-6`}>
      {Array.from({ length: count }).map((_, i) => <SkeletonComponent key={i} />)}
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Shimmer className="h-4 w-32 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 overflow-hidden">
            <Shimmer className="h-56 rounded-none" />
            <div className="p-6 space-y-3">
              <Shimmer className="h-7 w-2/3" />
              <Shimmer className="h-4 w-1/3" />
              <Shimmer className="h-4 w-full" />
              <Shimmer className="h-4 w-5/6" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6 space-y-3">
            <Shimmer className="h-5 w-40" />
            <div className="flex items-center gap-4">
              <Shimmer className="w-14 h-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <Shimmer className="h-4 w-32" />
                <Shimmer className="h-3 w-24" />
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6 space-y-4">
            <Shimmer className="h-8 w-24" />
            <Shimmer className="h-10 w-full rounded-xl" />
            <Shimmer className="h-10 w-full rounded-xl" />
            <Shimmer className="h-10 w-full rounded-xl" />
            <Shimmer className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <Shimmer className="h-5 w-48" />
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <Shimmer className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-4 w-1/3" />
              <Shimmer className="h-3 w-1/4" />
            </div>
            <Shimmer className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 flex gap-3">
              <Shimmer className="w-10 h-10 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <Shimmer className="h-4 w-1/3" />
                <div className="flex items-center gap-3">
                  <Shimmer className="h-3 w-20" />
                  <Shimmer className="h-3 w-16" />
                  <Shimmer className="h-3 w-24" />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Shimmer className="h-5 w-16 rounded-full" />
                  <Shimmer className="h-5 w-16 rounded-full" />
                  <Shimmer className="h-5 w-16 rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <Shimmer className="h-5 w-16 rounded-full" />
              <Shimmer className="h-9 w-28 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="min-h-[60vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <Shimmer className="h-7 w-48" />
          <Shimmer className="h-4 w-32" />
        </div>
        <Shimmer className="h-10 w-28 rounded-xl" />
      </div>
      <CardGridSkeleton count={6} />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 space-y-2">
        <Shimmer className="h-7 w-56" />
        <Shimmer className="h-4 w-36" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-5 space-y-3">
            <Shimmer className="w-10 h-10 rounded-xl" />
            <Shimmer className="h-7 w-16" />
            <Shimmer className="h-3 w-24" />
          </div>
        ))}
      </div>
      
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6 mb-8">
        <Shimmer className="h-5 w-32 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Shimmer key={i} className="h-16 rounded-xl w-full" />
          ))}
        </div>
      </div>

      <TableSkeleton rows={4} />
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Shimmer className="w-24 h-24 rounded-full" />
          <div className="flex-1 space-y-3 text-center md:text-left">
            <Shimmer className="h-6 w-48 mx-auto md:mx-0" />
            <Shimmer className="h-4 w-32 mx-auto md:mx-0" />
            <Shimmer className="h-4 w-64 mx-auto md:mx-0" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6">
        <Shimmer className="h-5 w-32 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Shimmer className="h-3 w-20 mb-2" />
                <Shimmer className="h-10 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
