import React, { useState, useEffect } from 'react'
import {
  TrashIcon, BriefcaseIcon, MagnifyingGlassIcon,
  PlusIcon, PencilSquareIcon, XMarkIcon, CheckCircleIcon, NoSymbolIcon
} from '@heroicons/react/24/outline'
import { getAllDocuments, updateDocument, createDocument, deleteDocument } from '../../services/firestoreService'
import { dummyJobs, formatCurrencyINR } from '../../utils/dummyData'
import { TableSkeleton } from '../../components/SkeletonLoader'
import toast from 'react-hot-toast'

export default function ManageJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' or 'edit'
  const [currentJob, setCurrentJob] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    is_active: true,
  })
  const [saving, setSaving] = useState(false)

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
    const newStatus = job.is_active === false ? true : false
    try {
      await updateDocument('jobs', job.id, { is_active: newStatus })
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_active: newStatus } : j))
      toast.success(newStatus ? 'Job activated' : 'Job deactivated')
    } catch { toast.error('Failed to update status') }
  }

  const removeJob = async (id) => {
    if (!window.confirm('Remove this job completely? This cannot be undone.')) return
    try {
      await deleteDocument('jobs', id)
      setJobs(prev => prev.filter(j => j.id !== id))
      toast.success('Job removed permanently')
    } catch {
      toast.error('Failed to remove job')
    }
  }

  const openCreateModal = () => {
    setModalMode('create')
    setCurrentJob(null)
    setFormData({ title: '', company: '', location: '', type: 'Full-time', is_active: true })
    setIsModalOpen(true)
  }

  const openEditModal = (job) => {
    setModalMode('edit')
    setCurrentJob(job)
    setFormData({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      type: job.type || 'Full-time',
      is_active: job.is_active !== false,
    })
    setIsModalOpen(true)
  }

  const handleSaveJob = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.company) {
      toast.error('Title and Company are required')
      return
    }
    
    setSaving(true)
    try {
      if (modalMode === 'create') {
        const newJob = {
          ...formData,
          created_at: new Date().toISOString(),
        }
        const docId = await createDocument('jobs', newJob)
        if (docId) {
          setJobs([{ id: docId, ...newJob }, ...jobs])
          toast.success('Job created successfully')
        }
      } else {
        const jobId = currentJob.id
        await updateDocument('jobs', jobId, formData)
        setJobs(jobs.map(j => j.id === jobId ? { ...j, ...formData } : j))
        toast.success('Job updated successfully')
      }
      setIsModalOpen(false)
    } catch (err) {
      toast.error(`Failed to ${modalMode} job`)
    } finally {
      setSaving(false)
    }
  }

  const filtered = jobs.filter(j =>
    !search || 
    j.title?.toLowerCase().includes(search.toLowerCase()) || 
    j.company?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="p-6 max-w-7xl mx-auto"><TableSkeleton rows={6} /></div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Jobs</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{jobs.length} total jobs posted</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/30">
          <PlusIcon className="w-5 h-5" />
          Post New Job
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by title or company…" 
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
                {['Job Title', 'Company', 'Location', 'Type', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(j => (
                <tr key={j.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-sm max-w-[200px] truncate">{j.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-medium max-w-[150px] truncate">{j.company || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">{j.location || 'Remote'}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full capitalize whitespace-nowrap">{j.type || 'Full-time'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${j.is_active !== false ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {j.is_active !== false ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <NoSymbolIcon className="w-3.5 h-3.5" />}
                      {j.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(j)} className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 bg-gray-50 hover:bg-primary-50 dark:bg-gray-800 dark:hover:bg-primary-900/30 rounded-lg transition-colors" title="Edit Job">
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleActive(j)} className={`p-1.5 rounded-lg transition-colors ${j.is_active !== false ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40' : 'text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40'}`} title={j.is_active !== false ? 'Deactivate' : 'Activate'}>
                        {j.is_active !== false ? <NoSymbolIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                      </button>
                      <button onClick={() => removeJob(j.id)} className="p-1.5 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete Job">
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
              <BriefcaseIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No jobs found matching "{search}"</p>
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
                {modalMode === 'create' ? 'Post New Job' : 'Edit Job Details'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              <form id="job-form" onSubmit={handleSaveJob} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })} 
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white transition-all"
                    placeholder="e.g. Senior Frontend Developer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                  <input 
                    type="text" 
                    value={formData.company} 
                    onChange={e => setFormData({ ...formData, company: e.target.value })} 
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white transition-all"
                    placeholder="e.g. TechCorp Inc."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    <input 
                      type="text" 
                      value={formData.location} 
                      onChange={e => setFormData({ ...formData, location: e.target.value })} 
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white transition-all"
                      placeholder="e.g. Remote"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Type</label>
                    <select 
                      value={formData.type} 
                      onChange={e => setFormData({ ...formData, type: e.target.value })} 
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white transition-all"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>
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
                    Job is Active and visible to applicants
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
                form="job-form"
                disabled={saving}
                className="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  modalMode === 'create' ? 'Post Job' : 'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
