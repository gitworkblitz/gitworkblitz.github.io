import React from 'react'
import { Link } from 'react-router-dom'
import { StarIcon, CheckBadgeIcon } from '@heroicons/react/24/solid'
import { MapPinIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline'
import { formatCurrencyINR } from '../utils/dummyData'
import { CategoryIconBadge } from './CategoryIcon'

const ServiceCard = React.memo(function ServiceCard({ service }) {
  const s = service
  const isHighlyRated = (s.rating || 0) >= 4.5
  const hasManyReviews = (s.total_reviews || 0) >= 50
  
  return (
    <Link to={`/services/${s.id}`}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden group border border-gray-100 dark:border-gray-800 flex flex-col relative"
    >
      {isHighlyRated && hasManyReviews && (
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <StarIcon className="w-3 h-3" /> TOP RATED
        </div>
      )}
      
      <div className="h-40 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 flex items-center justify-center relative overflow-hidden">
        <CategoryIconBadge category={s.category} size="xl" />
        
        <div className="absolute top-3 right-3 flex gap-2">
          <span className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-200 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
            {s.category}
          </span>
        </div>
        
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white dark:from-gray-900 to-transparent" />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-1 flex-1">{s.title}</h3>
          <span className="bg-primary-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap">
            {formatCurrencyINR(s.price || 0)}
          </span>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-3 line-clamp-2 flex-1">{s.description}</p>

        {s.worker_name && (
          <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500 dark:text-gray-400">
            <UserIcon className="w-3.5 h-3.5" />
            <span className="flex items-center gap-1">
              {s.worker_name}
              {isHighlyRated && <CheckBadgeIcon className="w-3.5 h-3.5 text-primary-500" />}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5">
            <StarIcon className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{s.rating || '0.0'}</span>
            <span className="text-xs text-gray-400">({s.total_reviews || 0})</span>
          </div>
          {s.location && (
            <div className="flex items-center gap-1 text-gray-400 max-w-[100px]">
              <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-xs truncate">{s.location.split(',')[0]}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
})

export default ServiceCard
