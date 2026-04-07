import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getServiceById, createBooking, getServiceReviews } from '../../services/firestoreService'
import { autoAssignWorker } from '../../services/workerMatchingService'
import { dummyServices, dummyReviews, TIME_SLOTS, formatCurrencyINR } from '../../utils/dummyData'
import { DetailSkeleton } from '../../components/SkeletonLoader'
import { CategoryIconBadge } from '../../components/CategoryIcon'
import toast from 'react-hot-toast'
import {
  StarIcon, MapPinIcon, ClockIcon, CalendarIcon, ShieldCheckIcon,
  UserIcon, CurrencyRupeeIcon, CheckCircleIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid, CheckBadgeIcon } from '@heroicons/react/24/solid'

export default function ServiceDetailPage() {
  const { id } = useParams()
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookingDate, setBookingDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [address, setAddress] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [matchedWorker, setMatchedWorker] = useState(null)
  const [matchingWorker, setMatchingWorker] = useState(false)

  useEffect(() => {
    loadService()
  }, [id])

  const loadService = async () => {
    setLoading(true)
    try {
      let data = await getServiceById(id)
      if (!data) {
        data = dummyServices.find(s => s.id === id) || null
      }
      setService(data)
      const srvReviews = await getServiceReviews(id)
      setReviews(srvReviews.length > 0 ? srvReviews : dummyReviews.filter(r => r.service_id === id))
    } catch (err) {
      console.error(err)
      const dummy = dummyServices.find(s => s.id === id)
      setService(dummy || null)
    } finally {
      setLoading(false)
    }
  }

  // Auto-match worker when date and slot are selected
  useEffect(() => {
    if (bookingDate && selectedSlot && service?.category) {
      matchWorker()
    } else {
      setMatchedWorker(null)
    }
  }, [bookingDate, selectedSlot])

  const matchWorker = async () => {
    setMatchingWorker(true)
    try {
      const worker = await autoAssignWorker(service.category, bookingDate, selectedSlot)
      setMatchedWorker(worker)
    } catch (err) {
      console.error('Worker matching failed:', err)
      setMatchedWorker(null)
    } finally {
      setMatchingWorker(false)
    }
  }

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please login to book a service')
      navigate('/login')
      return
    }
    if (!bookingDate || !selectedSlot) {
      toast.error('Please select date and time slot')
      return
    }
    setBookingLoading(true)
    try {
      const workerId = matchedWorker?.id || service.worker_id || ''
      const workerName = matchedWorker?.name || service.worker_name || ''

      const bookingId = await createBooking({
        service_id: id,
        service_title: service.title,
        category: service.category,
        customer_id: user.uid,
        customer_name: userProfile?.name || 'Customer',
        worker_id: workerId,
        worker_name: workerName,
        booking_date: bookingDate,
        time_slot: selectedSlot,
        address: address || userProfile?.location || '',
        amount: service.price || 0,
      })
      toast.success('Your booking has been placed successfully')
      navigate(`/bookings/${bookingId}`)
    } catch (err) {
      toast.error(err.message || 'Failed to create booking')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) return <DetailSkeleton />

  if (!service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Service Not Found</h2>
        <Link to="/services" className="btn-primary mt-4">Browse Services</Link>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/services" className="hover:text-primary-600">Services</Link>
        <span>&rsaquo;</span>
        <span className="text-gray-900 font-medium">{service.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left - Service details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero card */}
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
            <div className="h-56 bg-gradient-to-br from-primary-50 via-blue-50 to-violet-50 flex items-center justify-center relative">
              <CategoryIconBadge category={service.category} size="xl" />
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full shadow-sm">{service.category}</span>
              </div>
            </div>

            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1.5">
                  <StarSolid className="w-4 h-4 text-yellow-400" />
                  <span className="font-semibold text-gray-900">{service.rating || 0}</span>
                  <span>({service.total_reviews || 0} reviews)</span>
                </div>
                {service.location && (
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    {service.location}
                  </div>
                )}
              </div>
              <p className="text-gray-600 leading-relaxed">{service.description}</p>
            </div>
          </div>

          {/* Worker info */}
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Service Provider</h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg">
                {(service.worker_name || 'W')[0]}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{service.worker_name || 'Service Provider'}</p>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  <div className="flex items-center gap-1">
                    <StarSolid className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{service.rating || 0}</span>
                  </div>
                  <span>&bull;</span>
                  <span>{service.total_reviews || 0} reviews</span>
                </div>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 rounded-full">
                <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">Verified</span>
              </div>
            </div>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Reviews ({reviews.length})</h3>
              <div className="space-y-4">
                {reviews.slice(0, 5).map((r, i) => (
                  <div key={r.id || i} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600">
                        {(r.customer_name || 'U')[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{r.customer_name}</p>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, j) => (
                            <StarSolid key={j} className={`w-3 h-3 ${j < r.rating ? 'text-yellow-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                    {r.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {r.tags.map(t => <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right - Booking widget */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Starting from</p>
                <p className="text-3xl font-extrabold text-gray-900">{formatCurrencyINR(service.price || 0)}</p>
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-full">
                <StarSolid className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-bold text-gray-900">{service.rating || 0}</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Date picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <CalendarIcon className="w-4 h-4 inline mr-1" />
                  Select Date
                </label>
                <input type="date" value={bookingDate} min={today}
                  onChange={e => setBookingDate(e.target.value)}
                  className="input-field" />
              </div>

              {/* Time slots */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <ClockIcon className="w-4 h-4 inline mr-1" />
                  Time Slot
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {TIME_SLOTS.map(slot => (
                    <button key={slot.id} type="button"
                      onClick={() => setSelectedSlot(slot.value)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all text-center ${
                        selectedSlot === slot.value
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Matched Worker Card */}
              {matchingWorker && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Finding best available worker...</p>
                </div>
              )}

              {matchedWorker && !matchingWorker && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-green-800">Best Worker Matched</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full ${matchedWorker.avatar_color || 'bg-primary-500'} flex items-center justify-center text-white font-bold text-sm`}>
                      {matchedWorker.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{matchedWorker.name}</p>
                        <CheckBadgeIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-0.5"><StarSolid className="w-3 h-3 text-yellow-400" />{matchedWorker.rating}</span>
                        <span>&bull;</span>
                        <span>{matchedWorker.experience_years || 0}yr exp</span>
                        <span>&bull;</span>
                        <span>{matchedWorker.completion_rate || 95}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1"><MapPinIcon className="w-3 h-3" />{matchedWorker.location}</span>
                    <span className="font-semibold text-primary-600">Score: {matchedWorker.match_score}/100</span>
                  </div>
                </div>
              )}

              {bookingDate && selectedSlot && !matchedWorker && !matchingWorker && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">No workers available</p>
                    <p className="text-xs text-yellow-600 mt-0.5">Try selecting a different date or time slot</p>
                  </div>
                </div>
              )}

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <MapPinIcon className="w-4 h-4 inline mr-1" />
                  Service Address
                </label>
                <input type="text" value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Enter your address"
                  className="input-field" />
              </div>

              {/* Book button */}
              <button onClick={handleBooking} disabled={bookingLoading || (!matchedWorker && bookingDate && selectedSlot)}
                className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2 shadow-md disabled:opacity-50">
                {bookingLoading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Booking...</>
                ) : (
                  <>
                    <CalendarIcon className="w-5 h-5" />
                    Book Now
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">You won't be charged until the service is confirmed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
