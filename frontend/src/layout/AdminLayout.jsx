import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Squares2X2Icon, UsersIcon, WrenchScrewdriverIcon, CalendarIcon,
  BriefcaseIcon, StarIcon, DocumentTextIcon, FlagIcon, Cog6ToothIcon,
  ArrowRightOnRectangleIcon, ChevronLeftIcon, Bars3Icon, XMarkIcon,
  EnvelopeIcon, ChatBubbleLeftRightIcon, CreditCardIcon, ReceiptPercentIcon,
  PencilSquareIcon, TicketIcon, MegaphoneIcon
} from '@heroicons/react/24/outline'

const sidebarLinks = [
  { label: 'Dashboard', to: '/admin', icon: Squares2X2Icon },
  { label: 'Users', to: '/admin/users', icon: UsersIcon },
  { label: 'Services', to: '/admin/services', icon: WrenchScrewdriverIcon },
  { label: 'Bookings', to: '/admin/bookings', icon: CalendarIcon },
  { label: 'Jobs', to: '/admin/jobs', icon: BriefcaseIcon },
  { label: 'Gigs', to: '/admin/gigs', icon: StarIcon },
  { label: 'Payments', to: '/admin/payments', icon: CreditCardIcon },
  { label: 'Invoices', to: '/admin/invoices', icon: ReceiptPercentIcon },
  { label: 'Blog CMS', to: '/admin/blogs', icon: PencilSquareIcon },
  { label: 'Coupons & Offers', to: '/admin/offers', icon: TicketIcon },
  { label: 'Announcements', to: '/admin/announcements', icon: MegaphoneIcon },
  { label: 'Reviews', to: '/admin/reviews', icon: DocumentTextIcon },
  { label: 'Reports', to: '/admin/reports', icon: FlagIcon },
  { label: 'Contact Messages', to: '/admin/contacts', icon: EnvelopeIcon },
  { label: 'Feedback', to: '/admin/feedback', icon: ChatBubbleLeftRightIcon },
  { label: 'Settings', to: '/admin/settings', icon: Cog6ToothIcon },
]

export default function AdminLayout() {
  const { userProfile, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link to="/admin" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">WS</span>
          </div>
          <div>
            <span className="font-bold text-gray-900 text-lg block leading-tight">WorkSphere</span>
            <span className="text-[10px] text-primary-600 font-semibold uppercase tracking-wider">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {sidebarLinks.map(({ label, to, icon: Icon }) => {
          const active = location.pathname === to
          return (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <Icon className={`w-5 h-5 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm">
            {(userProfile?.name || 'A')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{userProfile?.name || 'Admin'}</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/" onClick={() => setMobileOpen(false)} className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-700 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            <ChevronLeftIcon className="w-3.5 h-3.5" /> Home
          </Link>
          <button onClick={async () => { await logout(); navigate('/') }}
            className="flex-1 flex items-center justify-center gap-1 text-xs text-red-500 hover:text-red-700 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
            <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col fixed h-full z-20">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col animate-slide-in z-40">
            <div className="absolute right-3 top-3">
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100">
            <Bars3Icon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">WS</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">Admin Panel</span>
          </div>
        </div>

        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
