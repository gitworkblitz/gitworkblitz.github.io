import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getJobById, getJobApplications, updateApplicationStatus } from '../../services/firestoreService'
import { dummyJobs } from '../../utils/dummyData'
import { TableSkeleton } from '../../components/SkeletonLoader'
import toast from 'react-hot-toast'
import { UserCircleIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, CheckCircleIcon, XCircleIcon, DocumentArrowDownIcon, AcademicCapIcon, WrenchIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'

export default function JobApplicantsPage() {
  const { id } = useParams()
  const { userProfile } = useAuth()
  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      let jobData = await getJobById(id)
      if (!jobData) jobData = dummyJobs.find(j => j.id === id)
      setJob(jobData)

      const apps = await getJobApplications(id)
      // appliedAt may be stored by new system; createdAt is fallback
      setApplications(apps)
    } catch (err) {
      console.error('Error loading applicants:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (appId, status) => {
    setActionLoading(appId)
    try {
      await updateApplicationStatus(appId, status)
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a))
      toast.success(`Application ${status}`)
    } catch (err) {
      toast.error('Failed to update status')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-700'
      case 'reviewed': return 'bg-yellow-100 text-yellow-700'
      case 'shortlisted': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-8"><TableSkeleton rows={5} /></div>

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/dashboard/jobs" className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Jobs
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Job Applicants</h1>
        <p className="text-gray-500 mt-1">{job?.title} - {applications.length} applicant(s)</p>
      </div>

      {applications.length === 0 ? (
        <div className="card p-12 text-center">
          <UserCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applicants Yet</h3>
          <p className="text-gray-500">You haven't received any applications for this job yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                    {(app.name || app.applicantName)?.[0] || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start w-full">
                      <h3 className="font-semibold text-gray-900">{app.name || app.applicantName}</h3>
                      {app.resumeURL && (
                        <a 
                          href={app.resumeURL} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors ml-4 shadow-sm border border-primary-100"
                        >
                          <DocumentArrowDownIcon className="w-4 h-4" /> Download Resume
                        </a>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                      {(app.email || app.applicantEmail) && (
                        <span className="flex items-center gap-1">
                          <EnvelopeIcon className="w-4 h-4" />
                          {app.email || app.applicantEmail}
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
                            <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium border border-gray-200">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {app.coverLetter && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{app.coverLetter}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mt-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(app.status)}`}>
                        {app.status || 'applied'}
                      </span>
                      <span className="text-xs text-gray-400">
                        Applied {app.appliedAt || app.createdAt ? new Date(app.appliedAt || app.createdAt).toLocaleDateString() : 'recently'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  {app.status === 'applied' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'shortlisted')}
                        disabled={actionLoading === app.id}
                        className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        title="Shortlist"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'rejected')}
                        disabled={actionLoading === app.id}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Reject"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  {app.status === 'shortlisted' && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'rejected')}
                      disabled={actionLoading === app.id}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Reject"
                    >
                      <XCircleIcon className="w-5 h-5" />
                    </button>
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
