import React, { useState, useEffect } from 'react'
import { UserIcon, ShieldExclamationIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { getAllDocuments, updateDocument } from '../../services/firestoreService'
import { dummyUsers } from '../../utils/dummyData'
import { TableSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/admin/users')
      const data = res.data || []
      setUsers(data.length > 0 ? data : dummyUsers)
    } catch {
      // Fallback to Firestore, then dummy
      try {
        const data = await getAllDocuments('users')
        setUsers(data.length > 0 ? data : dummyUsers)
      } catch {
        setUsers(dummyUsers)
        setError('Failed to load users from server')
      }
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  const toggleSuspend = async (userId, suspended) => {
    try {
      await api.put(`/api/admin/users/${userId}/suspend?suspend=${!suspended}`)
      toast.success(suspended ? 'User unsuspended' : 'User suspended')
      fetchUsers()
    } catch {
      // Try Firestore fallback
      try {
        await updateDocument('users', userId, { suspended: !suspended })
        setUsers(prev => prev.map(u => (u.id || u.uid) === userId ? { ...u, suspended: !suspended } : u))
        toast.success(suspended ? 'User unsuspended' : 'User suspended')
      } catch { toast.error('Failed to update user') }
    }
  }

  const changeType = async (userId, type) => {
    try {
      await api.put(`/api/admin/users/${userId}/type?user_type=${type}`)
      toast.success('User type updated')
      fetchUsers()
    } catch {
      try {
        await updateDocument('users', userId, { user_type: type })
        setUsers(prev => prev.map(u => (u.id || u.uid) === userId ? { ...u, user_type: type } : u))
        toast.success('User type updated')
      } catch { toast.error('Failed to update') }
    }
  }

  const filtered = users.filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="p-6"><TableSkeleton rows={6} /></div>

  if (error) return <div className="p-6"><ErrorState title="Error Loading Users" message={error} onRetry={fetchUsers} /></div>

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        <p className="text-gray-500 text-sm mt-1">{users.length} registered users</p>
      </div>

      <div className="bg-white rounded-xl shadow-card mb-6 p-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users by name or email…" className="input-field max-w-md" />
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['User', 'Email', 'Type', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.id || u.uid} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0">
                        {(u.name || u.email || 'U')[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{u.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{u.email}</td>
                  <td className="px-5 py-4">
                    <select value={u.user_type || 'customer'} onChange={e => changeType(u.id || u.uid, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500">
                      {['customer', 'worker', 'employer', 'admin'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${u.suspended ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {u.suspended ? <ShieldExclamationIcon className="w-3.5 h-3.5" /> : <CheckCircleIcon className="w-3.5 h-3.5" />}
                      {u.suspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggleSuspend(u.id || u.uid, u.suspended)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${u.suspended ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
                      {u.suspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-400"><UserIcon className="w-10 h-10 mx-auto mb-2" /><p>No users found</p></div>}
        </div>
      </div>
    </div>
  )
}
