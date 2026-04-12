import React, { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { applyToJob } from '../services/firestoreService'
import { formatSalaryRange } from '../utils/dummyData'
import { MapPinIcon, ClockIcon, CurrencyRupeeIcon, AcademicCapIcon, BriefcaseIcon, StarIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, StarIcon as StarSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

const JobCard = React.memo(function JobCard({ job, featured = false }) {
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  const [applied, setApplied] = useState(false)
  const [applying, setApplying] = useState(false)

  const handleApply = useCallback(async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { navigate('/login'); return }
    if (applied || applying) return

    setApplying(true)
    try {
      await applyToJob({
        jobId: job.id,
        userId: user.uid,
        userName: userProfile?.name || user.displayName || 'User',
        applicantName: userProfile?.name || user.displayName || 'User',
        applicantEmail: user.email || '',
        userEmail: user.email || '',
        jobTitle: job.title || '',
        company: job.company || '',
        employerId: job.employer_id || job.posted_by || '',
        location: userProfile?.location || '',
      })
      setApplied(true)
      toast.success('Applied Successfully! Check your applications.')
    } catch (err) {
      if (err.message?.includes('already applied')) {
        setApplied(true)
        toast.error('You have already applied to this job')
      } else {
        toast.error(err.message || 'Failed to apply. Please try again.')
      }
    } finally {
      setApplying(false)
    }
  }, [user, userProfile, job, applied, applying, navigate])

  const postedDaysAgo = () => {
    if (!job.createdAt) return 'Recently posted'
    const days = Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Posted today'
    if (days === 1) return '1 day ago'
    if (days <= 7) return `${days} days ago`
    return `${Math.ceil(days / 7)} weeks ago`
  }

  const getLogoColor = (name) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-emerald-500 to-emerald-600',
      'from-violet-500 to-violet-600',
      'from-rose-500 to-rose-600',
      'from-amber-500 to-amber-600',
      'from-cyan-500 to-cyan-600',
      'from-indigo-500 to-indigo-600',
    ]
    let hash = 0
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  const logoColorClass = getLogoColor(job.company)
  const initials = (job.company || 'C').substring(0, 2).toUpperCase()
  const typeLabel = (job.employment_type || job.type || 'full_time').replace(/_/g, ' ')

  const typeBadgeColor = {
    internship: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800',
    part_time: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
    contract: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
    remote: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800',
  }
  const badgeClass = typeBadgeColor[job.employment_type] || 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 flex flex-col group relative overflow-hidden ${featured ? 'ring-2 ring-primary-500 ring-opacity-50' : ''}`}>
      
      {featured && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-primary-600 to-primary-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
          <StarSolid className="w-3 h-3" /> FEATURED
        </div>
      )}

      <div className="flex gap-3 items-start mb-3">
        <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-base shadow-sm bg-gradient-to-br ${logoColorClass} text-white`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0 pr-16">
          <Link to={`/jobs/${job.id}`} className="font-semibold text-base text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-1 leading-snug">
            {job.title}
          </Link>
          <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mt-0.5 line-clamp-1">{job.company}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md border uppercase tracking-wide whitespace-nowrap flex-shrink-0 ${badgeClass}`}>
          {typeLabel}
        </span>
      </div>

      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3 gap-1.5">
        <MapPinIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <span className="truncate">{job.location}</span>
        <span className="mx-1">•</span>
        <ClockIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <span className="truncate">{postedDaysAgo()}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700/50">
        <div>
          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mb-0.5">
            <CurrencyRupeeIcon className="w-3 h-3" /> Salary
          </span>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{formatSalaryRange(job.salary_min || 0, job.salary_max || 0)}</span>
        </div>
        <div>
          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mb-0.5">
            <AcademicCapIcon className="w-3 h-3" /> Experience
          </span>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{job.experience_required || 'Open'}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4 min-h-[28px]">
        {(job.skills_required || []).slice(0, 4).map(s => (
          <span key={s} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-2.5 py-1 rounded-full font-medium">{s}</span>
        ))}
        {(job.skills_required || []).length > 4 && (
          <span className="bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full">+{job.skills_required.length - 4}</span>
        )}
      </div>

      <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full font-medium">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          Active
        </span>

        {applied ? (
          <span className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 text-sm font-semibold bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-lg">
            <CheckCircleIcon className="w-4 h-4" /> Applied
          </span>
        ) : (
          <button
            onClick={handleApply}
            disabled={applying}
            className="bg-primary-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-1.5 min-w-[100px] shadow-sm hover:shadow-md"
          >
            {applying ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Applying…</span>
              </>
            ) : (
              <>
                <BriefcaseIcon className="w-4 h-4" />
                <span>Apply Now</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
})

export default JobCard
