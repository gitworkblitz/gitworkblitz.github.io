import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  EnvelopeIcon, PhoneIcon, MapPinIcon, ClockIcon,
  PaperAirplaneIcon, CheckCircleIcon, ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const contactInfo = [
  { icon: EnvelopeIcon, label: 'Email', value: 'support@worksphere.in', href: 'mailto:support@worksphere.in' },
  { icon: PhoneIcon, label: 'Phone', value: '+91 11-4567-8900', href: 'tel:+911145678900' },
  { icon: MapPinIcon, label: 'Address', value: 'WorkSphere HQ, Connaught Place, New Delhi 110001, India' },
  { icon: ClockIcon, label: 'Business Hours', value: 'Mon-Sat: 9:00 AM - 7:00 PM IST' },
]

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields')
      return
    }
    setSending(true)
    // Simulate API call
    await new Promise(r => setTimeout(r, 1200))
    setSubmitted(true)
    setSending(false)
    toast.success('Message sent successfully!')
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Message Sent!</h2>
          <p className="text-gray-500 mb-6">Thank you for reaching out. We'll get back to you within 24 hours.</p>
          <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
            className="btn-primary">Send Another Message</button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.12 } } }}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm font-medium text-primary-100 mb-6">
              <ChatBubbleLeftRightIcon className="w-4 h-4" /> Get In Touch
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold mb-4">Contact Us</motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-primary-100 max-w-2xl mx-auto">
              Have a question, feedback, or need help? We'd love to hear from you.
            </motion.p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-50" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* Content */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Contact Information</h2>
                <p className="text-gray-500 text-sm">Reach out and we'll respond as soon as we can.</p>
              </div>
              {contactInfo.map(({ icon: Icon, label, value, href }, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-sm">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm text-gray-900 font-medium hover:text-primary-600 transition-colors">{value}</a>
                    ) : (
                      <p className="text-sm text-gray-900 font-medium">{value}</p>
                    )}
                  </div>
                </motion.div>
              ))}

              <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
                <h3 className="font-semibold mb-2">Need Urgent Help?</h3>
                <p className="text-primary-100 text-sm mb-4">Our support team is available for critical issues.</p>
                <a href="tel:+911145678900" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                  <PhoneIcon className="w-4 h-4" /> Call Now
                </a>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-card p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Name <span className="text-red-500">*</span></label>
                      <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className="input-field" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="input-field" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                    <input name="subject" value={form.subject} onChange={handleChange} placeholder="What's this about?" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Message <span className="text-red-500">*</span></label>
                    <textarea name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Tell us more…" className="input-field resize-none" required />
                  </div>
                  <button type="submit" disabled={sending} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                    {sending ? (
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending…</>
                    ) : (
                      <><PaperAirplaneIcon className="w-5 h-5" /> Send Message</>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
