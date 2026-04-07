import React, { useState, useEffect } from 'react'
import { getAllDocuments, updateDocument } from '../../services/firestoreService'
import { formatCurrencyINR } from '../../utils/dummyData'
import { dummyJobs } from '../../utils/dummyData'
import { TableSkeleton } from '../../components/SkeletonLoader'
import toast from 'react-hot-toast'

export default function ManageJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadJobs() }, [])
  const loadJobs = async () => {
    setLoading(true)
    try {
      const data = await getAllDocuments('jobs')
      setJobs(data.length > 0 ? data : dummyJobs)
    } catch { setJobs(dummyJobs) }
    finally { setLoading(false) }
  }

  const toggleActive = async (job) => {
    try {
      await updateDocument('jobs', job.id, { is_active: !job.is_active })
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_active: !j.is_active } : j))
      toast.success(job.is_active ? 'Job deactivated' : 'Job activated')
    } catch { toast.error('Failed to update') }
  }

  if (loading) return <div className="p-6"><TableSkeleton rows={5} /></div>

  return (
    <div>
      <h1 className="page-header">Manage Jobs</h1>
      <p className="page-subtitle">{jobs.length} total jobs</p>
      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
            <th className="px-5 py-3">Title</th><th className="px-5 py-3">Company</th><th className="px-5 py-3">Location</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {jobs.map(j => (
              <tr key={j.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 font-medium text-gray-900 text-sm">{j.title}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{j.company || 'N/A'}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{j.location}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{j.type}</td>
                <td className="px-5 py-4"><span className={`badge ${j.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{j.is_active !== false ? 'Active' : 'Inactive'}</span></td>
                <td className="px-5 py-4"><button onClick={() => toggleActive(j)} className="text-xs text-primary-600 hover:text-primary-800 font-medium">{j.is_active !== false ? 'Deactivate' : 'Activate'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
