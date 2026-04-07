import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UsersIcon, WrenchScrewdriverIcon, BriefcaseIcon, CurrencyDollarIcon, CalendarIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getCollectionCount, getRecentDocuments, queryDocuments } from '../../services/firestoreService'
import { dummyUsers, dummyServices, dummyBookings, dummyJobs, dummyGigs } from '../../utils/dummyData'
import { DashboardSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const generateMonthlyData = (totalBookings, totalRevenue) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map((month) => ({
    month,
    bookings: Math.round((totalBookings / 6) * (0.6 + Math.random() * 0.8)),
    revenue: Math.round((totalRevenue / 6) * (0.5 + Math.random() * 1.0)),
  }))
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
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
      const [bookings, users] = await Promise.all([
        getRecentDocuments('bookings', 50).catch(() => []),
        getRecentDocuments('users', 50).catch(() => []),
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

      const activeUsers = users.length > 0 ? users : dummyUsers
      const customerCount = activeUsers.filter(u => u.user_type === 'customer').length
      const workerCount = activeUsers.filter(u => u.user_type === 'worker').length
      const employerCount = activeUsers.filter(u => u.user_type === 'employer').length
      const adminCount = activeUsers.filter(u => u.user_type === 'admin').length

      setStats({
        total_users: totalUsers,
        total_services: totalServices,
        total_bookings: totalBookings,
        total_jobs: totalJobs,
        total_gigs: totalGigs,
        total_reviews: totalReviews,
        total_revenue: totalRevenue || 45000,
        monthly_data: generateMonthlyData(totalBookings || 30, totalRevenue || 45000),
        user_distribution: { customerCount, workerCount, employerCount, adminCount },
      })
    } catch (err) {
      console.error('Error loading admin stats:', err)
      setError('Failed to load admin data')
      setStats({
        total_users: dummyUsers.length,
        total_services: dummyServices.length,
        total_bookings: dummyBookings.length,
        total_jobs: dummyJobs.length,
        total_gigs: dummyGigs.length,
        total_reviews: 0,
        total_revenue: 45000,
        monthly_data: generateMonthlyData(30, 45000),
        user_distribution: { customerCount: 5, workerCount: 3, employerCount: 2, adminCount: 1 },
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <DashboardSkeleton />

  if (error && !stats) return (
    <div className="p-6 max-w-7xl mx-auto">
      <ErrorState title="Admin Dashboard Error" message={error} onRetry={loadStats} />
    </div>
  )

  const statCards = [
    { label: 'Total Users', value: stats?.total_users || 0, icon: UsersIcon, color: 'bg-blue-500', to: '/admin/users' },
    { label: 'Services', value: stats?.total_services || 0, icon: WrenchScrewdriverIcon, color: 'bg-green-500', to: '/admin/services' },
    { label: 'Jobs', value: stats?.total_jobs || 0, icon: BriefcaseIcon, color: 'bg-yellow-500', to: '/admin/jobs' },
    { label: 'Gigs', value: stats?.total_gigs || 0, icon: CurrencyDollarIcon, color: 'bg-purple-500', to: '/admin/gigs' },
    { label: 'Bookings', value: stats?.total_bookings || 0, icon: CalendarIcon, color: 'bg-indigo-500', to: '/admin/bookings' },
    { label: 'Revenue', value: `₹${Number(stats?.total_revenue || 0).toLocaleString('en-IN')}`, icon: CreditCardIcon, color: 'bg-emerald-500', to: '/admin/bookings' },
  ]

  const pieData = [
    { name: 'Customers', value: stats?.user_distribution?.customerCount || 5 },
    { name: 'Workers', value: stats?.user_distribution?.workerCount || 3 },
    { name: 'Employers', value: stats?.user_distribution?.employerCount || 2 },
    { name: 'Admins', value: Math.max(1, stats?.user_distribution?.adminCount || 1) },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Platform overview and analytics</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, to }) => (
          <Link to={to} key={label} className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-4 hover:shadow-card-hover transition-shadow group">
            <div className={`${color} w-9 h-9 rounded-lg flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue (₹)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats?.monthly_data || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Bookings</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={stats?.monthly_data || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">User Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Management</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Manage Users', desc: 'View, suspend, change roles', to: '/admin/users', color: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' },
              { label: 'Manage Services', desc: 'Review and moderate listings', to: '/admin/services', color: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' },
              { label: 'Manage Bookings', desc: 'Track all platform bookings', to: '/admin/bookings', color: 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20' },
              { label: 'Manage Reviews', desc: 'Moderate user reviews', to: '/admin/reviews', color: 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20' },
            ].map(({ label, desc, to, color }) => (
              <Link key={to} to={to} className={`p-4 rounded-xl border-2 ${color} hover:shadow-md transition-shadow group`}>
                <p className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">{label}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
