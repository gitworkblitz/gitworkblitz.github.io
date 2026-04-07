import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getJobById, applyToJob, hasUserApplied } from '../../services/firestoreService'
import { dummyJobs, formatSalaryRange } from '../../utils/dummyData'
import { MapPinIcon, CalendarIcon, BriefcaseIcon, CurrencyDollarIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { DetailSkeleton } from '../../components/SkeletonLoader'

export default function JobDetailsPage() {
  const { id } = useParams()
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')

  useEffect(() => {
    loadJob()
  }, [id])

  const loadJob = async () => {
    setLoading(true)
    try {
      // Try Firestore first
      let data = await getJobById(id)
      // Fallback to dummy data
      if (!data) {
        data = dummyJobs.find(j => j.id === id)
      }
      if (!data) {
        toast.error('Job not found')
        navigate('/jobs')
        return
      }
      setJob(data)

      // Check if user already applied
      if (user) {
        const alreadyApplied = await hasUserApplied(id, user.uid)
        setApplied(alreadyApplied)
      }
    } catch (err) {
      console.error('Error loading job:', err)
      // Try dummy data as last resort
      const dummy = dummyJobs.find(j => j.id === id)
      if (dummy) {
        setJob(dummy)
      } else {
        toast.error('Failed to load job')
        navigate('/jobs')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    if (!user) { navigate('/login'); return }
    try {
      setApplying(true)
      await applyToJob({
        jobId: id,
        userId: user.uid,
        applicantName: userProfile?.name || user.displayName || user.email,
        applicantEmail: user.email,
        applicantPhone: userProfile?.phone || '',
        coverLetter: coverLetter,
        jobTitle: job.title,
        company: job.company,
        employerId: job.employer_id || job.posted_by,
        location: userProfile?.location || '',
      })
      toast.success('You have successfully applied!')
      setApplied(true)
      setShowForm(false)
    } catch (e) {
      console.error('Apply error:', e)
      if (e.message.includes('already applied')) {
        toast.error('You have already applied to this job')
        setApplied(true)
      } else {
        toast.error(e.message || 'Failed to submit application')
      }
    } finally {
      setApplying(false)
    }
  }

  if (loading) return <DetailSkeleton />
  if (!job) return null

  const isEmployer = user && (job.employer_id === user.uid || userProfile?.user_type === 'employer')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/jobs" className="text-sm text-primary-600 hover:text-primary-700 mb-6 block">← Back to Jobs</Link>

        <div className="card p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>
              <p className="text-lg text-gray-600">{job.company}</p>
              {isEmployer && (
                <Link to={`/jobs/${id}/applicants`} className="inline-flex items-center gap-2 mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View Applicants
                </Link>
              )}
            </div>
            <div className="flex-shrink-0">
              {applied ? (
                <div className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-6 py-3 rounded-xl font-semibold">
                  <CheckCircleIcon className="w-5 h-5" />
                  Applied
                </div>
              ) : !showForm ? (
                <button onClick={() => user ? setShowForm(true) : navigate('/login')} className="btn-primary px-8 py-3">
                  Apply Now
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
            <span className="flex items-center gap-1.5"><MapPinIcon className="w-4 h-4" />{job.location}</span>
            <span className="flex items-center gap-1.5"><BriefcaseIcon className="w-4 h-4" />{(job.employment_type||'').replace(/_/g,' ')}</span>
            <span className="flex items-center gap-1.5"><CurrencyDollarIcon className="w-4 h-4" />₹{Number(job.salary_min||0).toLocaleString('en-IN')} – ₹{Number(job.salary_max||0).toLocaleString('en-IN')}/yr</span>
            {job.deadline && <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" />Deadline: {job.deadline}</span>}
          </div>

          <div className="mb-6">
            <h2 className="section-title">Job Description</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>

          {(job.skills_required||[]).length > 0 && (
            <div className="mb-6">
              <h2 className="section-title">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills_required.map(s => <span key={s} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">{s}</span>)}
              </div>
            </div>
          )}

          {job.experience_required && (
            <div><h2 className="section-title">Experience Required</h2><p className="text-gray-600">{job.experience_required}+ years</p></div>
          )}
        </div>

        {/* Application form */}
        {showForm && !applied && (
          <div className="card p-6">
            <h2 className="section-title">Submit Application</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Letter (optional)</label>
              <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} rows={5} className="input-field" placeholder="Tell the employer why you're a great fit…" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleApply} disabled={applying} className="btn-primary flex-1">
                {applying ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
