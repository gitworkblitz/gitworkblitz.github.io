import React from 'react'

function Pulse({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 overflow-hidden">
      <Pulse className="h-40 rounded-none" />
      <div className="p-5 space-y-3">
        <Pulse className="h-5 w-3/4" />
        <Pulse className="h-4 w-full" />
        <Pulse className="h-4 w-5/6" />
        <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <Pulse className="h-4 w-16" />
          <Pulse className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

export function CardGridSkeleton({ count = 6, cols = 3 }) {
  const colClass = cols === 4 ? 'lg:grid-cols-4' : cols === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${colClass} gap-6`}>
      {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Pulse className="h-4 w-32 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 overflow-hidden">
            <Pulse className="h-56 rounded-none" />
            <div className="p-6 space-y-3">
              <Pulse className="h-7 w-2/3" />
              <Pulse className="h-4 w-1/3" />
              <Pulse className="h-4 w-full" />
              <Pulse className="h-4 w-5/6" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6 space-y-3">
            <Pulse className="h-5 w-40" />
            <div className="flex items-center gap-4">
              <Pulse className="w-14 h-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <Pulse className="h-4 w-32" />
                <Pulse className="h-3 w-24" />
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6 space-y-4">
            <Pulse className="h-8 w-24" />
            <Pulse className="h-10 w-full rounded-xl" />
            <Pulse className="h-10 w-full rounded-xl" />
            <Pulse className="h-10 w-full rounded-xl" />
            <Pulse className="h-12 w-full rounded-xl" />
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
        <Pulse className="h-5 w-48" />
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <Pulse className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Pulse className="h-4 w-1/3" />
              <Pulse className="h-3 w-1/4" />
            </div>
            <Pulse className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="min-h-[60vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <Pulse className="h-7 w-48" />
          <Pulse className="h-4 w-32" />
        </div>
        <Pulse className="h-10 w-28 rounded-xl" />
      </div>
      <CardGridSkeleton count={6} />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 space-y-2">
        <Pulse className="h-7 w-56" />
        <Pulse className="h-4 w-36" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-5 space-y-3">
            <Pulse className="w-10 h-10 rounded-xl" />
            <Pulse className="h-7 w-16" />
            <Pulse className="h-3 w-24" />
          </div>
        ))}
      </div>
      <TableSkeleton rows={4} />
    </div>
  )
}
