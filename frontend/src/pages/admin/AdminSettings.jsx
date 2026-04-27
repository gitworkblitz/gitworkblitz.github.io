import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Settings as Cog6ToothIcon, Mail as EnvelopeIcon, ShieldCheck as ShieldCheckIcon, Bell as BellIcon, CheckCircle as CheckCircleIcon } from 'lucide-react'
import { getPlatformSettings, updatePlatformSettings } from '../../services/firestoreService'
import { DashboardSkeleton } from '../../components/SkeletonLoader'

export default function AdminSettings() {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    platformName: 'WorkSphere',
    adminEmail: import.meta.env.VITE_ADMIN_EMAIL || 'worksphere.admin@gmail.com',
    maintenanceMode: false,
    emailNotifications: true,
    autoApproveReviews: false,
    maxBookingsPerDay: 10,
  })

  useEffect(() => {
    getPlatformSettings().then(data => {
      if (data) setSettings(data)
    }).catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const success = await updatePlatformSettings(settings)
    if (success) {
      toast.success('Settings saved successfully to Firestore')
    } else {
      toast.error('Failed to save settings')
    }
    setSaving(false)
  }

  if (loading) return <div className="p-6 max-w-4xl"><DashboardSkeleton /></div>

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="page-header">Settings</h1>
      <p className="page-subtitle">Admin panel configuration</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
              <Cog6ToothIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">General</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform Name</label>
              <input type="text" value={settings.platformName} onChange={e => setSettings(p => ({ ...p, platformName: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Email</label>
              <input type="email" value={settings.adminEmail} disabled className="input-field bg-gray-50 dark:bg-gray-800/50 text-gray-500 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Controlled via environment variable or Firestore</p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Maintenance Mode</p>
                <p className="text-xs text-gray-500">Disable public access temporarily</p>
              </div>
              <button onClick={() => setSettings(p => ({ ...p, maintenanceMode: !p.maintenanceMode }))}
                className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${settings.maintenanceMode ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <BellIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Operations</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</p><p className="text-xs text-gray-500">Send email alerts for new actions</p></div>
              <button onClick={() => setSettings(p => ({ ...p, emailNotifications: !p.emailNotifications }))}
                className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${settings.emailNotifications ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${settings.emailNotifications ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-gray-900 dark:text-white">Auto-approve Reviews</p><p className="text-xs text-gray-500">Publish reviews without moderation</p></div>
              <button onClick={() => setSettings(p => ({ ...p, autoApproveReviews: !p.autoApproveReviews }))}
                className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${settings.autoApproveReviews ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${settings.autoApproveReviews ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Bookings Per Worker / Day</label>
              <input type="number" min="1" value={settings.maxBookingsPerDay} onChange={e => setSettings(p => ({ ...p, maxBookingsPerDay: parseInt(e.target.value) || 10 }))} className="input-field w-full sm:w-32" />
            </div>
          </div>
        </div>

        {/* Security & Save */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-6 lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <ShieldCheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Security & Actions</h3>
          </div>
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-green-800 dark:text-green-300 font-medium flex items-center gap-1.5"><CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-500" /> Firebase Authentication is active</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">All user sessions are securely managed. Admin access is restricted to {settings.adminEmail}.</p>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving} className="btn-primary min-w-[150px] flex justify-center items-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
