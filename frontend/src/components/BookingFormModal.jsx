import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDataCache } from '../context/DataCacheContext'
import { createBooking } from '../services/firestoreService'
import { formatCurrencyINR, TIME_SLOTS } from '../utils/dummyData'
import toast from 'react-hot-toast'
import {
  X, Calendar, Clock, MapPin, FileText, ShoppingBag,
  ChevronDown, Loader2, CheckCircle, Search, Star, IndianRupee
} from 'lucide-react'

/* ─────────────────────────────────────────────
   BookingFormModal — Full booking form in a modal
   Used from the customer dashboard's "Book Now" action
   ───────────────────────────────────────────── */
export default React.memo(function BookingFormModal({ onClose, onBookingCreated }) {
  const { user, userProfile } = useAuth()
  const { services: cachedServices } = useDataCache()
  const navigate = useNavigate()

  const [selectedService, setSelectedService] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showServicePicker, setShowServicePicker] = useState(false)
  const [date, setDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('')
  const [address, setAddress] = useState(userProfile?.location || '')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Close on Escape, lock body scroll
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && !submitting) onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [submitting, onClose])

  // Today's date for min
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  // Filtered services
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return cachedServices.slice(0, 20)
    const q = searchQuery.toLowerCase()
    return cachedServices
      .filter(s => s.title?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q))
      .slice(0, 15)
  }, [cachedServices, searchQuery])

  const isValid = useMemo(() => {
    return selectedService && date && timeSlot && address.trim().length > 0
  }, [selectedService, date, timeSlot, address])

  const handleSubmit = useCallback(async () => {
    if (!isValid || submitting) return
    if (!user?.uid) {
      toast.error('Please log in to create a booking')
      return
    }
    setSubmitting(true)

    try {
      const bookingData = {
        customer_id: user.uid,
        customer_name: userProfile?.name || user.displayName || 'Customer',
        worker_id: selectedService.worker_id || '',
        worker_name: selectedService.worker_name || '',
        service_id: selectedService.id,
        service_title: selectedService.title,
        booking_date: date,
        time_slot: timeSlot,
        address: address.trim(),
        notes: notes.trim(),
        amount: selectedService.price || 0,
        price: selectedService.price || 0,
      }

      console.log('[Booking] Creating booking...', bookingData)
      const bookingId = await createBooking(bookingData)
      console.log('[Booking] Created:', bookingId)

      if (!bookingId) {
        throw new Error('Booking creation returned no ID')
      }

      const newBooking = {
        id: bookingId,
        ...bookingData,
        status: 'requested',
        payment_status: 'pending',
        createdAt: new Date().toISOString(),
      }

      setSuccess(true)
      setSubmitting(false)
      toast.success('Booking created! Redirecting to payment... 🎉')

      // Notify parent to update UI instantly
      if (onBookingCreated) {
        onBookingCreated(newBooking)
      }

      // Redirect to payment gateway after short success display
      setTimeout(() => {
        onClose()
        navigate(`/payments/${bookingId}`)
      }, 1200)
    } catch (err) {
      console.error('[Booking] Failed:', err)
      toast.error(err.message || 'Failed to create booking')
      setSubmitting(false)
      setSuccess(false)
    }
  }, [isValid, submitting, user, userProfile, selectedService, date, timeSlot, address, notes, onBookingCreated, onClose, navigate])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!submitting ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-800 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-violet-600 px-6 py-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Book a Service</h2>
              <p className="text-white/70 text-xs">Fill in the details below</p>
            </div>
          </div>
          {!submitting && (
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Success state */}
          {success && (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-1">Booking Created!</h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                {selectedService?.title} on {date}
              </p>
              <p className="text-xs text-gray-400 mt-3">Closing automatically…</p>
            </div>
          )}

          {/* Form */}
          {!success && (
            <>
              {/* Service Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Select Service <span className="text-red-500">*</span>
                </label>
                {selectedService ? (
                  <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-violet-600 rounded-lg flex items-center justify-center shadow-sm">
                        <ShoppingBag className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedService.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{selectedService.category}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            {selectedService.rating || '4.5'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                        {formatCurrencyINR(selectedService.price || 0)}
                      </span>
                      <button
                        onClick={() => { setSelectedService(null); setShowServicePicker(true) }}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium px-2 py-1 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="relative mb-2">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setShowServicePicker(true) }}
                        onFocus={() => setShowServicePicker(true)}
                        placeholder="Search services..."
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                    {showServicePicker && (
                      <div className="max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
                        {filteredServices.length === 0 ? (
                          <p className="text-center text-sm text-gray-400 py-4">No services found</p>
                        ) : (
                          filteredServices.map(svc => (
                            <button
                              key={svc.id}
                              onClick={() => { setSelectedService(svc); setShowServicePicker(false); setSearchQuery('') }}
                              className="w-full text-left px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-center justify-between"
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{svc.title}</p>
                                <p className="text-xs text-gray-400">{svc.category} • {svc.worker_name || 'Worker'}</p>
                              </div>
                              <span className="text-sm font-bold text-primary-600 dark:text-primary-400 whitespace-nowrap ml-2">
                                {formatCurrencyINR(svc.price || 0)}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                    <Calendar className="w-3.5 h-3.5 inline mr-1" />
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    min={today}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                    <Clock className="w-3.5 h-3.5 inline mr-1" />
                    Time Slot <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none"
                  >
                    <option value="">Select slot</option>
                    {TIME_SLOTS.map(slot => (
                      <option key={slot.id} value={slot.value}>{slot.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  <MapPin className="w-3.5 h-3.5 inline mr-1" />
                  Service Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your address"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  <FileText className="w-3.5 h-3.5 inline mr-1" />
                  Notes <span className="text-gray-400 text-[10px] normal-case">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific requirements..."
                  rows={2}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Price Summary */}
              {selectedService && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Service charge</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrencyINR(selectedService.price || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-500 dark:text-gray-400">GST (18%)</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrencyINR(Math.round((selectedService.price || 0) * 0.18))}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-base border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-primary-600 dark:text-primary-400">
                      {formatCurrencyINR((selectedService.price || 0) + Math.round((selectedService.price || 0) * 0.18))}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3.5 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isValid || submitting}
                  className="flex-1 bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-700 hover:to-violet-700 text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Book Now
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
})
