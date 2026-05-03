import React, { useState, Suspense, lazy } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

// Helper to retry dynamic imports (fixes production chunk 404s)
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('chatbot-chunk-refreshed') || 'false'
    )
    try {
      const component = await componentImport()
      window.sessionStorage.setItem('chatbot-chunk-refreshed', 'false')
      return component
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('chatbot-chunk-refreshed', 'true')
        window.location.reload()
      }
      throw error
    }
  })

const Chatbot = lazyWithRetry(() => import('./Chatbot'))
export default function ChatbotLauncher() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, y: [0, -6, 0] }}
            exit={{ scale: 0 }}
            transition={{ y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }, scale: { duration: 0.3 } }}
            className="fixed bottom-24 md:bottom-6 right-5 md:right-6 z-40"
          >
            <button
              onClick={() => setOpen(true)}
              className="chat-float-btn w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110 active:scale-95"
              aria-label="Open chat"
            >
              <ChatBubbleLeftRightIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white dark:border-gray-950 chat-online-dot" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <Suspense fallback={null}>
            <Chatbot open={open} setOpen={setOpen} />
          </Suspense>
        )}
      </AnimatePresence>
    </>
  )
}
