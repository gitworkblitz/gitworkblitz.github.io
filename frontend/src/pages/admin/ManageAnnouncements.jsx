import React, { useState, useEffect } from 'react'
import {
  TrashIcon, MegaphoneIcon, MagnifyingGlassIcon,
  PlusIcon, PencilSquareIcon, XMarkIcon, CheckCircleIcon, NoSymbolIcon
} from '@heroicons/react/24/outline'
import { getAllDocuments, updateDocument, createDocument, deleteDocument } from '../../services/firestoreService'
import { TableSkeleton } from '../../components/SkeletonLoader'
import toast from 'react-hot-toast'

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info', // info, warning, success
    is_active: true,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAnnouncements() }, [])
  const loadAnnouncements = async () => {
    setLoading(true)
    try {
      const data = await getAllDocuments('announcements')
      setAnnouncements(data)
    } catch { setAnnouncements([]) }
    finally { setLoading(false) }
  }

  const toggleActive = async (announcement) => {
    const newStatus = !announcement.is_active
    try {
      await updateDocument('announcements', announcement.id, { is_active: newStatus })
      setAnnouncements(prev => prev.map(a => a.id === announcement.id ? { ...a, is_active: newStatus } : a))
      toast.success(newStatus ? 'Announcement activated' : 'Announcement deactivated')
    } catch { toast.error('Failed to update status') }
  }

  const removeAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return
    try {
      await deleteDocument('announcements', id)
      setAnnouncements(prev => prev.filter(a => a.id !== id))
      toast.success('Announcement deleted')
    } catch {
      toast.error('Failed to delete announcement')
    }
  }

  const openCreateModal = () => {
    setModalMode('create')
    setCurrentAnnouncement(null)
    setFormData({ title: '', message: '', type: 'info', is_active: true })
    setIsModalOpen(true)
  }

  const openEditModal = (announcement) => {
    setModalMode('edit')
    setCurrentAnnouncement(announcement)
    setFormData({
      title: announcement.title || '',
      message: announcement.message || '',
      type: announcement.type || 'info',
      is_active: announcement.is_active !== false,
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.message) {
      toast.error('Title and Message are required')
      return
    }
    
    setSaving(true)
    try {
      if (modalMode === 'create') {
        const newDoc = { ...formData, created_at: new Date().toISOString() }
        const docId = await createDocument('announcements', newDoc)
        if (docId) {
          setAnnouncements([{ id: docId, ...newDoc }, ...announcements])
          toast.success('Announcement created')
        }
      } else {
        const docId = currentAnnouncement.id
        await updateDocument('announcements', docId, formData)
        setAnnouncements(announcements.map(a => a.id === docId ? { ...a, ...formData } : a))
        toast.success('Announcement updated')
      }
      setIsModalOpen(false)
    } catch (err) {
      toast.error(`Failed to ${modalMode} announcement`)
    } finally {
      setSaving(false)
    }
  }

  const filtered = announcements.filter(a =>
    !search || 
    a.title?.toLowerCase().includes(search.toLowerCase()) || 
    a.message?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="p-6 max-w-7xl mx-auto"><TableSkeleton rows={6} /></div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Announcements</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Broadcast messages to users</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/30">
          <PlusIcon className="w-5 h-5" />
          New Announcement
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search announcements…" 
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Message</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-sm max-w-[200px] truncate">{a.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-[300px] truncate">{a.message}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                      a.type === 'warning' ? 'bg-amber-50 text-amber-700' :
                      a.type === 'success' ? 'bg-green-50 text-green-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {a.type || 'info'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${a.is_active !== false ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {a.is_active !== false ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <NoSymbolIcon className="w-3.5 h-3.5" />}
                      {a.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(a)} className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 bg-gray-50 hover:bg-primary-50 dark:bg-gray-800 dark:hover:bg-primary-900/30 rounded-lg transition-colors" title="Edit">
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleActive(a)} className={`p-1.5 rounded-lg transition-colors ${a.is_active !== false ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`} title={a.is_active !== false ? 'Deactivate' : 'Activate'}>
                        {a.is_active !== false ? <NoSymbolIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                      </button>
                      <button onClick={() => removeAnnouncement(a.id)} className="p-1.5 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete">
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
              <MegaphoneIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No announcements found</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {modalMode === 'create' ? 'New Announcement' : 'Edit Announcement'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })} 
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white transition-all"
                  placeholder="E.g. System Maintenance"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                <textarea 
                  value={formData.message} 
                  onChange={e => setFormData({ ...formData, message: e.target.value })} 
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white transition-all resize-none"
                  placeholder="Details of the announcement..."
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({ ...formData, type: e.target.value })} 
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white transition-all"
                >
                  <option value="info">Info (Blue)</option>
                  <option value="warning">Warning (Yellow)</option>
                  <option value="success">Success (Green)</option>
                </select>
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
                  Active (Visible to users)
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
