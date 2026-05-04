import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, serverTimestamp, setDoc, getCountFromServer
} from 'firebase/firestore'
import { db } from './firebase'
import { createNotification } from './notificationService'
import api from './api'

// ===================== Generic CRUD =====================

// Write timeout — generous enough for Firestore to complete write
// Important: Firestore SDK queues writes offline, so setDoc resolves when
// the write hits the local cache even if the server hasn't confirmed yet.
const WRITE_TIMEOUT_MS = 8000
const executeWithTimeout = (promise, fallbackResult) => {
  return Promise.race([
    promise,
    new Promise((resolve, reject) => setTimeout(() => {
      console.warn('[Firestore] Write timeout reached — data may be queued offline')
      resolve(fallbackResult)
    }, WRITE_TIMEOUT_MS))
  ])
}

// Read timeout — generous enough for real data to arrive,
// short enough to not block UI forever if offline
const READ_TIMEOUT_MS = 5000
const readWithTimeout = (promise, fallback) => {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(fallback), READ_TIMEOUT_MS))
  ])
}

export async function createDocument(collectionName, data, docId = null) {
  try {
    const now = new Date().toISOString()
    const docData = { ...data, createdAt: now, updatedAt: now }
    if (docId) {
      await executeWithTimeout(setDoc(doc(db, collectionName, docId), docData), true)
      console.log(`[Firestore] Created ${collectionName}/${docId}`)
      return docId
    }
    const newDocRef = doc(collection(db, collectionName))
    await executeWithTimeout(setDoc(newDocRef, docData), true)
    console.log(`[Firestore] Created ${collectionName}/${newDocRef.id}`)
    return newDocRef.id
  } catch (err) {
    console.error(`[Firestore] Error creating ${collectionName}:`, err)
    throw err
  }
}

export async function getDocument(collectionName, docId) {
  try {
    const snap = await readWithTimeout(getDoc(doc(db, collectionName, docId)), null)
    if (!snap || !snap.exists()) return null
    return { id: snap.id, ...snap.data() }
  } catch (err) {
    console.error(`Error getting ${collectionName}/${docId}:`, err)
    return null
  }
}

export async function updateDocument(collectionName, docId, data) {
  try {
    await executeWithTimeout(updateDoc(doc(db, collectionName, docId), {
      ...data,
      updatedAt: new Date().toISOString()
    }), true)
    return true
  } catch (err) {
    console.error(`Error updating ${collectionName}/${docId}:`, err)
    return false
  }
}

export async function deleteDocument(collectionName, docId) {
  try {
    await executeWithTimeout(deleteDoc(doc(db, collectionName, docId)), true)
    return true
  } catch (err) {
    console.error(`Error deleting ${collectionName}/${docId}:`, err)
    return false
  }
}

export async function getAllDocuments(collectionName, maxLimit = 200) {
  try {
    // Safety: always apply a limit to prevent full collection scans
    const q = query(collection(db, collectionName), limit(maxLimit))
    const snap = await readWithTimeout(getDocs(q), null)
    if (!snap) return []
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.error(`Error getting all ${collectionName}:`, err)
    return []
  }
}

// Optimized: fetch limited + ordered documents
export async function getRecentDocuments(collectionName, limitCount = 50, orderField = 'createdAt', dir = 'desc') {
  try {
    const q = query(collection(db, collectionName), orderBy(orderField, dir), limit(limitCount))
    const snap = await readWithTimeout(getDocs(q), null)
    if (!snap) return []
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    // Fallback to unordered if index missing
    try {
      const q = query(collection(db, collectionName), limit(limitCount))
      const snap = await readWithTimeout(getDocs(q), null)
      if (!snap) return []
      return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (err2) {
      console.error(`Error getting recent ${collectionName}:`, err2)
      return []
    }
  }
}

// Optimized: fetch active items with limit
export async function getActiveDocuments(collectionName, activeField = 'is_active', limitCount = 50) {
  try {
    const q = query(collection(db, collectionName), where(activeField, '==', true), limit(limitCount))
    const snap = await readWithTimeout(getDocs(q), null)
    if (!snap) return []
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    // Fallback
    return getRecentDocuments(collectionName, limitCount)
  }
}

// Optimized: get collection count without fetching docs
export async function getCollectionCount(collectionName) {
  try {
    const snap = await readWithTimeout(getCountFromServer(collection(db, collectionName)), null)
    if (!snap) return 0
    return snap.data().count
  } catch (err) {
    console.error(`Error counting ${collectionName}:`, err)
    return 0
  }
}

export async function queryDocuments(collectionName, field, operator, value, maxLimit = 200) {
  try {
    const q = query(collection(db, collectionName), where(field, operator, value), limit(maxLimit))
    const snap = await readWithTimeout(getDocs(q), null)
    if (!snap) return []
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.error(`Error querying ${collectionName}:`, err)
    return []
  }
}

// Optimized: bounded query with limit + orderBy
export async function queryDocumentsLimited(collectionName, field, operator, value, maxLimit = 20, orderField = 'createdAt', dir = 'desc') {
  try {
    const q = query(
      collection(db, collectionName),
      where(field, operator, value),
      orderBy(orderField, dir),
      limit(maxLimit)
    )
    const snap = await readWithTimeout(getDocs(q), null)
    if (!snap) return []
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    // Fallback without orderBy if index missing
    return queryDocuments(collectionName, field, operator, value, maxLimit)
  }
}

// Optimized: count-only query — ZERO document reads
export async function getQueryCount(collectionName, field, operator, value) {
  try {
    const q = query(collection(db, collectionName), where(field, operator, value))
    const snap = await readWithTimeout(getCountFromServer(q), null)
    if (!snap) return 0
    return snap.data().count
  } catch (err) {
    console.error(`Error counting ${collectionName}:`, err)
    return 0
  }
}

// Optimized: check existence with limit(1) — reads at most 1 document
export async function documentExists(collectionName, field, operator, value) {
  try {
    const q = query(collection(db, collectionName), where(field, operator, value), limit(1))
    const snap = await readWithTimeout(getDocs(q), null)
    if (!snap) return false
    return !snap.empty
  } catch (err) {
    console.error(`Error checking existence in ${collectionName}:`, err)
    return false
  }
}

// ===================== Services =====================

export async function createService(serviceData) {
  return await createDocument('services', {
    ...serviceData,
    is_active: true,
    rating: 0,
    total_reviews: 0,
  })
}

export async function getAllServices(max = 100) {
  return await getRecentDocuments('services', max)
}

export async function getServiceById(id) {
  return await getDocument('services', id)
}

export async function getUserServices(userId) {
  return await queryDocuments('services', 'worker_id', '==', userId)
}

// ===================== Jobs =====================

export async function createJob(jobData) {
  return await createDocument('jobs', {
    ...jobData,
    is_active: true,
    applications_count: 0,
  })
}

export async function getAllJobs(max = 100) {
  return await getRecentDocuments('jobs', max)
}

export async function getJobById(id) {
  return await getDocument('jobs', id)
}

export async function getUserJobs(userId) {
  return await queryDocuments('jobs', 'posted_by', '==', userId)
}

// ===================== Gigs =====================

export async function createGig(gigData) {
  return await createDocument('gigs', {
    ...gigData,
    status: 'open',
    assignedTo: null,
    assignedName: null,
  })
}

export async function getAllGigs(max = 100) {
  return await getRecentDocuments('gigs', max)
}

export async function getGigById(id) {
  return await getDocument('gigs', id)
}

export async function getUserGigs(userId) {
  return await queryDocuments('gigs', 'employer_id', '==', userId)
}

export async function acceptGig(gigId, userId, userName) {
  const gig = await getDocument('gigs', gigId)
  if (!gig) throw new Error('Gig not found')
  if (gig.assignedTo) throw new Error('This gig has already been taken by another user')
  if (gig.status !== 'open') throw new Error('This gig is no longer available')

  await updateDocument('gigs', gigId, {
    assignedTo: userId,
    assignedName: userName,
    status: 'in-progress',
  })

  // Notify employer
  if (gig.employer_id) {
    await createNotification(
      gig.employer_id,
      `${userName} accepted your gig: ${gig.title}`,
      'gig'
    )
  }

  return true
}

export async function completeGig(gigId, userId) {
  const gig = await getDocument('gigs', gigId)
  if (!gig) throw new Error('Gig not found')
  if (gig.assignedTo !== userId) throw new Error('Only the assigned user can complete this gig')

  await updateDocument('gigs', gigId, { status: 'completed' })

  // Notify employer
  if (gig.employer_id) {
    await createNotification(
      gig.employer_id,
      `Gig "${gig.title}" has been marked as completed`,
      'gig'
    )
  }

  return true
}

// ===================== Job Applications =====================

export async function applyToJob(applicationData) {
  // Prevent duplicate applications — optimized check
  const userId = applicationData.applicantId || applicationData.userId;
  const alreadyApplied = await hasUserApplied(applicationData.jobId, userId)
  if (alreadyApplied) {
    throw new Error('You have already applied to this job')
  }

  const appId = await createDocument('job_applications', {
    ...applicationData,
    appliedAt: new Date().toISOString(),
    status: 'applied',
  })

  // Notify employer
  if (applicationData.employerId) {
    await createNotification(
      applicationData.employerId,
      `${applicationData.name || applicationData.applicantName} applied for ${applicationData.jobTitle}`,
      'job'
    )
  }

  return appId
}

export async function getJobApplications(jobId) {
  return await queryDocuments('job_applications', 'jobId', '==', jobId, 100)
}

export async function getUserApplications(userId) {
  // Try applicantId first, fallback to userId — bounded to 50
  const apps = await queryDocuments('job_applications', 'applicantId', '==', userId, 50)
  if (apps.length > 0) return apps
  return await queryDocuments('job_applications', 'userId', '==', userId, 50)
}

export async function hasUserApplied(jobId, userId) {
  try {
    // Optimized: compound query + limit(1) — reads at most 1 document
    const q = query(
      collection(db, 'job_applications'),
      where('jobId', '==', jobId),
      where('userId', '==', userId),
      limit(1)
    )
    const snap = await getDocs(q)
    if (!snap.empty) return true

    // Check with applicantId if userId doesn't match
    const q2 = query(
      collection(db, 'job_applications'),
      where('jobId', '==', jobId),
      where('applicantId', '==', userId),
      limit(1)
    )
    const snap2 = await getDocs(q2)
    return !snap2.empty
  } catch (err) {
    // Fallback if composite index not yet created
    const apps = await queryDocuments('job_applications', 'applicantId', '==', userId)
    if (apps.some(a => a.jobId === jobId)) return true
    const oldApps = await queryDocuments('job_applications', 'userId', '==', userId)
    return oldApps.some(a => a.jobId === jobId)
  }
}

export async function updateApplicationStatus(applicationId, status) {
  return await updateDocument('job_applications', applicationId, { status })
}

// ===================== Gig Applications =====================

export async function applyToGig(applicationData) {
  // Prevent duplicate applications — optimized check
  const userId = applicationData.applicantId || applicationData.userId
  const alreadyApplied = await hasUserAppliedToGig(applicationData.gigId, userId)
  if (alreadyApplied) {
    throw new Error('You have already applied to this gig')
  }

  const appId = await createDocument('gig_applications', {
    ...applicationData,
    appliedAt: new Date().toISOString(),
    status: 'applied',
  })

  // Notify employer
  if (applicationData.employerId) {
    await createNotification(
      applicationData.employerId,
      `${applicationData.applicantName || 'Someone'} applied for your gig: ${applicationData.gigTitle || ''}`,
      'gig'
    )
  }

  return appId
}

export async function hasUserAppliedToGig(gigId, userId) {
  try {
    // Optimized: compound query + limit(1) — reads at most 1 document
    const q = query(
      collection(db, 'gig_applications'),
      where('gigId', '==', gigId),
      where('userId', '==', userId),
      limit(1)
    )
    const snap = await getDocs(q)
    if (!snap.empty) return true

    // Also check with applicantId field (newer form submissions)
    const q2 = query(
      collection(db, 'gig_applications'),
      where('gigId', '==', gigId),
      where('applicantId', '==', userId),
      limit(1)
    )
    const snap2 = await getDocs(q2)
    return !snap2.empty
  } catch (err) {
    // Fallback if composite index not yet created
    const apps = await queryDocuments('gig_applications', 'userId', '==', userId)
    if (apps.some(a => a.gigId === gigId)) return true
    const apps2 = await queryDocuments('gig_applications', 'applicantId', '==', userId)
    return apps2.some(a => a.gigId === gigId)
  }
}

export async function getGigApplications(gigId) {
  return await queryDocuments('gig_applications', 'gigId', '==', gigId, 100)
}

export async function getUserGigApplications(userId) {
  return await queryDocuments('gig_applications', 'userId', '==', userId, 50)
}

export async function updateGigApplicationStatus(applicationId, status) {
  return await updateDocument('gig_applications', applicationId, { status })
}

// ===================== Reviews =====================

export async function createReview(reviewData) {
  // Optimized: check existence with limit(1) instead of fetching all reviews
  const alreadyReviewed = await documentExists('reviews', 'booking_id', '==', reviewData.booking_id)
  if (alreadyReviewed) {
    throw new Error('You have already reviewed this booking')
  }
  const reviewId = await createDocument('reviews', reviewData)

  if (reviewData.worker_id) {
    await updateWorkerRating(reviewData.worker_id)
  }

  return reviewId
}

export async function getServiceReviews(serviceId) {
  return await queryDocuments('reviews', 'service_id', '==', serviceId)
}

export async function getPublicTestimonials() {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('rating', '>=', 4),
      orderBy('rating', 'desc'),
      limit(6)
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.error('Error fetching testimonials:', err)
    return []
  }
}

// ===================== Worker Rating Auto-Update =====================

export async function updateWorkerRating(workerId) {
  try {
    const reviews = await queryDocuments('reviews', 'worker_id', '==', workerId)
    if (reviews.length === 0) return

    const avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    const roundedRating = Math.round(avgRating * 10) / 10

    await updateDocument('users', workerId, {
      rating: roundedRating,
      total_reviews: reviews.length,
    })

    const services = await queryDocuments('services', 'worker_id', '==', workerId)
    await Promise.all(services.map(svc => updateDocument('services', svc.id, {
      rating: roundedRating,
      total_reviews: reviews.length,
    })))
  } catch (err) {
    console.error('Error updating worker rating:', err)
  }
}

// ===================== Bookings =====================

// Strict 4-step status flow
const VALID_TRANSITIONS = {
  requested: ['accepted', 'cancelled'],
  accepted: ['on_the_way'],
  on_the_way: ['completed'],
  completed: [],
  cancelled: [],
}

export async function checkDoubleBooking(workerId, date, timeSlot) {
  try {
    // Use where() to narrow the query instead of fetching all bookings for this worker
    const q = query(
      collection(db, 'bookings'),
      where('worker_id', '==', workerId),
      where('booking_date', '==', date),
      where('time_slot', '==', timeSlot)
    )
    const snap = await getDocs(q)
    return snap.docs.some(d => d.data().status !== 'cancelled')
  } catch (err) {
    // Fallback if composite index is missing
    try {
      const bookings = await queryDocuments('bookings', 'worker_id', '==', workerId)
      return bookings.some(
        b => b.booking_date === date &&
             b.time_slot === timeSlot &&
             b.status !== 'cancelled'
      )
    } catch {
      console.error('Error checking double booking:', err)
      return false
    }
  }
}

export async function createBooking(bookingData) {
  if (bookingData.worker_id && bookingData.booking_date && bookingData.time_slot) {
    const isBooked = await checkDoubleBooking(
      bookingData.worker_id,
      bookingData.booking_date,
      bookingData.time_slot
    )
    if (isBooked) {
      throw new Error('This worker is already booked for the selected date and time slot. Please choose a different slot.')
    }
  }

  const bookingId = await createDocument('bookings', {
    ...bookingData,
    status: 'requested',
    payment_status: 'pending',
  })

  // Notify worker about new booking
  if (bookingData.worker_id) {
    await createNotification(
      bookingData.worker_id,
      `New booking request for ${bookingData.service_title} on ${bookingData.booking_date}`,
      'booking'
    )
  }

  return bookingId
}

export async function updateBookingStatus(bookingId, newStatus) {
  const booking = await getDocument('bookings', bookingId)
  if (!booking) throw new Error('Booking not found')

  const currentStatus = booking.status
  const allowed = VALID_TRANSITIONS[currentStatus] || []

  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot change status from "${currentStatus}" to "${newStatus}"`)
  }

  await updateDocument('bookings', bookingId, { status: newStatus })

  // Notify customer about status change
  if (booking.customer_id && newStatus !== 'cancelled') {
    const labels = { accepted: 'Accepted', on_the_way: 'On the Way', completed: 'Completed' }
    await createNotification(
      booking.customer_id,
      `Your booking for ${booking.service_title} is now: ${labels[newStatus] || newStatus}`,
      'booking'
    )
  }

  return true
}

export async function getUserBookings(userId, maxPerQuery = 50) {
  const [asCustomer, asWorker] = await Promise.all([
    queryDocuments('bookings', 'customer_id', '==', userId, maxPerQuery),
    queryDocuments('bookings', 'worker_id', '==', userId, maxPerQuery)
  ])
  const seen = new Set()
  const all = []
  for (const b of [...asCustomer, ...asWorker]) {
    if (!seen.has(b.id)) {
      seen.add(b.id)
      all.push(b)
    }
  }
  return all.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
}

// ===================== Payments (Simulated) =====================

export async function simulatePayment(bookingId, amount, userId, paymentMethod = 'card', bookingMeta = {}) {
  const txnId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  const paidAt = new Date().toISOString()
  const tax = Math.round(amount * 0.18)
  const total = amount + tax

  const paymentId = await createDocument('payments', {
    booking_id: bookingId,
    user_id: userId,
    amount,
    tax,
    total,
    currency: 'INR',
    status: 'paid',
    payment_method: paymentMethod,
    transaction_id: txnId,
    paid_at: paidAt,
    // Denormalized booking metadata for fast history display
    service_title: bookingMeta.service_title || '',
    worker_name: bookingMeta.worker_name || '',
    customer_name: bookingMeta.customer_name || '',
    booking_date: bookingMeta.booking_date || '',
    time_slot: bookingMeta.time_slot || '',
  })
  await updateDocument('bookings', bookingId, {
    payment_status: 'paid',
    paid_at: paidAt,
    transaction_id: txnId,
    payment_method: paymentMethod,
  })
  return { paymentId, txnId, paidAt, total }
}

export async function getUserPayments(userId, maxLimit = 50) {
  return await queryDocumentsLimited('payments', 'user_id', '==', userId, maxLimit, 'paid_at', 'desc')
}

export async function getPaymentByBookingId(bookingId) {
  const payments = await queryDocuments('payments', 'booking_id', '==', bookingId, 1)
  return payments.length > 0 ? payments[0] : null
}

// ===================== Invoices =====================

export async function generateInvoice(bookingId, bookingData) {
  try {
    // Idempotency guard — prevent duplicate invoices for same booking
    const existing = await getBookingInvoice(bookingId)
    if (existing) {
      console.log(`[Invoice] Already exists for booking ${bookingId}: ${existing.id}`)
      return existing
    }

    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    const subtotal = bookingData.amount || bookingData.price || 0
    const tax = Math.round(subtotal * 0.18)
    const total = subtotal + tax

    const invoiceData = {
      invoice_number: invoiceNumber,
      booking_id: bookingId,
      user_id: bookingData.customer_id || '', // use user_id to match our queries
      customer_name: bookingData.customer_name || 'Customer',
      worker_id: bookingData.worker_id || '',
      worker_name: bookingData.worker_name || 'Service Professional',
      service_title: bookingData.service_title || 'Service',
      booking_date: bookingData.booking_date || new Date().toISOString(),
      time_slot: bookingData.time_slot || '',
      address: bookingData.address || '',
      payment_method: bookingData.payment_method || 'online',
      transaction_id: bookingData.transaction_id || `TXN${Date.now()}`,
      subtotal,
      tax,
      total,
      status: 'paid',
      created_at: new Date().toISOString()
    }

    const invoiceId = await createDocument('invoices', invoiceData)
    console.log(`[Invoice] Created ${invoiceId} for booking ${bookingId}`)
    return { id: invoiceId, ...invoiceData }
  } catch (err) {
    console.error('Error generating invoice locally:', err);
    throw err;
  }
}

export async function getBookingInvoice(bookingId) {
  const invoices = await queryDocuments('invoices', 'booking_id', '==', bookingId)
  return invoices.length > 0 ? invoices[0] : null
}

export async function getUserInvoices(userId, maxLimit = 50) {
  try {
    const q = query(
      collection(db, 'invoices'), 
      where('user_id', '==', userId), 
      orderBy('created_at', 'desc'), 
      limit(maxLimit)
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    // Fallback if index is missing
    console.warn("Index missing for invoices user_id + created_at desc, falling back", err)
    return await queryDocuments('invoices', 'user_id', '==', userId, maxLimit)
  }
}

// ===================== Reports =====================

export async function createReport(reportData) {
  return await createDocument('reports', reportData)
}

export async function getAllReports() {
  return await getRecentDocuments('reports', 100)
}

// ===================== Platform Settings =====================

export async function getPlatformSettings() {
  try {
    const snap = await readWithTimeout(getDoc(doc(db, 'settings', 'platform')), null)
    if (!snap || !snap.exists()) {
      // Default settings if not exists
      return {
        platformName: 'WorkSphere',
        adminEmail: 'worksphere.admin@gmail.com',
        maintenanceMode: false,
        emailNotifications: true,
        autoApproveReviews: false,
        maxBookingsPerDay: 10,
      }
    }
    return snap.data()
  } catch (err) {
    console.error('Error getting platform settings:', err)
    return { platformName: 'WorkSphere' } // fallback
  }
}

export async function updatePlatformSettings(data) {
  try {
    await executeWithTimeout(setDoc(doc(db, 'settings', 'platform'), {
      ...data,
      updatedAt: new Date().toISOString()
    }), true)
    return true
  } catch (err) {
    console.error('Error updating platform settings:', err)
    return false
  }
}
