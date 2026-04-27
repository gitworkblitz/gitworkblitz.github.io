import React, { useState, useEffect } from 'react'
import {
  UserIcon, ShieldExclamationIcon, CheckCircleIcon,
  PlusIcon, PencilSquareIcon, TrashIcon, XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { getAllDocuments, updateDocument, createDocument, deleteDocument } from '../../services/firestoreService'
import { dummyUsers } from '../../utils/dummyData'
import useDebounce from '../../hooks/useDebounce'
import { TableSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' or 'edit'
  const [currentUser, setCurrentUser] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    user_type: 'customer',
    suspended: false,
  })
  const [saving, setSaving] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllDocuments('users')
      setUsers(data.length > 0 ? data : dummyUsers)
    } catch {
      setUsers(dummyUsers)
      setError('Failed to load users from database')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  const toggleSuspend = async (userId, suspended) => {
    try {
      await updateDocument('users', userId, { suspended: !suspended })
      setUsers(prev => prev.map(u => (u.id || u.uid) === userId ? { ...u, suspended: !suspended } : u))
      toast.success(suspended ? 'User unsuspended' : 'User suspended')
    } catch {
      toast.error('Failed to update user status')
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    try {
      await deleteDocument('users', userId)
      setUsers(prev => prev.filter(u => (u.id || u.uid) !== userId))
      toast.success('User deleted successfully')
    } catch {
      toast.error('Failed to delete user')
    }
  }

  const openCreateModal = () => {
    setModalMode('create')
    setCurrentUser(null)
    setFormData({ name: '', email: '', user_type: 'customer', suspended: false })
    setIsModalOpen(true)
  }

  const openEditModal = (user) => {
    setModalMode('edit')
    setCurrentUser(user)
    setFormData({
      name: user.name || '',
      email: user.email || '',
      user_type: user.user_type || 'customer',
      suspended: user.suspended || false,
    })
    setIsModalOpen(true)
  }

  const handleSaveUser = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required')
      return
    }
    
    setSaving(true)
    try {
      if (modalMode === 'create') {
        const newUser = {
          ...formData,
          created_at: new Date().toISOString(),
        }
        const docId = await createDocument('users', newUser)
        if (docId) {
          setUsers([{ id: docId, ...newUser }, ...users])
          toast.success('User created successfully')
        }
      } else {
        const userId = currentUser.id || currentUser.uid
        await updateDocument('users', userId, formData)
        setUsers(users.map(u => (u.id || u.uid) === userId ? { ...u, ...formData } : u))
        toast.success('User updated successfully')
      }
      setIsModalOpen(false)
    } catch (err) {
      toast.error(`Failed to ${modalMode} user`)
    } finally {
      setSaving(false)
    }
  }

  const filtered = users.filter(u => 
    !debouncedSearch || 
    u.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
    u.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  if (loading) return <div className="p-6 max-w-7xl mx-auto"><TableSkeleton rows={6} /></div>
  if (error) return <div className="p-6 max-w-7xl mx-auto"><ErrorState title="Error Loading Users" message={error} onRetry={fetchUsers} /></div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Users</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{users.length} total users on the platform</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/30">
          <PlusIcon className="w-5 h-5" />
          Add New User
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by name or email…" 
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
                {['User', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(u => (
                <tr key={u.id || u.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm shadow-sm flex-shrink-0">
                        {(u.name || u.email || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white text-sm block">{u.name || '—'}</span>
                        <span className="text-xs text-gray-400">{u.id || u.uid}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-medium">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize
                      ${u.user_type === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        u.user_type === 'worker' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        u.user_type === 'employer' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {u.user_type || 'customer'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${u.suspended ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                      {u.suspended ? <ShieldExclamationIcon className="w-3.5 h-3.5" /> : <CheckCircleIcon className="w-3.5 h-3.5" />}
                      {u.suspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(u)} className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 bg-gray-50 hover:bg-primary-50 dark:bg-gray-800 dark:hover:bg-primary-900/30 rounded-lg transition-colors" title="Edit User">
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleSuspend(u.id || u.uid, u.suspended)} className={`p-1.5 rounded-lg transition-colors ${u.suspended ? 'text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40' : 'text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40'}`} title={u.suspended ? 'Unsuspend' : 'Suspend'}>
                        <ShieldExclamationIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(u.id || u.uid)} className="p-1.5 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete User">
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
              <UserIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No users found matching "{search}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {modalMode === 'create' ? 'Create New User' : 'Edit User Details'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveUser} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })} 
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white transition-all"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User Role</label>
                <select 
                  value={formData.user_type} 
                  onChange={e => setFormData({ ...formData, user_type: e.target.value })} 
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white transition-all"
                >
                  <option value="customer">Customer</option>
                  <option value="worker">Worker</option>
                  <option value="employer">Employer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="suspended" 
                  checked={formData.suspended} 
                  onChange={e => setFormData({ ...formData, suspended: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="suspended" className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Suspend Account
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
                    modalMode === 'create' ? 'Create User' : 'Save Changes'
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
