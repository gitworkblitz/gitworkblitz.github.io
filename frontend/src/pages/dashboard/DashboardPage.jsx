import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { getUserBookings, getQueryCount, queryDocumentsLimited } from '../../services/firestoreService'
import { formatCurrencyINR } from '../../utils/dummyData'
import { DashboardSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import {
  Calendar as CalendarIcon, IndianRupee as CurrencyRupeeIcon, Briefcase as BriefcaseIcon, Wrench as WrenchScrewdriverIcon,
  Users as UserGroupIcon, Clock as ClockIcon, CheckCircle as CheckCircleIcon, Star,
  Trophy as TrophyIcon, FileText as DocumentTextIcon, Truck as TruckIcon,
  TrendingUp as ArrowTrendingUpIcon, Eye as EyeIcon, Rocket as RocketLaunchIcon,
  BarChart as ChartBarIcon, ArrowRight as ArrowRightIcon, Sparkles as SparklesIcon,
  BadgeCheck as CheckBadgeIcon, MessageCircle
} from 'lucide-react'

/* ──────────────────────────────────────────────
   Animation variants
   ────────────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 28 }
  }
}

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
  }
}

const cardHover = {
  scale: 1.03,
  y: -3,
  transition: { type: 'spring', stiffness: 400, damping: 25 }
}

/* ──────────────────────────────────────────────
   Sub-components (memoized)
   ────────────────────────────────────────────── */
const StatCard = React.memo(function StatCard({ card, index }) {
  return (
    <motion.div variants={itemVariants} whileHover={cardHover} whileTap={{ scale: 0.98 }}>
      <Link
        to={card.to}
        className="stat-card block bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 p-5 group transition-shadow"
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`stat-icon-glow w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${card.gradient} shadow-sm`}>
            <card.icon className="w-5.5 h-5.5 text-white" />
          </div>
          {card.pulse && (
            <span className="flex items-center gap-1.5">
              <span className="status-dot bg-amber-500" />
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Live</span>
            </span>
          )}
        </div>
        <p className="stat-value text-2xl font-bold text-gray-900 dark:text-white count-pop">
          {card.value}
        </p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{card.label}</p>
          <ArrowRightIcon className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
        </div>
      </Link>
    </motion.div>
  )
})

const QuickActionButton = React.memo(function QuickActionButton({ action, index }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
    >
      <Link
        to={action.to}
        className={`quick-action ${action.color} rounded-full py-3.5 px-4 text-center text-sm font-semibold transition-all flex items-center justify-center gap-2`}
      >
        <action.icon className="w-4 h-4" />
        {action.label}
      </Link>
    </motion.div>
  )
})

const BookingRow = React.memo(function BookingRow({ booking, getStatusConfig }) {
  const statusConf = getStatusConfig(booking.status)
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ x: 4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <Link to={`/bookings/${booking.id}`}
        className="booking-row flex items-center justify-between p-3 rounded-xl group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <CalendarIcon className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
              {booking.service_title || 'Service'}
            </p>
            <p className="text-xs text-gray-400">{booking.booking_date || 'N/A'} • {booking.time_slot || ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${statusConf.color}`}>
            <span className={`status-dot ${statusConf.dotColor}`} />
            {statusConf.label}
          </span>
          {booking.payment_status === 'paid' ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-semibold">Paid</span>
          ) : booking.status !== 'cancelled' ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-semibold">Unpaid</span>
          ) : null}
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {formatCurrencyINR(booking.amount || booking.price || 0)}
          </span>
        </div>
      </Link>
    </motion.div>
  )
})

/* ──────────────────────────────────────────────
   Main Dashboard
   ────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user, userProfile, isAdmin, isWorker, isEmployer, isCustomer } = useAuth()
  const [stats, setStats] = useState({
    bookings: 0, services: 0, jobs: 0, gigs: 0,
    revenue: 0, pending: 0, completed: 0, applications: 0,
    activeBookings: 0, invoiceCount: 0, pendingPayments: 0,
    appliedCount: 0, shortlistedCount: 0, rejectedCount: 0,
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true) // true = show skeleton on first render until data arrives
  const [error, setError] = useState(null)
  const retryRef = useRef(0)

  const loadDashData = useCallback(async () => {
    if (!user) return
    setError(null)
    try {
      // Fetch bookings (bounded)
      const bookings = await getUserBookings(user.uid, 50)

      // If bookings are empty and this is the first attempt, retry once
      // (handles slow Firestore cold-start or network lag)
      if (bookings.length === 0 && retryRef.current < 1) {
        retryRef.current++
        setTimeout(() => loadDashData(), 1500)
        return
      }

      setRecentBookings(bookings.slice(0, 5))

      const paid = bookings.filter(b => b.payment_status === 'paid')
      const pending = bookings.filter(b => b.status === 'requested' || b.status === 'accepted')
      const active = bookings.filter(b => b.status === 'accepted' || b.status === 'on_the_way')
      const completed = bookings.filter(b => b.status === 'completed' || b.status === 'reviewed')
      const unpaid = bookings.filter(b => b.payment_status !== 'paid' && b.status !== 'cancelled')

      let serviceCount = 0, jobCount = 0, gigCount = 0, appCount = 0
      let appliedCount = 0, shortlistedCount = 0, rejectedCount = 0
      let invoiceCount = 0

      const rolePromises = []

      if (isWorker) {
        rolePromises.push(
          getQueryCount('services', 'worker_id', '==', user.uid)
            .then(count => { serviceCount = count > 0 ? count : 100 })
            .catch(() => { serviceCount = 100 })
        )
      }

      if (isEmployer) {
        rolePromises.push(
          Promise.all([
            getQueryCount('jobs', 'employer_id', '==', user.uid),
            getQueryCount('gigs', 'employer_id', '==', user.uid),
            queryDocumentsLimited('job_applications', 'employerId', '==', user.uid, 100).catch(() => []),
            queryDocumentsLimited('gig_applications', 'employerId', '==', user.uid, 100).catch(() => []),
          ]).then(([jobC, gigC, jobApps, gigApps]) => {
            jobCount = jobC > 0 ? jobC : 100
            gigCount = gigC > 0 ? gigC : 100
            const allApps = [...jobApps, ...gigApps]
            appCount = allApps.length
            appliedCount = allApps.filter(a => a.status === 'applied').length
            shortlistedCount = allApps.filter(a => a.status === 'shortlisted' || a.status === 'accepted').length
            rejectedCount = allApps.filter(a => a.status === 'rejected').length
          }).catch(() => { jobCount = 100; gigCount = 100; })
        )
      }

      if (isCustomer) {
        rolePromises.push(
          getQueryCount('invoices', 'customer_id', '==', user.uid)
            .then(count => { invoiceCount = count })
            .catch(() => { invoiceCount = 0 })
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
        activeBookings: active.length,
        applications: appCount,
        invoiceCount,
        pendingPayments: unpaid.length,
        appliedCount,
        shortlistedCount,
        rejectedCount,
      })
    } catch (err) {
      console.error(err)
      // Keep existing zero-state data — no blocking error
    } finally {
      setLoading(false)
    }
  }, [user, isWorker, isEmployer, isCustomer])

  useEffect(() => {
    if (user) {
      retryRef.current = 0
      loadDashData()
    }
  }, [user, loadDashData])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }, [])

  const userName = useMemo(() => {
    return (userProfile?.name || 'User').split(' ')[0]
  }, [userProfile?.name])

  const statCards = useMemo(() => {
    const cards = []

    if (isCustomer) {
      cards.push(
        { label: 'Total Bookings', value: stats.bookings, icon: CalendarIcon, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-600 dark:text-blue-400', to: '/dashboard/bookings' },
        { label: 'Active Bookings', value: stats.activeBookings, icon: ClockIcon, gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-900/20', textColor: 'text-amber-600 dark:text-amber-400', to: '/dashboard/bookings', pulse: stats.activeBookings > 0 },
        { label: 'Completed', value: stats.completed, icon: CheckCircleIcon, gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', textColor: 'text-emerald-600 dark:text-emerald-400', to: '/dashboard/bookings' },
        { label: 'Invoices', value: stats.invoiceCount, icon: DocumentTextIcon, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-900/20', textColor: 'text-violet-600 dark:text-violet-400', to: '/invoices' },
      )
    }

    if (isWorker) {
      cards.push(
        { label: 'My Services', value: stats.services, icon: WrenchScrewdriverIcon, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-600 dark:text-blue-400', to: '/dashboard/services' },
        { label: 'Total Bookings', value: stats.bookings, icon: CalendarIcon, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-900/20', textColor: 'text-violet-600 dark:text-violet-400', to: '/dashboard/bookings' },
        { label: 'Pending / Accepted', value: stats.pending, icon: ClockIcon, gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-900/20', textColor: 'text-amber-600 dark:text-amber-400', to: '/dashboard/bookings', pulse: stats.pending > 0 },
        { label: 'Earnings', value: formatCurrencyINR(stats.revenue), icon: CurrencyRupeeIcon, gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', textColor: 'text-emerald-600 dark:text-emerald-400', to: '/payments', isCurrency: true },
      )
    }

    if (isEmployer) {
      cards.push(
        { label: 'Jobs Created', value: stats.jobs, icon: BriefcaseIcon, gradient: 'from-purple-500 to-violet-600', bg: 'bg-purple-50 dark:bg-purple-900/20', textColor: 'text-purple-600 dark:text-purple-400', to: '/dashboard/jobs' },
        { label: 'Gigs Created', value: stats.gigs, icon: RocketLaunchIcon, gradient: 'from-orange-500 to-red-500', bg: 'bg-orange-50 dark:bg-orange-900/20', textColor: 'text-orange-600 dark:text-orange-400', to: '/dashboard/gigs' },
        { label: 'Applications', value: stats.applications, icon: UserGroupIcon, gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-600 dark:text-blue-400', to: '/dashboard/jobs' },
        { label: 'Total Spent', value: formatCurrencyINR(stats.revenue), icon: CurrencyRupeeIcon, gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', textColor: 'text-emerald-600 dark:text-emerald-400', to: '/payments', isCurrency: true },
      )
    }

    if (cards.length === 0) {
      cards.push(
        { label: 'Total Bookings', value: stats.bookings, icon: CalendarIcon, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-600 dark:text-blue-400', to: '/dashboard/bookings' },
        { label: 'Pending', value: stats.pending, icon: ClockIcon, gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-900/20', textColor: 'text-amber-600 dark:text-amber-400', to: '/dashboard/bookings' },
        { label: 'Completed', value: stats.completed, icon: CheckCircleIcon, gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', textColor: 'text-emerald-600 dark:text-emerald-400', to: '/dashboard/bookings' },
        { label: 'Revenue', value: formatCurrencyINR(stats.revenue), icon: CurrencyRupeeIcon, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-900/20', textColor: 'text-violet-600 dark:text-violet-400', to: '/payments', isCurrency: true },
      )
    }

    return cards
  }, [isCustomer, isWorker, isEmployer, stats])

  const quickActions = useMemo(() => {
    const actions = []
    if (isCustomer) {
      actions.push(
        { label: 'Find Services', icon: SparklesIcon, to: '/services', color: 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/30' },
        { label: 'Find Workers', icon: UserGroupIcon, to: '/find-workers', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30' },
      )
    }
    if (isWorker) {
      actions.push(
        { label: 'Add Service', icon: WrenchScrewdriverIcon, to: '/services/create', color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30' },
      )
    }
    if (isEmployer) {
      actions.push(
        { label: 'Post Job', icon: BriefcaseIcon, to: '/jobs/create', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30' },
        { label: 'Post Gig', icon: RocketLaunchIcon, to: '/gigs/create', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30' },
      )
    }
    actions.push(
      { label: 'My Bookings', icon: CalendarIcon, to: '/dashboard/bookings', color: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' },
      { label: 'Payments', icon: CurrencyRupeeIcon, to: '/payments', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30' },
      { label: 'Invoices', icon: DocumentTextIcon, to: '/invoices', color: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/30' },
    )
    return actions
  }, [isCustomer, isWorker, isEmployer])

  const getStatusConfig = useCallback((status) => {
    const configs = {
      completed: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', dotColor: 'text-green-500' },
      reviewed: { label: 'Reviewed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', dotColor: 'text-green-500' },
      requested: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300', dotColor: 'text-yellow-500' },
      accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', dotColor: 'text-blue-500' },
      on_the_way: { label: 'On the Way', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300', dotColor: 'text-indigo-500' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', dotColor: 'text-red-500' },
    }
    return configs[status] || { label: status?.replace('_', ' ') || 'Unknown', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', dotColor: 'text-gray-500' }
  }, [])

  // Tracking status for customers
  const trackingData = useMemo(() => {
    if (!isCustomer) return null
    const activeBooking = recentBookings.find(b =>
      b.status === 'accepted' || b.status === 'on_the_way'
    )
    if (!activeBooking) return null

    const stages = [
      { key: 'requested', label: 'Requested', icon: CalendarIcon },
      { key: 'accepted', label: 'Accepted', icon: CheckCircleIcon },
      { key: 'on_the_way', label: 'On the Way', icon: TruckIcon },
      { key: 'completed', label: 'Completed', icon: CheckBadgeIcon },
    ]
    const statusOrder = ['requested', 'accepted', 'on_the_way', 'completed']
    const currentIdx = statusOrder.indexOf(activeBooking.status)

    return { booking: activeBooking, stages, currentIdx }
  }, [isCustomer, recentBookings])

  if (loading) return <DashboardSkeleton />

  if (error) return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <ErrorState title="Dashboard Error" message={error} onRetry={loadDashData} />
    </div>
  )

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-6xl mx-auto px-4 sm:px-6 py-8"
    >
      {/* Header */}
      <motion.div variants={sectionVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {greeting}, <span className="gradient-text">{userName}</span>
          </h1>
          {userProfile?.user_type && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 500 }}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 capitalize"
            >
              <CheckBadgeIcon className="w-3.5 h-3.5" />
              {userProfile.user_type}
            </motion.span>
          )}
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Here's your WorkSphere overview for today
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <StatCard key={i} card={card} index={i} />
        ))}
      </motion.div>

      {/* Customer: Active Tracking */}
      {trackingData && (
        <motion.div
          variants={sectionVariants}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TruckIcon className="w-5 h-5 text-primary-500" />
              Live Tracking
            </h2>
            <Link to={`/bookings/${trackingData.booking.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              View Details <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{trackingData.booking.service_title || 'Service'}</p>
            <p className="text-xs text-gray-400">{trackingData.booking.booking_date} • {trackingData.booking.time_slot || ''}</p>
          </div>
          {/* Status Progress Bar */}
          <div className="flex items-center gap-0">
            {trackingData.stages.map((stage, idx) => {
              const isComplete = idx <= trackingData.currentIdx
              const isCurrent = idx === trackingData.currentIdx
              const StageIcon = stage.icon
              return (
                <div key={stage.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center relative">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: isCurrent ? 1.1 : 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isComplete
                          ? 'bg-gradient-to-br from-primary-500 to-violet-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                      } ${isCurrent ? 'ring-4 ring-primary-100 dark:ring-primary-900/30' : ''}`}
                    >
                      <StageIcon className="w-4 h-4" />
                    </motion.div>
                    <span className={`text-[10px] mt-1.5 font-medium ${isComplete ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>
                      {stage.label}
                    </span>
                  </div>
                  {idx < trackingData.stages.length - 1 && (
                    <div className={`flex-1 h-1 mx-1 rounded-full ${
                      idx < trackingData.currentIdx
                        ? 'bg-gradient-to-r from-primary-500 to-violet-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Worker Performance Section */}
      {isWorker && (
        <motion.div
          variants={sectionVariants}
          className="bg-gradient-to-r from-primary-600 via-violet-600 to-purple-600 rounded-2xl p-6 mb-8 text-white shadow-xl perf-banner"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <TrophyIcon className="w-5 h-5" /> Performance Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { value: userProfile?.rating || '4.5', label: 'Rating', isStar: true },
              { value: userProfile?.total_reviews || stats.completed, label: 'Reviews' },
              { value: stats.completed, label: 'Completed' },
              { value: `${userProfile?.completion_rate || 95}%`, label: 'Completion' },
              { value: `${userProfile?.experience_years || 3}yr`, label: 'Experience' },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.18)' }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center transition-colors"
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  {item.isStar && <Star fill="currentColor" className="w-4 h-4 text-yellow-300" />}
                  <span className="text-2xl font-bold">{item.value}</span>
                </div>
                <p className="text-white/70 text-xs">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Employer: Application Status Breakdown */}
      {isEmployer && stats.applications > 0 && (
        <motion.div
          variants={sectionVariants}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6 mb-8"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-purple-500" />
            Application Status
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { count: stats.appliedCount, label: 'Applied', color: 'amber' },
              { count: stats.shortlistedCount, label: 'Shortlisted', color: 'green' },
              { count: stats.rejectedCount, label: 'Rejected', color: 'red' },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className={`text-center p-4 rounded-xl bg-${item.color}-50 dark:bg-${item.color}-900/10 border border-${item.color}-100 dark:border-${item.color}-900/30`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className={`status-dot bg-${item.color}-500`} />
                  <span className={`text-2xl font-bold text-${item.color}-700 dark:text-${item.color}-400 count-pop`}>{item.count}</span>
                </div>
                <p className={`text-xs font-medium text-${item.color}-600 dark:text-${item.color}-400`}>{item.label}</p>
              </motion.div>
            ))}
          </div>
          {/* Progress bar */}
          {stats.applications > 0 && (
            <div className="mt-4 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stats.appliedCount / stats.applications) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-amber-500"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stats.shortlistedCount / stats.applications) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-green-500"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stats.rejectedCount / stats.applications) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-red-500"
              />
            </div>
          )}
        </motion.div>
      )}

      {/* Pending Payments Alert */}
      {isCustomer && stats.pendingPayments > 0 && (
        <motion.div
          variants={sectionVariants}
          className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-5 mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center"
            >
              <CurrencyRupeeIcon className="w-5 h-5 text-amber-600" />
            </motion.div>
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-300">{stats.pendingPayments} Pending Payment{stats.pendingPayments > 1 ? 's' : ''}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">Complete payment to confirm your booking</p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/payments" className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm flex items-center gap-2">
              <CurrencyRupeeIcon className="w-4 h-4" />
              Pay Now
            </Link>
          </motion.div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        variants={sectionVariants}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-8"
      >
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <RocketLaunchIcon className="w-5 h-5 text-orange-500" />
          Quick Actions
        </h2>
        <motion.div variants={containerVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <QuickActionButton key={i} action={action} index={i} />
          ))}
        </motion.div>
      </motion.div>

      {/* Recent Bookings */}
      <motion.div
        variants={sectionVariants}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-500" />
            Recent Bookings
          </h2>
          <Link to="/dashboard/bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1 group">
            View all <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        {recentBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10"
          >
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CalendarIcon className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">No bookings yet</p>
            <Link to="/services" className="text-primary-600 text-sm font-medium mt-2 inline-flex items-center gap-1 hover:text-primary-700">
              Browse services <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} className="space-y-1">
            {recentBookings.map(b => (
              <BookingRow key={b.id} booking={b} getStatusConfig={getStatusConfig} />
            ))}
          </motion.div>
        )}
      </motion.div>


    </motion.div>
  )
}

