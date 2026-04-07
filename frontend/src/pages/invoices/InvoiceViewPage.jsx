import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getDocument, getBookingInvoice } from '../../services/firestoreService'
import { formatCurrencyINR } from '../../utils/dummyData'
import { DetailSkeleton } from '../../components/SkeletonLoader'
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline'

export default function InvoiceViewPage() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInvoice()
  }, [id])

  const loadInvoice = async () => {
    setLoading(true)
    try {
      const inv = await getDocument('invoices', id)
      setInvoice(inv)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => window.print()

  if (loading) return <DetailSkeleton />

  if (!invoice) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Invoice Not Found</h2>
        <Link to="/invoices" className="btn-primary mt-4">Go to Invoices</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Actions bar */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link to="/invoices" className="text-sm text-primary-600 hover:text-primary-700">← Back to Invoices</Link>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn-secondary text-sm flex items-center gap-1.5">
            <PrinterIcon className="w-4 h-4" /> Print
          </button>
          <button onClick={handlePrint} className="btn-primary text-sm flex items-center gap-1.5">
            <ArrowDownTrayIcon className="w-4 h-4" /> Download
          </button>
        </div>
      </div>

      {/* Invoice document */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">WS</span>
              </div>
              <div>
                <p className="text-white font-bold text-lg">WorkSphere</p>
                <p className="text-primary-200 text-xs">Tax Invoice</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-lg">INVOICE</p>
              <p className="text-primary-200 text-xs font-mono">{invoice.invoice_number}</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Date & Status */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-400 uppercase">Date</p>
              <p className="text-sm font-medium text-gray-900">{new Date(invoice.createdAt || invoice.created_at || Date.now()).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <span className="badge-paid px-3 py-1.5">Paid</span>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs text-gray-400 uppercase mb-2">Bill To</p>
              <p className="font-semibold text-gray-900">{invoice.customer_name || 'Customer'}</p>
              <p className="text-sm text-gray-500">{invoice.address || ''}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase mb-2">Service Provider</p>
              <p className="font-semibold text-gray-900">{invoice.worker_name || 'Worker'}</p>
            </div>
          </div>

          {/* Items table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3 rounded-l-lg">Description</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Time</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase px-4 py-3 rounded-r-lg">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900">{invoice.service_title || 'Service'}</p>
                    <p className="text-xs text-gray-400">Booking: {invoice.booking_id?.slice(0, 12)}...</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{invoice.booking_date || 'N/A'}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{invoice.time_slot || 'N/A'}</td>
                  <td className="px-4 py-4 text-right font-medium text-gray-900">{formatCurrencyINR(invoice.subtotal || 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">{formatCurrencyINR(invoice.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">GST (18%)</span>
                <span className="text-gray-900">{formatCurrencyINR(invoice.tax || 0)}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-3">
                <span className="text-gray-900">Total</span>
                <span className="text-primary-600">{formatCurrencyINR(invoice.total || 0)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">Thank you for using WorkSphere!</p>
            <p className="text-xs text-gray-400 mt-1">This is a computer-generated invoice and does not require a signature.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
