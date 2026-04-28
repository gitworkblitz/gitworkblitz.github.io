import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getDocument, simulatePayment, generateInvoice } from '../../services/firestoreService'
import { formatCurrencyINR } from '../../utils/dummyData'
import { DetailSkeleton } from '../../components/SkeletonLoader'
import toast from 'react-hot-toast'
import {
  CurrencyRupeeIcon, ShieldCheckIcon, CheckCircleIcon, LockClosedIcon,
  DevicePhoneMobileIcon, CreditCardIcon, BanknotesIcon, ArrowLeftIcon,
  CalendarIcon, ClockIcon, MapPinIcon, UserIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'

const STEPS = [
  'Verifying payment details…',
  'Connecting to payment gateway…',
  'Processing transaction…',
  'Confirming payment…',
]

export default function PaymentGatewayPage() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [processing, setProcessing] = useState(false)
  const [step, setStep] = useState(-1)
  const [success, setSuccess] = useState(false)
  const [invoiceId, setInvoiceId] = useState(null)

  // Card
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardName, setCardName] = useState('')
  // UPI
  const [upiId, setUpiId] = useState('')

  // Load booking with retry for just-created bookings
  useEffect(() => {
    let retries = 0
    let cancelled = false
    const tryLoad = async () => {
      try {
        const doc = await getDocument('bookings', bookingId)
        if (cancelled) return
        if (doc) {
          setBooking(doc)
          if (doc.payment_status === 'paid') {
            toast('This booking is already paid', { icon: 'ℹ️' })
            navigate(`/bookings/${bookingId}`, { replace: true })
          }
          setLoading(false)
        } else if (retries < 3) {
          retries++
          setTimeout(tryLoad, 800)
        } else {
          setLoading(false)
        }
      } catch (err) {
        if (cancelled) return
        if (retries < 3) { retries++; setTimeout(tryLoad, 800) }
        else setLoading(false)
      }
    }
    tryLoad()
    return () => { cancelled = true }
  }, [bookingId, navigate])

  // Set document title
  useEffect(() => {
    document.title = booking
      ? `Pay for ${booking.service_title || 'Service'} | WorkSphere`
      : 'Secure Checkout | WorkSphere'
  }, [booking])

  // Step animation
  useEffect(() => {
    if (!processing || step < 0 || step >= STEPS.length - 1) return
    const t = setTimeout(() => setStep(s => s + 1), 1200)
    return () => clearTimeout(t)
  }, [processing, step])

  const fmtCard = useCallback(v => {
    const d = v.replace(/\D/g, '').slice(0, 16)
    return d.replace(/(.{4})/g, '$1 ').trim()
  }, [])

  const fmtExp = useCallback(v => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length >= 2 ? d.slice(0, 2) + '/' + d.slice(2) : d
  }, [])

  const valid = useMemo(() => {
    if (paymentMethod === 'upi') return upiId.trim().length > 0
    if (paymentMethod === 'card') return cardNumber.replace(/\s/g, '').length >= 16 && expiry.length === 5 && cvv.length >= 3
    return true
  }, [paymentMethod, upiId, cardNumber, expiry, cvv])

  const amount = booking?.amount || booking?.price || 0
  const tax = Math.round(amount * 0.18)
  const total = amount + tax

  const handlePay = useCallback(async () => {
    if (!valid || processing) return
    setProcessing(true)
    setStep(0)
    try {
      const meta = {
        service_title: booking.service_title || '',
        worker_name: booking.worker_name || '',
        customer_name: booking.customer_name || '',
        booking_date: booking.booking_date || '',
        time_slot: booking.time_slot || '',
      }
      console.log('[Payment] Starting payment for booking:', bookingId, 'Amount:', amount, 'Method:', paymentMethod)

      console.log('[Payment] Calling simulatePayment...')
      const payResult = await simulatePayment(bookingId, amount, user.uid, paymentMethod, meta)
      console.log('[Payment] Payment saved:', payResult)

      // CRITICAL: Merge payment result into booking data so invoice gets correct txnId + method
      const invoiceBookingData = {
        ...booking,
        transaction_id: payResult.txnId,
        payment_method: paymentMethod,
        paid_at: payResult.paidAt,
      }

      console.log('[Payment] Generating invoice with merged data...')
      const inv = await generateInvoice(bookingId, invoiceBookingData)
      console.log('[Payment] Invoice generated:', inv.id)

      setInvoiceId(inv.id)
      setProcessing(false)
      setSuccess(true)
      toast.success('Payment successful! Invoice generated 🎉')
      navigate(`/invoices/${inv.id}`)
    } catch (err) {
      console.error('[Payment] Failed:', err)
      toast.error('Payment failed. Please try again.')
      setProcessing(false)
      setStep(-1)
    }
  }, [booking, bookingId, user, paymentMethod, valid, processing, amount, navigate])

  if (loading) return <DetailSkeleton />

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <CurrencyRupeeIcon className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Booking Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">We couldn't find this booking.</p>
        <Link to="/dashboard/bookings" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeftIcon className="w-4 h-4" /> Go to My Bookings
        </Link>
      </div>
    )
  }

  // Processing / Success
  if (processing || success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-8 text-center">
          {processing && !success && (
            <div className="animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="w-20 h-20 border-4 border-green-200 dark:border-green-800 border-t-green-600 rounded-full animate-spin" />
                <CurrencyRupeeIcon className="w-8 h-8 text-green-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-base font-semibold text-green-800 dark:text-green-300 mb-4">
                {STEPS[step] || 'Processing…'}
              </p>
              <div className="flex gap-1.5 justify-center mb-4">
                {STEPS.map((_, i) => (
                  <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i <= step ? 'bg-green-500 w-10' : 'bg-green-200 dark:bg-green-800 w-5'}`} />
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Please don't close this window</p>
              <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatCurrencyINR(total)}</span>
                </div>
              </div>
            </div>
          )}
          {success && (
            <div className="animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircleSolid className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">Payment Successful!</h2>
              <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                {formatCurrencyINR(total)} paid via {paymentMethod === 'card' ? 'Card' : paymentMethod === 'upi' ? 'UPI' : 'Wallet'}
              </p>
              <p className="text-xs text-gray-400 mt-4">Redirecting to invoice…</p>
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mt-3" />
              {invoiceId && (
                <Link to={`/invoices/${invoiceId}`} className="btn-primary mt-6 inline-flex items-center gap-2 text-sm">
                  View Invoice
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Main payment form
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to={`/bookings/${bookingId}`} className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 mb-2 inline-flex items-center gap-1 transition-colors">
            <ArrowLeftIcon className="w-4 h-4" /> Back to Booking
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">Secure Checkout</h1>
        </div>
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-full border border-green-200 dark:border-green-800">
          <LockClosedIcon className="w-4 h-4" />
          <span className="text-xs font-semibold">SSL Secured</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Order Summary - Left */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6 sticky top-24">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Order Summary</h3>
            <div className="space-y-3 mb-5">
              <SummaryRow icon={<CurrencyRupeeIcon className="w-4 h-4" />} label="Service" value={booking.service_title || 'Service'} />
              <SummaryRow icon={<UserIcon className="w-4 h-4" />} label="Provider" value={booking.worker_name || 'Worker'} />
              <SummaryRow icon={<CalendarIcon className="w-4 h-4" />} label="Date" value={booking.booking_date || 'N/A'} />
              <SummaryRow icon={<ClockIcon className="w-4 h-4" />} label="Time" value={booking.time_slot || 'N/A'} />
              {booking.address && <SummaryRow icon={<MapPinIcon className="w-4 h-4" />} label="Address" value={booking.address} />}
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                <span className="text-gray-900 dark:text-white">{formatCurrencyINR(amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">GST (18%)</span>
                <span className="text-gray-900 dark:text-white">{formatCurrencyINR(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-100 dark:border-gray-800 pt-3 mt-2">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-green-600 dark:text-green-400">{formatCurrencyINR(total)}</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-4 text-center">Booking ID: {bookingId?.slice(0, 16)}…</p>
          </div>
        </div>

        {/* Payment Form - Right */}
        <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
          {/* Method Selection */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Select Payment Method</h3>
            <div className="grid grid-cols-3 gap-3">
              <MethodBtn icon={<CreditCardIcon className="w-6 h-6" />} label="Card" active={paymentMethod === 'card'} onClick={() => setPaymentMethod('card')} />
              <MethodBtn icon={<DevicePhoneMobileIcon className="w-6 h-6" />} label="UPI" active={paymentMethod === 'upi'} onClick={() => setPaymentMethod('upi')} />
              <MethodBtn icon={<BanknotesIcon className="w-6 h-6" />} label="Wallet" active={paymentMethod === 'wallet'} onClick={() => setPaymentMethod('wallet')} />
            </div>
          </div>

          {/* Card Form */}
          {paymentMethod === 'card' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6 animate-fade-in">
              {/* Visual Card */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-5 text-white mb-6">
                <div className="flex items-center justify-between mb-6">
                  <LockClosedIcon className="w-4 h-4 text-gray-400" />
                  <div className="flex gap-1">
                    <div className="w-6 h-4 bg-red-500/80 rounded-sm" />
                    <div className="w-6 h-4 bg-yellow-500/80 rounded-sm" />
                  </div>
                </div>
                <p className="font-mono text-base tracking-widest text-white/90 mb-4">{cardNumber || '•••• •••• •••• ••••'}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400 uppercase">{cardName || 'CARD HOLDER'}</p>
                  <p className="text-xs text-gray-400">{expiry || 'MM/YY'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Card Number</label>
                  <input type="text" value={cardNumber} onChange={e => setCardNumber(fmtCard(e.target.value))}
                    placeholder="1234 5678 9012 3456" maxLength={19}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Expiry</label>
                    <input type="text" value={expiry} onChange={e => setExpiry(fmtExp(e.target.value))}
                      placeholder="MM/YY" maxLength={5}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">CVV</label>
                    <input type="password" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="•••" maxLength={4}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Cardholder Name</label>
                  <input type="text" value={cardName} onChange={e => setCardName(e.target.value)}
                    placeholder="Name on card"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <LockClosedIcon className="w-3 h-3" /> Test card: 4242 4242 4242 4242 • Any future date • Any CVV
                </p>
              </div>
            </div>
          )}

          {/* UPI Form */}
          {paymentMethod === 'upi' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6 animate-fade-in">
              <div className="text-center py-3 mb-4">
                <DevicePhoneMobileIcon className="w-14 h-14 mx-auto text-primary-600 dark:text-primary-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-300">Pay using any UPI app</p>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">UPI ID</label>
                <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {['gpay', 'phonepe', 'paytm'].map(app => (
                  <button key={app} type="button" onClick={() => setUpiId(`user@${app}`)}
                    className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors capitalize">
                    {app}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Wallet */}
          {paymentMethod === 'wallet' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6 animate-fade-in">
              <div className="text-center py-3 mb-4">
                <BanknotesIcon className="w-14 h-14 mx-auto text-primary-600 dark:text-primary-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-300">WorkSphere Pay (Demo)</p>
              </div>
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Wallet Balance</span>
                  <span className="font-bold text-lg text-primary-600 dark:text-primary-400">{formatCurrencyINR(5000)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Pay Button */}
          <div className="space-y-4">
            <button onClick={handlePay} disabled={!valid}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]">
              <LockClosedIcon className="w-5 h-5" />
              Pay {formatCurrencyINR(total)}
            </button>
            <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
              <ShieldCheckIcon className="w-4 h-4 text-green-500" />
              <span>256-bit SSL • PCI DSS Compliant • Money-back guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-gray-400 dark:text-gray-500">{icon}</div>
      <div className="flex-1 flex justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white text-right max-w-[180px] truncate">{value}</span>
      </div>
    </div>
  )
}

function MethodBtn({ icon, label, active, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
        active
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600'
          : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
      }`}>
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}
