import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getUserBookings, updateBookingStatus } from '../../services/firestoreService'
import { BOOKING_STATUSES, formatCurrencyINR } from '../../utils/dummyData'
import { ListSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { CalendarIcon, ClockIcon, CheckCircleIcon, TruckIcon, XCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

// Worker actions per booking status
const WORKER_ACTIONS = {
  requested: [
    { label: 'Accept', next: 'accepted', cls: 'bg-green-600 hover:bg-green-700 text-white' },
    { label: 'Reject', next: 'cancelled', cls: 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800' },
  ],
  accepted: [
    { label: 'On the Way', next: 'on_the_way', cls: 'bg-blue-600 hover:bg-blue-700 text-white' },
  ],
  on_the_way: [
    { label: 'Mark Completed', next: 'completed', cls: 'bg-green-600 hover:bg-green-700 text-white' },
  ],
}

export default function MyBookings() {
  const { user, isWorker } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const loadBookings = useCallback(async () => {
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
  }, [user])

  useEffect(() => { if (user) loadBookings() }, [user, loadBookings])

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setActionLoading(bookingId + newStatus)
    try {
      await updateBookingStatus(bookingId, newStatus)
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
      const messages = {
        accepted: 'Booking accepted! ✅',
        cancelled: 'Booking rejected',
        on_the_way: 'Status updated — heading to customer',
        completed: 'Booking marked as completed! 🎉',
      }
      toast.success(messages[newStatus] || `Status updated to ${newStatus}`)
    } catch (err) {
      toast.error(err.message || 'Failed to update booking status')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-2"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
        </div>
        <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
      </div>
      <ListSkeleton count={4} />
    </div>
  )
  if (error) return <ErrorState title="Error Loading Bookings" message={error} onRetry={loadBookings} />

  // Worker sees all their assigned bookings; customers see bookings they made
  const workerBookings = isWorker ? bookings.filter(b => b.worker_id === user?.uid) : []
  const customerBookings = !isWorker ? bookings : bookings.filter(b => b.customer_id === user?.uid)

  const renderBookingCard = (b, showActions = false) => {
    const statusConf = BOOKING_STATUSES.find(s => s.key === b.status) || BOOKING_STATUSES[0]
    const actions = showActions ? WORKER_ACTIONS[b.status] || [] : []

    return (
      <div key={b.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <CalendarIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{b.service_title || 'Service Booking'}</p>
              {showActions && b.customer_name && (
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Customer: {b.customer_name}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {b.booking_date || 'N/A'}
                </span>
                {b.time_slot && (
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    {b.time_slot}
                  </span>
                )}
                {b.address && <span className="text-xs truncate max-w-[160px]">{b.address}</span>}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusConf.color}`}>
                  {statusConf.label}
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrencyINR(b.amount || b.price || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {/* Worker action buttons */}
            {actions.map(action => (
              <button
                key={action.next}
                onClick={() => handleStatusUpdate(b.id, action.next)}
                disabled={actionLoading === b.id + action.next}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap ${action.cls}`}
              >
                {actionLoading === b.id + action.next ? (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : null}
                {action.label}
              </button>
            ))}
            {/* Customer link to detail page */}
            {!showActions && (
              <Link to={`/bookings/${b.id}`} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                View →
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">My Bookings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{bookings.length} total bookings</p>
        </div>
        {!isWorker && (
          <Link to="/services" className="btn-primary text-sm">Book a Service</Link>
        )}
      </div>

      {/* Worker section: action-capable incoming bookings */}
      {isWorker && workerBookings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <TruckIcon className="w-5 h-5 text-primary-500" />
            Service Requests
            <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full font-semibold">
              {workerBookings.filter(b => b.status === 'requested').length} pending
            </span>
          </h2>
          <div className="space-y-3">
            {workerBookings.map(b => renderBookingCard(b, true))}
          </div>
        </div>
      )}

      {/* Customer bookings */}
      {customerBookings.length === 0 && (!isWorker || workerBookings.length === 0) ? (
        <EmptyState
          icon={CalendarIcon}
          title="No bookings yet"
          description={isWorker ? 'Your accepted bookings will appear here' : 'Book a service to get started'}
          actionLabel={isWorker ? undefined : 'Browse Services'}
          actionTo={isWorker ? undefined : '/services'}
        />
      ) : (
        customerBookings.length > 0 && (
          <div>
            {isWorker && <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">My Bookings as Customer</h2>}
            <div className="space-y-3">
              {customerBookings.map(b => renderBookingCard(b, false))}
            </div>
          </div>
        )
      )}
    </div>
  )
}
