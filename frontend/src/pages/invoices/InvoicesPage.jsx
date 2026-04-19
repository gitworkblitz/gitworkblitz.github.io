import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getUserInvoices } from '../../services/firestoreService'
import { formatCurrencyINR } from '../../utils/dummyData'
import { TableSkeleton } from '../../components/SkeletonLoader'
import EmptyState from '../../components/EmptyState'
import { FileText as DocumentTextIcon, ArrowRight as ArrowRightIcon, Download, Receipt } from 'lucide-react'

export default function InvoicesPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  const loadInvoices = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getUserInvoices(user.uid)
      setInvoices(data.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')))
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }, [user])

  useEffect(() => {
    if (user) loadInvoices()
  }, [user, loadInvoices])

  if (loading) return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8"><TableSkeleton rows={3} /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">Invoices</h1>
          <p className="page-subtitle">View and download your invoices</p>
        </div>
        {invoices.length > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No invoices yet"
          description="Invoices are generated automatically after payment"
        />
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => (
            <Link key={inv.id} to={`/invoices/${inv.id}`}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5 flex items-center justify-between hover:shadow-card-hover transition-all group block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{inv.service_title || 'Service'}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{inv.invoice_number}</p>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{inv.booking_date || ''}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">{formatCurrencyINR(inv.total || 0)}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(inv.createdAt || inv.created_at || Date.now()).toLocaleDateString()}</p>
                </div>
                <span className="badge-paid">Paid</span>
                <ArrowRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
