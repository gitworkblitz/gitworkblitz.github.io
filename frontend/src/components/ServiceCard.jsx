import React from 'react'
import { Link } from 'react-router-dom'
import { StarIcon } from '@heroicons/react/24/solid'
import { MapPinIcon, UserIcon } from '@heroicons/react/24/outline'
import { formatCurrencyINR } from '../utils/dummyData'
import { CategoryIconBadge } from './CategoryIcon'

export default function ServiceCard({ service }) {
  const s = service
  return (
    <Link to={`/services/${s.id}`}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden group border border-gray-100 dark:border-gray-800 flex flex-col">
      <div className="h-40 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 flex items-center justify-center relative overflow-hidden">
        <CategoryIconBadge category={s.category} size="xl" />
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-200 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">{s.category}</span>
        </div>
        {/* Price badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-primary-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            {formatCurrencyINR(s.price || 0)}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 group-hover:text-primary-600 transition-colors line-clamp-1">{s.title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-3 line-clamp-2 flex-1">{s.description}</p>

        {/* Worker name */}
        {s.worker_name && (
          <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500 dark:text-gray-400">
            <UserIcon className="w-3.5 h-3.5" />
            <span>{s.worker_name}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5">
            <StarIcon className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{s.rating || '0.0'}</span>
            <span className="text-xs text-gray-400">({s.total_reviews || 0})</span>
          </div>
          {s.location && (
            <div className="flex items-center gap-1 text-gray-400">
              <MapPinIcon className="w-3.5 h-3.5" />
              <span className="text-xs">{s.location}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
