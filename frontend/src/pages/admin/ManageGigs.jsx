import React, { useState, useEffect } from 'react'
import { getAllDocuments, updateDocument } from '../../services/firestoreService'
import { dummyGigs, formatCurrencyINR } from '../../utils/dummyData'
import { TableSkeleton } from '../../components/SkeletonLoader'
import toast from 'react-hot-toast'

export default function ManageGigs() {
  const [gigs, setGigs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadGigs() }, [])
  const loadGigs = async () => {
    setLoading(true)
    try {
      const data = await getAllDocuments('gigs')
      setGigs(data.length > 0 ? data : dummyGigs)
    } catch { setGigs(dummyGigs) }
    finally { setLoading(false) }
  }

  const toggleStatus = async (gig) => {
    const newStatus = gig.status === 'active' ? 'paused' : 'active'
    try {
      await updateDocument('gigs', gig.id, { status: newStatus })
      setGigs(prev => prev.map(g => g.id === gig.id ? { ...g, status: newStatus } : g))
      toast.success(`Gig ${newStatus}`)
    } catch { toast.error('Failed to update') }
  }

  if (loading) return <div className="p-6"><TableSkeleton rows={5} /></div>

  return (
    <div>
      <h1 className="page-header">Manage Gigs</h1>
      <p className="page-subtitle">{gigs.length} total gigs</p>
      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
            <th className="px-5 py-3">Title</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Budget</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {gigs.map(g => (
              <tr key={g.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 font-medium text-gray-900 text-sm">{g.title}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{g.category}</td>
                <td className="px-5 py-4 text-sm font-medium text-gray-900">{formatCurrencyINR(g.budget || 0)}</td>
                <td className="px-5 py-4"><span className={`badge ${g.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{g.status || 'active'}</span></td>
                <td className="px-5 py-4"><button onClick={() => toggleStatus(g)} className="text-xs text-primary-600 hover:text-primary-800 font-medium">{g.status === 'active' ? 'Pause' : 'Activate'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
