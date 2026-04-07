import React, { useState, useEffect } from 'react'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { getAllDocuments, updateDocument } from '../../services/firestoreService'
import { dummyBookings } from '../../utils/dummyData'
import { TableSkeleton } from '../../components/SkeletonLoader'
import toast from 'react-hot-toast'

const STATUS_CLASSES = {
  pending: 'bg-yellow-100 text-yellow-800',
  requested: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-800',
}

const ALL_STATUSES = ['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled']

export default function ManageBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => { loadBookings() }, [])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const data = await getAllDocuments('bookings')
      setBookings(data.length > 0 ? data : dummyBookings)
    } catch {
      setBookings(dummyBookings)
    } finally { setLoading(false) }
  }

  const updateStatus = async (bookingId, newStatus) => {
    try {
      await updateDocument('bookings', bookingId, { status: newStatus })
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  const filtered = bookings
    .filter(b => filter === 'all' || b.status === filter)
    .filter(b => !search || b.service_title?.toLowerCase().includes(search.toLowerCase()) || b.customer_name?.toLowerCase().includes(search.toLowerCase()) || b.worker_name?.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="p-6"><TableSkeleton rows={6} /></div>

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
        <p className="text-gray-500 text-sm mt-1">{bookings.length} bookings total</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-card mb-4 p-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by service, customer, or worker…"
          className="input-field max-w-md" />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-5">
        {ALL_STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              filter === s ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
            }`}>{s === 'all' ? 'All' : s.replace('_', ' ')}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Booking', 'Service', 'Customer', 'Worker', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">#{(b.id || '').slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{b.service_title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{b.customer_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{b.worker_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{b.booking_date}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{Number(b.amount || 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_CLASSES[b.status] || 'bg-gray-100 text-gray-600'}`}>
                      {(b.status || '').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={b.status || 'pending'}
                      onChange={e => updateStatus(b.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500">
                      {['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <CalendarIcon className="w-10 h-10 mx-auto mb-2" />
              <p>No bookings found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
