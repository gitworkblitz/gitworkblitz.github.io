import {
  collection, doc, getDocs, addDoc, updateDoc,
  query, where, orderBy, limit, writeBatch
} from 'firebase/firestore'
import { db } from './firebase'

/**
 * Create a notification for a user
 */
export async function createNotification(userId, message, type = 'general') {
  try {
    const promise = addDoc(collection(db, 'notifications'), {
      user_id: userId,
      message,
      type, // 'booking', 'job', 'gig', 'general'
      read: false,
      created_at: new Date().toISOString(),
    })
    await Promise.race([
      promise,
      new Promise(resolve => setTimeout(resolve, 500))
    ])
  } catch (err) {
    console.error('Failed to create notification:', err)
  }
}

/**
 * Get notifications for a user (latest first)
 */
export async function getUserNotifications(userId, maxResults = 20) {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc'),
      limit(maxResults)
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.error('Failed to get notifications:', err)
    return []
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId) {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('user_id', '==', userId),
      where('read', '==', false)
    )
    const snap = await getDocs(q)
    return snap.size
  } catch (err) {
    console.error('Failed to count notifications:', err)
    return 0
  }
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(notificationId) {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true })
  } catch (err) {
    console.error('Failed to mark notification as read:', err)
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId) {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('user_id', '==', userId),
      where('read', '==', false)
    )
    const snap = await getDocs(q)
    const batch = writeBatch(db)
    snap.docs.forEach(d => batch.update(d.ref, { read: true }))
    await batch.commit()
  } catch (err) {
    console.error('Failed to mark all as read:', err)
  }
}
