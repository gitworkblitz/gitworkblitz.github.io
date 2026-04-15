import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { queryDocuments } from '../../services/firestoreService'
import { dummyServices, formatCurrencyINR } from '../../utils/dummyData'
import { CardGridSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import {
  WrenchScrewdriverIcon, ClockIcon, ArrowTrendingUpIcon,
  EyeIcon, ArrowRightIcon
} from '@heroicons/react/24/outline'
import { StarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'

export default function MyServices() {
  const { user } = useAuth()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadServices = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await queryDocuments('services', 'worker_id', '==', user.uid)
      setServices(data.length > 0 ? data : dummyServices)
    } catch (err) {
      console.error(err)
      setError('Failed to load services')
      setServices(dummyServices.slice(0, 2))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { if (user) loadServices() }, [user, loadServices])

  // Memoized stats
  const serviceStats = useMemo(() => ({
    total: services.length,
    active: services.filter(s => s.is_active !== false).length,
    inactive: services.filter(s => s.is_active === false).length,
    avgRating: services.length > 0
      ? (services.reduce((sum, s) => sum + (s.rating || 0), 0) / services.length).toFixed(1)
      : '0.0',
    totalRevenue: formatCurrencyINR(
      services.reduce((sum, s) => sum + (s.total_bookings || 0) * (s.price || 0), 0)
    ),
  }), [services])

  if (loading) return (
    <div>
      <div className="mb-6">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-2"></div>
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
      </div>
      <CardGridSkeleton count={4} cols={2} type="service" />
    </div>
  )
  if (error) return <ErrorState title="Error Loading Services" message={error} onRetry={loadServices} />

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">My Services</h1>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span>{serviceStats.total} services</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="flex items-center gap-1">
              <span className="status-dot bg-green-500" />
              {serviceStats.active} active
            </span>
            <span className="flex items-center gap-1">
              <StarIcon className="w-3 h-3 text-yellow-400" />
              {serviceStats.avgRating} avg
            </span>
          </div>
        </div>
        <Link to="/services/create" className="btn-primary text-sm">+ Add Service</Link>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={WrenchScrewdriverIcon}
          title="No services yet"
          description="Create your first service listing to start receiving bookings"
          actionLabel="Create Your First Service"
          actionTo="/services/create"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((s, i) => (
            <div
              key={s.id}
              className="stat-card dash-card-enter bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5 group"
            >
              {/* Title + Price */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 pr-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">{s.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">{s.category}</p>
                </div>
                <span className="text-lg font-bold text-primary-600 flex-shrink-0">{formatCurrencyINR(s.price || 0)}</span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{s.description}</p>

              {/* Availability slots */}
              {(s.availability || []).length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-400 flex items-center gap-1 mb-1.5">
                    <ClockIcon className="w-3 h-3" /> Available slots
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(s.availability || []).slice(0, 2).map(slot => (
                      <span key={slot} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        {slot}
                      </span>
                    ))}
                    {(s.availability || []).length > 2 && (
                      <span className="text-xs text-gray-400">+{s.availability.length - 2} more</span>
                    )}
                  </div>
                </div>
              )}

              {/* Footer: Rating + Status */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{s.rating || '0.0'}</span>
                  <span className="text-xs text-gray-400">({s.total_reviews || 0} reviews)</span>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${
                  s.is_active !== false
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {s.is_active !== false ? (
                    <>
                      <span className="status-dot bg-green-500" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="w-3 h-3" />
                      Inactive
                    </>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
