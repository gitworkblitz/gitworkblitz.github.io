import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { queryDocuments } from '../../services/firestoreService'
import { dummyGigs, formatCurrencyINR } from '../../utils/dummyData'
import { TableSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { RocketLaunchIcon } from '@heroicons/react/24/outline'

export default function MyGigs() {
  const { user } = useAuth()
  const [gigs, setGigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) loadGigs()
  }, [user])

  const loadGigs = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await queryDocuments('gigs', 'employer_id', '==', user.uid)
      setGigs(data.length > 0 ? data : dummyGigs.slice(0, 2))
    } catch (err) {
      console.error(err)
      setError('Failed to load gigs')
      setGigs(dummyGigs.slice(0, 2))
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <TableSkeleton rows={4} />

  if (error) return <ErrorState title="Error Loading Gigs" message={error} onRetry={loadGigs} />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="page-header">My Gigs</h1><p className="text-sm text-gray-500 dark:text-gray-400">{gigs.length} gigs posted</p></div>
        <Link to="/gigs/create" className="btn-primary text-sm">+ Post Gig</Link>
      </div>
      {gigs.length === 0 ? (
        <EmptyState
          icon={RocketLaunchIcon}
          title="No gigs posted yet"
          description="Post your first freelance gig"
          actionLabel="Post Your First Gig"
          actionTo="/gigs/create"
        />
      ) : (
        <div className="space-y-3">
          {gigs.map(g => (
            <div key={g.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{g.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{g.category} • {g.location}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(g.skills || []).slice(0, 4).map(s => (
                      <span key={s} className="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600">{formatCurrencyINR(g.budget || 0)}</p>
                  <span className={`badge mt-1 ${g.status === 'active' || g.status === 'open' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                    {g.status || 'active'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
