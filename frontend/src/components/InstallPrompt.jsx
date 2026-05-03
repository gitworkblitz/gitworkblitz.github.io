import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Smartphone, Zap, ChevronRight } from 'lucide-react'

/**
 * InstallPrompt — Premium mobile-only PWA install + APK download banner
 * Shows on mobile devices only. Remembers dismissal for 7 days.
 */
const DISMISS_KEY = 'ws-install-dismissed'
const DISMISS_DAYS = 7
const APK_FILENAME = 'app-apk-69f5dec61ca37-1777721030.apk'

export default React.memo(function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installing, setInstalling] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
      setIsMobile(mobile)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Check dismissal
  useEffect(() => {
    if (!isMobile) return
    
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY)
      if (dismissed) {
        const dismissedAt = parseInt(dismissed, 10)
        const daysPassed = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
        if (daysPassed < DISMISS_DAYS) return
      }
    } catch {}
    
    // Show after 3 seconds
    const timer = setTimeout(() => setShow(true), 3000)
    return () => clearTimeout(timer)
  }, [isMobile])

  // Capture beforeinstallprompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleDismiss = useCallback(() => {
    setShow(false)
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString())
    } catch {}
  }, [])

  const handleInstallPWA = useCallback(async () => {
    if (!deferredPrompt) return
    setInstalling(true)
    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShow(false)
      }
    } catch {}
    setInstalling(false)
    setDeferredPrompt(null)
  }, [deferredPrompt])

  const handleDownloadAPK = useCallback(() => {
    const link = document.createElement('a')
    link.href = `/${APK_FILENAME}`
    link.download = 'WorkSphere.apk'
    link.click()
  }, [])

  // Don't render on desktop or when hidden
  if (!isMobile || !show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-20 left-3 right-3 z-[60] max-w-md mx-auto"
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-black/20 border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Gradient top bar */}
          <div className="h-1 bg-gradient-to-r from-primary-500 via-violet-500 to-primary-500" />
          
          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    Install WorkSphere 🚀
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Faster access & app-like experience
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Features */}
            <div className="flex items-center gap-4 mb-5 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" /> Instant load
              </span>
              <span className="flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-primary-500" /> Native feel
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-3 h-3 text-green-500" /> Offline ready
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5">
              {deferredPrompt && (
                <button
                  onClick={handleInstallPWA}
                  disabled={installing}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-primary-500/25 active:scale-[0.97] transition-all disabled:opacity-60"
                >
                  <Smartphone className="w-4 h-4" />
                  {installing ? 'Installing…' : 'Install App'}
                </button>
              )}
              
              <button
                onClick={handleDownloadAPK}
                className={`${deferredPrompt ? '' : 'flex-1'} flex items-center justify-center gap-2 ${
                  deferredPrompt 
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' 
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md shadow-green-500/25'
                } font-semibold py-3 px-4 rounded-xl active:scale-[0.97] transition-all`}
              >
                <Download className="w-4 h-4" />
                Download APK
              </button>
            </div>

            {/* Later link */}
            <button
              onClick={handleDismiss}
              className="w-full mt-3 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-center py-1"
            >
              Maybe later
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
})
