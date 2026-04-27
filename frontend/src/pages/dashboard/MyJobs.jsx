import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { queryDocuments } from '../../services/firestoreService'
import { dummyJobs } from '../../utils/dummyData'
import { ListSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import {
  BriefcaseIcon, UserGroupIcon, MapPinIcon,
  ArrowRightIcon, ChartBarIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

export default function MyJobs() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [applicantCounts, setApplicantCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadJobs = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await queryDocuments('jobs', 'employer_id', '==', user.uid)
      const jobList = data.length > 0 ? data : dummyJobs
      setJobs(jobList)

      // Batch fetch all applicant counts for this employer in ONE query (removes N+1 delay)
      const allApps = await queryDocuments('job_applications', 'employerId', '==', user.uid).catch(() => [])
      const countMap = {}
      jobList.forEach(job => {
        countMap[job.id] = allApps.filter(a => a.jobId === job.id).length
      })
      setApplicantCounts(countMap)
    } catch (err) {
      console.error(err)
      setError('Failed to load jobs')
      setJobs(dummyJobs.slice(0, 2))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { if (user) loadJobs() }, [user, loadJobs])

  // Memoized summary
  const jobStats = useMemo(() => ({
    total: jobs.length,
    active: jobs.filter(j => j.is_active !== false).length,
    closed: jobs.filter(j => j.is_active === false).length,
    totalApplicants: Object.values(applicantCounts).reduce((s, c) => s + c, 0),
  }), [jobs, applicantCounts])

  if (loading) return (
    <div>
      <div className="mb-6">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-2"></div>
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
      </div>
      <ListSkeleton count={4} />
    </div>
  )
  if (error) return <ErrorState title="Error Loading Jobs" message={error} onRetry={loadJobs} />

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">My Jobs</h1>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span>{jobStats.total} jobs posted</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="flex items-center gap-1">
              <span className="status-dot bg-green-500" />
              {jobStats.active} active
            </span>
            <span className="flex items-center gap-1">
              <UserGroupIcon className="w-3.5 h-3.5" />
              {jobStats.totalApplicants} applicants
            </span>
          </div>
        </div>
        <Link to="/jobs/create" className="btn-primary text-sm">+ Post Job</Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          icon={BriefcaseIcon}
          title="No jobs posted yet"
          description="Post your first job listing to start receiving applicants"
          actionLabel="Post Your First Job"
          actionTo="/jobs/create"
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((j, i) => {
            const appCount = applicantCounts[j.id] ?? 0
            return (
              <div key={j.id} style={{ animationDelay: `${i * 0.05}s` }} className="animate-slide-up bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <BriefcaseIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link to={`/jobs/${j.id}`} className="font-semibold text-gray-900 dark:text-white text-base hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{j.title}</Link>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{j.company}</span>
                          {j.location && (
                            <span className="flex items-center gap-1">
                              <MapPinIcon className="w-3.5 h-3.5" />
                              {j.location}
                            </span>
                          )}
                          <span className="capitalize text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full font-medium">
                            {(j.employment_type || j.type || 'full_time').replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {(j.skills_required || []).slice(0, 5).map(s => (
                            <span key={s} className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2.5 py-0.5 rounded-full font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold ${
                      j.is_active !== false
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {j.is_active !== false ? (
                        <>
                          <span className="status-dot bg-green-500" />
                          Active
                        </>
                      ) : 'Closed'}
                    </span>

                    <Link
                      to={`/jobs/${j.id}/applicants`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:border-primary-300 hover:text-primary-600 transition-all shadow-sm"
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
