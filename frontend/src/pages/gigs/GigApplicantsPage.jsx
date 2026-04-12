import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getGigById, getGigApplications, updateGigApplicationStatus } from '../../services/firestoreService'
import { dummyGigs } from '../../utils/dummyData'
import { TableSkeleton } from '../../components/SkeletonLoader'
import toast from 'react-hot-toast'
import {
  UserCircleIcon, EnvelopeIcon, MapPinIcon, PhoneIcon,
  CheckCircleIcon, XCircleIcon, ArrowLeftIcon, DocumentArrowDownIcon, AcademicCapIcon, WrenchIcon
} from '@heroicons/react/24/outline'
import { ClockIcon } from '@heroicons/react/24/solid'

const STATUS_COLORS = {
  applied:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  reviewed:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  shortlisted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  rejected:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

export default function GigApplicantsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [gig, setGig] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      let gigData = await getGigById(id)
      if (!gigData) gigData = dummyGigs.find(g => g.id === id)
      setGig(gigData)
      const apps = await getGigApplications(id)
      setApplications(apps)
    } catch (err) {
      console.error('Error loading gig applicants:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  const handleUpdateStatus = async (appId, status) => {
    setActionLoading(appId)
    try {
      // gig_applications uses same updateApplicationStatus service (it's generic)
      await updateGigApplicationStatus(appId, status)
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a))
      const labels = { shortlisted: 'Shortlisted ✅', rejected: 'Rejected', reviewed: 'Marked as Reviewed' }
      toast.success(labels[status] || `Status updated to ${status}`)
    } catch (err) {
      toast.error('Failed to update status')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-8"><TableSkeleton rows={5} /></div>

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/dashboard/gigs"
        className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 mb-6 font-medium"
      >
        <ArrowLeftIcon className="w-4 h-4" /> Back to My Gigs
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gig Applicants</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          <span className="font-medium text-gray-700 dark:text-gray-300">{gig?.title}</span>
          {' '}— {applications.length} applicant{applications.length !== 1 ? 's' : ''}
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center">
          <UserCircleIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Applicants Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            You haven't received any applications for this gig yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <div key={app.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {(app.name || app.applicantName || app.userName || 'U')[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start w-full">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {app.name || app.applicantName || app.userName || 'Applicant'}
                      </h3>
                      {app.resumeURL && (
                        <a 
                          href={app.resumeURL} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors shadow-sm border border-primary-100"
                        >
                          <DocumentArrowDownIcon className="w-4 h-4" /> Download Resume
                        </a>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {(app.email || app.userEmail || app.applicantEmail) && (
                        <span className="flex items-center gap-1">
                          <EnvelopeIcon className="w-4 h-4" />
                          {app.email || app.userEmail || app.applicantEmail}
                        </span>
                      )}
                      {app.phone && (
                        <span className="flex items-center gap-1">
                          <PhoneIcon className="w-4 h-4" />
                          {app.phone}
                        </span>
                      )}
                       {app.location && (
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          {app.location}
                        </span>
                      )}
                      {app.experience !== undefined && (
                        <span className="flex items-center gap-1">
                          <AcademicCapIcon className="w-4 h-4" />
                          {app.experience} Years Exp.
                        </span>
                      )}
                    </div>

                    {app.skills && app.skills.length > 0 && (
                      <div className="mt-3 flex items-start gap-2">
                        <WrenchIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex flex-wrap gap-1.5">
                          {app.skills.map((skill, idx) => (
                            <span key={idx} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs font-medium border border-gray-200 dark:border-gray-700">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {app.coverLetter && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{app.coverLetter}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[app.status] || STATUS_COLORS.applied}`}>
                        {app.status || 'applied'}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5" />
                        {app.appliedAt
                          ? new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : app.createdAt
                          ? new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : 'Recently'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  {actionLoading === app.id ? (
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {(app.status === 'applied' || app.status === 'reviewed') && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'shortlisted')}
                          className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                          title="Shortlist"
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                        </button>
                      )}
                      {app.status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'rejected')}
                          className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                          title="Reject"
                        >
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
