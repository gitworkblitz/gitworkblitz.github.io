import React, { useState, useEffect, useCallback } from 'react'
import useSEO from '../../hooks/useSEO'
import { useParams, useNavigate } from 'react-router-dom'
import { getDocument } from '../../services/firestoreService'
import { dummyWorkers, formatCurrencyINR } from '../../utils/dummyData'
import { PageSkeleton } from '../../components/SkeletonLoader'
import { MapPinIcon, CheckBadgeIcon, ShieldCheckIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'

export default function WorkerProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [worker, setWorker] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadWorker = useCallback(async () => {
    // 1. Instant Cache Match (Zero Delay)
    const cached = dummyWorkers.find(w => w.id === id)
    if (cached) {
      setWorker(cached)
      setLoading(false)
    } else {
      setLoading(true)
    }

    // 2. Background Sync
    try {
      let data = await getDocument('users', id).catch(() => null)
      if (data && data.user_type === 'worker') {
        setWorker(data)
      }
    } catch (err) {
      console.error("Error loading worker profile:", err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadWorker()
  }, [loadWorker])

  useSEO({
    title: worker ? `${worker.name} - ${worker.category || 'Professional'} | WorkSphere` : 'Worker Profile | WorkSphere',
    description: worker ? `Hire ${worker.name}, an expert ${worker.category || 'professional'} on WorkSphere.` : 'View professional worker profiles on WorkSphere.',
    keywords: worker ? `${worker.name}, ${worker.category}, worksphere, hire professional` : 'worksphere worker, hire',
  })

  if (loading) return <PageSkeleton />

  if (!worker) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Worker Not Found</h2>
        <p className="text-gray-500 mb-6">The professional you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate('/find-workers')} className="btn-primary">Browse Professionals</button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <button onClick={() => navigate(-1)} className="text-sm font-medium text-gray-500 hover:text-primary-600 mb-6 flex items-center gap-1 transition-colors">
        <span>&larr;</span> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Profile info */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-card border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col md:flex-row gap-6 md:items-center">
              
              {/* Avatar */}
              <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full ${worker.avatar_color || 'bg-primary-600'} flex items-center justify-center text-white font-bold text-4xl shadow-lg flex-shrink-0 mx-auto md:mx-0`}>
                {(worker.name || 'W')[0]}
              </div>
              
              {/* Core Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{worker.name}</h1>
                  <CheckBadgeIcon className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 dark:text-gray-400 mb-4">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{worker.location || 'India'}</span>
                </div>
                
                {/* Category Badge */}
                <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/50">
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>{worker.category || 'Verified Professional'}</span>
                </div>
              </div>

            </div>

            <hr className="my-8 border-gray-100 dark:border-gray-800" />

            {/* BIO */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About Me</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {worker.bio || `Hi, I am ${worker.name}, a professional ${worker.category || 'service provider'} with ${worker.experience_years || 0} years of experience.`}
              </p>
            </div>
          </motion.div>

          {/* DYNAMIC SERVICES SECTION */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-card border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary-500 rounded-full inline-block"></span>
              Offered Services
            </h3>
            
            {worker.services && worker.services.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {worker.services.map((service, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex items-center gap-3 transition-colors hover:border-primary-200">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{service}</span>
                  </div>
                ))}
              </div>
            ) : (
              (worker.skills && worker.skills.length > 0) ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {worker.skills.map((skill, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{skill}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">No specific services listed.</p>
              )
            )}
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Stats & CTA */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-card border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Professional Stats</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Rating</span>
                <div className="flex items-center gap-1 font-bold text-gray-900 dark:text-white">
                  <StarSolid className="w-4 h-4 text-yellow-400" />
                  {worker.rating || 'N/A'}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Experience</span>
                <span className="font-bold text-gray-900 dark:text-white">{worker.experience_years || 0} Years</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Jobs Completed</span>
                <span className="font-bold text-gray-900 dark:text-white">{worker.completion_rate || 0}% Rate</span>
              </div>
            </div>

            <hr className="my-6 border-gray-100 dark:border-gray-800" />
            
            <div className="mb-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-bold mb-1">Starting From</p>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {formatCurrencyINR(worker.hourly_rate || 500)}<span className="text-sm text-gray-400 font-normal">/hr</span>
              </p>
            </div>

            <button onClick={() => navigate('/services')} className="w-full btn-primary py-3 justify-center mb-3">
              Book a Service
            </button>
            <button className="w-full btn-secondary py-3 justify-center text-sm font-medium flex items-center gap-2">
              <EnvelopeIcon className="w-4 h-4" /> Message Direct
            </button>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
