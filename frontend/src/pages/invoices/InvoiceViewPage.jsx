import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getDocument } from '../../services/firestoreService'
import { formatCurrencyINR } from '../../utils/dummyData'
import { DetailSkeleton } from '../../components/SkeletonLoader'
import { ArrowDownTrayIcon, PrinterIcon, ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

export default function InvoiceViewPage() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const invoiceRef = useRef(null)

  useEffect(() => { loadInvoice() }, [id])

  const loadInvoice = async () => {
    setLoading(true)
    try {
      const inv = await getDocument('invoices', id)
      setInvoice(inv)
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const element = invoiceRef.current
      if (!element) return

      const printCSS = document.createElement('style')
      printCSS.id = 'invoice-print-style'
      printCSS.textContent = `
        @media print {
          body * { visibility: hidden; }
          #invoice-print-area, #invoice-print-area * { visibility: visible; }
          #invoice-print-area { position: fixed; left: 0; top: 0; width: 100%; background: white !important; }
          .no-print { display: none !important; }
        }
      `
      document.head.appendChild(printCSS)
      
      window.print()
      
      setTimeout(() => {
        const el = document.getElementById('invoice-print-style')
        if (el) el.remove()
      }, 1000)
    } catch (err) {
      console.error('Download error:', err)
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) return <DetailSkeleton />

  if (!invoice) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <DocumentTextIcon className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invoice Not Found</h2>
        <p className="text-gray-500 mb-6">This invoice doesn't exist or you don't have access.</p>
        <Link to="/invoices" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeftIcon className="w-4 h-4" /> Go to Invoices
        </Link>
      </div>
    )
  }

  const invoiceDate = new Date(invoice.createdAt || invoice.created_at || Date.now())

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6 no-print">
        <Link
          to="/invoices"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors group"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Invoices
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="btn-secondary text-sm flex items-center gap-1.5"
          >
            <PrinterIcon className="w-4 h-4" /> Print
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn-primary text-sm flex items-center gap-1.5"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="w-4 h-4" /> Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div id="invoice-print-area" ref={invoiceRef} className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-8 py-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">WS</span>
              </div>
              <div>
                <p className="text-white font-bold text-xl">WorkSphere</p>
                <p className="text-primary-200 text-xs tracking-wide">TAX INVOICE</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-lg">INVOICE</p>
              <p className="text-primary-200 text-sm font-mono">{invoice.invoice_number}</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-100">
            <div className="space-y-1">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Invoice Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {invoiceDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Booking Ref</p>
                <p className="text-sm font-mono text-gray-600">{invoice.booking_id?.slice(0, 16) || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="font-bold text-sm">PAID</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Bill To</p>
              <p className="font-bold text-gray-900 text-base">{invoice.customer_name || 'Customer'}</p>
              {invoice.address && <p className="text-sm text-gray-500 mt-0.5">{invoice.address}</p>}
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Service Provider</p>
              <p className="font-bold text-gray-900 text-base">{invoice.worker_name || 'Worker'}</p>
              <p className="text-sm text-gray-500 mt-0.5">WorkSphere Verified Professional</p>
            </div>
          </div>

          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 rounded-lg">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 rounded-l-lg">
                    Description
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Date
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Time Slot
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 rounded-r-lg">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-5">
                    <p className="font-semibold text-gray-900">{invoice.service_title || 'Service'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Professional service booking</p>
                  </td>
                  <td className="px-4 py-5 text-sm text-gray-600">{invoice.booking_date || 'N/A'}</td>
                  <td className="px-4 py-5 text-sm text-gray-600">{invoice.time_slot || 'N/A'}</td>
                  <td className="px-4 py-5 text-right font-semibold text-gray-900">
                    {formatCurrencyINR(invoice.subtotal || 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-8">
            <div className="w-72 bg-gray-50 rounded-xl p-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900">{formatCurrencyINR(invoice.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">GST (18%)</span>
                <span className="font-medium text-gray-900">{formatCurrencyINR(invoice.tax || 0)}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-3 mt-1">
                <span className="text-gray-900">Total Paid</span>
                <span className="text-primary-600 text-lg">{formatCurrencyINR(invoice.total || 0)}</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center gap-3 mb-8">
            <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Payment Confirmed</p>
              <p className="text-xs text-green-600">Payment received via WorkSphere secure gateway</p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 text-center">
            <p className="text-sm font-semibold text-gray-700">Thank you for using WorkSphere!</p>
            <p className="text-xs text-gray-400 mt-1">
              This is a computer-generated invoice and does not require a physical signature.
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              For queries, contact support@worksphere.in
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
