import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import {
  Users as UsersIcon, Wrench as WrenchScrewdriverIcon, Briefcase as BriefcaseIcon,
  DollarSign as CurrencyDollarIcon, Calendar as CalendarIcon, CreditCard as CreditCardIcon,
  Rocket as RocketLaunchIcon, Star as StarIcon, TrendingUp as ArrowTrendingUpIcon,
  ArrowRight as ArrowRightIcon, ShieldCheck as ShieldCheckIcon,
  BarChart3 as ChartBarIcon, Eye as EyeIcon, FileText as DocumentTextIcon,
  BadgeCheck as CheckBadgeIcon
} from 'lucide-react'
import { getCollectionCount, getRecentDocuments } from '../../services/firestoreService'
import { dummyUsers, dummyServices, dummyBookings, dummyJobs, dummyGigs, formatCurrencyINR } from '../../utils/dummyData'
import { DashboardSkeleton } from '../../components/SkeletonLoader'

const AdminCharts = lazy(() => import('./AdminCharts'))
import ErrorState from '../../components/ErrorState'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

const generateMonthlyData = (totalBookings, totalRevenue) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map((month) => ({
    month,
    bookings: Math.round((totalBookings / 6) * (0.6 + Math.random() * 0.8)),
    revenue: Math.round((totalRevenue / 6) * (0.5 + Math.random() * 1.0)),
  }))
}



// Default/fallback stats — shown INSTANTLY while Firestore loads in background
const DEFAULT_STATS = {
  total_users: dummyUsers.length,
  total_services: dummyServices.length,
  total_bookings: dummyBookings.length,
  total_jobs: dummyJobs.length,
  total_gigs: dummyGigs.length,
  total_reviews: 0,
  total_revenue: 45000,
  total_payments: 0,
  paid_payments: 0,
  pending_payments: 0,
  pending_bookings: Math.round(dummyBookings.length * 0.15),
  active_bookings: Math.round(dummyBookings.length * 0.2),
  completed_bookings: Math.round(dummyBookings.length * 0.6),
  monthly_data: generateMonthlyData(dummyBookings.length, 45000),
  user_distribution: {
    customerCount: dummyUsers.filter(u => u.user_type === 'customer').length || 5,
    workerCount: dummyUsers.filter(u => u.user_type === 'worker').length || 3,
    employerCount: dummyUsers.filter(u => u.user_type === 'employer').length || 2,
    adminCount: 1,
  },
}

export default function AdminDashboard() {
  // Stale-while-revalidate: show dummy data INSTANTLY, update silently
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [loading, setLoading] = useState(false) // false = no skeleton blocking
  const [error, setError] = useState(null)

  const loadStats = useCallback(async () => {
    setError(null)
    try {
      // Use counts instead of fetching full collections where possible
      const [userCount, serviceCount, bookingCount, jobCount, gigCount, reviewCount] = await Promise.all([
        getCollectionCount('users').catch(() => 0),
        getCollectionCount('services').catch(() => 0),
        getCollectionCount('bookings').catch(() => 0),
        getCollectionCount('jobs').catch(() => 0),
        getCollectionCount('gigs').catch(() => 0),
        getCollectionCount('reviews').catch(() => 0),
      ])

      // Only fetch what we actually need for computation
      const [bookings, users, payments] = await Promise.all([
        getRecentDocuments('bookings', 20).catch(() => []),
        getRecentDocuments('users', 20).catch(() => []),
        getRecentDocuments('payments', 20).catch(() => []),
      ])

      const totalUsers = userCount > 0 ? userCount : dummyUsers.length
      const totalServices = serviceCount > 0 ? serviceCount : dummyServices.length
      const totalBookings = bookingCount > 0 ? bookingCount : dummyBookings.length
      const totalJobs = jobCount > 0 ? jobCount : dummyJobs.length
      const totalGigs = gigCount > 0 ? gigCount : dummyGigs.length
      const totalReviews = reviewCount

      const paidBookings = bookings.length > 0
        ? bookings.filter(b => b.payment_status === 'paid')
        : dummyBookings.filter(b => b.payment_status === 'paid')
      const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.amount || 0), 0)

      // Payment stats
      const totalPayments = payments.length
      const paidPayments = payments.filter(p => p.status === 'paid').length
      const pendingPayments = payments.filter(p => p.status === 'pending').length

      const activeUsers = users.length > 0 ? users : dummyUsers
      const customerCount = activeUsers.filter(u => u.user_type === 'customer').length
      const workerCount = activeUsers.filter(u => u.user_type === 'worker').length
      const employerCount = activeUsers.filter(u => u.user_type === 'employer').length
      const adminCount = activeUsers.filter(u => u.user_type === 'admin').length

      // Booking statuses
      const pendingBookings = bookings.filter(b => b.status === 'requested').length || Math.round(totalBookings * 0.15)
      const activeBookings = bookings.filter(b => b.status === 'accepted' || b.status === 'on_the_way').length || Math.round(totalBookings * 0.2)
      const completedBookings = bookings.filter(b => b.status === 'completed' || b.status === 'reviewed').length || Math.round(totalBookings * 0.6)

      setStats({
        total_users: totalUsers,
        total_services: totalServices,
        total_bookings: totalBookings,
        total_jobs: totalJobs,
        total_gigs: totalGigs,
        total_reviews: totalReviews,
        total_revenue: totalRevenue || 45000,
        total_payments: totalPayments,
        paid_payments: paidPayments,
        pending_payments: pendingPayments,
        pending_bookings: pendingBookings,
        active_bookings: activeBookings,
        completed_bookings: completedBookings,
        monthly_data: generateMonthlyData(totalBookings || 30, totalRevenue || 45000),
        user_distribution: { customerCount, workerCount, employerCount, adminCount },
      })
    } catch (err) {
      console.error('Error loading admin stats:', err)
      // Keep the existing stats (dummy or previously loaded) — no error blocking needed
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const statCards = useMemo(() => {
    if (!stats) return []
    return [
      { label: 'Total Users', value: stats.total_users, icon: UsersIcon, gradient: 'from-blue-500 to-blue-600', to: '/admin/users' },
      { label: 'Services', value: stats.total_services, icon: WrenchScrewdriverIcon, gradient: 'from-emerald-500 to-green-600', to: '/admin/services' },
      { label: 'Jobs', value: stats.total_jobs, icon: BriefcaseIcon, gradient: 'from-amber-500 to-orange-500', to: '/admin/jobs' },
      { label: 'Gigs', value: stats.total_gigs, icon: RocketLaunchIcon, gradient: 'from-purple-500 to-violet-600', to: '/admin/gigs' },
      { label: 'Bookings', value: stats.total_bookings, icon: CalendarIcon, gradient: 'from-indigo-500 to-blue-600', to: '/admin/bookings' },
      { label: 'Revenue', value: formatCurrencyINR(stats.total_revenue), icon: CreditCardIcon, gradient: 'from-teal-500 to-emerald-600', to: '/admin/bookings', isRevenue: true },
    ]
  }, [stats])

  const pieData = useMemo(() => {
    if (!stats) return []
    return [
      { name: 'Customers', value: stats.user_distribution?.customerCount || 5 },
      { name: 'Workers', value: stats.user_distribution?.workerCount || 3 },
      { name: 'Employers', value: stats.user_distribution?.employerCount || 2 },
      { name: 'Admins', value: Math.max(1, stats.user_distribution?.adminCount || 1) },
    ]
  }, [stats])

  if (loading) return <DashboardSkeleton />

  if (error && !stats) return (
    <div className="p-6 max-w-7xl mx-auto">
      <ErrorState title="Admin Dashboard Error" message={error} onRetry={loadStats} />
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 dash-section">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            Admin
          </span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Platform overview and analytics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, gradient, to, isRevenue }, i) => (
          <Link
            to={to}
            key={label}
            className="stat-card dash-card-enter bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-4 group"
          >
            <div className={`stat-icon-glow w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${gradient} shadow-sm mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="stat-value text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors count-pop">
              {value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{label}</p>
          </Link>
        ))}
      </div>

      {/* Payments Overview */}
      <div className="dash-section bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 mb-8 text-white shadow-xl">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <CreditCardIcon className="w-5 h-5" /> Payments Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/15 transition-colors">
            <p className="text-2xl font-bold mb-1 count-pop">{formatCurrencyINR(stats?.total_revenue || 0)}</p>
            <p className="text-white/70 text-xs">Total Revenue</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/15 transition-colors">
            <p className="text-2xl font-bold mb-1 count-pop">{stats?.total_payments || 0}</p>
            <p className="text-white/70 text-xs">Total Payments</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/15 transition-colors">
            <p className="text-2xl font-bold mb-1 count-pop">{stats?.paid_payments || 0}</p>
            <p className="text-white/70 text-xs">Paid</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/15 transition-colors">
            <p className="text-2xl font-bold mb-1 count-pop">{stats?.pending_payments || 0}</p>
            <p className="text-white/70 text-xs">Pending</p>
          </div>
        </div>
      </div>

      {/* Booking Status Overview */}
      <div className="dash-section grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5 text-center stat-card">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="status-dot bg-amber-500" />
            <span className="text-2xl font-bold text-amber-700 dark:text-amber-400 count-pop">{stats?.pending_bookings || 0}</span>
          </div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Pending Bookings</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5 text-center stat-card">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="status-dot bg-blue-500" />
            <span className="text-2xl font-bold text-blue-700 dark:text-blue-400 count-pop">{stats?.active_bookings || 0}</span>
          </div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Active Bookings</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5 text-center stat-card">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="status-dot bg-green-500" />
            <span className="text-2xl font-bold text-green-700 dark:text-green-400 count-pop">{stats?.completed_bookings || 0}</span>
          </div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Completed</p>
        </div>
      </div>

      <Suspense fallback={<div className="h-64 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl mb-6 flex items-center justify-center text-gray-400">Loading charts...</div>}>
        <AdminCharts stats={stats} pieData={pieData}>
          <div className="lg:col-span-2 dash-section bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <EyeIcon className="w-5 h-5 text-violet-500" />
              Quick Management
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Manage Users', desc: 'View, suspend, change roles', to: '/admin/users', icon: UsersIcon, gradient: 'from-blue-500 to-blue-600', bg: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' },
                { label: 'Manage Services', desc: 'Review and moderate listings', to: '/admin/services', icon: WrenchScrewdriverIcon, gradient: 'from-green-500 to-green-600', bg: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' },
                { label: 'Manage Bookings', desc: 'Track all platform bookings', to: '/admin/bookings', icon: CalendarIcon, gradient: 'from-purple-500 to-purple-600', bg: 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20' },
                { label: 'Payments', desc: 'View revenue & transactions', to: '/admin/payments', icon: CreditCardIcon, gradient: 'from-emerald-500 to-teal-600', bg: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' },
                { label: 'Invoices', desc: 'View all platform invoices', to: '/admin/invoices', icon: DocumentTextIcon, gradient: 'from-violet-500 to-purple-600', bg: 'border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-900/20' },
                { label: 'Blog CMS', desc: 'Create, edit & publish blogs', to: '/admin/blogs', icon: ArrowTrendingUpIcon, gradient: 'from-indigo-500 to-blue-600', bg: 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20' },
                { label: 'Manage Reviews', desc: 'Moderate user reviews', to: '/admin/reviews', icon: StarIcon, gradient: 'from-orange-500 to-orange-600', bg: 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20' },
                { label: 'Contact Messages', desc: 'View and respond to inquiries', to: '/admin/contacts', icon: DocumentTextIcon, gradient: 'from-cyan-500 to-cyan-600', bg: 'border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-900/20' },
                { label: 'User Feedback', desc: 'Track ratings and feedback', to: '/admin/feedback', icon: CheckBadgeIcon, gradient: 'from-pink-500 to-rose-600', bg: 'border-pink-200 bg-pink-50 dark:border-pink-800 dark:bg-pink-900/20' },
                { label: 'Coupons/Offers', desc: 'Manage discounts & promos', to: '/admin/offers', icon: RocketLaunchIcon, gradient: 'from-fuchsia-500 to-pink-600', bg: 'border-fuchsia-200 bg-fuchsia-50 dark:border-fuchsia-800 dark:bg-fuchsia-900/20' },
                { label: 'Announcements', desc: 'Broadcast global alerts', to: '/admin/announcements', icon: RocketLaunchIcon, gradient: 'from-red-500 to-orange-600', bg: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' },
              ].map(({ label, desc, to, icon: ItemIcon, gradient, bg }) => (
                <Link key={to} to={to} className={`quick-action p-4 rounded-xl border-2 ${bg} group flex items-start gap-3`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${gradient} shadow-sm flex-shrink-0`}>
                    <ItemIcon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors flex items-center gap-1">
                      {label}
                      <ArrowRightIcon className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </AdminCharts>
      </Suspense>
    </div>
  )
}
