import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { createGig } from '../../services/firestoreService'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'Web Development', 'Mobile Development', 'UI/UX Design', 'Graphic Design',
  'Content Writing', 'Digital Marketing', 'Video Editing', 'Photography',
  'Data Entry', 'QA Testing', 'Consulting', 'Virtual Assistant'
]

export default function CreateGigPage() {
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) { setSkills([...skills, s]); setSkillInput('') }
  }

  const onSubmit = async (data) => {
    if (!user) { toast.error('Please login to create a gig'); navigate('/login'); return }
    try {
      setLoading(true)
      await createGig({
        title: data.title,
        category: data.category,
        description: data.description,
        price: Number(data.price),
        budget: Number(data.price),
        duration: data.duration,
        deadline: data.deadline || '',
        delivery_time: Number(data.delivery_time) || 7,
        skills,
        requirements: data.requirements || '',
        location: data.location || 'Remote',
        employer_id: user.uid,
        posted_by: user.uid,
        posted_by_name: userProfile?.name || user.displayName || user.email,
        employer_name: userProfile?.name || user.displayName || user.email,
        status: 'open',
      })
      toast.success('Gig created successfully! 🎉')
      navigate('/gigs')
    } catch (e) {
      console.error('Create gig error:', e)
      toast.error(e.message || 'Failed to create gig. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="page-header">Post a Gig</h1>
          <p className="page-subtitle">Find the right freelancer for your project</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Gig Title</label>
              <input {...register('title', { required: 'Title is required' })} className="input-field" placeholder="e.g. Build a full-stack React & Node.js app" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
              <select {...register('category', { required: 'Category is required' })} className="input-field">
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Project Description</label>
              <textarea
                {...register('description', { required: 'Description is required', minLength: { value: 50, message: 'Minimum 50 characters' } })}
                rows={5} className="input-field"
                placeholder="Describe what you need, the expected deliverables, and any specific requirements..."
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            {/* Budget + Delivery */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Budget (₹)</label>
                <input {...register('price', { required: 'Required', min: { value: 100, message: 'Min ₹100' } })} type="number" className="input-field" placeholder="15000" />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Delivery (days)</label>
                <input {...register('delivery_time', { required: 'Required', min: { value: 1, message: 'Min 1 day' } })} type="number" className="input-field" placeholder="14" />
                {errors.delivery_time && <p className="text-red-500 text-xs mt-1">{errors.delivery_time.message}</p>}
              </div>
            </div>

            {/* Duration + Deadline */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Duration</label>
                <select {...register('duration', { required: 'Required' })} className="input-field">
                  <option value="">Select duration</option>
                  {['Less than 1 week', '1–2 weeks', '2–4 weeks', '1–3 months', '3–6 months', '6+ months'].map(d => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
                {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Deadline (optional)</label>
                <input {...register('deadline')} type="date" className="input-field" />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
              <select {...register('location')} className="input-field">
                {['Remote', 'Delhi NCR', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'].map(l => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Required Skills</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="input-field flex-1"
                  placeholder="Type a skill and press Enter"
                />
                <button type="button" onClick={addSkill} className="btn-secondary px-4">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <span key={s} className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    {s}
                    <button type="button" onClick={() => setSkills(skills.filter(x => x !== s))} className="text-primary-400 hover:text-primary-700 ml-1">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Requirements from Freelancer (optional)</label>
              <textarea {...register('requirements')} rows={3} className="input-field" placeholder="What information or assets do you need from the freelancer before starting?" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Posting…</>
                ) : 'Post Gig'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
