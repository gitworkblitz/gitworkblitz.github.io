import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useSettings } from '../../context/SettingsContext'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { getUserBookings, getUserInvoices } from '../../services/firestoreService'
import { formatCurrencyINR } from '../../utils/dummyData'
import {
  UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, StarIcon,
  PencilIcon, CheckIcon, XMarkIcon, BriefcaseIcon, ClockIcon,
  CalendarDaysIcon, ChartBarIcon, DocumentTextIcon, ArrowRightIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { ProfileSkeleton } from '../../components/SkeletonLoader'

export default function ProfilePage() {
  const { user, userProfile, updateUserProfile } = useAuth()
  const { settings } = useSettings()
  const [editing, setEditing] = useState(() => {
    if (!userProfile) return false;
    return !userProfile.phone || !userProfile.location || (userProfile.user_type === 'worker' && (!userProfile.skills || userProfile.skills.length === 0));
  });
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [skills, setSkills] = useState(userProfile?.skills || [])
  const [skillInput, setSkillInput] = useState('')
  const [bookingStats, setBookingStats] = useState({ total: 0, completed: 0, active: 0 })
  const [recentInvoices, setRecentInvoices] = useState([])

  const platformName = settings?.platformName || 'WorkSphere'

  useEffect(() => {
    setMounted(true)
    document.title = `My Profile | ${platformName}`
  }, [platformName])

  // Load booking stats for profile insights
  useEffect(() => {
    if (!user) return
    getUserBookings(user.uid).then(bookings => {
      setBookingStats({
        total: bookings.length,
        completed: bookings.filter(b => b.status === 'completed').length,
        active: bookings.filter(b => !['completed', 'cancelled'].includes(b.status)).length,
      })
    }).catch(() => {})

    getUserInvoices(user.uid, 5).then(setRecentInvoices).catch(() => {})
  }, [user])

  if (!mounted || !userProfile) {
    return <ProfileSkeleton />
  }

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: userProfile?.name || '',
      phone: userProfile?.phone || '',
      location: userProfile?.location || '',
      bio: userProfile?.bio || '',
      experience_years: userProfile?.experience_years || 0,
      company: userProfile?.company || '',
    }
  })

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) {
      setSkills([...skills, s])
      setSkillInput('')
    }
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      await updateUserProfile({ ...data, skills })
      setEditing(false)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update')
    } finally {
      setLoading(false)
    }
  }

  const rating = userProfile?.rating || 0
  const isWorker = userProfile?.user_type === 'worker'
  const isEmployer = userProfile?.user_type === 'employer'
  const memberSince = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : 'N/A'

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="page-header">My Profile</h1>

      {/* Header card */}
      <div className="card overflow-hidden mb-5">
        <div className="h-28 bg-gradient-to-r from-primary-600 via-violet-600 to-purple-600 relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
            <div className="absolute -bottom-5 -left-5 w-28 h-28 bg-white rounded-full" />
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 gap-4">
            <div className="w-24 h-24 rounded-full bg-white shadow-lg ring-4 ring-white flex items-center justify-center text-primary-600 font-bold text-4xl">
              {(userProfile?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <button onClick={() => setEditing(!editing)} className="btn-secondary flex items-center gap-2 w-fit">
              {editing ? <><XMarkIcon className="w-4 h-4" />Cancel</> : <><PencilIcon className="w-4 h-4" />Edit Profile</>}
            </button>
          </div>
          <div className="mt-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{userProfile?.name || 'Your Name'}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-500 dark:text-gray-400 capitalize bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full font-medium">
                {userProfile?.user_type || 'customer'}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <CalendarDaysIcon className="w-3.5 h-3.5" /> Member since {memberSince}
              </span>
            </div>
            {(isWorker || rating > 0) && (
              <div className="flex items-center gap-1 mt-2">
                {[1,2,3,4,5].map(i => (
                  <StarIcon key={i} className={`w-4 h-4 ${i<=rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-700'}`} />
                ))}
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                  {rating.toFixed(1)} ({userProfile?.total_reviews||0} reviews)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats row — visible for all roles */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{bookingStats.total}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Bookings</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{bookingStats.completed}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{bookingStats.active}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
        </div>
      </div>

      {editing ? (
        <div className="card p-6">
          <h2 className="section-title">Edit Profile</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              ['name', 'Full Name', UserIcon],
              ['phone', 'Phone', PhoneIcon],
              ['location', 'Location', MapPinIcon]
            ].map(([n, l, Icon]) => (
              <div key={n}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{l}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input {...register(n, { required: `${l} is required` })} className="input-field pl-10" />
                </div>
                {errors[n] && <p className="text-red-500 text-xs mt-1">{errors[n].message}</p>}
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio</label>
              <textarea {...register('bio')} rows={3} className="input-field" placeholder="Tell people about yourself…" />
            </div>

            {/* Worker-specific: Experience */}
            {isWorker && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Years of Experience</label>
                <div className="relative">
                  <BriefcaseIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min={0}
                    max={50}
                    {...register('experience_years', { valueAsNumber: true, min: 0, max: 50 })}
                    className="input-field pl-10"
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            {/* Employer-specific: Company */}
            {isEmployer && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company Name</label>
                <div className="relative">
                  <BriefcaseIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    {...register('company')}
                    className="input-field pl-10"
                    placeholder="Company Name"
                  />
                </div>
              </div>
            )}

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Skills</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="input-field flex-1"
                  placeholder="Add skill…"
                />
                <button type="button" onClick={addSkill} className="btn-secondary px-4">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <span key={s} className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-full text-sm flex items-center gap-1 font-medium">
                    {s}
                    <button type="button" onClick={() => setSkills(skills.filter(x => x !== s))} className="text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 ml-0.5">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Contact Information */}
          <div className="card p-6">
            <h2 className="section-title">Contact Information</h2>
            <div className="space-y-3">
              {[
                [EnvelopeIcon, 'Email', user?.email],
                [PhoneIcon, 'Phone', userProfile?.phone || 'Not provided'],
                [MapPinIcon, 'Location', userProfile?.location || 'Not provided'],
                ...(isEmployer ? [[BriefcaseIcon, 'Company', userProfile?.company || 'Not provided']] : [])
              ].map(([Icon, label, val], i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                  <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* About */}
          {userProfile?.bio && (
            <div className="card p-6">
              <h2 className="section-title">About</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{userProfile.bio}</p>
            </div>
          )}

          {/* Worker-specific: Professional Details */}
          {isWorker && (
            <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="section-title">Professional Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center stat-card">
                  <BriefcaseIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1 stat-icon-glow" />
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-300 count-pop">{userProfile?.experience_years || 0}</p>
                  <p className="text-[10px] text-blue-500 dark:text-blue-400 font-medium">Years Exp</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center stat-card">
                  <ChartBarIcon className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-1 stat-icon-glow" />
                  <p className="text-lg font-bold text-green-700 dark:text-green-300 count-pop">{userProfile?.completion_rate || 100}%</p>
                  <p className="text-[10px] text-green-500 dark:text-green-400 font-medium">Completion</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 text-center stat-card">
                  <StarIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mx-auto mb-1 stat-icon-glow" />
                  <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300 count-pop">{rating.toFixed(1)}</p>
                  <p className="text-[10px] text-yellow-500 dark:text-yellow-400 font-medium">Avg Rating</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center stat-card">
                  <ClockIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1 stat-icon-glow" />
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-300 count-pop">{bookingStats.completed}</p>
                  <p className="text-[10px] text-purple-500 dark:text-purple-400 font-medium">Jobs Done</p>
                </div>
              </div>
            </div>
          )}

          {/* Employer info */}
          {isEmployer && (
            <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="section-title">Employer Activity</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 text-center stat-card">
                  <BriefcaseIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mx-auto mb-1 stat-icon-glow" />
                  <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300 count-pop">{bookingStats.total}</p>
                  <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium">Total Bookings</p>
                </div>
                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-4 text-center stat-card">
                  <CalendarDaysIcon className="w-5 h-5 text-teal-600 dark:text-teal-400 mx-auto mb-1 stat-icon-glow" />
                  <p className="text-lg font-bold text-teal-700 dark:text-teal-300 count-pop">{memberSince}</p>
                  <p className="text-[10px] text-teal-500 dark:text-teal-400 font-medium">Since</p>
                </div>
              </div>
            </div>
          )}

          {/* Skills */}
          {(userProfile?.skills || []).length > 0 && (
            <div className="card p-6">
              <h2 className="section-title">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {userProfile.skills.map(s => (
                  <span key={s} className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-3 py-1.5 rounded-full text-sm font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Invoice History */}
          {recentInvoices.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title mb-0">Invoice History</h2>
                <Link to="/invoices" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1 group">
                  View all <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <div className="space-y-3">
                {recentInvoices.map(inv => (
                  <Link key={inv.id} to={`/invoices/${inv.id}`}
                    className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex items-center justify-between hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group border border-transparent hover:border-primary-200 dark:hover:border-primary-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100 dark:border-gray-700">
                        <DocumentTextIcon className="w-5 h-5 text-gray-500 group-hover:text-primary-600 transition-colors" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-primary-600 transition-colors">{inv.service_title || 'Service'}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{inv.invoice_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{formatCurrencyINR(inv.total || 0)}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(inv.created_at || inv.createdAt).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {/* Next Steps / Explore */}
          <div className="card p-6 border-2 border-primary-100 dark:border-primary-900/30">
            <h2 className="section-title">What's Next?</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              {isCustomer && (
                <>
                  <Link to="/services" className="flex-1 btn-primary text-center">Browse Services</Link>
                  <Link to="/jobs" className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-2 rounded-xl font-semibold text-center dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">Find Jobs</Link>
                </>
              )}
              {isWorker && (
                <>
                  <Link to="/dashboard/services" className="flex-1 btn-primary text-center">My Services</Link>
                  <Link to="/jobs" className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-2 rounded-xl font-semibold text-center dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">Browse Jobs</Link>
                </>
              )}
              {isEmployer && (
                <>
                  <Link to="/jobs/create" className="flex-1 btn-primary text-center">Post a Job</Link>
                  <Link to="/find-workers" className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-2 rounded-xl font-semibold text-center dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">Find Talent</Link>
                </>
              )}
              {(!isCustomer && !isWorker && !isEmployer) && (
                <Link to="/dashboard" className="flex-1 btn-primary text-center">Go to Dashboard</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
