import React, { useState, useEffect, useCallback } from 'react'
import { formatCurrencyINR } from '../utils/dummyData'
import {
  CurrencyRupeeIcon, ShieldCheckIcon, XMarkIcon,
  CheckCircleIcon, LockClosedIcon, DevicePhoneMobileIcon,
  CreditCardIcon, BanknotesIcon
} from '@heroicons/react/24/outline'

const PROCESSING_STEPS = [
  'Verifying payment details…',
  'Connecting to payment gateway…',
  'Processing transaction…',
  'Confirming payment…',
]

export default function PaymentModal({ 
  amount, 
  service, 
  worker, 
  date, 
  loading, 
  onConfirm, 
  onClose,
  timeSlot 
}) {
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [upiId, setUpiId] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardName, setCardName] = useState('')
  const [processingStep, setProcessingStep] = useState(-1)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && !loading) onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [loading, onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Processing step animation
  useEffect(() => {
    if (!loading || processingStep < 0) return
    if (processingStep >= PROCESSING_STEPS.length) return
    const timer = setTimeout(() => {
      setProcessingStep(prev => Math.min(prev + 1, PROCESSING_STEPS.length - 1))
    }, 800)
    return () => clearTimeout(timer)
  }, [loading, processingStep])

  const tax = Math.round(amount * 0.18)
  const total = amount + tax

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(' ') : value
  }

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4)
    }
    return v
  }

  const isFormValid = useCallback(() => {
    if (paymentMethod === 'upi') return upiId.trim().length > 0
    if (paymentMethod === 'card') return cardNumber.length >= 16 && expiry.length === 5 && cvv.length >= 3
    return true // wallet always valid
  }, [paymentMethod, upiId, cardNumber, expiry, cvv])

  const handleSubmit = useCallback(() => {
    if (!isFormValid()) return
    setProcessingStep(0)
    // Pass paymentMethod back to parent so it can be stored in Firestore
    onConfirm(paymentMethod)
  }, [paymentMethod, isFormValid, onConfirm])

  // When parent sets loading=false and we were processing, show success
  useEffect(() => {
    if (!loading && processingStep >= 0 && !paymentSuccess) {
      setPaymentSuccess(true)
    }
  }, [loading, processingStep, paymentSuccess])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800 overflow-hidden max-h-[90vh] overflow-y-auto">

        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <CurrencyRupeeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Complete Payment</h2>
              <p className="text-green-100 text-xs">Secure checkout</p>
            </div>
          </div>
          {!loading && (
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Processing overlay */}
          {loading && processingStep >= 0 && (
            <div className="mb-5 animate-fade-in">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 text-center border border-green-200 dark:border-green-800">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <div className="w-16 h-16 border-4 border-green-200 dark:border-green-800 border-t-green-600 dark:border-t-green-400 rounded-full animate-spin" />
                  <CurrencyRupeeIcon className="w-6 h-6 text-green-600 dark:text-green-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3">
                  {PROCESSING_STEPS[processingStep] || 'Processing…'}
                </p>
                <div className="flex gap-1 justify-center">
                  {PROCESSING_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        i <= processingStep
                          ? 'bg-green-500 w-8'
                          : 'bg-green-200 dark:bg-green-800 w-4'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-3">
                  Please don't close this window
                </p>
              </div>
            </div>
          )}

          {/* Success state */}
          {paymentSuccess && !loading && (
            <div className="mb-5 animate-fade-in">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 text-center border border-green-200 dark:border-green-800">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-lg font-bold text-green-800 dark:text-green-300 mb-1">Payment Successful!</p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {formatCurrencyINR(total)} paid via {paymentMethod === 'card' ? 'Card' : paymentMethod === 'upi' ? 'UPI' : 'Wallet'}
                </p>
                <p className="text-xs text-green-500 dark:text-green-500 mt-2">Redirecting to invoice…</p>
              </div>
            </div>
          )}

          {/* Normal form state */}
          {!loading && !paymentSuccess && (
            <>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-xl p-4 mb-5">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Service</span>
                    <span className="font-semibold text-gray-900 dark:text-white line-clamp-1 max-w-[180px]">{service || 'Service Booking'}</span>
                  </div>
                  {worker && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Provider</span>
                      <span className="font-medium text-gray-900 dark:text-white">{worker}</span>
                    </div>
                  )}
                  {date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Date</span>
                      <span className="font-medium text-gray-900 dark:text-white">{date}</span>
                    </div>
                  )}
                  {timeSlot && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Time</span>
                      <span className="font-medium text-gray-900 dark:text-white">{timeSlot}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                      <span className="text-gray-700 dark:text-gray-300">{formatCurrencyINR(amount)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">GST (18%)</span>
                      <span className="text-gray-700 dark:text-gray-300">{formatCurrencyINR(tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-900 dark:text-white">Total Amount</span>
                      <span className="text-green-600 dark:text-green-400">{formatCurrencyINR(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Select Payment Method</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      paymentMethod === 'card'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <CreditCardIcon className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-primary-600' : 'text-gray-500'}`} />
                    <span className={`text-xs font-medium ${paymentMethod === 'card' ? 'text-primary-600' : 'text-gray-500'}`}>Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      paymentMethod === 'upi'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <DevicePhoneMobileIcon className={`w-6 h-6 ${paymentMethod === 'upi' ? 'text-primary-600' : 'text-gray-500'}`} />
                    <span className={`text-xs font-medium ${paymentMethod === 'upi' ? 'text-primary-600' : 'text-gray-500'}`}>UPI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      paymentMethod === 'wallet'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <BanknotesIcon className={`w-6 h-6 ${paymentMethod === 'wallet' ? 'text-primary-600' : 'text-gray-500'}`} />
                    <span className={`text-xs font-medium ${paymentMethod === 'wallet' ? 'text-primary-600' : 'text-gray-500'}`}>Wallet</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-3 mb-5 animate-fade-in">
                  <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <LockClosedIcon className="w-4 h-4 text-gray-400" />
                      <div className="flex gap-1">
                        <div className="w-6 h-4 bg-red-500/80 rounded-sm" />
                        <div className="w-6 h-4 bg-yellow-500/80 rounded-sm" />
                      </div>
                    </div>
                    <p className="font-mono text-sm tracking-widest text-white/90">{cardNumber || '•••• •••• •••• ••••'}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-gray-400">{cardName || 'CARD HOLDER'}</p>
                      <p className="text-xs text-gray-400">{expiry || 'MM/YY'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Expiry</label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">CVV</label>
                      <input
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Name on card"
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <LockClosedIcon className="w-3 h-3" />
                    Test card: 4242 4242 4242 4242 • Any future date • Any CVV
                  </p>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="space-y-3 mb-5 animate-fade-in">
                  <div className="text-center py-4">
                    <DevicePhoneMobileIcon className="w-16 h-16 mx-auto text-primary-600 dark:text-primary-400 mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">Pay using any UPI app</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">UPI ID</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">@upi</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {['gpay', 'phonepe', 'paytm'].map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => setUpiId(`user@${app}`)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors capitalize"
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethod === 'wallet' && (
                <div className="space-y-3 mb-5 animate-fade-in">
                  <div className="text-center py-4">
                    <BanknotesIcon className="w-16 h-16 mx-auto text-primary-600 dark:text-primary-400 mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">WorkSphere Pay (Demo)</p>
                  </div>

                  <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Wallet Balance</span>
                      <span className="font-bold text-primary-600 dark:text-primary-400">{formatCurrencyINR(5000)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-5">
                <ShieldCheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>256-bit SSL • PCI DSS Compliant • Money-back guarantee</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !isFormValid()}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  Pay {formatCurrencyINR(total)}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
