import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getGigById, acceptGig, completeGig } from '../../services/firestoreService'
import { dummyGigs, formatCurrencyINR } from '../../utils/dummyData'
import { ClockIcon, StarIcon, MapPinIcon } from '@heroicons/react/24/solid'
import { UserCircleIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { DetailSkeleton } from '../../components/SkeletonLoader'

const STATUS_BADGE = {
  open: 'bg-green-100 text-green-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
}

export default function GigDetailsPage() {
  const { id } = useParams()
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  const [gig, setGig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => { loadGig() }, [id])

  const loadGig = async () => {
    setLoading(true)
    try {
      let data = await getGigById(id)
      if (!data) {
        data = dummyGigs.find(g => g.id === id)
      }
      if (!data) {
        toast.error('Gig not found')
        navigate('/gigs')
        return
      }
      if (!data.status) data.status = 'open'
      setGig(data)
    } catch (err) {
      console.error('Error loading gig:', err)
      const dummy = dummyGigs.find(g => g.id === id)
      if (dummy) { setGig({ ...dummy, status: dummy.status || 'open' }) }
      else { toast.error('Failed to load gig'); navigate('/gigs') }
    } finally { setLoading(false) }
  }

  const handleAcceptGig = async () => {
    if (!user) { navigate('/login'); return }
    try {
      setActionLoading(true)
      await acceptGig(id, user.uid, userProfile?.name || user.displayName || user.email)
      toast.success('Gig accepted! You can now start working.')
      await loadGig()
    } catch (e) {
      console.error('Accept gig error:', e)
      toast.error(e.message || 'Failed to accept gig')
    } finally { setActionLoading(false) }
  }

  const handleCompleteGig = async () => {
    if (!user) return
    try {
      setActionLoading(true)
      await completeGig(id, user.uid)
      toast.success('Gig marked as completed!')
      await loadGig()
    } catch (e) {
      console.error('Complete gig error:', e)
      toast.error(e.message || 'Failed to complete gig')
    } finally { setActionLoading(false) }
  }

  if (loading) return <DetailSkeleton />
  if (!gig) return null

  const isOwner = user && (gig.employer_id === user.uid || gig.freelancer_id === user.uid)
  const isAssigned = user && gig.assignedTo === user.uid
  const isTaken = gig.assignedTo && (!user || gig.assignedTo !== user.uid)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/gigs" className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Gigs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">{gig.category}</span>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE[gig.status] || STATUS_BADGE.open}`}>
                    {(gig.status || 'open').replace('-', ' ')}
                  </span>
                  <div className="flex items-center gap-1"><StarIcon className="w-4 h-4 text-yellow-400" /><span className="text-sm text-gray-600">{gig.rating ? gig.rating.toFixed(1) : 'New'}</span></div>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{gig.title}</h1>
              <div className="flex items-center gap-3 mb-5">
                <UserCircleIcon className="w-9 h-9 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{gig.freelancer_name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">Posted by</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed mb-5 whitespace-pre-wrap">{gig.description}</p>
              {gig.requirements && <div className="bg-gray-50 rounded-lg p-4"><h3 className="font-medium text-gray-900 mb-2">Requirements from client</h3><p className="text-sm text-gray-600">{gig.requirements}</p></div>}
            </div>

            <div className="card p-6">
              <h2 className="section-title">Skills & Tags</h2>
              <div className="flex flex-wrap gap-2">
                {(gig.skills||[]).map(s=><span key={s} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">{s}</span>)}
                {(gig.skills||[]).length === 0 && <p className="text-gray-400 text-sm">No skills specified</p>}
              </div>
            </div>

            {gig.assignedTo && (
              <div className={`card p-5 border-l-4 ${gig.status === 'completed' ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'}`}>
                <div className="flex items-center gap-2">
                  {gig.status === 'completed' ? <CheckCircleIcon className="w-5 h-5 text-green-600" /> : <ClockIcon className="w-5 h-5 text-blue-600" />}
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {gig.status === 'completed' ? 'Completed' : 'In Progress'}
                    </p>
                    <p className="text-xs text-gray-600">
                      Assigned to: <strong>{gig.assignedName || 'Unknown'}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="card p-6 sticky top-24">
              <p className="text-3xl font-extrabold text-primary-600 mb-1">{formatCurrencyINR(Number(gig.price || gig.budget || 0))}</p>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
                <ClockIcon className="w-4 h-4" />
                {gig.delivery_time || 7} days delivery
              </div>

              {gig.status === 'open' && !isOwner && (
                <button onClick={handleAcceptGig} disabled={actionLoading}
                  className="btn-primary w-full py-3 mb-3 flex items-center justify-center gap-2">
                  {actionLoading ? 'Accepting...' : 'Accept Gig'}
                </button>
              )}

              {gig.status === 'open' && isOwner && (
                <div className="bg-gray-50 rounded-xl p-4 text-center mb-3">
                  <p className="text-sm text-gray-500">This is your gig</p>
                  <p className="text-xs text-gray-400 mt-1">Waiting for someone to accept</p>
                </div>
              )}

              {isTaken && gig.status === 'in-progress' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center mb-3">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                  <p className="text-sm text-yellow-700 font-medium">Already Taken</p>
                  <p className="text-xs text-yellow-600 mt-1">This gig is being worked on by another user</p>
                </div>
              )}

              {isAssigned && gig.status === 'in-progress' && (
                <button onClick={handleCompleteGig} disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700 text-white w-full py-3 rounded-xl font-medium mb-3 flex items-center justify-center gap-2 transition-colors">
                  {actionLoading ? 'Completing...' : 'Mark as Completed'}
                </button>
              )}

              {gig.status === 'completed' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center mb-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto mb-1" />
                  <p className="text-sm text-green-700 font-medium">Completed</p>
                  <p className="text-xs text-green-600 mt-1">This gig has been completed</p>
                </div>
              )}

              {gig.location && (
                <p className="text-xs text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                  <MapPinIcon className="w-3 h-3" /> {gig.location}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
