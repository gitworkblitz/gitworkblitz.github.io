import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { StarIcon, CheckCircleIcon, PaperAirplaneIcon, FaceSmileIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

const feedbackCategories = [
  'Overall Experience',
  'Service Quality',
  'User Interface',
  'Payment Process',
  'Customer Support',
  'Feature Request',
  'Other',
]

export default function FeedbackPage() {
  const [form, setForm] = useState({ category: '', rating: 0, message: '', name: '', email: '' })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.rating || !form.message) {
      toast.error('Please add a rating and message')
      return
    }
    setSending(true)
    // Instant — no artificial delay
    setSubmitted(true)
    setSending(false)
    toast.success('Thank you for your feedback!')
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaceSmileIcon className="w-10 h-10 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Thank You!</h2>
          <p className="text-gray-500 mb-6">Your feedback helps us make WorkSphere better for everyone. We truly appreciate your time.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setSubmitted(false); setForm({ category: '', rating: 0, message: '', name: '', email: '' }) }} className="btn-secondary">Send More Feedback</button>
            <Link to="/" className="btn-primary">Go Home</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm font-medium text-primary-100 mb-4">
            <FaceSmileIcon className="w-4 h-4" /> Feedback
          </div>
          <h1 className="text-4xl font-extrabold mb-3">We Value Your Feedback</h1>
          <p className="text-primary-100 text-lg">Help us improve WorkSphere by sharing your experience.</p>
        </div>
      </section>

      {/* Form */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">How would you rate your experience? <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button type="button" key={star} onClick={() => setForm(f => ({ ...f, rating: star }))}
                      className="transition-transform hover:scale-110">
                      {star <= form.rating ? (
                        <StarSolid className="w-10 h-10 text-yellow-400" />
                      ) : (
                        <StarIcon className="w-10 h-10 text-gray-300 hover:text-yellow-300" />
                      )}
                    </button>
                  ))}
                  <span className="ml-3 text-sm text-gray-500">
                    {form.rating === 0 && 'Select a rating'}
                    {form.rating === 1 && 'Poor'}
                    {form.rating === 2 && 'Fair'}
                    {form.rating === 3 && 'Good'}
                    {form.rating === 4 && 'Very Good'}
                    {form.rating === 5 && 'Excellent'}
                  </span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select name="category" value={form.category} onChange={handleChange} className="input-field">
                  <option value="">Select a category…</option>
                  {feedbackCategories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Feedback <span className="text-red-500">*</span></label>
                <textarea name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Tell us what you liked, what could be improved, or any suggestions you have…" className="input-field resize-none" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name (optional)</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email (optional)</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className="input-field" />
                </div>
              </div>

              <button type="submit" disabled={sending} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {sending ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                ) : (
                  <><PaperAirplaneIcon className="w-5 h-5" /> Submit Feedback</>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
