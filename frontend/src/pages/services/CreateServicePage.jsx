import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { createService } from '../../services/firestoreService'
import { SERVICE_CATEGORIES } from '../../utils/dummyData'
import toast from 'react-hot-toast'

export default function CreateServicePage() {
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    if (!user) {
      toast.error('Please login to post a service')
      navigate('/login')
      return
    }
    try {
      setLoading(true)
      await createService({
        title: data.title,
        category: data.category,
        description: data.description,
        price: Number(data.price),
        duration: Number(data.duration),
        location: data.location,
        worker_id: user.uid,
        worker_name: userProfile?.name || user.displayName || user.email,
      })
      toast.success('Service created successfully!')
      navigate('/services')
    } catch (e) {
      console.error('Create service error:', e)
      toast.error(e.message || 'Failed to create service. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="page-header">Post a New Service</h1>
          <p className="page-subtitle">List your service and start receiving bookings</p>
        </div>
        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Title</label>
              <input {...register('title', { required: 'Title is required' })} className="input-field" placeholder="e.g. Professional Home Cleaning" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select {...register('category', { required: 'Category is required' })} className="input-field">
                <option value="">Select category</option>
                {SERVICE_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea {...register('description', { required: 'Description is required' })} rows={4} className="input-field" placeholder="Describe your service in detail..." />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price</label>
                <input {...register('price', { required: 'Price is required', min: { value: 1, message: 'Min Rs.1' } })} type="number" className="input-field" placeholder="500" />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (minutes)</label>
                <input {...register('duration', { required: 'Duration is required', min: { value: 15, message: 'Min 15 min' } })} type="number" className="input-field" placeholder="60" />
                {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Location / Area</label>
              <input {...register('location', { required: 'Location is required' })} className="input-field" placeholder="e.g. Connaught Place, Delhi" />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Creating...' : 'Create Service'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
