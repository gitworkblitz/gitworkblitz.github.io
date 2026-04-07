import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { acceptGig } from '../services/firestoreService'
import { formatCurrencyINR } from '../utils/dummyData'
import { MapPinIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

export default function GigCard({ gig }) {
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  const [accepted, setAccepted] = useState(gig.status === 'in-progress' || gig.status === 'completed')
  const [accepting, setAccepting] = useState(false)

  const isAssignedToMe = gig.assignedTo === user?.uid
  const isOpen = gig.status === 'open' || gig.status === 'active'

  const handleAccept = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { navigate('/login'); return }

    setAccepting(true)
    try {
      await acceptGig(gig.id, user.uid, userProfile?.name || 'User')
      setAccepted(true)
      toast.success('Gig accepted! It is yours now.')
    } catch (err) {
      toast.error(err.message || 'Failed to accept gig')
    } finally { setAccepting(false) }
  }

  const statusColor = {
    'open': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'active': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'completed': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex flex-col group">
      {/* Color accent bar */}
      <div className={`h-1.5 ${isOpen ? 'bg-gradient-to-r from-violet-500 to-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Top row: category + status */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium px-2.5 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
            {gig.category || 'General'}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColor[gig.status] || statusColor.open}`}>
            {gig.status || 'open'}
          </span>
        </div>

        {/* Title */}
        <Link to={`/gigs/${gig.id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">{gig.title}</h3>
        </Link>

        {/* Description */}
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2 flex-1">{gig.description}</p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(gig.skills || []).slice(0, 3).map(s => (
            <span key={s} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{s}</span>
          ))}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
          {gig.location && (
            <span className="flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5" />{gig.location}</span>
          )}
          {gig.posted_by_name && (
            <span className="flex items-center gap-1"><UserIcon className="w-3.5 h-3.5" />{gig.posted_by_name}</span>
          )}
        </div>

        {/* Footer: Price + Action */}
        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <p className="text-lg font-bold text-primary-600">{formatCurrencyINR(Number(gig.price || gig.budget || 0))}</p>

          {accepted || isAssignedToMe ? (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium">
              <CheckCircleIcon className="w-4 h-4" /> {isAssignedToMe ? 'Your Gig' : 'Taken'}
            </span>
          ) : isOpen ? (
            <button onClick={handleAccept} disabled={accepting}
              className="bg-violet-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50">
              {accepting ? 'Accepting…' : 'Accept Gig'}
            </button>
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium capitalize">{gig.status}</span>
          )}
        </div>
      </div>
    </div>
  )
}
