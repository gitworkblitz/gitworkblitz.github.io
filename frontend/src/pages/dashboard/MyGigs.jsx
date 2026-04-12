import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { queryDocuments } from '../../services/firestoreService'
import { dummyGigs, formatCurrencyINR } from '../../utils/dummyData'
import { TableSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { ListSkeleton } from '../../components/SkeletonLoader'
import { RocketLaunchIcon, UserGroupIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline'

export default function MyGigs() {
  const { user } = useAuth()
  const [gigs, setGigs] = useState([])
  const [applicantCounts, setApplicantCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadGigs = useCallback(async () => {
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">My Gigs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{gigs.length} gigs posted</p>
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
          {gigs.map(g => {
            const appCount = applicantCounts[g.id] ?? 0
            return (
              <div key={g.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <RocketLaunchIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base">{g.title}</h3>
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
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium mt-0.5 inline-block capitalize ${
                        g.status === 'active' || g.status === 'open'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : g.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {g.status || 'open'}
                      </span>
                    </div>

                    <Link
                      to={`/gigs/${g.id}/applicants`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow-sm"
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
