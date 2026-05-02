import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MagnifyingGlassIcon, BookOpenIcon, CreditCardIcon, UserGroupIcon,
  WrenchScrewdriverIcon, ShieldCheckIcon, QuestionMarkCircleIcon,
  CalendarIcon, ChatBubbleLeftRightIcon, ArrowRightIcon
} from '@heroicons/react/24/outline'
import SEO from '../../components/SEO'
import { getPageSEO } from '../../data/seoData'

const categories = [
  { icon: UserGroupIcon, title: 'Account & Profile', desc: 'Manage your account settings, password, and profile information', articles: 12, color: 'bg-blue-50 text-blue-600' },
  { icon: CalendarIcon, title: 'Bookings & Scheduling', desc: 'Learn how to book, reschedule, and cancel appointments', articles: 8, color: 'bg-green-50 text-green-600' },
  { icon: CreditCardIcon, title: 'Payments & Billing', desc: 'Payment methods, refunds, invoices, and transaction issues', articles: 15, color: 'bg-purple-50 text-purple-600' },
  { icon: WrenchScrewdriverIcon, title: 'Services', desc: 'How to list, manage, and find services on WorkSphere', articles: 10, color: 'bg-orange-50 text-orange-600' },
  { icon: ShieldCheckIcon, title: 'Trust & Safety', desc: 'Verification, reviews, reporting, and safety guidelines', articles: 7, color: 'bg-red-50 text-red-600' },
  { icon: ChatBubbleLeftRightIcon, title: 'Jobs & Gigs', desc: 'Posting jobs, applying to gigs, and freelancing tips', articles: 9, color: 'bg-teal-50 text-teal-600' },
]

const popularArticles = [
  { title: 'How to create your first booking', category: 'Bookings' },
  { title: 'Setting up payment methods', category: 'Payments' },
  { title: 'How to post a service listing', category: 'Services' },
  { title: 'Understanding our cancellation policy', category: 'Bookings' },
  { title: 'How to get verified as a service provider', category: 'Trust & Safety' },
  { title: 'Downloading invoices and receipts', category: 'Payments' },
  { title: 'How the smart matching system works', category: 'Services' },
  { title: 'Resolving payment disputes', category: 'Payments' },
]

export default function HelpCenterPage() {
  const [search, setSearch] = useState('')

  const filteredArticles = popularArticles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen">
      <SEO {...getPageSEO('help')} />
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white py-20 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-sm font-medium text-primary-100 mb-6 shadow-sm">
            <BookOpenIcon className="w-4 h-4" /> Support Center
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">How can we help you?</h1>
          <p className="text-lg text-primary-100 mb-8">Search our knowledge base or browse categories below.</p>
          <div className="max-w-xl mx-auto relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search for help articles…"
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 text-sm focus:outline-none focus:ring-4 focus:ring-primary-400/30 shadow-lg" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-50 dark:bg-gray-950 pointer-events-none" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* Categories */}
      <section className="bg-gray-50 dark:bg-gray-950 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(({ icon: Icon, title, desc, articles, color }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all cursor-pointer group">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}><Icon className="w-6 h-6" /></div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{desc}</p>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{articles} articles</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="bg-white dark:bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Popular Articles</h2>
          <div className="space-y-3">
            {filteredArticles.map((article, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400">{article.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{article.category}</p>
                  </div>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-primary-600 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still need help */}
      <section className="bg-gray-50 dark:bg-gray-950 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Still need help?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Can't find what you're looking for? Our support team is here for you.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-primary px-6 py-3">Contact Support</Link>
            <Link to="/faq" className="btn-secondary px-6 py-3">View FAQ</Link>
            <Link to="/report-issue" className="btn-outline px-6 py-3">Report an Issue</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
