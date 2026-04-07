import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserNotifications, markAsRead, markAllAsRead, getUnreadCount } from '../services/notificationService'
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline'
import { BellAlertIcon } from '@heroicons/react/24/solid'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

const TYPE_COLORS = {
  booking: 'bg-blue-100 text-blue-600',
  job: 'bg-green-100 text-green-600',
  gig: 'bg-purple-100 text-purple-600',
  general: 'bg-gray-100 text-gray-600',
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const loadNotifications = useCallback(async () => {
    if (!user) return
    try {
      const [notifs, count] = await Promise.all([
        getUserNotifications(user.uid, 15),
        getUnreadCount(user.uid),
      ])
      setNotifications(notifs)
      setUnreadCount(count)
    } catch (err) {
      console.error('Failed to load notifications:', err)
    }
  }, [user])

  useEffect(() => {
    loadNotifications()
    // Poll every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [loadNotifications])

  const handleMarkRead = async (id) => {
    await markAsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const handleMarkAllRead = async () => {
    if (!user) return
    await markAllAsRead(user.uid)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

  if (!user) return null

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative p-2 rounded-lg transition-all duration-200 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
        {unreadCount > 0 ? (
          <BellAlertIcon className="w-5 h-5 text-primary-600" />
        ) : (
          <BellIcon className="w-5 h-5" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Menu.Button>

      <Transition as={Fragment}
        enter="transition ease-out duration-150" enterFrom="opacity-0 scale-95 -translate-y-1"
        enterTo="opacity-100 scale-100 translate-y-0" leave="transition ease-in duration-100"
        leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
        <Menu.Items className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 focus:outline-none overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                <CheckIcon className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <BellIcon className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <Menu.Item key={n.id}>
                  {({ active }) => (
                    <button
                      onClick={() => !n.read && handleMarkRead(n.id)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                        active ? 'bg-gray-50 dark:bg-gray-700' : ''
                      } ${!n.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${TYPE_COLORS[n.type] || TYPE_COLORS.general}`}>
                        {n.type?.[0]?.toUpperCase() || 'N'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${!n.read ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                          {n.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatTime(n.created_at)}</p>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </button>
                  )}
                </Menu.Item>
              ))
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
