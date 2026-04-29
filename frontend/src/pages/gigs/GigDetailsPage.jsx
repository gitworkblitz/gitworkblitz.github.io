import React, { useState, useEffect, useCallback } from 'react'
import useSEO from '../../hooks/useSEO'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getGigById, applyToGig, hasUserAppliedToGig, completeGig } from '../../services/firestoreService'
import { storage } from '../../services/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { dummyGigs, formatCurrencyINR } from '../../utils/dummyData'
import { ClockIcon, MapPinIcon, ArrowLeftIcon, CalendarDaysIcon, IdentificationIcon, ShieldCheckIcon, DocumentTextIcon, PaperClipIcon } from '@heroicons/react/24/outline'
import { StarIcon, CheckCircleIcon, ExclamationTriangleIcon, CurrencyRupeeIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { DetailSkeleton } from '../../components/SkeletonLoader'

const STATUS_BADGE = {
  open: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800',
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
  completed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
}

export default function GigDetailsPage() {
  const { id } = useParams()
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  const [gig, setGig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [applied, setApplied] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [applyMode, setApplyMode] = useState('resume')

  // Simple Upwork-style form fields -> Now standard
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formExperience, setFormExperience] = useState('')
  const [formSkills, setFormSkills] = useState('')
  const [formCoverLetter, setFormCoverLetter] = useState('')
  const [formBudget, setFormBudget] = useState('')
  const [formResume, setFormResume] = useState(null)

  // Pre-fill from user profile
  useEffect(() => {
    if (user && userProfile) {
      setFormName(userProfile.name || user.displayName || '')
      setFormEmail(user.email || '')
      setFormPhone(userProfile.phone || '')
      setFormExperience(userProfile.experience_years?.toString() || '')
      setFormSkills(userProfile.skills?.join(', ') || '')
    }
  }, [user, userProfile])

  const loadGig = useCallback(async () => {
    // Instant render from dummy cache
    const cached = dummyGigs.find(g => g.id === id)
    if (cached) {
      setGig({ ...cached, status: cached.status || 'open' })
      setLoading(false)
    } else {
      setLoading(true)
    }

    try {
      const data = await getGigById(id)
      if (data) {
        if (!data.status) data.status = 'open'
        setGig(data)
      } else if (!cached) {
        toast.error('Gig not found')
        navigate('/gigs')
      }
    } catch (err) {
      console.error('Error loading gig:', err)
      if (!cached) { toast.error('Failed to load gig'); navigate('/gigs') }
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => { loadGig() }, [loadGig])

  useEffect(() => {
    if (user && gig?.id) {
      hasUserAppliedToGig(gig.id, user.uid).then(setApplied).catch(console.error)
    }
  }, [user, gig?.id])

  const handleApplyGig = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    if (applied) return
    if (!formName.trim() || !formEmail.trim() || !formPhone.trim()) {
      toast.error('Please fill in your name, email, and phone')
      return
    }

    if (applyMode === 'resume' && !formResume) {
      toast.error('Please upload your resume for Quick Apply')
      return
    }

    try {
      setActionLoading(true)

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
            new Promise(resolve => setTimeout(() => resolve(URL.createObjectURL(formResume)), 5000))
          ])
        } catch {
          resumeURL = URL.createObjectURL(formResume)
        }
      }

      await applyToGig({
        gigId: gig.id,
        applicantId: user.uid,
        employerId: gig.employer_id || gig.posted_by || '',
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        experience: parseFloat(formExperience) || 0,
        skills: formSkills.split(',').map(s => s.trim()).filter(Boolean),
        coverLetter: formCoverLetter.trim(),
        proposedBudget: parseFloat(formBudget) || null,
        resumeURL: resumeURL,
        // Legacy
        userId: user.uid,
        userName: formName.trim(),
        applicantName: formName.trim(),
        userEmail: formEmail.trim(),
        gigTitle: gig.title || '',
      })
      toast.success('Applied Successfully ✅')
      setApplied(true)
      setShowForm(false)
    } catch (e) {
      console.error('Apply gig error:', e)
      if (e.message?.includes('already applied')) {
        setApplied(true)
        toast.error('You have already applied to this gig')
      } else {
        toast.error(e.message || 'Failed to apply to gig')
      }
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

  // Dynamic SEO for this specific gig
  useSEO({
    title: `${gig.title} — Freelance Gig | WorkSphere`,
    description: `Apply for "${gig.title}" gig on WorkSphere. Budget: ${formatCurrencyINR(Number(gig.price || gig.budget || 0))}. Category: ${gig.category || 'Freelance'}. Duration: ${gig.duration || 'Flexible'}. India's gig marketplace.`,
    keywords: `${gig.category || 'freelance'} gigs, ${gig.title}, gig marketplace, freelance gigs India, WorkSphere`,
    url: `https://wsphere.me/gigs/${id}`
  })

  const isOwner = user && (gig.employer_id === user.uid || gig.posted_by === user.uid)
  const isAssigned = user && gig.assignedTo === user.uid
  const isTaken = gig.assignedTo && (!user || gig.assignedTo !== user.uid)

  const postedDaysAgo = () => {
    if (!gig.createdAt) return ''
    const days = Math.floor((Date.now() - new Date(gig.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Posted today'
    if (days === 1) return 'Posted 1 day ago'
    return `Posted ${days} days ago`
  }

  const client = gig.client_details || { rating: 4.5, projects_posted: 0, member_since: '2023' }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/gigs" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors font-medium">
          <ArrowLeftIcon className="w-4 h-4" /> Back to Gigs
        </Link>

        {/* Upwork-style layout: Left (main) + Right (sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* === MAIN CONTENT === */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 tracking-wide uppercase px-3 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-full">
                  {gig.category || 'General Category'}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${STATUS_BADGE[gig.status] || STATUS_BADGE.open}`}>
                  {(gig.status || 'open').replace('-', ' ')}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-snug">{gig.title}</h1>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-500 dark:text-gray-400 mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
                <span className="flex items-center gap-1.5 font-medium"><MapPinIcon className="w-4 h-4" /> {gig.location || 'Remote'}</span>
                <span className="flex items-center gap-1.5 font-medium"><ClockIcon className="w-4 h-4" /> {postedDaysAgo()}</span>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><DocumentTextIcon className="w-5 h-5 text-gray-400" /> Project Description</h2>
                <div className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">{gig.description}</div>
              </div>

              {/* Key stats grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium flex items-center gap-1"><CurrencyRupeeIcon className="w-4 h-4" /> Budget</p>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">{formatCurrencyINR(Number(gig.price || gig.budget || 0))}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Fixed-price</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium flex items-center gap-1"><ClockIcon className="w-4 h-4" /> Duration</p>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">{gig.duration || 'Not specified'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Estimated time</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium flex items-center gap-1"><CalendarDaysIcon className="w-4 h-4" /> Deadline</p>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">{gig.deadline || 'Negotiable'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Target date</p>
                </div>
              </div>

              {/* Skills */}
              {(gig.skills || []).length > 0 && (
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Skills and Expertise</h2>
                  <div className="flex flex-wrap gap-2">
                    {gig.skills.map(s => (
                      <span key={s} className="bg-gray-100 dark:bg-gray-800 border border-transparent hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-default">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* === UPWORK-STYLE SIMPLE APPLY FORM === */}
            {showForm && !applied && gig.status === 'open' && !isOwner && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8 animate-slide-up">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Submit a Proposal</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Tell the client why you're the right fit for this project.</p>

                <form onSubmit={handleApplyGig} className="space-y-4">
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
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Experience (Years)</label>
                          <input type="number" min="0" step="0.5" value={formExperience} onChange={e => setFormExperience(e.target.value)} placeholder="e.g. 2.5" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 overflow-hidden outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Proposed Budget (₹) <span className="text-gray-400 font-normal ml-1">Optional</span></label>
                          <input type="number" min="0" value={formBudget} onChange={e => setFormBudget(e.target.value)} placeholder="e.g. 5000" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 overflow-hidden outline-none" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Skills (csv)</label>
                        <input type="text" value={formSkills} onChange={e => setFormSkills(e.target.value)} placeholder="React, Node.js" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 overflow-hidden outline-none" />
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Cover Message / Proposal</label>
                        <textarea value={formCoverLetter} onChange={e => setFormCoverLetter(e.target.value)} rows={4} placeholder="Briefly describe why you are the best fit for this project..." className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
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
                          className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 hover:file:bg-primary-100"
                        />
                      </div>
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
                      disabled={actionLoading}
                      className="flex-2 bg-primary-600 text-white font-semibold hover:bg-primary-700 px-8 py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm min-w-[160px]"
                    >
                      {actionLoading ? (
                        <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                      ) : (
                        <><CheckCircleIcon className="w-5 h-5" /> Submit Proposal</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Applied success */}
            {applied && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 flex items-center gap-4 animate-slide-up">
                <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-green-800 dark:text-green-300 text-lg">Proposal Submitted!</h3>
                  <p className="text-green-700 dark:text-green-400 text-sm mt-0.5 mb-3">Your proposal has been sent to the client. They will review it and get back to you soon.</p>
                  <Link to="/dashboard/applications" className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 dark:text-green-400 bg-white dark:bg-green-900/40 px-4 py-2 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-50 transition-colors">
                    Track Application
                  </Link>
                </div>
              </div>
            )}

            {/* Project Status Banner */}
            {gig.assignedTo && (
              <div className={`rounded-2xl p-6 border-l-4 shadow-sm flex items-start gap-4 ${gig.status === 'completed' ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'}`}>
                {gig.status === 'completed' ? <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-500 mt-0.5" /> : <ClockIcon className="w-8 h-8 text-blue-600 dark:text-blue-500 mt-0.5" />}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                    {gig.status === 'completed' ? 'Project Completed' : 'Project In Progress'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Assigned to: <strong className="text-gray-900 dark:text-white">{gig.assignedName || 'Unknown'}</strong>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* === SIDEBAR === */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Action Box */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">

              {applied ? (
                <div className="w-full bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold py-3.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-not-allowed">
                  <CheckCircleIcon className="w-5 h-5 text-gray-400" /> Applied
                </div>
              ) : gig.status === 'open' && !isOwner && !isTaken ? (
                <>
                  {!showForm ? (
                    <button
                      onClick={() => user ? setShowForm(true) : navigate('/login')}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mb-4"
                    >
                      Apply Now
                    </button>
                  ) : (
                    <div className="w-full bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 font-medium py-3 px-4 rounded-xl text-center text-sm mb-4">
                      Proposal form below
                    </div>
                  )}
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 flex justify-center items-center gap-1.5"><ShieldCheckIcon className="w-4 h-4 text-green-500" /> Secure payment via WorkSphere</p>
                </>
              ) : null}

              {gig.status === 'open' && isOwner && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 text-center">
                  <IdentificationIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-bold text-gray-900 dark:text-white mb-1">This is your gig</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Waiting for proposals</p>
                </div>
              )}

              {isTaken && gig.status === 'in-progress' && !isAssigned && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 text-center">
                  <ExclamationTriangleIcon className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="font-bold text-amber-800 dark:text-amber-400 mb-1">Position Filled</p>
                  <p className="text-sm text-amber-700 dark:text-amber-500">This gig is currently being worked on.</p>
                </div>
              )}

              {isAssigned && gig.status === 'in-progress' && (
                <button onClick={handleCompleteGig} disabled={actionLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
                  {actionLoading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Completing…</> : 'Submit Final Work'}
                </button>
              )}

              {gig.status === 'completed' && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 text-center">
                  <CheckCircleIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-bold text-gray-900 dark:text-white">Gig Closed</p>
                </div>
              )}
            </div>

            {/* Client Info Box */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">About the client</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {(gig.posted_by_name || gig.employer_name || gig.freelancer_name || 'C')[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white leading-tight mb-0.5">{gig.posted_by_name || gig.employer_name || gig.freelancer_name || 'Client Name'}</p>
                    <div className="flex items-center gap-1 mb-1">
                      <StarIcon className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{client.rating}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">of 5 reviews</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3 pb-2">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Location</h4>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{gig.location || 'India'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Jobs Posted</h4>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{client.jobs_posted || client.projects_posted || 0} jobs</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Member Since</h4>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{client.member_since}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
