import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { createJob } from '../../services/firestoreService'
import toast from 'react-hot-toast'

export default function CreateJobPage() {
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
    if (!user) {
      toast.error('Please login to post a job')
      navigate('/login')
      return
    }
    try {
      setLoading(true)
      await createJob({
        title: data.title,
        company: data.company,
        description: data.description,
        location: data.location,
        employment_type: data.employment_type,
        salary_min: Number(data.salary_min),
        salary_max: Number(data.salary_max),
        experience_required: Number(data.experience_required),
        deadline: data.deadline,
        skills_required: skills,
        posted_by: user.uid,
        poster_name: userProfile?.name || user.displayName || user.email,
        employer_id: user.uid,
      })
      toast.success('Job posted successfully!')
      navigate('/jobs')
    } catch (e) {
      console.error('Create job error:', e)
      toast.error(e.message || 'Failed to post job. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6"><h1 className="page-header">Post a Job</h1><p className="page-subtitle">Find the perfect candidate for your opening</p></div>
        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {[['title','Job Title','Senior React Developer',{required:'Title is required'}],['company','Company Name','Tech Corp India',{required:'Company is required'}]].map(([n,l,p,r])=>(
              <div key={n}><label className="block text-sm font-medium text-gray-700 mb-1.5">{l}</label><input {...register(n,r)} className="input-field" placeholder={p} />{errors[n]&&<p className="text-red-500 text-xs mt-1">{errors[n].message}</p>}</div>
            ))}
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label><textarea {...register('description',{required:'Description is required'})} rows={4} className="input-field" placeholder="Describe the role and responsibilities…" />{errors.description&&<p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}</div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label><input {...register('location',{required:'Location is required'})} className="input-field" placeholder="Delhi NCR" />{errors.location&&<p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                <select {...register('employment_type',{required:'Type is required'})} className="input-field">
                  {['full_time','part_time','contract','internship','remote'].map(t=><option key={t} value={t}>{t.replace('_',' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Min Salary (₹/yr)</label><input {...register('salary_min',{required:'Required'})} type="number" className="input-field" placeholder="600000" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Max Salary (₹/yr)</label><input {...register('salary_max',{required:'Required'})} type="number" className="input-field" placeholder="1200000" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Experience (years)</label><input {...register('experience_required',{required:'Required'})} type="number" className="input-field" placeholder="2" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Application Deadline</label><input {...register('deadline',{required:'Required'})} type="date" className="input-field" /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Required Skills</label>
              <div className="flex gap-2 mb-2">
                <input value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addSkill())} className="input-field flex-1" placeholder="Type skill & press Enter" />
                <button type="button" onClick={addSkill} className="btn-secondary px-4">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">{skills.map(s=><span key={s} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">{s}<button type="button" onClick={()=>setSkills(skills.filter(x=>x!==s))} className="text-primary-400 hover:text-primary-700 ml-1">×</button></span>)}</div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={()=>navigate(-1)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">{loading?'Posting…':'Post Job'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
