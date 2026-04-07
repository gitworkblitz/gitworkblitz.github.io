import React, { useState, useEffect } from 'react'
import { getAllReports } from '../../services/firestoreService'
import { FlagIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { updateDocument } from '../../services/firestoreService'
import { TableSkeleton } from '../../components/SkeletonLoader'
import toast from 'react-hot-toast'

const dummyReports = [
  { id: 'rp1', type: 'service', subject: 'Unprofessional behavior', description: 'Worker was rude during service', reported_by: 'Priya Sharma', status: 'open', createdAt: '2026-01-15T10:00:00Z' },
  { id: 'rp2', type: 'payment', subject: 'Overcharged', description: 'Was charged more than listed price', reported_by: 'Rahul Mehta', status: 'open', createdAt: '2026-01-12T10:00:00Z' },
  { id: 'rp3', type: 'account', subject: 'Fake profile', description: 'Suspected fake worker profile with stolen photos', reported_by: 'Anita Desai', status: 'resolved', createdAt: '2026-01-10T10:00:00Z' },
]

export default function ManageReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadReports() }, [])
  const loadReports = async () => {
    setLoading(true)
    try {
      const data = await getAllReports()
      setReports(data.length > 0 ? data : dummyReports)
    } catch { setReports(dummyReports) }
    finally { setLoading(false) }
  }

  const resolveReport = async (report) => {
    try {
      await updateDocument('reports', report.id, { status: 'resolved' })
      setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: 'resolved' } : r))
      toast.success('Report resolved')
    } catch { toast.error('Failed to resolve') }
  }

  if (loading) return <div className="p-6"><TableSkeleton rows={3} /></div>

  return (
    <div>
      <h1 className="page-header">Reports</h1>
      <p className="page-subtitle">{reports.filter(r => r.status === 'open').length} open reports</p>
      <div className="space-y-3">
        {reports.map(r => (
          <div key={r.id} className={`bg-white rounded-xl shadow-card border p-5 ${r.status === 'open' ? 'border-red-200' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.status === 'open' ? 'bg-red-100' : 'bg-green-100'}`}>
                  {r.status === 'open' ? <FlagIcon className="w-5 h-5 text-red-600" /> : <CheckCircleIcon className="w-5 h-5 text-green-600" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{r.subject}</p>
                  <p className="text-sm text-gray-600 mt-1">{r.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                    <span>Reported by: {r.reported_by}</span>
                    <span>Type: <span className="capitalize">{r.type}</span></span>
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div>
                {r.status === 'open' ? (
                  <button onClick={() => resolveReport(r)} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 font-medium">
                    Mark Resolved
                  </button>
                ) : (
                  <span className="badge bg-green-100 text-green-700">Resolved</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
