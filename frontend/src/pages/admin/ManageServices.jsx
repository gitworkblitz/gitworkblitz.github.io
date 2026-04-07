import React, { useState, useEffect } from 'react'
import { TrashIcon, WrenchScrewdriverIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { getAllDocuments, updateDocument } from '../../services/firestoreService'
import { dummyServices, formatCurrencyINR } from '../../utils/dummyData'
import { TableSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'

export default function ManageServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const fetchServices = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/services/')
      const data = res.data || []
      setServices(data.length > 0 ? data : dummyServices)
    } catch {
      try {
        const data = await getAllDocuments('services')
        setServices(data.length > 0 ? data : dummyServices)
      } catch {
        setServices(dummyServices)
        setError('Failed to load services from server')
      }
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchServices() }, [])

  const toggleActive = async (service) => {
    try {
      await updateDocument('services', service.id, { is_active: !service.is_active })
      setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: !s.is_active } : s))
      toast.success(service.is_active ? 'Service deactivated' : 'Service activated')
    } catch {
      toast.error('Failed to update')
    }
  }

  const removeService = async (id) => {
    if (!window.confirm('Remove this service?')) return
    try {
      await api.delete(`/api/admin/services/${id}`)
      toast.success('Service removed')
      fetchServices()
    } catch {
      try {
        await updateDocument('services', id, { is_active: false })
        setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: false } : s))
        toast.success('Service deactivated')
      } catch { toast.error('Failed to remove') }
    }
  }

  const filtered = services.filter(s =>
    !search || s.title?.toLowerCase().includes(search.toLowerCase()) || s.category?.toLowerCase().includes(search.toLowerCase()) || s.worker_name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="p-6"><TableSkeleton rows={6} /></div>

  if (error) return <div className="p-6"><ErrorState title="Error Loading Services" message={error} onRetry={fetchServices} /></div>

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Services</h1>
        <p className="text-gray-500 text-sm mt-1">{services.length} total services</p>
      </div>

      <div className="bg-white rounded-xl shadow-card mb-6 p-4">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services…" className="input-field pl-10" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Service', 'Category', 'Provider', 'Price', 'Rating', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900 text-sm">{s.title}</p>
                    <p className="text-xs text-gray-400">{s.location}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full">{s.category}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{s.worker_name}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900">{formatCurrencyINR(s.price || 0)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-3.5 h-3.5 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-900">{s.rating || '—'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {s.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleActive(s)}
                        className="text-xs text-primary-600 hover:text-primary-800 font-medium">
                        {s.is_active !== false ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => removeService(s.id)} className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-400"><WrenchScrewdriverIcon className="w-10 h-10 mx-auto mb-2" /><p>No services found</p></div>}
        </div>
      </div>
    </div>
  )
}
