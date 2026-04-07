import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getUserBookings } from '../../services/firestoreService'
import { BOOKING_STATUSES, formatCurrencyINR } from '../../utils/dummyData'
import { TableSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function MyBookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) loadBookings()
  }, [user])

  const loadBookings = async () => {
    setLoading(true)
    setError(null)
    try {
      setBookings(await getUserBookings(user.uid))
    } catch (err) {
      console.error(err)
      setError('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <TableSkeleton rows={5} />

  if (error) return <ErrorState title="Error Loading Bookings" message={error} onRetry={loadBookings} />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">My Bookings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{bookings.length} total bookings</p>
        </div>
        <Link to="/services" className="btn-primary text-sm">Book a Service</Link>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No bookings yet"
          description="Book a service to get started"
          actionLabel="Browse Services"
          actionTo="/services"
        />
      ) : (
        <div className="space-y-3">
          {bookings.map(b => {
            const statusConf = BOOKING_STATUSES.find(s => s.key === b.status) || BOOKING_STATUSES[0]
            return (
              <Link key={b.id} to={`/bookings/${b.id}`}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between hover:shadow-card-hover transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-primary-600">{b.service_title || 'Service'}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" />{b.booking_date || 'N/A'}</span>
                      <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" />{b.time_slot || ''}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConf.color}`}>{statusConf.label}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrencyINR(b.amount || b.price || 0)}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
