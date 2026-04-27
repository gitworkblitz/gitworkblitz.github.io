import React, { useState, useEffect, useRef, useCallback } from 'react'
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

  useEffect(() => {
    let cancelled = false
    let retries = 0
    const tryLoad = async () => {
      try {
        const inv = await getDocument('invoices', id)
        if (cancelled) return
        if (inv) {
          setInvoice(inv)
          setLoading(false)
        } else if (retries < 4) {
          // Retry for freshly-created invoices that may not be available yet
          retries++
          console.log(`[Invoice] Retry ${retries}/4 for invoice ${id}`)
          setTimeout(tryLoad, 800)
        } else {
          setLoading(false)
        }
      } catch (err) {
        if (cancelled) return
        if (retries < 4) {
          retries++
          setTimeout(tryLoad, 800)
        } else {
          setLoading(false)
        }
      }
    }
    tryLoad()
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    document.title = invoice
      ? `Invoice ${invoice.invoice_number} | WorkSphere`
      : 'Invoice | WorkSphere'
  }, [invoice])

  const handleDownload = useCallback(async () => {
    setDownloading(true)
    try {
      const element = invoiceRef.current
      if (!element) return

      const html2pdf = (await import('html2pdf.js')).default
      
      const opt = {
        margin:       10,
        filename:     `${invoice?.invoice_number || 'receipt'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }

      // Hide the action bar for the print
      const noPrintElements = element.querySelectorAll('.no-print')
      noPrintElements.forEach(el => el.style.display = 'none')

      await html2pdf().set(opt).from(element).save()

      // Restore
      noPrintElements.forEach(el => el.style.display = '')

    } catch (err) {
      console.error('Download error:', err)
    } finally {
      setDownloading(false)
    }
  }, [invoice])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

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
  const gstRate = 18
  const companyGSTIN = 'XXXXXXXXXXXX' // placeholder
  const companyPAN = 'XXXXXXXXXX'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 no-print">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Dashboard
          </Link>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
          <Link
            to="/invoices"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            All Invoices
          </Link>
        </div>
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

      {/* Invoice Document */}
      <div id="invoice-print-area" ref={invoiceRef} className="bg-white mx-auto max-w-2xl rounded-2xl shadow-card border border-gray-100 overflow-hidden font-sans">
        
        {/* Simple Clean Header */}
        <div className="p-8 pb-0 text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary-100">
            <span className="text-primary-600 font-bold text-2xl tracking-tighter">WS</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">WorkSphere</h1>
          <p className="text-gray-500 text-sm mt-1">Payment Receipt</p>
          <div className="mt-6 inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full border border-green-200">
            <CheckCircleIcon className="w-4 h-4" />
            <span className="font-bold text-sm tracking-wide">PAID</span>
          </div>
        </div>

        <div className="p-8">
          {/* Main Total */}
          <div className="text-center mb-8 pb-8 border-b border-gray-100">
            <p className="text-5xl font-extrabold text-gray-900 tracking-tight">{formatCurrencyINR(invoice.total || 0)}</p>
            <p className="text-gray-500 mt-2 text-sm">{invoiceDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Receipt Number</p>
              <p className="font-semibold text-gray-900 font-mono">{invoice.invoice_number}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Payment Method</p>
              <p className="font-semibold text-gray-900 capitalize">{invoice.payment_method || 'Online'}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Customer</p>
              <p className="font-semibold text-gray-900">{invoice.customer_name || 'Customer'}</p>
              {invoice.address && <p className="text-gray-500 text-xs mt-0.5 truncate">{invoice.address}</p>}
            </div>
            <div>
              <p className="text-gray-400 mb-1">Service Professional</p>
              <p className="font-semibold text-gray-900">{invoice.worker_name || 'Worker'}</p>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-4 text-base">Booking Details</h3>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-semibold text-gray-900">{invoice.service_title || 'Service'}</p>
                <p className="text-gray-500 text-xs mt-1">{invoice.booking_date} • {invoice.time_slot}</p>
              </div>
              <p className="font-medium text-gray-900">{formatCurrencyINR(invoice.subtotal || 0)}</p>
            </div>
            
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrencyINR(invoice.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>GST (18%)</span>
                <span>{formatCurrencyINR(invoice.tax || 0)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
                <span>Total Paid</span>
                <span>{formatCurrencyINR(invoice.total || 0)}</span>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center space-y-2">
            <p className="text-xs font-mono text-gray-400">TXN: {invoice.transaction_id || `TXN${invoice.booking_id?.slice(0, 8) || '00000000'}`}</p>
            <p className="text-xs text-gray-400 mt-4 pt-6 border-t border-gray-100">
              WorkSphere India Pvt. Ltd. | GSTIN: {companyGSTIN}<br/>
              Support: support@worksphere.in
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
