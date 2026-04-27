import React, { useState, useEffect, useMemo } from 'react'
import { CreditCard, Search, Download, CheckCircle, Clock, XCircle, IndianRupee } from 'lucide-react'
import { getAllDocuments } from '../../services/firestoreService'
import { formatCurrencyINR } from '../../utils/dummyData'
import { TableSkeleton } from '../../components/SkeletonLoader'

const STATUS_CLASSES = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
}

export default function ManagePayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    document.title = 'Manage Payments | WorkSphere Admin'
    loadPayments()
  }, [])

  const loadPayments = async () => {
    setLoading(true)
    try {
      const data = await getAllDocuments('payments')
      setPayments(data.sort((a, b) => (b.paid_at || b.createdAt || '').localeCompare(a.paid_at || a.createdAt || '')))
    } catch {
      setPayments([])
    } finally { setLoading(false) }
  }

  const filtered = useMemo(() =>
    payments
      .filter(p => filter === 'all' || p.status === filter)
      .filter(p => !search || 
        p.service_title?.toLowerCase().includes(search.toLowerCase()) || 
        p.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.transaction_id?.toLowerCase().includes(search.toLowerCase())
      ),
    [payments, filter, search]
  )

  const totalRevenue = useMemo(() => 
    payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.total || p.amount || 0), 0),
    [payments]
  )

  if (loading) return <div className="p-6"><TableSkeleton rows={6} /></div>

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Payments</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{payments.length} total payments</p>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
          <IndianRupee className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{formatCurrencyINR(totalRevenue)}</p>
          <p className="text-white/70 text-xs">Total Revenue</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-1"><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-xs text-gray-500">Paid</span></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{payments.filter(p => p.status === 'paid').length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-yellow-500" /><span className="text-xs text-gray-500">Pending</span></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{payments.filter(p => p.status === 'pending').length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-1"><XCircle className="w-4 h-4 text-red-500" /><span className="text-xs text-gray-500">Failed</span></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{payments.filter(p => p.status === 'failed').length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card mb-4 p-4 flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by service, customer, or TXN ID…"
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {['all', 'paid', 'pending', 'failed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              filter === s ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
            }`}>{s === 'all' ? 'All' : s}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
              <tr>{['Transaction ID', 'Service', 'Customer', 'Amount', 'Tax', 'Total', 'Method', 'Status', 'Date'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-primary-600 dark:text-primary-400">{p.transaction_id || '—'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{p.service_title || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{p.customer_name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{formatCurrencyINR(p.amount || 0)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatCurrencyINR(p.tax || 0)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">{formatCurrencyINR(p.total || 0)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 capitalize">{p.payment_method || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_CLASSES[p.status] || 'bg-gray-100 text-gray-600'}`}>
                      {p.status || 'unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <CreditCard className="w-10 h-10 mx-auto mb-2" />
              <p>No payments found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
