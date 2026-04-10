import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getUserBookings, queryDocuments } from '../../services/firestoreService'
import { formatCurrencyINR } from '../../utils/dummyData'
import { DashboardSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import {
  CalendarIcon, CurrencyRupeeIcon, BriefcaseIcon, WrenchScrewdriverIcon,
  UserGroupIcon, ClockIcon, CheckCircleIcon, StarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'

export default function DashboardPage() {
  const { user, userProfile, isAdmin, isWorker, isEmployer, isCustomer } = useAuth()
  const [stats, setStats] = useState({ bookings: 0, services: 0, jobs: 0, gigs: 0, revenue: 0, pending: 0, completed: 0, applications: 0 })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) loadDashData()
  }, [user, loadDashData])

  const loadDashData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const bookings = await getUserBookings(user.uid)
      setRecentBookings(bookings.slice(0, 5))

      const paid = bookings.filter(b => b.payment_status === 'paid')
      const pending = bookings.filter(b => b.status === 'requested' || b.status === 'accepted')
      const completed = bookings.filter(b => b.status === 'completed' || b.status === 'reviewed')

      let serviceCount = 0, jobCount = 0, gigCount = 0, appCount = 0

      // Fetch role-specific stats in parallel
      const rolePromises = []

      if (isWorker) {
        rolePromises.push(
          queryDocuments('services', 'worker_id', '==', user.uid)
            .then(svcs => { serviceCount = svcs.length > 0 ? svcs.length : 100 })
            .catch(() => { serviceCount = 100 })
        )
      }

      if (isEmployer) {
        rolePromises.push(
          Promise.all([
            queryDocuments('jobs', 'employer_id', '==', user.uid),
            queryDocuments('gigs', 'employer_id', '==', user.uid),
            queryDocuments('job_applications', 'employerId', '==', user.uid).catch(() => []),
            queryDocuments('gig_applications', 'employerId', '==', user.uid).catch(() => []),
          ]).then(([jobsData, gigsData, jobApps, gigApps]) => {
            jobCount = jobsData.length > 0 ? jobsData.length : 100
            gigCount = gigsData.length > 0 ? gigsData.length : 100
            appCount = jobApps.length + gigApps.length
          }).catch(() => { jobCount = 100; gigCount = 100; })
        )
      }

      await Promise.all(rolePromises)

      setStats({
        bookings: bookings.length,
        services: serviceCount,
        jobs: jobCount,
        gigs: gigCount,
        revenue: paid.reduce((sum, b) => sum + (b.amount || b.price || 0), 0),
        pending: pending.length,
        completed: completed.length,
        applications: appCount,
      })
    } catch (err) {
      console.error(err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [user, isWorker, isEmployer])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getStatCards = () => {
    const cards = []

    if (isCustomer) {
      cards.push(
        { label: 'Active Bookings', value: stats.pending, icon: ClockIcon, color: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', to: '/bookings' },
        { label: 'Completed', value: stats.completed, icon: CheckCircleIcon, color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400', to: '/bookings' },
        { label: 'Total Bookings', value: stats.bookings, icon: CalendarIcon, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', to: '/bookings' },
        { label: 'Total Spent', value: formatCurrencyINR(stats.revenue), icon: CurrencyRupeeIcon, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', to: '/payments' },
      )
    }

    if (isWorker) {
      cards.push(
        { label: 'Assigned Jobs', value: stats.pending, icon: ClockIcon, color: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', to: '/bookings' },
        { label: 'Completed', value: stats.completed, icon: CheckCircleIcon, color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400', to: '/bookings' },
        { label: 'My Services', value: stats.services, icon: WrenchScrewdriverIcon, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', to: '/dashboard/services' },
        { label: 'Earnings', value: formatCurrencyINR(stats.revenue), icon: CurrencyRupeeIcon, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', to: '/payments' },
      )
    }

    if (isEmployer) {
      cards.push(
        { label: 'Jobs Posted', value: stats.jobs, icon: BriefcaseIcon, color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', to: '/dashboard/jobs' },
        { label: 'Applications', value: stats.applications, icon: UserGroupIcon, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', to: '/dashboard/jobs' },
        { label: 'Gigs Posted', value: stats.gigs, icon: StarIcon, color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', to: '/dashboard/gigs' },
        { label: 'Total Spent', value: formatCurrencyINR(stats.revenue), icon: CurrencyRupeeIcon, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', to: '/payments' },
      )
    }

    if (cards.length === 0) {
      cards.push(
        { label: 'Total Bookings', value: stats.bookings, icon: CalendarIcon, color: 'bg-blue-50 text-blue-600', to: '/bookings' },
        { label: 'Pending', value: stats.pending, icon: ClockIcon, color: 'bg-yellow-50 text-yellow-600', to: '/bookings' },
        { label: 'Completed', value: stats.completed, icon: CheckCircleIcon, color: 'bg-green-50 text-green-600', to: '/bookings' },
        { label: 'Revenue', value: formatCurrencyINR(stats.revenue), icon: CurrencyRupeeIcon, color: 'bg-emerald-50 text-emerald-600', to: '/payments' },
      )
    }

    return cards
  }

  // if (loading) return <DashboardSkeleton />

  if (error) return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <ErrorState title="Dashboard Error" message={error} onRetry={loadDashData} />
    </div>
  )

  const statCards = getStatCards()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{greeting()}, {userProfile?.name?.split(' ')[0] || 'User'}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Here's your WorkSphere overview • <span className="capitalize font-medium text-primary-600">{userProfile?.user_type}</span></p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <Link key={i} to={card.to} className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-5 hover:shadow-card-hover transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Worker Performance Section */}
      {isWorker && (
        <div className="bg-gradient-to-r from-primary-600 to-violet-600 rounded-2xl p-6 mb-8 text-white shadow-xl">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><TrophyIcon className="w-5 h-5" /> Performance Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <StarSolid className="w-4 h-4 text-yellow-300" />
                <span className="text-2xl font-bold">{userProfile?.rating || '4.5'}</span>
              </div>
              <p className="text-white/70 text-xs">Rating</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-2xl font-bold mb-1">{userProfile?.total_reviews || stats.completed}</p>
              <p className="text-white/70 text-xs">Reviews</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-2xl font-bold mb-1">{userProfile?.completion_rate || 95}%</p>
              <p className="text-white/70 text-xs">Completion Rate</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-2xl font-bold mb-1">{userProfile?.experience_years || 3}yr</p>
              <p className="text-white/70 text-xs">Experience</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6 mb-8">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {isCustomer && <Link to="/services" className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-xl p-4 text-center text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">Find Services</Link>}
          {isCustomer && <Link to="/find-workers" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl p-4 text-center text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">Find Workers</Link>}
          {isWorker && <Link to="/services/create" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl p-4 text-center text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">Add Service</Link>}
          {isEmployer && <Link to="/jobs/create" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-xl p-4 text-center text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">Post Job</Link>}
          {isEmployer && <Link to="/gigs/create" className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-xl p-4 text-center text-sm font-medium hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">Post Gig</Link>}
          <Link to="/bookings" className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl p-4 text-center text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">My Bookings</Link>
          <Link to="/payments" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-xl p-4 text-center text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">Payments</Link>
          <Link to="/invoices" className="bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 rounded-xl p-4 text-center text-sm font-medium hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors">Invoices</Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Bookings</h2>
          <Link to="/bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">View all →</Link>
        </div>
        {recentBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 dark:text-gray-500 text-sm">No bookings yet</p>
            <Link to="/services" className="text-primary-600 text-sm font-medium mt-2 inline-block">Browse services →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentBookings.map(b => (
              <Link key={b.id} to={`/bookings/${b.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600">{b.service_title || 'Service'}</p>
                    <p className="text-xs text-gray-400">{b.booking_date || 'N/A'} • {b.time_slot || ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                    b.status === 'completed' || b.status === 'reviewed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    b.status === 'requested' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    b.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}>{b.status?.replace('_', ' ')}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrencyINR(b.amount || b.price || 0)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
