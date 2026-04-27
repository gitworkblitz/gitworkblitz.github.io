import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Search, Download, Eye, IndianRupee } from 'lucide-react'
import { getAllDocuments } from '../../services/firestoreService'
import { formatCurrencyINR } from '../../utils/dummyData'
import { TableSkeleton } from '../../components/SkeletonLoader'

export default function ManageInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    document.title = 'Manage Invoices | WorkSphere Admin'
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const data = await getAllDocuments('invoices')
      setInvoices(data.sort((a, b) => (b.created_at || b.createdAt || '').localeCompare(a.created_at || a.createdAt || '')))
    } catch {
      setInvoices([])
    } finally { setLoading(false) }
  }

  const filtered = useMemo(() =>
    invoices.filter(inv => !search ||
      inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.service_title?.toLowerCase().includes(search.toLowerCase()) ||
      inv.transaction_id?.toLowerCase().includes(search.toLowerCase())
    ),
    [invoices, search]
  )

  const totalInvoiced = useMemo(() =>
    invoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
    [invoices]
  )

  if (loading) return <div className="p-6"><TableSkeleton rows={6} /></div>

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Invoices</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{invoices.length} total invoices</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
          <FileText className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{invoices.length}</p>
          <p className="text-white/70 text-xs">Total Invoices</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
          <IndianRupee className="w-5 h-5 text-green-500 mb-1" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrencyINR(totalInvoiced)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Invoiced Amount</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
          <Download className="w-5 h-5 text-blue-500 mb-1" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{invoices.filter(i => i.status === 'paid').length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Paid Invoices</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card mb-5 p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by invoice number, customer, or service…"
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
              <tr>{['Invoice #', 'Service', 'Customer', 'Worker', 'Subtotal', 'GST', 'Total', 'TXN ID', 'Date', 'Action'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-primary-600 dark:text-primary-400 font-semibold">{inv.invoice_number || '—'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{inv.service_title || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{inv.customer_name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{inv.worker_name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{formatCurrencyINR(inv.subtotal || 0)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatCurrencyINR(inv.tax || 0)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">{formatCurrencyINR(inv.total || 0)}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-400">{inv.transaction_id?.slice(0, 14) || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{new Date(inv.created_at || inv.createdAt || Date.now()).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Link to={`/invoices/${inv.id}`} className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
                      <Eye className="w-3.5 h-3.5" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <FileText className="w-10 h-10 mx-auto mb-2" />
              <p>No invoices found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
