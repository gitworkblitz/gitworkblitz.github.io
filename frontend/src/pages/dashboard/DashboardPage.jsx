import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useDataCache } from '../../context/DataCacheContext'
import { useSettings } from '../../context/SettingsContext'
import { getUserBookings, getQueryCount, queryDocumentsLimited } from '../../services/firestoreService'
import toast from 'react-hot-toast'
import { formatCurrencyINR } from '../../utils/dummyData'
import { DashboardSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import BookingFormModal from '../../components/BookingFormModal'
import {
  Calendar as CalendarIcon, IndianRupee as CurrencyRupeeIcon, Briefcase as BriefcaseIcon, Wrench as WrenchScrewdriverIcon,
  Users as UserGroupIcon, Clock as ClockIcon, CheckCircle as CheckCircleIcon, Star,
  Trophy as TrophyIcon, FileText as DocumentTextIcon, Truck as TruckIcon,
  TrendingUp as ArrowTrendingUpIcon, Eye as EyeIcon, Rocket as RocketLaunchIcon,
  BarChart as ChartBarIcon, ArrowRight as ArrowRightIcon, Sparkles as SparklesIcon,
  BadgeCheck as CheckBadgeIcon, MessageCircle, Search, Zap, Receipt,
  CreditCard, ShoppingBag, History, AlertCircle, Send, MapPin, IndianRupee,
  Download, Loader2
} from 'lucide-react'

/* ──────────────────────────────────────────────
   Animation variants (optimized — less stagger delay)
   ────────────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.02 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 350, damping: 30 }
  }
}

const sectionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  }
}

const cardHover = {
  scale: 1.02,
  y: -2,
  transition: { type: 'spring', stiffness: 400, damping: 28 }
}

/* ──────────────────────────────────────────────
   Sub-components (memoized)
   ────────────────────────────────────────────── */
const StatCard = React.memo(function StatCard({ card }) {
  return (
    <motion.div variants={itemVariants} whileHover={cardHover} whileTap={{ scale: 0.98 }}>
      <Link
        to={card.to}
        className="stat-card flex flex-col justify-between bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 p-5 group transition-all duration-200 h-[140px] w-full"
      >
        <div className="flex items-center justify-between">
          <div className={`stat-icon-glow w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${card.gradient} shadow-sm flex-shrink-0`}>
            <card.icon className="w-5.5 h-5.5 text-white" />
          </div>
          {card.pulse && (
            <span className="flex items-center gap-1.5 shrink-0">
              <span className="status-dot bg-amber-500" />
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Live</span>
            </span>
          )}
        </div>
        <div>
          <p className="stat-value text-2xl font-bold text-gray-900 dark:text-white count-pop leading-none mb-1">
            {card.value !== undefined ? card.value : '--'}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate pr-2">{card.label}</p>
            <ArrowRightIcon className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
})

const QuickActionButton = React.memo(function QuickActionButton({ action }) {
  const content = (
    <>
      <action.icon className="w-4 h-4 shrink-0" />
      <span className="truncate">{action.label}</span>
    </>
  )
  const className = `quick-action ${action.color} rounded-xl py-3.5 px-4 text-center text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 w-full h-[48px]`
  
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
    >
      {action.onClick ? (
        <button onClick={action.onClick} className={className}>
          {content}
        </button>
      ) : (
        <Link to={action.to} className={className}>
          {content}
        </Link>
      )}
    </motion.div>
  )
})

const BookingRow = React.memo(function BookingRow({ booking, getStatusConfig, onPayNow, payingId }) {
  const statusConf = getStatusConfig(booking.status)
  const isPaying = payingId === booking.id
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ x: 4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className="booking-row flex items-center justify-between p-3 rounded-xl group h-auto min-h-[64px]">
        <Link to={`/bookings/${booking.id}`} className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
          <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <CalendarIcon className="w-5 h-5 text-primary-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors truncate">
              {booking.service_title || 'Service'}
            </p>
            <p className="text-xs text-gray-400 truncate">{booking.booking_date || 'N/A'} • {booking.time_slot || ''}</p>
          </div>
        </Link>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${statusConf.color}`}>
            <span className={`status-dot ${statusConf.dotColor}`} />
            {statusConf.label}
          </span>
          {booking.payment_status === 'paid' ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-semibold">Paid</span>
          ) : booking.status !== 'cancelled' ? (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPayNow && onPayNow(booking) }}
              disabled={isPaying}
              className="text-xs px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.97] disabled:opacity-50 whitespace-nowrap"
            >
              {isPaying ? <Loader2 className="w-3 h-3 animate-spin" /> : <CreditCard className="w-3 h-3" />}
              {isPaying ? 'Paying…' : 'Pay Now'}
            </button>
          ) : null}
          <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
            {formatCurrencyINR(booking.amount || booking.price || 0)}
          </span>
        </div>
      </div>
    </motion.div>
  )
})

/* ──────────────────────────────────────────────
   Main Dashboard
   ────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user, userProfile, isAdmin, isWorker, isEmployer, isCustomer } = useAuth()
  const { services: cachedServices, jobs: cachedJobs, gigs: cachedGigs } = useDataCache()
  const { settings } = useSettings()
  const [stats, setStats] = useState({
    bookings: 0, services: 0, jobs: 0, gigs: 0,
    revenue: 0, pending: 0, completed: 0, applications: 0,
    activeBookings: 0, invoiceCount: 0, pendingPayments: 0,
    appliedCount: 0, shortlistedCount: 0, rejectedCount: 0,
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [recentInvoices, setRecentInvoices] = useState([])
  const [recentApps, setRecentApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Modals & Flows
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [payingId, setPayingId] = useState(null)
  const navigate = useNavigate()

  const platformName = settings?.platformName || 'WorkSphere'

  const handleBookingCreated = useCallback((newBooking) => {
    setRecentBookings(prev => [newBooking, ...prev].slice(0, 5))
    setStats(s => ({
      ...s,
      bookings: s.bookings + 1,
      pending: s.pending + 1,
      pendingPayments: s.pendingPayments + 1
    }))
  }, [])

  const handlePayNow = useCallback((booking) => {
    // Redirect to the full payment gateway page for a proper checkout experience
    navigate(`/payments/${booking.id}`)
  }, [navigate])

  // Set document title for SEO
  useEffect(() => {
    document.title = `Dashboard — ${platformName}`
  }, [platformName])

  const loadDashData = useCallback(async () => {
    if (!user) return
    setError(null)
    
    // 1. Instant Cache Match
    const cacheKey = `dash_stats_${user.uid}`
    const cachedStats = localStorage.getItem(cacheKey)
    if (cachedStats) {
      try {
        const parsed = JSON.parse(cachedStats)
        setStats(parsed.stats)
        if (parsed.recentBookings) setRecentBookings(parsed.recentBookings)
        if (parsed.recentActivity) setRecentActivity(parsed.recentActivity)
        if (parsed.recentInvoices) setRecentInvoices(parsed.recentInvoices)
        if (parsed.recentApps) setRecentApps(parsed.recentApps)
        setLoading(false) // Show UI immediately
      } catch (e) {}
    }

    try {
      // Start fetching bookings immediately to run in parallel with role queries
      const bookingsPromise = getUserBookings(user.uid, 50).catch(() => [])

      let serviceCount = 0, jobCount = 0, gigCount = 0, appCount = 0
      let appliedCount = 0, shortlistedCount = 0, rejectedCount = 0
      let invoiceCount = 0

      let recentInvoicesData = []
      let recentAppsData = []

      // FIX: declare rolePromises array (was missing — caused runtime crash)
      const rolePromises = []

      if (isWorker) {
        rolePromises.push(
          getQueryCount('services', 'worker_id', '==', user.uid)
            .then(count => { serviceCount = count })
            .catch(() => { serviceCount = 0 })
        )
      }

      let allApps = []
      if (isEmployer) {
        rolePromises.push(
          Promise.all([
            getQueryCount('jobs', 'employer_id', '==', user.uid),
            getQueryCount('gigs', 'employer_id', '==', user.uid),
            queryDocumentsLimited('job_applications', 'employerId', '==', user.uid, 100).catch(() => []),
            queryDocumentsLimited('gig_applications', 'employerId', '==', user.uid, 100).catch(() => []),
          ]).then(([jobC, gigC, jobApps, gigApps]) => {
            jobCount = jobC
            gigCount = gigC
            allApps = [...jobApps, ...gigApps]
            appCount = allApps.length
            appliedCount = allApps.filter(a => a.status === 'applied').length
            shortlistedCount = allApps.filter(a => a.status === 'shortlisted' || a.status === 'accepted').length
            rejectedCount = allApps.filter(a => a.status === 'rejected').length
          }).catch(() => { jobCount = 0; gigCount = 0; })
        )
      }

      if (isCustomer || isWorker) {
        rolePromises.push(
          Promise.all([
            queryDocumentsLimited('invoices', 'user_id', '==', user.uid, 5).catch(() => []),
            queryDocumentsLimited('job_applications', 'applicant_id', '==', user.uid, 5).catch(() => []),
            queryDocumentsLimited('gig_applications', 'applicant_id', '==', user.uid, 5).catch(() => [])
          ]).then(([invs, jApps, gApps]) => {
            recentInvoicesData = invs
            invoiceCount = invs.length // approximate if <=5, else could do getQueryCount
            recentAppsData = [...jApps, ...gApps].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
          })
        )
      }

      // Add bookingsPromise to the promise array to await them all together
      rolePromises.push(bookingsPromise)

      await Promise.all(rolePromises)

      // Resolve bookings
      const bookings = await bookingsPromise
      const freshRecentBookings = bookings.slice(0, 5)

      if (!cachedStats) {
        setRecentBookings(freshRecentBookings)
      }

      const paid = bookings.filter(b => b.payment_status === 'paid')
      const pending = bookings.filter(b => b.status === 'requested' || b.status === 'accepted')
      const active = bookings.filter(b => b.status === 'accepted' || b.status === 'on_the_way')
      const completed = bookings.filter(b => b.status === 'completed' || b.status === 'reviewed')
      const unpaid = bookings.filter(b => b.payment_status !== 'paid' && b.status !== 'cancelled')

      // Synthesize unified "Recent Activity" feed
      const activities = []
      bookings.forEach(b => {
        activities.push({
          id: `book-${b.id}`,
          type: 'booking',
          title: 'Booking Created',
          desc: `You booked ${b.service_title || 'a service'}`,
          date: b.createdAt || b.booking_date,
          icon: CalendarIcon,
          color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
        })
        if (b.payment_status === 'paid') {
          activities.push({
            id: `pay-${b.id}`,
            type: 'payment',
            title: 'Payment Completed',
            desc: `Paid ${formatCurrencyINR(b.amount || b.price || 0)} for ${b.service_title}`,
            date: b.createdAt, // Ideally paidAt, fallback to createdAt
            icon: CheckCircleIcon,
            color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
          })
          activities.push({
            id: `inv-${b.id}`,
            type: 'invoice',
            title: 'Invoice Generated',
            desc: `Invoice ready for ${b.service_title}`,
            date: b.createdAt,
            icon: Receipt,
            color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
          })
        }
      })

      allApps.forEach(a => {
        activities.push({
          id: `app-${a.id}`,
          type: 'application',
          title: 'New Application',
          desc: `Application received for your job`,
          date: a.createdAt,
          icon: BriefcaseIcon,
          color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
        })
      })

      activities.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      setRecentActivity(activities.slice(0, 10))

      const freshStats = {
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
      }
      
      setStats(freshStats)
      setRecentBookings(freshRecentBookings)
      setRecentActivity(activities.slice(0, 10))
      setRecentInvoices(recentInvoicesData)
      setRecentApps(recentAppsData)
      
      // Save to cache
      localStorage.setItem(`dash_stats_${user.uid}`, JSON.stringify({
        stats: freshStats,
        recentBookings: freshRecentBookings,
        recentActivity: activities.slice(0, 10),
        recentInvoices: recentInvoicesData,
        recentApps: recentAppsData
      }))
    } catch (err) {
      console.error(err)
      // Keep existing zero-state data — no blocking error
    } finally {
      setLoading(false)
    }
  }, [user, isWorker, isEmployer, isCustomer])

  useEffect(() => {
    if (user) {
      loadDashData()
    }
  }, [user, loadDashData])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }, [])

  const greetingEmoji = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return '☀️'
    if (hour < 18) return '🌤️'
    return '🌙'
  }, [])

  const userName = useMemo(() => {
    return (userProfile?.name || 'User').split(' ')[0]
  }, [userProfile?.name])

  const currentDateTime = useMemo(() => {
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    return { dateStr, timeStr }
  }, [])

  const motivationalMessage = useMemo(() => {
    const messages = [
      "Let's make today productive! 🚀",
      "Great things are built one step at a time 💪",
      "Your dedication drives success ✨",
      "Stay focused, stay ahead 🎯",
      "Every task completed is progress made 📈",
      "You're doing amazing work! 🌟",
      "Small wins lead to big victories 🏆",
    ]
    const dayIndex = new Date().getDay()
    return messages[dayIndex % messages.length]
  }, [])

  const statCards = useMemo(() => {
    const cards = []

    if (isCustomer) {
      cards.push(
        { label: 'Total Bookings', value: stats.bookings, icon: CalendarIcon, gradient: 'from-blue-500 to-blue-600', to: '/dashboard/bookings' },
        { label: 'Pending', value: stats.pending, icon: ClockIcon, gradient: 'from-amber-500 to-orange-500', to: '/dashboard/bookings', pulse: stats.pending > 0 },
        { label: 'Completed', value: stats.completed, icon: CheckCircleIcon, gradient: 'from-emerald-500 to-green-600', to: '/dashboard/bookings' },
        { label: 'Invoices', value: stats.invoiceCount, icon: Receipt, gradient: 'from-violet-500 to-purple-600', to: '/invoices' },
      )
    }

    if (isWorker) {
      cards.push(
        { label: 'My Services', value: stats.services, icon: WrenchScrewdriverIcon, gradient: 'from-blue-500 to-indigo-600', to: '/dashboard/services' },
        { label: 'Total Bookings', value: stats.bookings, icon: CalendarIcon, gradient: 'from-violet-500 to-purple-600', to: '/dashboard/bookings' },
        { label: 'Pending / Accepted', value: stats.pending, icon: ClockIcon, gradient: 'from-amber-500 to-orange-500', to: '/dashboard/bookings', pulse: stats.pending > 0 },
        { label: 'Earnings', value: formatCurrencyINR(stats.revenue), icon: CurrencyRupeeIcon, gradient: 'from-emerald-500 to-green-600', to: '/payments', isCurrency: true },
      )
    }

    if (isEmployer) {
      cards.push(
        { label: 'Jobs Created', value: stats.jobs, icon: BriefcaseIcon, gradient: 'from-purple-500 to-violet-600', to: '/dashboard/jobs' },
        { label: 'Gigs Created', value: stats.gigs, icon: RocketLaunchIcon, gradient: 'from-orange-500 to-red-500', to: '/dashboard/gigs' },
        { label: 'Applications', value: stats.applications, icon: UserGroupIcon, gradient: 'from-blue-500 to-cyan-500', to: '/dashboard/jobs' },
        { label: 'Total Spent', value: formatCurrencyINR(stats.revenue), icon: CurrencyRupeeIcon, gradient: 'from-emerald-500 to-green-600', to: '/payments', isCurrency: true },
      )
    }

    if (cards.length === 0) {
      cards.push(
        { label: 'Total Bookings', value: stats.bookings, icon: CalendarIcon, gradient: 'from-blue-500 to-blue-600', to: '/dashboard/bookings' },
        { label: 'Pending', value: stats.pending, icon: ClockIcon, gradient: 'from-amber-500 to-orange-500', to: '/dashboard/bookings' },
        { label: 'Completed', value: stats.completed, icon: CheckCircleIcon, gradient: 'from-emerald-500 to-green-600', to: '/dashboard/bookings' },
        { label: 'Revenue', value: formatCurrencyINR(stats.revenue), icon: CurrencyRupeeIcon, gradient: 'from-violet-500 to-purple-600', to: '/payments', isCurrency: true },
      )
    }

    return cards
  }, [isCustomer, isWorker, isEmployer, stats])

  const performanceStats = useMemo(() => {
    return [
      { value: userProfile?.rating || '4.5', label: 'Rating', isStar: true },
      { value: userProfile?.total_reviews || stats.completed, label: 'Reviews' },
      { value: stats.completed, label: 'Completed' },
      { value: `${userProfile?.completion_rate || 95}%`, label: 'Completion' },
      { value: `${userProfile?.experience_years || 3}yr`, label: 'Experience' },
    ]
  }, [userProfile, stats.completed])

  const appStatusStats = useMemo(() => {
    return [
      { count: stats.appliedCount, label: 'Applied', bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-100 dark:border-amber-900/30', dotBg: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400', subtext: 'text-amber-600 dark:text-amber-400' },
      { count: stats.shortlistedCount, label: 'Shortlisted', bg: 'bg-green-50 dark:bg-green-900/10', border: 'border-green-100 dark:border-green-900/30', dotBg: 'bg-green-500', text: 'text-green-700 dark:text-green-400', subtext: 'text-green-600 dark:text-green-400' },
      { count: stats.rejectedCount, label: 'Rejected', bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-100 dark:border-red-900/30', dotBg: 'bg-red-500', text: 'text-red-700 dark:text-red-400', subtext: 'text-red-600 dark:text-red-400' },
    ]
  }, [stats.appliedCount, stats.shortlistedCount, stats.rejectedCount])

  const quickActions = useMemo(() => {
    const actions = []
    if (isCustomer) {
      actions.push(
        { label: 'Book Now', icon: ShoppingBag, onClick: () => setShowBookingModal(true), color: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm hover:shadow-md' },
        { label: 'Find Workers', icon: UserGroupIcon, to: '/find-workers', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30' },
      )
    }
    if (isWorker) {
      actions.push(
        { label: 'Add Service', icon: WrenchScrewdriverIcon, to: '/services/create', color: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm hover:shadow-md' },
      )
    }
    if (isEmployer) {
      actions.push(
        { label: 'Post Job', icon: BriefcaseIcon, to: '/jobs/create', color: 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-sm hover:shadow-md' },
        { label: 'Post Gig', icon: RocketLaunchIcon, to: '/gigs/create', color: 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm hover:shadow-md' },
      )
    }
    actions.push(
      { label: 'My Bookings', icon: CalendarIcon, to: '/dashboard/bookings', color: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' },
      { label: 'My Applications', icon: Send, to: '/dashboard/applications', color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30' },
      { label: 'Payments', icon: CurrencyRupeeIcon, to: '/payments', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30' },
      { label: 'Invoices', icon: DocumentTextIcon, to: '/invoices', color: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/30' },
    )
    return actions
  }, [isCustomer, isWorker, isEmployer])

  // ── Skill-based Recommendation Engine ──
  const recommendedServices = useMemo(() => {
    if (!cachedServices.length) return []
    const userSkills = (userProfile?.skills || []).map(s => s.toLowerCase())
    const userLocation = (userProfile?.location || '').toLowerCase()

    // Optimization: limit to 50 to prevent heavy processing
    const servicesToProcess = cachedServices.slice(0, 50)

    if (!userSkills.length && !userLocation) {
      // Fallback: sort by rating desc
      return servicesToProcess.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3)
    }

    const scored = servicesToProcess.map(svc => {
      let score = 0
      const cat = (svc.category || '').toLowerCase()
      const title = (svc.title || '').toLowerCase()
      const loc = (svc.location || '').toLowerCase()

      // Skill match (40% weight)
      for (const skill of userSkills) {
        if (cat.includes(skill) || title.includes(skill)) { score += 40; break }
      }
      // Location match (30% weight)
      if (userLocation && loc.includes(userLocation.split(',')[0].trim())) score += 30
      // Rating boost (30% weight, normalized to 0-30)
      score += ((svc.rating || 0) / 5) * 30

      return { ...svc, _score: score }
    })

    return scored.sort((a, b) => b._score - a._score).slice(0, 3)
  }, [cachedServices, userProfile?.skills, userProfile?.location])

  const recommendedJobs = useMemo(() => {
    if (!cachedJobs.length) return []
    const userSkills = (userProfile?.skills || []).map(s => s.toLowerCase())
    const userLocation = (userProfile?.location || '').toLowerCase()

    // Optimization: limit to 50 to prevent heavy processing
    const jobsToProcess = cachedJobs.slice(0, 50)

    if (!userSkills.length && !userLocation) {
      return jobsToProcess.slice(0, 3)
    }

    const scored = jobsToProcess.map(job => {
      let score = 0
      const title = (job.title || '').toLowerCase()
      const cat = (job.category || '').toLowerCase()
      const loc = (job.location || '').toLowerCase()
      const reqSkills = (job.skills || []).map(s => s.toLowerCase())

      // Skill match (50% weight)
      for (const skill of userSkills) {
        if (title.includes(skill) || cat.includes(skill) || reqSkills.includes(skill)) {
          score += 50; break
        }
      }
      // Location match (30% weight)
      if (userLocation && loc.includes(userLocation.split(',')[0].trim())) score += 30
      // Salary boost (20% weight)
      score += Math.min((job.salary_min || 0) / 1000000 * 20, 20)

      return { ...job, _score: score }
    })

    return scored.sort((a, b) => b._score - a._score).slice(0, 3)
  }, [cachedJobs, userProfile?.skills, userProfile?.location])

  const recommendedGigs = useMemo(() => {
    if (!cachedGigs.length) return []
    const userSkills = (userProfile?.skills || []).map(s => s.toLowerCase())
    const userLocation = (userProfile?.location || '').toLowerCase()

    const gigsToProcess = cachedGigs.slice(0, 50)

    if (!userSkills.length && !userLocation) {
      return gigsToProcess.slice(0, 3)
    }

    const scored = gigsToProcess.map(gig => {
      let score = 0
      const title = (gig.title || '').toLowerCase()
      const cat = (gig.category || '').toLowerCase()
      const loc = (gig.location || '').toLowerCase()
      const reqSkills = (gig.skills || []).map(s => s.toLowerCase())

      for (const skill of userSkills) {
        if (title.includes(skill) || cat.includes(skill) || reqSkills.includes(skill)) {
          score += 50; break
        }
      }
      if (userLocation && loc.includes(userLocation.split(',')[0].trim())) score += 30
      score += Math.min((gig.budget || 0) / 10000 * 20, 20)

      return { ...gig, _score: score }
    })

    return scored.sort((a, b) => b._score - a._score).slice(0, 3)
  }, [cachedGigs, userProfile?.skills, userProfile?.location])

  const getStatusConfig = useCallback((status) => {
    const configs = {
      completed: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', dotColor: 'text-green-500' },
      reviewed: { label: 'Reviewed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', dotColor: 'text-green-500' },
      confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', dotColor: 'text-green-500' },
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
      {/* Header — Personalized */}
      <motion.div variants={sectionVariants} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {greeting}, <span className="gradient-text">{userName}</span> 👋 {greetingEmoji}
              </h1>
              {userProfile?.user_type && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 500 }}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 capitalize"
                >
                  <CheckBadgeIcon className="w-3.5 h-3.5" />
                  {userProfile.user_type}
                </motion.span>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Welcome back to {platformName} — {motivationalMessage}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 justify-end">
              <ClockIcon className="w-4 h-4 text-primary-500" />
              {currentDateTime.timeStr}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{currentDateTime.dateStr}</p>
          </div>
        </div>
      </motion.div>

      {/* Profile Completion */}
      {(() => {
        const fields = [
          !!userProfile?.name, !!userProfile?.email, !!userProfile?.phone,
          !!userProfile?.location, !!userProfile?.bio, (userProfile?.skills?.length > 0),
          !!userProfile?.profile_image
        ]
        const filled = fields.filter(Boolean).length
        const pct = Math.round((filled / fields.length) * 100)
        if (pct >= 100) return null
        return (
          <motion.div variants={sectionVariants} className="bg-gradient-to-r from-primary-50 to-violet-50 dark:from-primary-900/10 dark:to-violet-900/10 rounded-2xl border border-primary-200 dark:border-primary-800 p-5 mb-8 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-primary-800 dark:text-primary-300 text-sm mb-2">Complete Your Profile — {pct}%</p>
              <div className="h-2 rounded-full bg-primary-100 dark:bg-primary-900/30 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-primary-500 to-violet-500 rounded-full"
                />
              </div>
              <p className="text-xs text-primary-600 dark:text-primary-400 mt-1.5">Add your phone, bio, skills & profile photo</p>
            </div>
            <Link to="/profile" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-colors shadow-sm whitespace-nowrap">
              Complete Profile
            </Link>
          </motion.div>
        )
      })()}

      {/* Stats Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <StatCard key={i} card={card} />
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
        <div
          className="bg-gradient-to-r from-primary-600 via-violet-600 to-purple-600 rounded-xl p-6 mb-8 text-white shadow-card overflow-hidden"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <TrophyIcon className="w-5 h-5" /> Performance Stats
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {performanceStats.map((item, i) => (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex flex-col justify-center text-center w-full min-w-0 h-[120px] min-h-[120px]"
                >
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  {item.isStar && <Star fill="currentColor" className="w-5 h-5 text-yellow-300" />}
                  <span className="text-3xl font-bold truncate">{item.value !== undefined ? item.value : '--'}</span>
                </div>
                <p className="text-white/80 text-sm font-medium truncate">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employer: Application Status Breakdown */}
      {isEmployer && stats.applications > 0 && (
        <div
          className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-6 mb-8 overflow-hidden"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-purple-500" />
            Application Status
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {appStatusStats.map((item, i) => (
              <div
                key={i}
                className={`flex flex-col justify-center text-center p-4 rounded-xl ${item.bg} border ${item.border} transition-all duration-200 hover:shadow-md w-full min-w-0 h-[120px] min-h-[120px]`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <span className={`status-dot ${item.dotBg} shrink-0`} />
                  <span className={`text-3xl font-bold ${item.text} count-pop truncate`}>{item.count !== undefined ? item.count : '--'}</span>
                </div>
                <p className={`text-sm font-medium ${item.subtext} truncate`}>{item.label}</p>
              </div>
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
        </div>
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
          <Zap className="w-5 h-5 text-orange-500" />
          Quick Actions
        </h2>
        <motion.div variants={containerVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action, i) => (
            <QuickActionButton key={i} action={action} />
          ))}
        </motion.div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        variants={sectionVariants}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-amber-500" />
            Recommended For You
          </h2>
          <Link to={isCustomer ? '/services' : '/jobs'} className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1 group">
            View all <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(isCustomer || (!isWorker && !isEmployer)) && recommendedServices.map((svc) => (
            <motion.div key={svc.id} variants={itemVariants} whileHover={{ y: -2 }}>
              <Link to={`/services/${svc.id}`} className="block bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group border border-transparent hover:border-primary-200 dark:hover:border-primary-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-violet-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <WrenchScrewdriverIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">{svc.title}</p>
                    <p className="text-xs text-gray-400 truncate">{svc.category}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{svc.rating || '4.5'}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{(svc.location || 'Delhi').split(',')[0]}</span>
                  </div>
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{formatCurrencyINR(svc.price || 0)}</span>
                </div>
              </Link>
            </motion.div>
          ))}
          {(isWorker || isEmployer || isCustomer) && recommendedJobs.map((job) => (
            <motion.div key={job.id} variants={itemVariants} whileHover={{ y: -2 }}>
              <Link to={`/jobs/${job.id}`} className="block bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group border border-transparent hover:border-purple-200 dark:hover:border-purple-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <BriefcaseIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-purple-600 transition-colors">{job.title}</p>
                    <p className="text-xs text-gray-400 truncate">{job.company || 'Company'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{(job.location || 'Remote').split(',')[0]}</span>
                    <span className="capitalize bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-full text-[10px] font-medium">{(job.employment_type || 'full_time').replace('_', ' ')}</span>
                  </div>
                  {job.salary_min && <span className="text-sm font-bold text-purple-600 dark:text-purple-400">₹{(job.salary_min/100000).toFixed(0)}L+</span>}
                </div>
              </Link>
            </motion.div>
          ))}
          {(isWorker || isEmployer || isCustomer) && recommendedGigs.map((gig) => (
            <motion.div key={gig.id} variants={itemVariants} whileHover={{ y: -2 }}>
              <Link to={`/gigs/${gig.id}`} className="block bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all group border border-transparent hover:border-orange-200 dark:hover:border-orange-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <RocketLaunchIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-orange-600 transition-colors">{gig.title}</p>
                    <p className="text-xs text-gray-400 truncate">{gig.category || 'Gig'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{(gig.location || 'Remote').split(',')[0]}</span>
                  </div>
                  {gig.budget && <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{formatCurrencyINR(gig.budget)}</span>}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* My Bookings (with Pay Now actions) */}
      {recentBookings.length > 0 && (
        <motion.div
          variants={sectionVariants}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary-500" />
              My Bookings
            </h2>
            <Link to="/dashboard/bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1 group">
              View all <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <motion.div variants={containerVariants} className="space-y-2">
            {recentBookings.map(b => (
              <BookingRow
                key={b.id}
                booking={b}
                getStatusConfig={getStatusConfig}
                onPayNow={handlePayNow}
                payingId={payingId}
              />
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Recent Bookings */}
      <motion.div
        variants={sectionVariants}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" />
            Recent Activity
          </h2>
          <Link to="/dashboard/bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1 group">
            View all <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        {recentActivity.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10"
          >
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <History className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-sm font-medium mb-3">No activity yet</p>
            {isWorker ? (
              <Link to="/services/create" className="btn-primary inline-flex items-center gap-2">
                Post your first service
              </Link>
            ) : isEmployer ? (
              <Link to="/jobs/create" className="btn-primary inline-flex items-center gap-2">
                Post your first job
              </Link>
            ) : (
              <Link to="/services" className="btn-primary inline-flex items-center gap-2">
                Browse services
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} className="space-y-3 mt-4">
            {recentActivity.map((act) => (
              <motion.div key={act.id} variants={itemVariants} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${act.color}`}>
                  <act.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{act.title}</p>
                  <p className="text-xs text-gray-500 truncate">{act.desc}</p>
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {act.date ? new Date(act.date).toLocaleDateString() : 'Just now'}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Payment & Invoice History */}
      {isCustomer && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Payment History */}
          <motion.div variants={sectionVariants} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CurrencyRupeeIcon className="w-5 h-5 text-emerald-500" />
                Payment History
              </h2>
              <Link to="/payments" className="text-primary-600 hover:text-primary-700 text-sm font-medium">View all</Link>
            </div>
            {recentBookings.filter(b => b.payment_status === 'paid').length === 0 ? (
              <p className="text-sm text-gray-400">No recent payments.</p>
            ) : (
              <div className="space-y-3">
                {recentBookings.filter(b => b.payment_status === 'paid').slice(0, 3).map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><CheckCircleIcon className="w-4 h-4" /></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{b.service_title || 'Service Payment'}</p>
                        <p className="text-xs text-gray-500">Paid on {b.updated_at ? new Date(b.updated_at).toLocaleDateString() : 'recently'}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{formatCurrencyINR(b.amount || b.price || 0)}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Invoice History */}
          <motion.div variants={sectionVariants} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-500" />
                Invoice History
              </h2>
              <Link to="/invoices" className="text-primary-600 hover:text-primary-700 text-sm font-medium">View all</Link>
            </div>
            {recentInvoices.length === 0 ? (
              <p className="text-sm text-gray-400">No invoices generated yet.</p>
            ) : (
              <div className="space-y-3">
                {recentInvoices.slice(0, 3).map(inv => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><DocumentTextIcon className="w-4 h-4" /></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">INV-{inv.id.slice(0,6).toUpperCase()}</p>
                        <p className="text-xs text-gray-500">{new Date(inv.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Link to={`/invoices/${inv.id}`} className="text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">Download</Link>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* My Applications (for customers who apply to jobs/gigs) */}
      {(isCustomer || isWorker) && recentApps.length > 0 && (
        <motion.div variants={sectionVariants} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-500" />
              My Applications
            </h2>
            <Link to="/dashboard/applications" className="text-primary-600 hover:text-primary-700 text-sm font-medium">View all</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentApps.slice(0, 3).map(app => (
              <div key={app.id} className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 uppercase">{app.type || 'Job'}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${app.status === 'accepted' ? 'bg-green-100 text-green-700' : app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {app.status || 'Applied'}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">{app.title || 'Application'}</p>
                </div>
                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1"><ClockIcon className="w-3 h-3"/> Applied {new Date(app.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Booking Form Modal */}
      {showBookingModal && (
        <BookingFormModal
          onClose={() => setShowBookingModal(false)}
          onBookingCreated={handleBookingCreated}
        />
      )}
    </motion.div>
  )
}
