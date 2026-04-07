import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getUserBookings, simulatePayment, generateInvoice, updateBookingStatus } from '../../services/firestoreService'
import { BOOKING_STATUSES, formatCurrencyINR } from '../../utils/dummyData'
import { TableSkeleton } from '../../components/SkeletonLoader'
import toast from 'react-hot-toast'
import { CurrencyRupeeIcon, CheckCircleIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/outline'

export default function PaymentsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState(null)

  useEffect(() => {
    if (user) loadBookings()
  }, [user])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const all = await getUserBookings(user.uid)
      setBookings(all)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (booking) => {
    setPayingId(booking.id)
    try {
      await simulatePayment(booking.id, booking.amount || booking.price || 0, user.uid)
      await generateInvoice(booking.id, booking)
      toast.success('Payment successful! Invoice generated')
      await loadBookings()
    } catch (err) {
      toast.error('Payment failed')
    } finally {
      setPayingId(null)
    }
  }

  const pendingPayment = bookings.filter(b => b.payment_status !== 'paid' && b.status !== 'cancelled')
  const paidBookings = bookings.filter(b => b.payment_status === 'paid')

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <TableSkeleton rows={4} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="page-header">Payments</h1>
        <p className="page-subtitle">Manage your service payments</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{paidBookings.length}</p>
              <p className="text-xs text-gray-500">Paid</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingPayment.length}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <CurrencyRupeeIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrencyINR(paidBookings.reduce((sum, b) => sum + (b.amount || b.price || 0), 0))}
              </p>
              <p className="text-xs text-gray-500">Total Paid</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending payments */}
      {pendingPayment.length > 0 && (
        <div className="mb-8">
          <h2 className="section-title">Pending Payments</h2>
          <div className="space-y-3">
            {pendingPayment.map(b => (
              <div key={b.id} className="bg-white rounded-xl shadow-card border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                    <CurrencyRupeeIcon className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{b.service_title || 'Service'}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5" />{b.booking_date || 'N/A'}</span>
                      <span>{b.time_slot || ''}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-bold text-gray-900">{formatCurrencyINR(b.amount || b.price || 0)}</p>
                  <button onClick={() => handlePayment(b)} disabled={payingId === b.id}
                    className="bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors font-semibold text-sm flex items-center gap-2 shadow-sm">
                    {payingId === b.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CurrencyRupeeIcon className="w-4 h-4" />
                        Pay Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paid */}
      <div>
        <h2 className="section-title">Payment History</h2>
        {paidBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-card border border-gray-100 p-8 text-center">
            <p className="text-gray-400 text-sm">No completed payments yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paidBookings.map(b => (
              <div key={b.id} className="bg-white rounded-xl shadow-card border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{b.service_title || 'Service'}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>{b.booking_date || 'N/A'}</span>
                      <span className="badge-paid">Paid</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-bold text-gray-900">{formatCurrencyINR(b.amount || b.price || 0)}</p>
                  <Link to={`/bookings/${b.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
