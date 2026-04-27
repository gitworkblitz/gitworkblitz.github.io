import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getDocument, updateBookingStatus, simulatePayment, generateInvoice, getBookingInvoice, createReview, queryDocuments } from '../../services/firestoreService'
import { BOOKING_STATUSES, formatCurrencyINR } from '../../utils/dummyData'
import ReviewModal from '../../components/ReviewModal'
import PaymentModal from '../../components/PaymentModal'
import { DetailSkeleton } from '../../components/SkeletonLoader'
import toast from 'react-hot-toast'
import {
  Calendar as CalendarIcon, Clock as ClockIcon, MapPin as MapPinIcon,
  IndianRupee as CurrencyRupeeIcon, CheckCircle as CheckCircleIcon,
  Truck as TruckIcon, Star as StarIcon, ArrowLeft, CreditCard
} from 'lucide-react'

const STATUS_FLOW = ['requested', 'accepted', 'on_the_way', 'completed']

export default function BookingDetailPage() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  const [booking, setBooking] = useState(null)
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [existingReview, setExistingReview] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Auto-redirect to payment gateway when arriving with ?pay=1
  useEffect(() => {
    if (searchParams.get('pay') === '1' && booking && booking.payment_status !== 'paid') {
      searchParams.delete('pay')
      setSearchParams(searchParams, { replace: true })
      navigate(`/payments/${id}`, { replace: true })
    }
  }, [booking, searchParams, id, navigate])

  const loadBooking = useCallback(async () => {
    setLoading(true)
    try {
      const doc = await getDocument('bookings', id)
      setBooking(doc)
      if (doc?.payment_status === 'paid') {
        const inv = await getBookingInvoice(id)
        setInvoice(inv)
      }
      const reviews = await queryDocuments('reviews', 'booking_id', '==', id)
      if (reviews.length > 0) setExistingReview(reviews[0])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load booking')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadBooking()
  }, [loadBooking])

  const handleStatusUpdate = useCallback(async (newStatus) => {
    setActionLoading(true)
    try {
      await updateBookingStatus(id, newStatus)
      setBooking(prev => ({ ...prev, status: newStatus }))
      const labels = { accepted: 'Accepted', on_the_way: 'On the Way', completed: 'Completed', cancelled: 'Cancelled' }
      toast.success(`Status updated to ${labels[newStatus] || newStatus}`)
    } catch (err) {
      toast.error(err.message || 'Failed to update status')
    } finally {
      setActionLoading(false)
    }
  }, [id])

  const handlePayment = useCallback(async (paymentMethod = 'card') => {
    setActionLoading(true)
    try {
      const bookingMeta = {
        service_title: booking.service_title || '',
        worker_name: booking.worker_name || '',
        customer_name: booking.customer_name || '',
        booking_date: booking.booking_date || '',
        time_slot: booking.time_slot || '',
      }
      
      const paymentResult = await simulatePayment(
        id,
        booking.amount || booking.price || 0,
        user.uid,
        paymentMethod,
        bookingMeta
      )

      // CRITICAL: Merge payment result into booking data so invoice gets correct txnId + method
      const invoiceBookingData = {
        ...booking,
        transaction_id: paymentResult.txnId,
        payment_method: paymentMethod,
        paid_at: paymentResult.paidAt,
      }

      const inv = await generateInvoice(id, invoiceBookingData)
      setBooking(prev => ({ ...prev, payment_status: 'paid' }))
      setInvoice(inv)
      setActionLoading(false)
      setShowPaymentModal(false)
      
      toast.success('Payment successful! Invoice generated. 🎉')
      
      // Auto-redirect to invoice page after short delay
      navigate(`/invoices/${inv.id}`)
    } catch (err) {
      toast.error('Payment failed. Please try again.')
      setActionLoading(false)
    }
  }, [id, booking, user, navigate])

  const handleReviewSubmit = useCallback(async (reviewData) => {
    try {
      await createReview({
        ...reviewData,
        booking_id: id,
        service_id: booking.service_id || '',
        customer_id: user.uid,
        customer_name: userProfile?.name || 'Customer',
        worker_id: booking.worker_id || '',
        service_title: booking.service_title || '',
        service_type: booking.category || booking.service_title || '',
      })
      toast.success('Review submitted! Thank you.')
      setShowReview(false)
      await loadBooking()
    } catch (err) {
      toast.error(err.message || 'Failed to submit review')
    }
  }, [id, booking, user, userProfile, loadBooking])

  if (loading) return <DetailSkeleton />

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Booking Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">This booking doesn't exist or you don't have access.</p>
        <Link to="/dashboard/bookings" className="btn-primary">Go to My Bookings</Link>
      </div>
    )
  }

  const isCustomer = booking.customer_id === user?.uid
  const isWorker = booking.worker_id === user?.uid
  const currentStatusIndex = STATUS_FLOW.indexOf(booking.status)
  const canReview = booking.status === 'completed' && isCustomer && !existingReview

  const getNextAction = () => {
    if (!isWorker) return null
    if (booking.status === 'requested') return { label: 'Accept Booking', status: 'accepted', color: 'btn-primary' }
    if (booking.status === 'accepted') return { label: 'On the Way', status: 'on_the_way', color: 'bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-all font-medium active:scale-[0.98]' }
    if (booking.status === 'on_the_way') return { label: 'Mark Completed', status: 'completed', color: 'bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition-all font-medium active:scale-[0.98]' }
    return null
  }

  const nextAction = getNextAction()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link to="/dashboard/bookings" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-2 inline-flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to bookings
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">Booking Details</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ID: {id?.slice(0, 12)}...</p>
        </div>
        <div className="flex items-center gap-3">
          {BOOKING_STATUSES.filter(s => s.key === booking.status).map(s => (
            <span key={s.key} className={`px-3 py-1.5 rounded-full text-sm font-medium ${s.color}`}>{s.label}</span>
          ))}
          {booking.payment_status === 'paid' && (
            <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-3 py-1.5 rounded-full text-sm font-medium">Paid</span>
          )}
        </div>
      </div>

      {/* Status Flow Timeline */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Service Status</h3>
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 z-0" />
          <div className="absolute top-5 left-0 h-0.5 bg-primary-600 z-0 transition-all duration-500"
            style={{ width: currentStatusIndex >= 0 ? `${(currentStatusIndex / (STATUS_FLOW.length - 1)) * 100}%` : '0%' }} />

          {STATUS_FLOW.map((status, i) => {
            const isComplete = i <= currentStatusIndex
            const isCurrent = i === currentStatusIndex
            const statusConf = BOOKING_STATUSES.find(s => s.key === status)
            return (
              <div key={status} className="flex flex-col items-center relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isComplete
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                } ${isCurrent ? 'ring-4 ring-primary-100 dark:ring-primary-900/30 scale-110' : ''}`}>
                  {isComplete ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    <span className="text-xs font-bold">{i + 1}</span>
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium ${isComplete ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  {statusConf?.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Service Information</h3>
            <div className="space-y-3">
              <InfoRow icon={<CalendarIcon className="w-5 h-5" />} label="Service" value={booking.service_title || 'N/A'} />
              <InfoRow icon={<CalendarIcon className="w-5 h-5" />} label="Date" value={booking.booking_date || 'N/A'} />
              <InfoRow icon={<ClockIcon className="w-5 h-5" />} label="Time Slot" value={booking.time_slot || 'N/A'} />
              <InfoRow icon={<MapPinIcon className="w-5 h-5" />} label="Address" value={booking.address || 'N/A'} />
              <InfoRow icon={<CurrencyRupeeIcon className="w-5 h-5" />} label="Amount" value={formatCurrencyINR(booking.amount || booking.price || 0)} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">People</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PersonCard label="Customer" name={booking.customer_name || 'Customer'} type="customer" />
              <PersonCard label="Worker" name={booking.worker_name || 'Worker'} type="worker" />
            </div>
          </div>

          {existingReview && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Your Review</h3>
              <div className="flex gap-0.5 mb-2">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className={`w-5 h-5 ${i < existingReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-700'}`} />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">"{existingReview.comment}"</p>
              {existingReview.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {existingReview.tags.map(tag => (
                    <span key={tag} className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions sidebar */}
        <div className="space-y-4">
          {nextAction && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Worker Actions</h4>
              <button onClick={() => handleStatusUpdate(nextAction.status)} disabled={actionLoading}
                className={`w-full ${nextAction.color} flex items-center justify-center gap-2 disabled:opacity-50`}>
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : nextAction.label}
              </button>
            </div>
          )}

          {isCustomer && booking.payment_status !== 'paid' && booking.status !== 'cancelled' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Payment</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Amount due:</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{formatCurrencyINR(booking.amount || booking.price || 0)}</p>
              <button
                onClick={() => navigate(`/payments/${id}`)}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 transition-all font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
              >
                <CreditCard className="w-5 h-5" />
                Pay Now
              </button>
            </div>
          )}

          {invoice && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Invoice</h4>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">#{invoice.invoice_number}</p>
              <div className="space-y-1.5 text-sm mb-4">
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Subtotal</span><span className="text-gray-900 dark:text-white">{formatCurrencyINR(invoice.subtotal || 0)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">GST (18%)</span><span className="text-gray-900 dark:text-white">{formatCurrencyINR(invoice.tax || 0)}</span></div>
                <div className="flex justify-between font-bold border-t border-gray-100 dark:border-gray-800 pt-1.5"><span className="text-gray-900 dark:text-white">Total</span><span className="text-gray-900 dark:text-white">{formatCurrencyINR(invoice.total || 0)}</span></div>
              </div>
              <Link to={`/invoices/${invoice.id}`} className="btn-outline w-full text-center text-sm block">
                View Full Invoice
              </Link>
            </div>
          )}

          {canReview && (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-2xl border border-yellow-200 dark:border-yellow-800 p-5">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Rate and Review</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Service completed! Share your experience.</p>
              <button onClick={() => setShowReview(true)} className="w-full bg-yellow-500 text-white px-4 py-2.5 rounded-xl hover:bg-yellow-600 transition-all font-semibold flex items-center justify-center gap-2 active:scale-[0.98]">
                <StarIcon className="w-5 h-5 fill-white" />
                Write a Review
              </button>
            </div>
          )}

          {isCustomer && booking.status === 'requested' && (
            <button onClick={() => handleStatusUpdate('cancelled')} disabled={actionLoading}
              className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 px-4 py-2.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all font-medium text-sm disabled:opacity-50 active:scale-[0.98]">
              Cancel Booking
            </button>
          )}
        </div>
      </div>

      {showReview && (
        <ReviewModal onClose={() => setShowReview(false)} onSubmit={handleReviewSubmit} />
      )}

      {showPaymentModal && (
        <PaymentModal
          amount={booking.amount || booking.price || 0}
          service={booking.service_title}
          worker={booking.worker_name}
          date={booking.booking_date}
          timeSlot={booking.time_slot}
          loading={actionLoading}
          onConfirm={handlePayment}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
      <div className="text-gray-400 dark:text-gray-500">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}

function PersonCard({ label, name, type }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
        type === 'customer' ? 'bg-blue-500' : 'bg-green-500'
      }`}>
        {name[0]?.toUpperCase()}
      </div>
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
      </div>
    </div>
  )
}
