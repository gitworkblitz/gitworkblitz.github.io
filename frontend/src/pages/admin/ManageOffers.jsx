import React, { useState, useEffect } from 'react'
import {
  TrashIcon, TicketIcon, MagnifyingGlassIcon,
  PlusIcon, PencilSquareIcon, XMarkIcon, CheckCircleIcon, NoSymbolIcon
} from '@heroicons/react/24/outline'
import { getAllDocuments, updateDocument, createDocument, deleteDocument } from '../../services/firestoreService'
import { TableSkeleton } from '../../components/SkeletonLoader'
import toast from 'react-hot-toast'

export default function ManageOffers() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [currentOffer, setCurrentOffer] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discount_percentage: '',
    description: '',
    valid_until: '',
    is_active: true,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadOffers() }, [])
  const loadOffers = async () => {
    setLoading(true)
    try {
      const data = await getAllDocuments('offers')
      setOffers(data)
    } catch { setOffers([]) }
    finally { setLoading(false) }
  }

  const toggleActive = async (offer) => {
    const newStatus = !offer.is_active
    try {
      await updateDocument('offers', offer.id, { is_active: newStatus })
      setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, is_active: newStatus } : o))
      toast.success(newStatus ? 'Offer activated' : 'Offer deactivated')
    } catch { toast.error('Failed to update status') }
  }

  const removeOffer = async (id) => {
    if (!window.confirm('Delete this coupon/offer?')) return
    try {
      await deleteDocument('offers', id)
      setOffers(prev => prev.filter(o => o.id !== id))
      toast.success('Offer deleted')
    } catch {
      toast.error('Failed to delete offer')
    }
  }

  const openCreateModal = () => {
    setModalMode('create')
    setCurrentOffer(null)
    setFormData({ code: '', discount_percentage: '', description: '', valid_until: '', is_active: true })
    setIsModalOpen(true)
  }

  const openEditModal = (offer) => {
    setModalMode('edit')
    setCurrentOffer(offer)
    setFormData({
      code: offer.code || '',
      discount_percentage: offer.discount_percentage || '',
      description: offer.description || '',
      valid_until: offer.valid_until || '',
      is_active: offer.is_active !== false,
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.code || !formData.discount_percentage) {
      toast.error('Code and Discount % are required')
      return
    }
    
    setSaving(true)
    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().replace(/\s+/g, ''),
        discount_percentage: Number(formData.discount_percentage)
      }

      if (modalMode === 'create') {
        const newDoc = { ...payload, created_at: new Date().toISOString() }
        const docId = await createDocument('offers', newDoc)
        if (docId) {
          setOffers([{ id: docId, ...newDoc }, ...offers])
          toast.success('Offer created')
        }
      } else {
        const docId = currentOffer.id
        await updateDocument('offers', docId, payload)
        setOffers(offers.map(o => o.id === docId ? { ...o, ...payload } : o))
        toast.success('Offer updated')
      }
      setIsModalOpen(false)
    } catch (err) {
      toast.error(`Failed to ${modalMode} offer`)
    } finally {
      setSaving(false)
    }
  }

  const filtered = offers.filter(o =>
    !search || 
    o.code?.toLowerCase().includes(search.toLowerCase()) || 
    o.description?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="p-6 max-w-7xl mx-auto"><TableSkeleton rows={6} /></div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Coupons & Offers</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Create and track platform discounts</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/30">
          <PlusIcon className="w-5 h-5" />
          Create New Offer
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by code or description…" 
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valid Until</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-gray-900 dark:text-white px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">{o.code}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">{o.discount_percentage}% OFF</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-[200px] truncate">{o.description || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {o.valid_until ? new Date(o.valid_until).toLocaleDateString() : 'No expiry'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${o.is_active !== false ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {o.is_active !== false ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <NoSymbolIcon className="w-3.5 h-3.5" />}
                      {o.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(o)} className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 bg-gray-50 hover:bg-primary-50 dark:bg-gray-800 dark:hover:bg-primary-900/30 rounded-lg transition-colors" title="Edit">
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleActive(o)} className={`p-1.5 rounded-lg transition-colors ${o.is_active !== false ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`} title={o.is_active !== false ? 'Deactivate' : 'Activate'}>
                        {o.is_active !== false ? <NoSymbolIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                      </button>
                      <button onClick={() => removeOffer(o.id)} className="p-1.5 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete">
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
              <TicketIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No offers found</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {modalMode === 'create' ? 'New Coupon/Offer' : 'Edit Offer Details'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coupon Code</label>
                  <input 
                    type="text" 
                    value={formData.code} 
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} 
                    className="w-full font-mono uppercase bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white transition-all"
                    placeholder="SUMMER50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount (%)</label>
                  <input 
                    type="number" 
                    value={formData.discount_percentage} 
                    onChange={e => setFormData({ ...formData, discount_percentage: e.target.value })} 
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white transition-all"
                    placeholder="E.g. 20"
                    min="1" max="100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white transition-all resize-none"
                  placeholder="What is this offer for?"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valid Until (Optional)</label>
                <input 
                  type="date" 
                  value={formData.valid_until} 
                  onChange={e => setFormData({ ...formData, valid_until: e.target.value })} 
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white transition-all"
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
                  Active (Customers can use it)
                </label>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 dark:border-gray-800 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors flex items-center justify-center min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    modalMode === 'create' ? 'Create' : 'Save'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
