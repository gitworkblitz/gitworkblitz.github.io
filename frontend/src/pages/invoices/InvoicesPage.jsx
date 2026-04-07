import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getUserInvoices } from '../../services/firestoreService'
import { formatCurrencyINR } from '../../utils/dummyData'
import { TableSkeleton } from '../../components/SkeletonLoader'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

export default function InvoicesPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadInvoices()
  }, [user])

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const data = await getUserInvoices(user.uid)
      setInvoices(data.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')))
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8"><TableSkeleton rows={3} /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="page-header">Invoices</h1>
      <p className="page-subtitle">View and download your invoices</p>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-1">No invoices yet</p>
          <p className="text-gray-400 text-sm">Invoices are generated after payment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => (
            <Link key={inv.id} to={`/invoices/${inv.id}`}
              className="bg-white rounded-xl shadow-card border border-gray-100 p-5 flex items-center justify-between hover:shadow-card-hover transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{inv.service_title || 'Service'}</p>
                  <p className="text-xs text-gray-400 font-mono">{inv.invoice_number}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrencyINR(inv.total || 0)}</p>
                  <p className="text-xs text-gray-400">{new Date(inv.createdAt || inv.created_at || Date.now()).toLocaleDateString()}</p>
                </div>
                <span className="badge-paid">Paid</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
