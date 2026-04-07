import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { queryDocuments } from '../../services/firestoreService'
import { dummyServices, formatCurrencyINR } from '../../utils/dummyData'
import { TableSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'

export default function MyServices() {
  const { user } = useAuth()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) loadServices()
  }, [user])

  const loadServices = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await queryDocuments('services', 'worker_id', '==', user.uid)
      setServices(data.length > 0 ? data : dummyServices.slice(0, 2))
    } catch (err) {
      console.error(err)
      setError('Failed to load services')
      setServices(dummyServices.slice(0, 2))
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <TableSkeleton rows={4} />

  if (error) return <ErrorState title="Error Loading Services" message={error} onRetry={loadServices} />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">My Services</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{services.length} services listed</p>
        </div>
        <Link to="/services/create" className="btn-primary text-sm">+ Add Service</Link>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={WrenchScrewdriverIcon}
          title="No services yet"
          description="Create your first service listing"
          actionLabel="Create Your First Service"
          actionTo="/services/create"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map(s => (
            <div key={s.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{s.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{s.category}</p>
                </div>
                <span className="text-lg font-bold text-primary-600">{formatCurrencyINR(s.price || 0)}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{s.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{s.rating || 0}</span>
                  <span className="text-xs text-gray-400">({s.total_reviews || 0})</span>
                </div>
                <span className={`badge ${s.is_active !== false ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                  {s.is_active !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
