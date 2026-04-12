import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { queryDocuments } from '../../services/firestoreService'
import { dummyJobs } from '../../utils/dummyData'
import { TableSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { ListSkeleton } from '../../components/SkeletonLoader'
import { BriefcaseIcon, UserGroupIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

export default function MyJobs() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [applicantCounts, setApplicantCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadJobs = useCallback(async () => {
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">My Jobs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{jobs.length} jobs posted</p>
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
          {jobs.map(j => {
            const appCount = applicantCounts[j.id] ?? 0
            return (
              <div key={j.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BriefcaseIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base">{j.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          <span className="font-medium">{j.company}</span>
                          {j.location && (
                            <span className="flex items-center gap-1">
                              <MapPinIcon className="w-3.5 h-3.5" />
                              {j.location}
                            </span>
                          )}
                          <span className="capitalize text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                            {(j.employment_type || j.type || 'full_time').replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(j.skills_required || []).slice(0, 5).map(s => (
                            <span key={s} className="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      j.is_active !== false
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {j.is_active !== false && <CheckCircleIcon className="w-3 h-3" />}
                      {j.is_active !== false ? 'Active' : 'Closed'}
                    </span>

                    <Link
                      to={`/jobs/${j.id}/applicants`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
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
