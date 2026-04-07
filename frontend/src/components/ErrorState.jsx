import React from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function ErrorState({ title = 'Something went wrong', message = 'Please try again later.', onRetry }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
        <ExclamationTriangleIcon className="w-8 h-8 text-red-500 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto">{message}</p>
      {onRetry && (
        <button onClick={onRetry}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
          <ArrowPathIcon className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  )
}
