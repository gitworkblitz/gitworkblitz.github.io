import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSettings } from '../../context/SettingsContext'
import { getUserBookings } from '../../services/firestoreService'
import { formatCurrencyINR } from '../../utils/dummyData'
import { TableSkeleton } from '../../components/SkeletonLoader'
import toast from 'react-hot-toast'
import {
  IndianRupee as CurrencyRupeeIcon,
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  ArrowRight as ArrowRightIcon,
  CreditCard,
  TrendingUp,
} from 'lucide-react'

export default function PaymentsPage() {
  const { user } = useAuth()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const platformName = settings?.platformName || 'WorkSphere'

  const loadBookings = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const all = await getUserBookings(user.uid)
      setBookings(all)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) loadBookings()
  }, [user, loadBookings])

  useEffect(() => {
    document.title = `Payments | ${platformName}`
  }, [platformName])

  const pendingPayment = useMemo(() =>
    bookings.filter(b => b.payment_status !== 'paid' && b.status !== 'cancelled'),
    [bookings]
  )
  const paidBookings = useMemo(() =>
    bookings.filter(b => b.payment_status === 'paid'),
    [bookings]
  )
  const totalPaid = useMemo(() =>
    paidBookings.reduce((sum, b) => sum + (b.amount || b.price || 0), 0),
    [paidBookings]
  )

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
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{paidBookings.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingPayment.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrencyINR(totalPaid)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Paid</p>
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
              <div key={b.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center">
                    <CurrencyRupeeIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{b.service_title || 'Service'}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5" />{b.booking_date || 'N/A'}</span>
                      <span>{b.time_slot || ''}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrencyINR(b.amount || b.price || 0)}</p>
                  <button
                    onClick={() => navigate(`/payments/${b.id}`)}
                    className="bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 transition-all font-semibold text-sm flex items-center gap-2 shadow-sm active:scale-[0.98]">
                    <CreditCard className="w-4 h-4" />
                    Pay Now
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
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-8 text-center">
            <p className="text-gray-400 dark:text-gray-500 text-sm">No completed payments yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paidBookings.map(b => (
              <div key={b.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:shadow-card-hover transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{b.service_title || 'Service'}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>{b.booking_date || 'N/A'}</span>
                      <span className="badge-paid">Paid</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrencyINR(b.amount || b.price || 0)}</p>
                  <Link to={`/bookings/${b.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                    View <ArrowRightIcon className="w-3 h-3" />
                  </Link>
                  <Link to="/invoices" className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
                    Invoice <ArrowRightIcon className="w-3 h-3" />
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
