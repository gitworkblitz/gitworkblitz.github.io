import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { queryDocuments } from '../../services/firestoreService'
import { dummyGigs, formatCurrencyINR } from '../../utils/dummyData'
import { ListSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import {
  RocketLaunchIcon, UserGroupIcon, CurrencyRupeeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export default function MyGigs() {
  const { user } = useAuth()
  const [gigs, setGigs] = useState([])
  const [applicantCounts, setApplicantCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadGigs = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await queryDocuments('gigs', 'employer_id', '==', user.uid)
      const gigList = data.length > 0 ? data : dummyGigs
      setGigs(gigList)

      // Batch fetch all applicant counts for this employer in ONE query (removes N+1 delay)
      const allApps = await queryDocuments('gig_applications', 'employerId', '==', user.uid).catch(() => [])
      const countMap = {}
      gigList.forEach(gig => {
        countMap[gig.id] = allApps.filter(a => a.gigId === gig.id).length
      })
      setApplicantCounts(countMap)
    } catch (err) {
      console.error(err)
      setError('Failed to load gigs')
      setGigs(dummyGigs.slice(0, 2))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { if (user) loadGigs() }, [user, loadGigs])

  // Memoized summary
  const gigStats = useMemo(() => ({
    total: gigs.length,
    open: gigs.filter(g => g.status === 'open' || g.status === 'active').length,
    inProgress: gigs.filter(g => g.status === 'in-progress').length,
    completed: gigs.filter(g => g.status === 'completed').length,
    totalApplicants: Object.values(applicantCounts).reduce((s, c) => s + c, 0),
    totalBudget: gigs.reduce((sum, g) => sum + (g.budget || g.price || 0), 0),
  }), [gigs, applicantCounts])

  const getStatusStyle = useCallback((status) => {
    const styles = {
      open: { label: 'Open', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', dot: 'bg-green-500' },
      active: { label: 'Active', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', dot: 'bg-green-500' },
      'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', dot: 'bg-blue-500' },
      completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', dot: 'bg-emerald-500' },
      closed: { label: 'Closed', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', dot: 'bg-gray-400' },
    }
    return styles[status] || styles.open
  }, [])

  if (loading) return (
    <div>
      <div className="mb-6">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-2"></div>
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
      </div>
      <ListSkeleton count={4} />
    </div>
  )
  if (error) return <ErrorState title="Error Loading Gigs" message={error} onRetry={loadGigs} />

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">My Gigs</h1>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span>{gigStats.total} gigs posted</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="flex items-center gap-1">
              <span className="status-dot bg-green-500" />
              {gigStats.open} open
            </span>
            {gigStats.inProgress > 0 && (
              <span className="flex items-center gap-1">
                <span className="status-dot bg-blue-500" />
                {gigStats.inProgress} in progress
              </span>
            )}
            <span className="flex items-center gap-1">
              <UserGroupIcon className="w-3.5 h-3.5" />
              {gigStats.totalApplicants} applicants
            </span>
          </div>
        </div>
        <Link to="/gigs/create" className="btn-primary text-sm">+ Post Gig</Link>
      </div>

      {gigs.length === 0 ? (
        <EmptyState
          icon={RocketLaunchIcon}
          title="No gigs posted yet"
          description="Post your first freelance gig to start receiving proposals"
          actionLabel="Post Your First Gig"
          actionTo="/gigs/create"
        />
      ) : (
        <div className="space-y-4">
          {gigs.map((g, i) => {
            const appCount = applicantCounts[g.id] ?? 0
            const statusStyle = getStatusStyle(g.status)
            return (
              <div key={g.id} className="stat-card dash-card-enter bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5 group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="stat-icon-glow w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <RocketLaunchIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base group-hover:text-primary-600 transition-colors">{g.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          <span>{g.category || 'General'}</span>
                          {g.location && <span>• {g.location}</span>}
                          {g.duration && <span>• {g.duration}</span>}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(g.skills || []).slice(0, 5).map(s => (
                            <span key={s} className="text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-primary-600 flex items-center gap-0.5">
                        <CurrencyRupeeIcon className="w-4 h-4" />
                        {formatCurrencyINR(g.budget || g.price || 0)}
                      </p>
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium mt-1 capitalize ${statusStyle.color}`}>
                        <span className={`status-dot ${statusStyle.dot}`} />
                        {statusStyle.label}
                      </span>
                    </div>

                    <Link
                      to={`/gigs/${g.id}/applicants`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all shadow-sm hover:shadow-md"
                    >
                      <UserGroupIcon className="w-4 h-4" />
                      {appCount} Applicant{appCount !== 1 ? 's' : ''}
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
