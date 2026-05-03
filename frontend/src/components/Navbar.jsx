import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import NotificationBell from './NotificationBell'
import {
  Menu as MenuIcon, X, UserCircle, LogOut,
  ShieldCheck, ChevronDown, LayoutGrid, Sun, Moon
} from 'lucide-react'
import { prefetchRoute } from '../utils/performanceUtils'

const publicLinks = [
  { label: 'Services', to: '/services' },
  { label: 'Find Workers', to: '/find-workers' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'Gigs', to: '/gigs' },
]

export default React.memo(function Navbar() {
  const { user, userProfile, loading, logout } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const isActive = (to) => location.pathname === to
  const platformName = settings?.platformName || 'WorkSphere'
  const brandInitials = platformName.substring(0, 2).toUpperCase()

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-md border-b border-gray-100/50 dark:border-gray-800/50'
        : 'bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-white font-bold text-sm">{brandInitials}</span>
            </div>
            <span className="font-bold text-xl transition-colors text-gray-900 dark:text-white">{platformName}</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {publicLinks.map(({ label, to }) => (
              <Link key={to} to={to}
                onMouseEnter={() => prefetchRoute(to)}
                onFocus={() => prefetchRoute(to)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}>{label}</Link>
            ))}
          </div>

          {/* Auth section */}
          <div className="hidden md:flex items-center gap-2">
            <button onClick={toggleTheme} aria-label="Toggle dark mode"
              className="p-2 rounded-lg transition-all duration-200 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div className="w-20 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              </div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <NotificationBell />

                <Link to="/dashboard" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <LayoutGrid className="w-4 h-4" />
                  Dashboard
                </Link>

                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 transition-all bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {((userProfile?.name || user?.email || 'U').trim() || 'U')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium max-w-[100px] truncate text-gray-700 dark:text-gray-200">
                      {userProfile?.name?.split(' ')[0] || 'User'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </Menu.Button>

                  <Transition as={Fragment}
                    enter="transition ease-out duration-150" enterFrom="opacity-0 scale-95 -translate-y-1"
                    enterTo="opacity-100 scale-100 translate-y-0" leave="transition ease-in duration-100"
                    leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                    <Menu.Items className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1.5 focus:outline-none">
                      <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{userProfile?.name || 'User'}</p>
                        <p className="text-xs text-gray-400 capitalize">{userProfile?.user_type} &middot; {user?.email}</p>
                      </div>

                      <Menu.Item>{({ active }) => (
                        <Link to="/profile" className={`flex items-center gap-2.5 px-4 py-2.5 text-sm ${active ? 'bg-gray-50 dark:bg-gray-700' : ''} text-gray-700 dark:text-gray-200`}>
                          <UserCircle className="w-4 h-4 text-gray-400" />Profile
                        </Link>
                      )}</Menu.Item>

                      <Menu.Item>{({ active }) => (
                        <Link to="/dashboard" className={`flex items-center gap-2.5 px-4 py-2.5 text-sm ${active ? 'bg-gray-50 dark:bg-gray-700' : ''} text-gray-700 dark:text-gray-200`}>
                          <LayoutGrid className="w-4 h-4 text-gray-400" />Dashboard
                        </Link>
                      )}</Menu.Item>

                      {userProfile?.user_type === 'admin' && (
                        <Menu.Item>{({ active }) => (
                          <Link to="/admin" className={`flex items-center gap-2.5 px-4 py-2.5 text-sm ${active ? 'bg-gray-50 dark:bg-gray-700' : ''} text-gray-700 dark:text-gray-200`}>
                            <ShieldCheck className="w-4 h-4 text-gray-400" />Admin Panel
                          </Link>
                        )}</Menu.Item>
                      )}

                      <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                        <Menu.Item>{({ active }) => (
                          <button onClick={async () => { await logout(); navigate('/') }}
                            className={`flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 w-full text-left ${active ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                            <LogOut className="w-4 h-4" />Logout
                          </button>
                        )}</Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium transition-colors rounded-lg text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800">Login</Link>
                <Link to="/signup" className="btn-primary text-sm px-5 py-2.5 shadow-sm">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-2 md:hidden">
            {user && <NotificationBell />}
            <button onClick={toggleTheme} aria-label="Toggle dark mode"
              className="p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg transition-colors text-gray-500">
              {mobileOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Transition show={mobileOpen} as={Fragment}
        enter="transition ease-out duration-200" enterFrom="opacity-0 -translate-y-2"
        enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 -translate-y-2">
        <div className="absolute top-full left-0 right-0 md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-xl max-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            {publicLinks.map(({ label, to }) => (
              <Link key={to} to={to}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(to) ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}>{label}</Link>
            ))}

            <div className="border-t border-gray-100 dark:border-gray-800 my-2 pt-2">
              {loading ? (
                <div className="flex items-center gap-3 px-4 py-3 mb-2 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                </div>
              ) : user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                      {((userProfile?.name || user?.email || 'U').trim() || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{userProfile?.name || 'User'}</p>
                      <p className="text-xs text-gray-400 capitalize">{userProfile?.user_type}</p>
                    </div>
                  </div>
                  <Link to="/dashboard" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Dashboard</Link>
                  <Link to="/profile" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Profile</Link>
                  {userProfile?.user_type === 'admin' && (
                    <Link to="/admin" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Admin Panel</Link>
                  )}
                  <button onClick={async () => { await logout(); navigate('/') }}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 mt-1">
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-3 px-4 pt-2">
                  <Link to="/login" className="flex-1 btn-secondary text-center py-2.5 text-sm">Login</Link>
                  <Link to="/signup" className="flex-1 btn-primary text-center py-2.5 text-sm">Get Started</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </Transition>
    </nav>
  )
})
