import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExclamationTriangleIcon, CheckCircleIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const issueTypes = [
  'Bug / Technical Issue',
  'Payment / Billing Issue',
  'Booking Problem',
  'Account / Login Issue',
  'Service Provider Complaint',
  'Inappropriate Content',
  'Safety Concern',
  'Other',
]

const priorityLevels = [
  { value: 'low', label: 'Low', desc: 'Minor inconvenience', color: 'border-green-300 bg-green-50 text-green-700' },
  { value: 'medium', label: 'Medium', desc: 'Affects functionality', color: 'border-yellow-300 bg-yellow-50 text-yellow-700' },
  { value: 'high', label: 'High', desc: 'Critical / Blocking', color: 'border-red-300 bg-red-50 text-red-700' },
]

export default function ReportIssuePage() {
  const [form, setForm] = useState({ type: '', priority: 'medium', title: '', description: '', email: '' })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.type || !form.title || !form.description) {
      toast.error('Please fill in all required fields')
      return
    }
    setSending(true)
    // Instant — no artificial delay
    setSubmitted(true)
    setSending(false)
    toast.success('Issue reported successfully!')
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Issue Reported!</h2>
          <p className="text-gray-500 mb-2">Ticket ID: <span className="font-mono font-bold text-primary-600">WS-{Date.now().toString().slice(-6)}</span></p>
          <p className="text-gray-500 mb-6">Our team will review your issue and get back to you within 24-48 hours.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setSubmitted(false); setForm({ type: '', priority: 'medium', title: '', description: '', email: '' }) }} className="btn-secondary">Report Another</button>
            <Link to="/help" className="btn-primary">Help Center</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-600 to-red-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm font-medium text-red-100 mb-4">
            <ExclamationTriangleIcon className="w-4 h-4" /> Report
          </div>
          <h1 className="text-4xl font-extrabold mb-3">Report an Issue</h1>
          <p className="text-red-100 text-lg">Found a bug or have a problem? Let us know so we can fix it.</p>
        </div>
      </section>

      {/* Form */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Issue type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Issue Type <span className="text-red-500">*</span></label>
                <select name="type" value={form.type} onChange={handleChange} className="input-field" required>
                  <option value="">Select an issue type…</option>
                  {issueTypes.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <div className="grid grid-cols-3 gap-3">
                  {priorityLevels.map(p => (
                    <button type="button" key={p.value} onClick={() => setForm(f => ({ ...f, priority: p.value }))}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${form.priority === p.value ? p.color + ' border-current' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                      <p className="font-semibold text-sm">{p.label}</p>
                      <p className="text-xs mt-0.5 opacity-75">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Title <span className="text-red-500">*</span></label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="Brief summary of the issue" className="input-field" required />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={5} placeholder="Please describe the issue in detail. Include steps to reproduce the problem if applicable." className="input-field resize-none" required />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com (for follow-up)" className="input-field" />
              </div>

              <button type="submit" disabled={sending} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {sending ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                ) : (
                  <><PaperAirplaneIcon className="w-5 h-5" /> Submit Report</>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
