import React, { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { applyToGig } from '../services/firestoreService'
import { formatCurrencyINR } from '../utils/dummyData'
import { MapPinIcon, ClockIcon, StarIcon as StarOutline } from '@heroicons/react/24/outline'
import { CheckCircleIcon, StarIcon as StarSolid, CurrencyRupeeIcon, CalendarIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

const GigCard = React.memo(function GigCard({ gig }) {
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  const [applied, setApplied] = useState(false)
  const [applying, setApplying] = useState(false)

  const isAssignedToMe = gig.assignedTo === user?.uid
  const isOpen = gig.status === 'open' || gig.status === 'active'

  const handleApply = useCallback(async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { navigate('/login'); return }
    if (applied || applying) return

    setApplying(true)
    try {
      await applyToGig({
        gigId: gig.id,
        userId: user.uid,
        userName: userProfile?.name || user.displayName || 'User',
        applicantName: userProfile?.name || user.displayName || 'User',
        userEmail: user.email || '',
        message: '',
        gigTitle: gig.title || '',
        employerId: gig.employer_id || gig.posted_by || '',
      })
      setApplied(true)
      toast.success('Proposal Submitted Successfully!')
    } catch (err) {
      if (err.message?.includes('already applied')) {
        setApplied(true)
        toast.error('You have already applied to this gig')
      } else {
        toast.error(err.message || 'Failed to submit proposal')
      }
    } finally {
      setApplying(false)
    }
  }, [user, userProfile, gig, applied, applying, navigate])

  const postedDaysAgo = () => {
    if (!gig.createdAt) return 'Recently'
    const days = Math.floor((Date.now() - new Date(gig.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return '1 day ago'
    return `${days} days ago`
  }

  const clientRating = gig.client_details?.rating || 4.5
  const clientProjects = gig.client_details?.jobs_posted || gig.client_details?.projects_posted || 0

  const categoryColor = {
    'Web Development': 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'Mobile Development': 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
    'UI/UX Design': 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400 border-pink-200 dark:border-pink-800',
    'Data Science & AI': 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400 border-violet-200 dark:border-violet-800',
    'Digital Marketing': 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    'DevOps & Cloud': 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400 border-sky-200 dark:border-sky-800',
    'Writing': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    'Graphic Design': 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    'Video Production': 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    'Cybersecurity': 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
    'Data Entry': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  }
  const catClass = categoryColor[gig.category] || 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'

  const budget = Number(gig.price || gig.budget || 0)
  const isHighBudget = budget >= 15000

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col group relative overflow-hidden">
      
      {isHighBudget && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-green-600 to-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
          <CurrencyRupeeIcon className="w-3 h-3" /> HIGH BUDGET
        </div>
      )}

      <div className="flex items-center justify-between mb-3 gap-2">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${catClass}`}>
          {gig.category || 'General'}
        </span>
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border ${
          gig.status === 'open' || !gig.status
            ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
            : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
        }`}>
          {(gig.status || 'OPEN').toUpperCase()}
        </span>
      </div>

      <Link to={`/gigs/${gig.id}`} className="group-hover:text-primary-600 transition-colors mb-1">
        <h3 className="font-semibold text-base text-gray-900 dark:text-white group-hover:text-primary-600 line-clamp-2 leading-snug">
          {gig.title}
        </h3>
      </Link>

      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
        <ClockIcon className="w-3.5 h-3.5" />
        <span>{postedDaysAgo()}</span>
        {gig.duration && (
          <>
            <span>•</span>
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{gig.duration}</span>
          </>
        )}
        {gig.deadline && (
          <>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400">Due: {gig.deadline}</span>
          </>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">
        {gig.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4 min-h-[24px]">
        {(gig.skills || []).slice(0, 4).map(s => (
          <span key={s} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">
            {s}
          </span>
        ))}
        {(gig.skills || []).length > 4 && (
          <span className="bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full">+{gig.skills.length - 4}</span>
        )}
      </div>

      <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-1.5 rounded-lg">
            <CurrencyRupeeIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Budget</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrencyINR(budget)}</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 font-medium">
          <StarSolid className="w-4 h-4 text-amber-400" />
          <span>{clientRating}</span>
          <span className="text-xs text-gray-400">({clientProjects} projects)</span>
        </div>

        {applied ? (
          <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 py-2 px-4 rounded-xl font-medium text-sm flex items-center gap-1.5 cursor-not-allowed flex-shrink-0">
            <CheckCircleIcon className="w-4 h-4 text-green-500" /> Applied
          </span>
        ) : isAssignedToMe ? (
          <span className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 py-2 px-4 rounded-xl font-medium text-sm flex items-center gap-1.5 flex-shrink-0">
            <CheckCircleIcon className="w-4 h-4" /> Active
          </span>
        ) : isOpen ? (
          <button
            onClick={handleApply}
            disabled={applying}
            className="bg-primary-600 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md flex-shrink-0"
          >
            {applying ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting…</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4" />
                <span>Apply</span>
              </>
            )}
          </button>
        ) : (
          <Link to={`/gigs/${gig.id}`} className="border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium px-5 py-2 rounded-xl transition-colors flex-shrink-0">
            View
          </Link>
        )}
      </div>
    </div>
  )
})

export default GigCard
