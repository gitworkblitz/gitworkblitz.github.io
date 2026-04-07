import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { queryDocuments } from '../../services/firestoreService'
import { dummyJobs } from '../../utils/dummyData'
import { TableSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { BriefcaseIcon } from '@heroicons/react/24/outline'

export default function MyJobs() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) loadJobs()
  }, [user])

  const loadJobs = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await queryDocuments('jobs', 'employer_id', '==', user.uid)
      setJobs(data.length > 0 ? data : dummyJobs.slice(0, 2))
    } catch (err) {
      console.error(err)
      setError('Failed to load jobs')
      setJobs(dummyJobs.slice(0, 2))
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <TableSkeleton rows={4} />

  if (error) return <ErrorState title="Error Loading Jobs" message={error} onRetry={loadJobs} />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="page-header">My Jobs</h1><p className="text-sm text-gray-500 dark:text-gray-400">{jobs.length} jobs posted</p></div>
        <Link to="/jobs/create" className="btn-primary text-sm">+ Post Job</Link>
      </div>
      {jobs.length === 0 ? (
        <EmptyState
          icon={BriefcaseIcon}
          title="No jobs posted yet"
          description="Post your first job listing"
          actionLabel="Post Your First Job"
          actionTo="/jobs/create"
        />
      ) : (
        <div className="space-y-3">
          {jobs.map(j => (
            <div key={j.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{j.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{j.company} • {j.location} • {j.type}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(j.skills_required || []).slice(0, 4).map(s => (
                      <span key={s} className="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
                <span className={`badge ${j.is_active !== false ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                  {j.is_active !== false ? 'Active' : 'Closed'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
