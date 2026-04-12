import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useForm } from 'react-hook-form'
import { UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, StarIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { ProfileSkeleton } from '../../components/SkeletonLoader'

export default function ProfilePage() {
  const { user, userProfile, updateUserProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [skills, setSkills] = useState(userProfile?.skills || [])
  const [skillInput, setSkillInput] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !userProfile) {
    return <ProfileSkeleton />
  }

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: userProfile?.name || '', phone: userProfile?.phone || '', location: userProfile?.location || '', bio: userProfile?.bio || '' }
  })

  const addSkill = () => { const s = skillInput.trim(); if (s && !skills.includes(s)) { setSkills([...skills, s]); setSkillInput('') } }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      await updateUserProfile({ ...data, skills })
      setEditing(false)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update') } finally { setLoading(false) }
  }

  const rating = userProfile?.rating || 0

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="page-header">My Profile</h1>

      {/* Header card */}
      <div className="card overflow-hidden mb-5">
        <div className="h-24 bg-gradient-to-r from-primary-600 to-primary-800" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-10 gap-4">
            <div className="w-20 h-20 rounded-full bg-white shadow-md ring-4 ring-white flex items-center justify-center text-primary-600 font-bold text-3xl">
              {(userProfile?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <button onClick={() => setEditing(!editing)} className="btn-secondary flex items-center gap-2 w-fit">
              {editing ? <><XMarkIcon className="w-4 h-4" />Cancel</> : <><PencilIcon className="w-4 h-4" />Edit Profile</>}
            </button>
          </div>
          <div className="mt-3">
            <h2 className="text-xl font-bold text-gray-900">{userProfile?.name || 'Your Name'}</h2>
            <p className="text-gray-500 capitalize">{userProfile?.user_type || 'customer'}</p>
            <div className="flex items-center gap-1 mt-1">
              {[1,2,3,4,5].map(i => <StarIcon key={i} className={`w-4 h-4 ${i<=rating?'text-yellow-400 fill-yellow-400':'text-gray-200'}`} />)}
              <span className="text-sm text-gray-500 ml-1">{rating.toFixed(1)} ({userProfile?.total_reviews||0} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {editing ? (
        <div className="card p-6">
          <h2 className="section-title">Edit Profile</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[['name','Full Name',UserIcon],['phone','Phone',PhoneIcon],['location','Location',MapPinIcon]].map(([n,l,Icon])=>(
              <div key={n}><label className="block text-sm font-medium text-gray-700 mb-1.5">{l}</label>
                <div className="relative"><Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input {...register(n,{required:`${l} is required`})} className="input-field pl-10" /></div>
                {errors[n]&&<p className="text-red-500 text-xs mt-1">{errors[n].message}</p>}
              </div>
            ))}
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label><textarea {...register('bio')} rows={3} className="input-field" placeholder="Tell people about yourself…" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Skills</label>
              <div className="flex gap-2 mb-2"><input value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addSkill())} className="input-field flex-1" placeholder="Add skill…" /><button type="button" onClick={addSkill} className="btn-secondary px-4">Add</button></div>
              <div className="flex flex-wrap gap-2">{skills.map(s=><span key={s} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">{s}<button type="button" onClick={()=>setSkills(skills.filter(x=>x!==s))} className="text-primary-400 hover:text-primary-700">×</button></span>)}</div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading?'Saving…':'Save Changes'}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="card p-6">
            <h2 className="section-title">Contact Information</h2>
            <div className="space-y-3">
              {[[EnvelopeIcon, user?.email],[PhoneIcon, userProfile?.phone||'Not provided'],[MapPinIcon, userProfile?.location||'Not provided']].map(([Icon, val], i) => (
                <div key={i} className="flex items-center gap-3"><Icon className="w-5 h-5 text-gray-400" /><span className="text-gray-700 text-sm">{val}</span></div>
              ))}
            </div>
          </div>
          {userProfile?.bio && <div className="card p-6"><h2 className="section-title">About</h2><p className="text-gray-600 text-sm leading-relaxed">{userProfile.bio}</p></div>}
          {(userProfile?.skills||[]).length > 0 && (
            <div className="card p-6"><h2 className="section-title">Skills</h2>
              <div className="flex flex-wrap gap-2">{userProfile.skills.map(s=><span key={s} className="bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full text-sm font-medium">{s}</span>)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
