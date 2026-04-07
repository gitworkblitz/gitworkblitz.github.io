import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { createGig } from '../../services/firestoreService'
import toast from 'react-hot-toast'

const CATEGORIES = ['Web Development','Mobile Development','UI/UX Design','Graphic Design','Content Writing','Digital Marketing','Video Editing','Photography','Data Entry','QA Testing','Consulting','Virtual Assistant']

export default function CreateGigPage() {
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')

  const addSkill = () => { const s = skillInput.trim(); if (s && !skills.includes(s)) { setSkills([...skills, s]); setSkillInput('') } }

  const onSubmit = async (data) => {
    if (!user) {
      toast.error('Please login to create a gig')
      navigate('/login')
      return
    }
    try {
      setLoading(true)
      await createGig({
        title: data.title,
        category: data.category,
        description: data.description,
        price: Number(data.price),
        budget: Number(data.price),
        delivery_time: Number(data.delivery_time),
        skills,
        requirements: data.requirements || '',
        location: 'Remote',
        employer_id: user.uid,
        freelancer_id: user.uid,
        freelancer_name: userProfile?.name || user.displayName || user.email,
      })
      toast.success('Gig created successfully!')
      navigate('/gigs')
    } catch (e) {
      console.error('Create gig error:', e)
      toast.error(e.message || 'Failed to create gig. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6"><h1 className="page-header">Create a Gig</h1><p className="page-subtitle">Offer your skills and start earning</p></div>
        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Gig Title</label><input {...register('title',{required:'Title is required'})} className="input-field" placeholder="e.g. I will build a responsive React website" />{errors.title&&<p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}</div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select {...register('category',{required:'Category is required'})} className="input-field">
                <option value="">Select category</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>{errors.category&&<p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label><textarea {...register('description',{required:'Description is required'})} rows={5} className="input-field" placeholder="Describe what you'll deliver, what's included, and why clients should choose you…" />{errors.description&&<p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}</div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹)</label><input {...register('price',{required:'Price is required',min:{value:1,message:'Min ₹1'}})} type="number" className="input-field" placeholder="5000" />{errors.price&&<p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery (days)</label><input {...register('delivery_time',{required:'Required',min:{value:1,message:'Min 1 day'}})} type="number" className="input-field" placeholder="7" />{errors.delivery_time&&<p className="text-red-500 text-xs mt-1">{errors.delivery_time.message}</p>}</div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Skills</label>
              <div className="flex gap-2 mb-2"><input value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addSkill())} className="input-field flex-1" placeholder="Add skills…" /><button type="button" onClick={addSkill} className="btn-secondary px-4">Add</button></div>
              <div className="flex flex-wrap gap-2">{skills.map(s=><span key={s} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">{s}<button type="button" onClick={()=>setSkills(skills.filter(x=>x!==s))} className="text-primary-400 hover:text-primary-700 ml-1">×</button></span>)}</div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Requirements from client (optional)</label><textarea {...register('requirements')} rows={3} className="input-field" placeholder="What do you need from the client to get started?" /></div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={()=>navigate(-1)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">{loading?'Creating…':'Create Gig'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
