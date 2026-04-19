import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Settings as Cog6ToothIcon, Mail as EnvelopeIcon, ShieldCheck as ShieldCheckIcon, Bell as BellIcon, CheckCircle as CheckCircleIcon } from 'lucide-react'

export default function AdminSettings() {
  const { userProfile } = useAuth()
  const [settings, setSettings] = useState({
    platformName: 'WorkSphere',
    adminEmail: import.meta.env.VITE_ADMIN_EMAIL || 'worksphere.admin@gmail.com',
    maintenanceMode: false,
    emailNotifications: true,
    autoApproveReviews: false,
    maxBookingsPerDay: 10,
  })

  const handleSave = () => {
    toast.success('Settings saved (simulated)')
  }

  return (
    <div>
      <h1 className="page-header">Settings</h1>
      <p className="page-subtitle">Admin panel configuration</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General */}
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Cog6ToothIcon className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900">General</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
              <input type="text" value={settings.platformName} onChange={e => setSettings(p => ({ ...p, platformName: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
              <input type="email" value={settings.adminEmail} disabled className="input-field bg-gray-50 text-gray-500" />
              <p className="text-xs text-gray-400 mt-1">Controlled via VITE_ADMIN_EMAIL env variable</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Maintenance Mode</p>
                <p className="text-xs text-gray-400">Disable public access temporarily</p>
              </div>
              <button onClick={() => setSettings(p => ({ ...p, maintenanceMode: !p.maintenanceMode }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.maintenanceMode ? 'bg-primary-600' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${settings.maintenanceMode ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <BellIcon className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-gray-900">Email Notifications</p><p className="text-xs text-gray-400">Send email alerts for new signups</p></div>
              <button onClick={() => setSettings(p => ({ ...p, emailNotifications: !p.emailNotifications }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.emailNotifications ? 'bg-primary-600' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${settings.emailNotifications ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-gray-900">Auto-approve Reviews</p><p className="text-xs text-gray-400">Publish reviews without moderation</p></div>
              <button onClick={() => setSettings(p => ({ ...p, autoApproveReviews: !p.autoApproveReviews }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.autoApproveReviews ? 'bg-primary-600' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${settings.autoApproveReviews ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Bookings Per Day</label>
              <input type="number" value={settings.maxBookingsPerDay} onChange={e => setSettings(p => ({ ...p, maxBookingsPerDay: parseInt(e.target.value) || 10 }))} className="input-field w-32" />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <ShieldCheckIcon className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Security</h3>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-green-800 font-medium flex items-center gap-1.5"><CheckCircleIcon className="w-4 h-4 text-green-600" /> Firebase Authentication is active</p>
            <p className="text-xs text-green-600 mt-1">All user sessions are managed via Firebase Auth. Admin access is restricted to {settings.adminEmail}</p>
          </div>
          <button onClick={handleSave} className="btn-primary">Save Settings</button>
        </div>
      </div>
    </div>
  )
}
