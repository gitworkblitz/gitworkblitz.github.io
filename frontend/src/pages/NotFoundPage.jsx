import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HomeIcon, ArrowLeftIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import SEO from '../components/SEO'
import { getPageSEO } from '../data/seoData'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <SEO {...getPageSEO('notFound')} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="relative mb-8">
          <span className="text-[120px] sm:text-[160px] font-extrabold text-gray-100 leading-none select-none">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center">
              <QuestionMarkCircleIcon className="w-10 h-10 text-primary-600" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved. Let us get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/"
            className="btn-primary flex items-center justify-center gap-2 px-6 py-3">
            <HomeIcon className="w-4 h-4" />
            Go Home
          </Link>
          <button onClick={() => window.history.back()}
            className="btn-secondary flex items-center justify-center gap-2 px-6 py-3">
            <ArrowLeftIcon className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  )
}
