import React, { useState, useEffect } from 'react'
import { getAllDocuments, updateDocument, deleteDocument } from '../../services/firestoreService'
import { dummyReviews } from '../../utils/dummyData'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import { TrashIcon, CheckCircleIcon, XCircleIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { TableSkeleton } from '../../components/SkeletonLoader'
import toast from 'react-hot-toast'

export default function ManageReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, approved, removed
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => { loadReviews() }, [])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const data = await getAllDocuments('reviews')
      setReviews(data.length > 0 ? data : dummyReviews)
    } catch { setReviews(dummyReviews) }
    finally { setLoading(false) }
  }

  const handleModerate = async (review, action) => {
    try {
      await updateDocument('reviews', review.id, { moderated: true, moderation_status: action })
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, moderated: true, moderation_status: action } : r))
      toast.success(`Review ${action}`)
    } catch { toast.error('Failed to moderate') }
  }

  const handleDelete = async (reviewId) => {
    try {
      await deleteDocument('reviews', reviewId)
      setReviews(prev => prev.filter(r => r.id !== reviewId))
      setDeleteConfirm(null)
      toast.success('Review deleted permanently')
    } catch {
      toast.error('Failed to delete review')
    }
  }

  const filtered = reviews.filter(r => {
    if (filter === 'all') return true
    if (filter === 'pending') return !r.moderated
    return r.moderation_status === filter
  })

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => !r.moderated).length,
    approved: reviews.filter(r => r.moderation_status === 'approved').length,
    removed: reviews.filter(r => r.moderation_status === 'removed').length,
    avgRating: reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : '0.0',
  }

  if (loading) return <div className="p-6"><TableSkeleton rows={5} /></div>

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-header">Manage Reviews</h1>
          <p className="page-subtitle">Moderate and manage user feedback</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          <p className="text-xs text-gray-500">Approved</p>
        </div>
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.removed}</p>
          <p className="text-xs text-gray-500">Removed</p>
        </div>
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <StarSolid className="w-5 h-5 text-yellow-400" />
            <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
          </div>
          <p className="text-xs text-gray-500">Avg Rating</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-5">
        <FunnelIcon className="w-4 h-4 text-gray-400" />
        {['all', 'pending', 'approved', 'removed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize transition-all ${
              filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>{f} {f === 'all' ? `(${stats.total})` : f === 'pending' ? `(${stats.pending})` : ''}</button>
        ))}
      </div>

      {/* Reviews list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <p className="text-gray-400 text-sm">No reviews match this filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className={`bg-white rounded-xl shadow-card border p-5 transition-all ${
              r.moderation_status === 'removed' ? 'border-red-200 opacity-60' : 'border-gray-100'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                      {(r.customer_name || 'U')[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r.customer_name}</p>
                      <p className="text-xs text-gray-400">{r.service_title} • {r.service_type}</p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <StarSolid key={i} className={`w-4 h-4 ${i < r.rating ? 'text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{r.rating}/5</span>
                    {r.createdAt && (
                      <span className="text-xs text-gray-300">• {new Date(r.createdAt).toLocaleDateString()}</span>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed mb-2">"{r.comment}"</p>

                  {r.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {r.tags.map(t => <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>)}
                    </div>
                  )}

                  {r.booking_id && (
                    <p className="text-[10px] text-gray-300 mt-2 font-mono">Booking: {r.booking_id.slice(0, 16)}...</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {r.moderated ? (
                    <span className={`badge text-xs ${r.moderation_status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.moderation_status === 'approved' ? 'Approved' : 'Removed'}
                    </span>
                  ) : (
                    <>
                      <button onClick={() => handleModerate(r, 'approved')}
                        className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 font-medium transition-colors">
                        <CheckCircleIcon className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button onClick={() => handleModerate(r, 'removed')}
                        className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 font-medium transition-colors">
                        <XCircleIcon className="w-3.5 h-3.5" /> Remove
                      </button>
                    </>
                  )}

                  {/* Delete button */}
                  {deleteConfirm === r.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(r.id)}
                        className="text-[10px] bg-red-600 text-white px-2 py-1 rounded-md font-semibold hover:bg-red-700">
                        Confirm
                      </button>
                      <button onClick={() => setDeleteConfirm(null)}
                        className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded-md font-medium hover:bg-gray-300">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(r.id)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 font-medium transition-colors mt-1">
                      <TrashIcon className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
