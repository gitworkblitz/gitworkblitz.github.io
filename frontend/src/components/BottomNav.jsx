import React, { useMemo, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, Briefcase, Wrench, LayoutDashboard, User } from 'lucide-react'
import { prefetchRoute } from '../utils/performanceUtils'

const tabs = [
  { label: 'Home', to: '/', icon: Home, matchExact: true },
  { label: 'Services', to: '/services', icon: Wrench },
  { label: 'Jobs', to: '/jobs', icon: Briefcase },
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, requiresAuth: true },
  { label: 'Profile', to: '/profile', icon: User, requiresAuth: true },
]

const guestTabs = [
  { label: 'Home', to: '/', icon: Home, matchExact: true },
  { label: 'Services', to: '/services', icon: Wrench },
  { label: 'Jobs', to: '/jobs', icon: Briefcase },
  { label: 'Gigs', to: '/gigs', icon: Briefcase },
  { label: 'Login', to: '/login', icon: User },
]

export default React.memo(function BottomNav() {
  const location = useLocation()
  const { user } = useAuth()
  const currentTabs = user ? tabs : guestTabs

  const isActive = useCallback((tab) => {
    if (tab.matchExact) return location.pathname === tab.to
    return location.pathname.startsWith(tab.to)
  }, [location.pathname])

  // Hide on admin/auth/dashboard-sub routes on desktop — only show on public mobile pages
  const shouldHide = useMemo(() => {
    const p = location.pathname
    return p.startsWith('/admin')
  }, [location.pathname])

  if (shouldHide) return null

  return (
    <nav
      className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Glassmorphism backdrop */}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/85 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50" />
      
      <div className="relative flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {currentTabs.map((tab) => {
          const active = isActive(tab)
          const Icon = tab.icon
          return (
            <Link
              key={tab.to}
              to={tab.to}
              onTouchStart={() => prefetchRoute(tab.to)}
              onMouseEnter={() => prefetchRoute(tab.to)}
              className={`
                relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5
                transition-all duration-200 ease-out group
                ${active
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 dark:text-gray-500'
                }
              `}
              aria-label={tab.label}
            >
              {/* Active indicator pill */}
              {active && (
                <span className="absolute -top-0.5 w-8 h-1 rounded-full bg-primary-600 dark:bg-primary-400 shadow-sm shadow-primary-600/30" />
              )}
              
              <div className={`
                relative p-1.5 rounded-xl transition-all duration-200
                ${active 
                  ? 'bg-primary-50 dark:bg-primary-900/30 scale-110' 
                  : 'group-active:scale-90 group-active:bg-gray-100 dark:group-active:bg-gray-800'
                }
              `}>
                <Icon className={`w-5 h-5 transition-all duration-200 ${
                  active ? 'stroke-[2.5]' : 'stroke-[1.8]'
                }`} />
              </div>
              
              <span className={`text-[10px] font-semibold leading-none transition-all duration-200 ${
                active ? 'opacity-100' : 'opacity-70'
              }`}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
})
