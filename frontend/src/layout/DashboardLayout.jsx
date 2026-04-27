import React, { useState, useMemo, useCallback } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import { motion, AnimatePresence } from 'framer-motion'
import NotificationBell from '../components/NotificationBell'
import {
  Home, Calendar, Wrench,
  Briefcase, DollarSign, FileText,
  User, CreditCard, Menu, X,
  LogOut, ShieldCheck,
  Rocket, Sun, Moon, ChevronDown,
  Bell, Search, Send
} from 'lucide-react'

/* ──────────────────────────────────────────────
   Sidebar (shared between desktop & mobile)
   ────────────────────────────────────────────── */
const SidebarContent = React.memo(function SidebarContent({ onClose }) {
  const { user, userProfile, logout, isWorker, isEmployer, isCustomer, isAdmin } = useAuth()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const location = useLocation()

  // Role-gated nav items — each role only sees what they can access
  const navItems = useMemo(() => {
    const items = [
      { label: 'Dashboard', to: '/dashboard', icon: Home },
      { label: 'My Bookings', to: '/dashboard/bookings', icon: Calendar },
    ]

    // Workers → My Services (they create services)
    if (isWorker || isAdmin) {
      items.push({ label: 'My Services', to: '/dashboard/services', icon: Wrench })
    }

    // Employers → My Jobs & My Gigs (they create jobs & gigs)
    if (isEmployer || isAdmin) {
      items.push(
        { label: 'My Jobs', to: '/dashboard/jobs', icon: Briefcase },
        { label: 'My Gigs', to: '/dashboard/gigs', icon: Rocket },
      )
    }

    // My Applications — visible to all roles who can apply
    items.push({ label: 'My Applications', to: '/dashboard/applications', icon: Send })

    items.push(
      { label: 'Payments', to: '/payments', icon: CreditCard },
      { label: 'Invoices', to: '/invoices', icon: FileText },
      { label: 'Profile', to: '/profile', icon: User },
    )

    return items
  }, [isWorker, isEmployer, isAdmin])

  const handleLogout = useCallback(async () => {
    await logout()
    navigate('/')
  }, [logout, navigate])

  const isActive = useCallback((to) =>
    location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to)),
    [location.pathname]
  )

  const userName = useMemo(() => userProfile?.name || 'User', [userProfile?.name])
  const userInitial = useMemo(() => (userName[0] || 'U').toUpperCase(), [userName])
  const userRole = useMemo(() => userProfile?.user_type || 'customer', [userProfile?.user_type])
  
  const platformName = settings?.platformName || 'WorkSphere'
  const brandInitials = platformName.substring(0, 2).toUpperCase()

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
            <span className="text-white font-bold text-sm tracking-tight">{brandInitials}</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">{platformName}</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 md:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User section */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-400 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md ring-2 ring-white dark:ring-gray-800">
            {userInitial}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{userName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400"></span>
              {userRole}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, to, icon: Icon }, index) => {
          const active = isActive(to)
          return (
            <motion.div
              key={to}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03, duration: 0.25 }}
            >
              <Link to={to} onClick={onClose}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                }`}>
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-600 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
                  active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
                }`} />
                {label}
              </Link>
            </motion.div>
          )
        })}
        {userProfile?.user_type === 'admin' && (
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: navItems.length * 0.03, duration: 0.25 }}
          >
            <Link to="/admin" onClick={onClose}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                location.pathname.startsWith('/admin')
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
              }`}>
              {location.pathname.startsWith('/admin') && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-600 rounded-r-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <ShieldCheck className={`w-[18px] h-[18px] flex-shrink-0 ${
                location.pathname.startsWith('/admin') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
              }`} />
              Admin Panel
            </Link>
          </motion.div>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-800">
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 group">
          <LogOut className="w-[18px] h-[18px] group-hover:translate-x-0.5 transition-transform" />
          Logout
        </button>
      </div>
    </div>
  )
})

/* ──────────────────────────────────────────────
   Dashboard Top Bar (desktop only, inside layout)
   ────────────────────────────────────────────── */
const DashboardTopBar = React.memo(function DashboardTopBar() {
  const { userProfile } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const location = useLocation()
  const userName = useMemo(() => (userProfile?.name || 'User').split(' ')[0], [userProfile?.name])
  const userInitial = useMemo(() => (userName[0] || 'U').toUpperCase(), [userName])

  const breadcrumbs = useMemo(() => {
    const paths = location.pathname.split('/').filter(Boolean)
    if (paths.length === 0) return []
    return paths.map((path, index) => {
      const isLast = index === paths.length - 1
      const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')
      return {
        label: label,
        isLast
      }
    })
  }, [location.pathname])

  return (
    <div className="hidden md:flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-gray-400 dark:text-gray-600">/</span>}
            <span className={`${crumb.isLast ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              {crumb.label}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} aria-label="Toggle dark mode"
          className="p-2 rounded-lg transition-all duration-200 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <NotificationBell />

        <Link to="/profile" className="flex items-center gap-2 ml-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {userInitial}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[80px] truncate">{userName}</span>
        </Link>
      </div>
    </div>
  )
})

/* ──────────────────────────────────────────────
   Layout root
   ────────────────────────────────────────────── */
export default function DashboardLayout() {
  const { userProfile } = useAuth()
  const { settings } = useSettings()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0 h-full">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="relative z-50 w-64 h-full shadow-2xl"
            >
              <SidebarContent onClose={() => setOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop top bar */}
        <DashboardTopBar />

        {/* Mobile topbar */}
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs">{settings?.platformName ? settings.platformName.substring(0, 2).toUpperCase() : 'WS'}</span>
            </div>
            <span className="font-bold text-primary-600 text-lg">{settings?.platformName || 'WorkSphere'}</span>
          </Link>
          <Link to="/profile">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {(userProfile?.name || 'U')[0].toUpperCase()}
            </div>
          </Link>
        </div>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
