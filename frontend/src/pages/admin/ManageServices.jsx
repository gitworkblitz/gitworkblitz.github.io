import React, { useState, useEffect } from 'react'
import {
  TrashIcon, WrenchScrewdriverIcon, MagnifyingGlassIcon,
  PlusIcon, PencilSquareIcon, XMarkIcon, CheckCircleIcon, NoSymbolIcon
} from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { getAllDocuments, updateDocument, createDocument, deleteDocument } from '../../services/firestoreService'
import { dummyServices, formatCurrencyINR } from '../../utils/dummyData'
import { TableSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'

export default function ManageServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' or 'edit'
  const [currentService, setCurrentService] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    location: '',
    worker_name: '',
    is_active: true,
  })
  const [saving, setSaving] = useState(false)

  const fetchServices = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllDocuments('services')
      setServices(data.length > 0 ? data : dummyServices)
    } catch {
      setServices(dummyServices)
      setError('Failed to load services from database')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchServices() }, [])

  const toggleActive = async (service) => {
    const newStatus = service.is_active === false ? true : false
    try {
      await updateDocument('services', service.id, { is_active: newStatus })
      setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: newStatus } : s))
      toast.success(newStatus ? 'Service activated' : 'Service deactivated')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const removeService = async (id) => {
    if (!window.confirm('Remove this service completely? This cannot be undone.')) return
    try {
      await deleteDocument('services', id)
      setServices(prev => prev.filter(s => s.id !== id))
      toast.success('Service removed permanently')
    } catch {
      toast.error('Failed to remove service')
    }
  }

  const openCreateModal = () => {
    setModalMode('create')
    setCurrentService(null)
    setFormData({ title: '', category: 'Plumbing', price: '', location: '', worker_name: '', is_active: true })
    setIsModalOpen(true)
  }

  const openEditModal = (service) => {
    setModalMode('edit')
    setCurrentService(service)
    setFormData({
      title: service.title || '',
      category: service.category || 'Plumbing',
      price: service.price || '',
      location: service.location || '',
      worker_name: service.worker_name || '',
      is_active: service.is_active !== false,
    })
    setIsModalOpen(true)
  }

  const handleSaveService = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.price || !formData.worker_name) {
      toast.error('Title, Provider Name, and Price are required')
      return
    }
    
    setSaving(true)
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
      }
      
      if (modalMode === 'create') {
        const newService = {
          ...payload,
          rating: 0,
          created_at: new Date().toISOString(),
        }
        const docId = await createDocument('services', newService)
        if (docId) {
          setServices([{ id: docId, ...newService }, ...services])
          toast.success('Service created successfully')
        }
      } else {
        const serviceId = currentService.id
        await updateDocument('services', serviceId, payload)
        setServices(services.map(s => s.id === serviceId ? { ...s, ...payload } : s))
        toast.success('Service updated successfully')
      }
      setIsModalOpen(false)
    } catch (err) {
      toast.error(`Failed to ${modalMode} service`)
    } finally {
      setSaving(false)
    }
  }

  const filtered = services.filter(s =>
    !search || 
    s.title?.toLowerCase().includes(search.toLowerCase()) || 
    s.category?.toLowerCase().includes(search.toLowerCase()) || 
    s.worker_name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="p-6 max-w-7xl mx-auto"><TableSkeleton rows={6} /></div>
  if (error) return <div className="p-6 max-w-7xl mx-auto"><ErrorState title="Error Loading Services" message={error} onRetry={fetchServices} /></div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Services</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{services.length} total services listed</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/30">
          <PlusIcon className="w-5 h-5" />
          Add New Service
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by title, category, or provider…" 
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                {['Service Info', 'Category', 'Provider', 'Price', 'Rating', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate max-w-[200px]">{s.title}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[200px]">{s.location || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2.5 py-1 rounded-full whitespace-nowrap">
                      {s.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
                    {s.worker_name || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    {formatCurrencyINR(s.price || 0)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-lg w-min">
                      <StarIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{s.rating || 'New'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${s.is_active !== false ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {s.is_active !== false ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <NoSymbolIcon className="w-3.5 h-3.5" />}
                      {s.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(s)} className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 bg-gray-50 hover:bg-primary-50 dark:bg-gray-800 dark:hover:bg-primary-900/30 rounded-lg transition-colors" title="Edit Service">
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleActive(s)} className={`p-1.5 rounded-lg transition-colors ${s.is_active !== false ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40' : 'text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40'}`} title={s.is_active !== false ? 'Deactivate' : 'Activate'}>
                        {s.is_active !== false ? <NoSymbolIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                      </button>
                      <button onClick={() => removeService(s.id)} className="p-1.5 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete Service">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <WrenchScrewdriverIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No services found matching "{search}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {modalMode === 'create' ? 'Create New Service' : 'Edit Service'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              <form id="service-form" onSubmit={handleSaveService} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Title</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })} 
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white transition-all"
                    placeholder="e.g. Professional Plumbing"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select 
                      value={formData.category} 
                      onChange={e => setFormData({ ...formData, category: e.target.value })} 
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white transition-all"
                    >
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Carpentry">Carpentry</option>
                      <option value="Painting">Painting</option>
                      <option value="Appliance Repair">Appliance Repair</option>
                      <option value="Beauty">Beauty</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                    <input 
                      type="number" 
                      value={formData.price} 
                      onChange={e => setFormData({ ...formData, price: e.target.value })} 
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white transition-all"
                      placeholder="999"
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provider Name</label>
                  <input 
                    type="text" 
                    value={formData.worker_name} 
                    onChange={e => setFormData({ ...formData, worker_name: e.target.value })} 
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white transition-all"
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input 
                    type="text" 
                    value={formData.location} 
                    onChange={e => setFormData({ ...formData, location: e.target.value })} 
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white transition-all"
                    placeholder="e.g. Mumbai, India"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input 
                    type="checkbox" 
                    id="is_active" 
                    checked={formData.is_active} 
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    List Service as Active (Visible to users)
                  </label>
                </div>
              </form>
            </div>

            <div className="p-5 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50 dark:bg-gray-900 flex gap-3 justify-end rounded-b-2xl">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="service-form"
                disabled={saving}
                className="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  modalMode === 'create' ? 'Create Service' : 'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
