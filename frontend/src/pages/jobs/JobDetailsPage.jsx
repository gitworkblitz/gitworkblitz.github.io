import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getJobById, applyToJob, hasUserApplied } from '../../services/firestoreService'
import { storage } from '../../services/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { dummyJobs, formatSalaryRange } from '../../utils/dummyData'
import { MapPinIcon, CalendarIcon, BriefcaseIcon, CurrencyRupeeIcon, AcademicCapIcon, BuildingOfficeIcon, UserIcon, ArrowLeftIcon, ClockIcon, PaperClipIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
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
  const [applyMode, setApplyMode] = useState('resume') // 'resume' | 'manual'

  // Simple form state – Internshala style
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formExperience, setFormExperience] = useState('')
  const [formSkills, setFormSkills] = useState('')
  const [formCoverLetter, setFormCoverLetter] = useState('')
  const [formResume, setFormResume] = useState(null)

  // Pre-fill form from user profile
  useEffect(() => {
    if (user && userProfile) {
      setFormName(userProfile.name || user.displayName || '')
      setFormEmail(user.email || '')
      setFormPhone(userProfile.phone || '')
      setFormExperience(userProfile.experience_years?.toString() || '')
      setFormSkills(userProfile.skills?.join(', ') || '')
    }
  }, [user, userProfile])

  const loadJob = useCallback(async () => {
    // Instant render from dummy cache
    const cached = dummyJobs.find(j => j.id === id)
    if (cached) {
      setJob(cached)
      setLoading(false)
    } else {
      setLoading(true)
    }

    try {
      const data = await getJobById(id)
      if (data) {
        setJob(data)
      } else if (!cached) {
        toast.error('Job not found')
        navigate('/jobs')
        return
      }

      if (user) {
        const alreadyApplied = await hasUserApplied(id, user.uid)
        setApplied(alreadyApplied)
      }
    } catch (err) {
      console.error('Error loading job:', err)
      if (!cached) {
        toast.error('Failed to load job')
        navigate('/jobs')
      }
    } finally {
      setLoading(false)
    }
  }, [id, user, navigate])

  useEffect(() => { loadJob() }, [loadJob])

  const handleApply = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    if (!formName.trim() || !formEmail.trim() || !formPhone.trim()) {
      toast.error('Please fill in your name, email, and phone')
      return
    }

    if (applyMode === 'resume' && !formResume) {
      toast.error('Please upload your resume for Quick Apply')
      return
    }

    try {
      setApplying(true)
      
      let resumeURL = null
      if (formResume) {
        const fileRef = ref(storage, `resumes/${user.uid}/${Date.now()}_${formResume.name}`)
        try {
          const uploadTask = async () => {
            await uploadBytes(fileRef, formResume)
            return await getDownloadURL(fileRef)
          }
          resumeURL = await Promise.race([
            uploadTask(),
            new Promise(resolve => setTimeout(() => resolve(URL.createObjectURL(formResume)), 1500))
          ])
        } catch {
          resumeURL = URL.createObjectURL(formResume)
        }
      }

      await applyToJob({
        jobId: id,
        applicantId: user.uid,
        employerId: job.employer_id || job.posted_by,
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        experience: parseFloat(formExperience) || 0,
        skills: formSkills.split(',').map(s => s.trim()).filter(Boolean),
        coverLetter: formCoverLetter.trim(),
        resumeURL: resumeURL,
        // Legacy fields for backward compatibility
        applicantName: formName.trim(),
        applicantEmail: formEmail.trim(),
        jobTitle: job.title,
        company: job.company,
        location: userProfile?.location || '',
      })
      toast.success('Applied Successfully ✅')
      setApplied(true)
      setShowForm(false)
    } catch (e) {
      console.error('Apply error:', e)
      if (e.message?.includes('already applied')) {
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

  const getLogoColor = (name) => {
    const colors = ['bg-blue-100 text-blue-600', 'bg-emerald-100 text-emerald-600', 'bg-violet-100 text-violet-600', 'bg-rose-100 text-rose-600', 'bg-amber-100 text-amber-600']
    let hash = 0
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  const logoColorClass = getLogoColor(job.company)
  const initials = (job.company || 'C').substring(0, 1).toUpperCase()

  const postedDaysAgo = () => {
    if (!job.createdAt) return ''
    const days = Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Posted today'
    if (days === 1) return 'Posted 1 day ago'
    return `Posted ${days} days ago`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
          <ArrowLeftIcon className="w-4 h-4" /> Back to Jobs
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6 md:items-start md:justify-between mb-8">
            <div className="flex gap-4 items-start">
              <div className={`w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-2xl shadow-sm ${logoColorClass}`}>
                {initials}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1.5">{job.title}</h1>
                <p className="text-lg text-primary-600 dark:text-primary-400 font-medium mb-1">{job.company}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <MapPinIcon className="w-4 h-4" /> {job.location}
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col md:items-end gap-3">
              {applied ? (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 px-6 py-2.5 rounded-xl font-semibold">
                  <CheckCircleIcon className="w-5 h-5" /> Applied Successfully
                </div>
              ) : !showForm ? (
                <button
                  onClick={() => user ? setShowForm(true) : navigate('/login')}
                  className="bg-primary-600 text-white font-semibold shadow-sm hover:shadow-md hover:bg-primary-700 px-8 py-2.5 rounded-xl transition-all"
                >
                  Apply Now
                </button>
              ) : null}
              {isEmployer && (
                <Link to={`/jobs/${id}/applicants`} className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium">
                  <UserIcon className="w-4 h-4" /> View Applicants
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-8 border border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1"><CurrencyRupeeIcon className="w-4 h-4" /> Salary</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{formatSalaryRange(job.salary_min || 0, job.salary_max || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1"><AcademicCapIcon className="w-4 h-4" /> Experience</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{job.experience_required || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1"><BriefcaseIcon className="w-4 h-4" /> Job Type</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{(job.employment_type || job.type || '').replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1"><ClockIcon className="w-4 h-4" /> Posted</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{postedDaysAgo()}</p>
            </div>
          </div>

          <div className="space-y-8">
            {job.description && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Job Description</h2>
                <div className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{job.description}</div>
              </section>
            )}

            {(job.responsibilities || []).length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Key Responsibilities</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="leading-relaxed">{r}</li>
                  ))}
                </ul>
              </section>
            )}

            {(job.skills_required || []).length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills_required.map(s => (
                    <span key={s} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm">{s}</span>
                  ))}
                </div>
              </section>
            )}

            {(job.perks || []).length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Perks & Benefits</h2>
                <div className="flex flex-wrap gap-2">
                  {job.perks.map(p => (
                    <span key={p} className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1 rounded-md text-sm border border-green-100 dark:border-green-800/50">{p}</span>
                  ))}
                </div>
              </section>
            )}

            {job.about_company && (
              <section className="bg-gray-50 dark:bg-gray-800/50 -mx-6 md:-mx-8 -mb-6 md:-mb-8 p-6 md:p-8 mt-8 border-t border-gray-100 dark:border-gray-800 rounded-b-2xl">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><BuildingOfficeIcon className="w-5 h-5" /> About {job.company}</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{job.about_company}</p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>Location: <span className="font-medium text-gray-700 dark:text-gray-300">{job.location}</span></p>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* === INTERNSHALA-STYLE SIMPLE APPLY FORM === */}
        {showForm && !applied && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${logoColorClass}`}>
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Apply for {job.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{job.company} · {job.location}</p>
              </div>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setApplyMode('resume')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${applyMode === 'resume' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  Quick Apply (Resume)
                </button>
                <button
                  type="button"
                  onClick={() => setApplyMode('manual')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${applyMode === 'manual' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  Fill Manually
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    required
                    placeholder="Your full name"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  required
                  placeholder="+91 9876543210"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                />
              </div>

              {applyMode === 'manual' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Experience (Years)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={formExperience}
                        onChange={e => setFormExperience(e.target.value)}
                        placeholder="e.g. 2.5"
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Skills (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formSkills}
                        onChange={e => setFormSkills(e.target.value)}
                        placeholder="React, Node.js, Design"
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Cover Letter
                    </label>
                    <textarea
                      value={formCoverLetter}
                      onChange={e => setFormCoverLetter(e.target.value)}
                      placeholder="Why are you a great fit for this role?"
                      rows={4}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                </>
              )}

              {applyMode === 'resume' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <span className="flex items-center gap-1.5"><PaperClipIcon className="w-4 h-4" /> Resume <span className="text-red-500">*</span></span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={e => setFormResume(e.target.files[0])}
                      className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 dark:file:bg-primary-900/30 dark:file:text-primary-300 hover:file:bg-primary-100 dark:hover:file:bg-primary-900/50 file:transition-colors border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 px-3 py-2.5 cursor-pointer"
                    />
                    {formResume && <p className="mt-1.5 text-xs text-green-600 dark:text-green-400">{formResume.name} selected</p>}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 5MB</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium px-6 py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="flex-2 bg-primary-600 text-white font-semibold hover:bg-primary-700 px-8 py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 min-w-[160px]"
                >
                  {applying ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                  ) : (
                    <><CheckCircleIcon className="w-5 h-5" /> Apply Now</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Applied success banner */}
        {applied && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 flex items-center gap-4 animate-slide-up">
            <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-green-800 dark:text-green-300 text-lg">Applied Successfully!</h3>
              <p className="text-green-700 dark:text-green-400 text-sm mt-0.5">Your application has been submitted to <strong>{job.company}</strong>. They will reach out to you shortly.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
