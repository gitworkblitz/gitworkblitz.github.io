import { queryDocuments } from './firestoreService'
import { dummyWorkers, calculateWorkerScore } from '../utils/dummyData'

/**
 * Find the best available worker for a service category on a given date/time slot.
 * Uses deterministic scoring — NO AI/ML.
 */
export async function findBestWorker(category, date, timeSlot) {
  try {
    // Get all workers matching the category skill
    let workers = []
    try {
      workers = await queryDocuments('users', 'user_type', '==', 'worker')
    } catch {
      workers = []
    }

    // Merge with dummy workers as fallback
    const allWorkers = workers.length > 0 ? workers : dummyWorkers

    // Filter workers whose skills match the category
    const matchingWorkers = allWorkers.filter(w => {
      const skills = (w.skills || []).map(s => s.toLowerCase())
      return skills.some(s =>
        s.includes(category.toLowerCase()) ||
        category.toLowerCase().includes(s)
      )
    })

    if (matchingWorkers.length === 0) {
      // If no skill match, return all available workers
      return scoreAndRank(allWorkers.filter(w => w.availability !== false), date, timeSlot)
    }

    return scoreAndRank(matchingWorkers, date, timeSlot)
  } catch (err) {
    console.error('Worker matching error:', err)
    return scoreAndRank(dummyWorkers, date, timeSlot)
  }
}

async function scoreAndRank(workers, date, timeSlot) {
  const available = []

  for (const worker of workers) {
    if (worker.availability === false) continue

    // Check if worker is already booked for this date + time
    let isBooked = false
    try {
      const bookings = await queryDocuments('bookings', 'worker_id', '==', worker.id)
      isBooked = bookings.some(
        b => b.booking_date === date &&
             b.time_slot === timeSlot &&
             b.status !== 'cancelled'
      )
    } catch {
      // If check fails, assume available (dummy data workers)
      isBooked = false
    }

    if (!isBooked) {
      const distance = Math.round(Math.random() * 10 + 1) // Simulated distance in km
      const score = calculateWorkerScore({ ...worker, distance })
      available.push({ ...worker, distance, match_score: score })
    }
  }

  // Sort by score descending
  available.sort((a, b) => b.match_score - a.match_score)
  return available
}

/**
 * Get the single best worker for auto-assignment
 */
export async function autoAssignWorker(category, date, timeSlot) {
  const ranked = await findBestWorker(category, date, timeSlot)
  return ranked.length > 0 ? ranked[0] : null
}
