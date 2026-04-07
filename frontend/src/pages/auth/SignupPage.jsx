import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { EnvelopeIcon, LockClosedIcon, UserIcon, PhoneIcon, MapPinIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

import { ShoppingBagIcon, WrenchScrewdriverIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'

const ROLES = [
  { value: 'customer', label: 'Customer', desc: 'Book services and hire professionals', icon: ShoppingBagIcon },
  { value: 'worker', label: 'Worker', desc: 'Offer your skills and get hired', icon: WrenchScrewdriverIcon },
  { value: 'employer', label: 'Employer', desc: 'Post jobs and find talent', icon: BuildingOfficeIcon },
]

export default function SignupPage() {
  const { signup, getRedirectPath } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', location: '', userType: 'customer'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1 = role, 2 = details

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const { profile } = await signup({
        name: form.name, email: form.email, password: form.password,
        phone: form.phone, location: form.location, userType: form.userType
      })
      const redirectPath = getRedirectPath(profile)
      navigate(redirectPath, { replace: true })
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('email-already-in-use')) {
        setError('This email is already registered. Try logging in instead.')
      } else if (msg.includes('weak-password')) {
        setError('Password is too weak. Use at least 6 characters.')
      } else {
        setError(msg || 'Signup failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-32 left-16 w-80 h-80 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-primary-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold">WS</span>
            </div>
            <span className="text-3xl font-bold">WorkSphere</span>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Join India's growing<br />workforce platform
          </h2>
          <p className="text-primary-100 text-lg mb-10 max-w-md leading-relaxed">
            Whether you need a service, want to offer your skills, or are hiring talent — WorkSphere connects you with the right people.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { n: '10,000+', l: 'Users' },
              { n: '5,000+', l: 'Services' },
              { n: '1,200+', l: 'Jobs' },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                <p className="text-xl font-bold">{s.n}</p>
                <p className="text-primary-200 text-xs mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-4 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">WS</span>
            </div>
            <span className="font-bold text-gray-900 text-2xl">WorkSphere</span>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>1</div>
              <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
            </div>

            {step === 1 ? (
              <>
                <div className="text-center mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Role</h1>
                  <p className="text-gray-500 text-sm">How will you use WorkSphere?</p>
                </div>
                <div className="space-y-2 mb-4">
                  {ROLES.map(r => (
                    <button key={r.value} onClick={() => setForm(p => ({ ...p, userType: r.value }))}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        form.userType === r.value
                          ? 'border-primary-600 bg-primary-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <r.icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{r.label}</p>
                        <p className="text-xs text-gray-500">{r.desc}</p>
                      </div>
                      {form.userType === r.value && (
                        <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep(2)} className="btn-primary w-full py-3 text-base" id="signup-next">
                  Continue
                </button>
              </>
            ) : (
              <>
                <div className="text-center mb-3">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
                  <p className="text-gray-500 text-sm">
                    Signing up as <span className="font-semibold text-primary-600 capitalize">{form.userType}</span>
                    <button onClick={() => setStep(1)} className="ml-1 text-primary-600 hover:underline text-xs">(change)</button>
                  </p>
                </div>

                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type="text" required value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className="input-field pl-10" placeholder="John Doe" id="signup-name" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Email</label>
                    <div className="relative">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type="email" required value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        className="input-field pl-10" placeholder="you@example.com" id="signup-email" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Phone</label>
                      <div className="relative">
                        <PhoneIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="tel" value={form.phone}
                          onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                          className="input-field pl-10" placeholder="+91" id="signup-phone" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Location</label>
                      <div className="relative">
                        <MapPinIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="text" value={form.location}
                          onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                          className="input-field pl-10" placeholder="City" id="signup-location" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Password</label>
                    <div className="relative">
                      <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type={showPassword ? 'text' : 'password'} required value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                        className="input-field pl-10 pr-10" placeholder="Min. 6 characters" id="signup-password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Confirm Password</label>
                    <div className="relative">
                      <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type="password" required value={form.confirmPassword}
                        onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                        className="input-field pl-10" placeholder="••••••••" id="signup-confirm" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} id="signup-submit"
                    className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
                    {loading ? (
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account...</>
                    ) : 'Create Account'}
                  </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-500">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">Sign In</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
