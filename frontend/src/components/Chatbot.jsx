import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, QuestionMarkCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import api from '../services/api'

const SUGGESTIONS = ['How to book?', 'Payment methods', 'Cancel booking', 'Find a worker', 'Track my booking', 'Jobs & Gigs']

const LOCAL_FAQ = {
  'how to book': 'Booking is easy! Go to Services → select a service → pick a date and time slot → confirm your booking. Track everything in Dashboard → My Bookings. 📅',
  'payment': 'We support Card, UPI (GPay/PhonePe/Paytm), and WorkSphere Wallet. After payment, GST invoices are auto-generated. View them in Dashboard → Invoices. 💳',
  'cancel': 'You can cancel a booking from My Bookings before the service starts. Refunds are processed within 3-5 business days. 🔄',
  'find worker': 'Visit the "Find Workers" page to browse professionals. Our smart matching ranks workers by rating, experience, and completion rate. 🔍',
  'track': 'Track your booking from Dashboard → My Bookings. Status updates: Requested → Accepted → On the Way → Completed. 📍',
  'review': 'After a booking is completed, you can leave a star rating and review. Your feedback helps others find the best professionals! ⭐',
  'refund': 'Refunds for cancelled bookings are processed within 3-5 business days to your original payment method. 💰',
  'service': 'We have 20+ service categories — Electrician, Plumber, Carpenter, AC Repair, Salon at Home, Pest Control, and more! Browse them in Services. 🔧',
  'job': 'Check the Jobs section for full-time, part-time, and contract opportunities. Filter by location and skills! 💼',
  'gig': 'Browse freelance gigs in the Gigs section. Fixed-price projects with clear deliverables. You can also post your own! 🚀',
  'account': 'Manage your profile from Dashboard → Profile. Update name, phone, location, and skills anytime. 👤',
  'contact': 'Need help? Email support@worksphere.com or visit the Help Center. You can also report issues from Dashboard. 📧',
  'match': 'Workers are matched using: 35% Rating + 25% Experience + 20% Distance + 20% Completion Rate. Smart math for best results! 📊',
  'invoice': 'Invoices are generated automatically after payment. View, print, or download from Dashboard → My Invoices. All invoices include GST breakdown. 🧾',
  'recommend': 'We recommend services, jobs, and gigs based on your skills, category preferences, and search history. Check "Recommended For You" on your dashboard! ✨',
  'pricing': 'Service prices vary by provider and category. You can compare prices while browsing services. GST (18%) is added at checkout. 💲',
  'safe': 'All workers on WorkSphere are verified. We use ID verification, background checks, and skill assessments to ensure your safety. 🛡️',
  'available': 'Services are available 7 days a week. Most workers accept bookings from 8 AM to 9 PM. You can check each worker\'s availability before booking. 🕐',
  'register': 'Sign up with your email, choose your role (Customer, Worker, or Employer), and complete your profile. It takes less than 2 minutes! 🎉',
  'verify': 'Worker profiles show verified badges, ratings, completion rates, and years of experience. Look for workers with 4.5+ ratings for best service. ✅',
  'portfolio': 'Workers can showcase their work in their profile. Check their past projects, reviews, and specializations before booking. 📂',
  'discount': 'Check the Offers section for active coupons and discounts. We regularly run promotions for new users and festival seasons! 🎁',
  'support': 'Our support team is available Mon-Sat, 9 AM - 6 PM IST. Use the Help Center, chatbot, or email us at support@worksphere.com. 🤝',
  'rating': 'Workers are rated on a 5-star scale. Ratings are based on quality, punctuality, professionalism, and value for money. ⭐',
}

function getLocalAnswer(message) {
  const msg = message.toLowerCase()
  for (const [key, answer] of Object.entries(LOCAL_FAQ)) {
    if (msg.includes(key)) return answer
  }
  if (/hello|hi|hey|help/.test(msg)) {
    return "Hello! I'm WorkSphere Assistant 😊 I can help with booking services, payments, finding workers, jobs and gigs. What do you need?"
  }
  return null
}

// API call with timeout
async function fetchBotResponse(message, history) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000) // 8s timeout
  
  try {
    const contextHistory = history.slice(-6).map(m => ({
      role: m.from === 'user' ? 'user' : 'assistant',
      content: m.text,
    }))
    
    const res = await api.post('/api/chatbot/chat', {
      message,
      context: { history: contextHistory }
    }, { signal: controller.signal })
    
    clearTimeout(timeoutId)
    return res.data.response
  } catch (err) {
    clearTimeout(timeoutId)
    throw err
  }
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm WorkSphere Assistant 😊 Ask me about booking services, payments, jobs, or anything about the platform!", from: 'bot' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [retryMsg, setRetryMsg] = useState(null)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = useCallback(async (text = input.trim()) => {
    if (!text || loading) return
    const userMsg = { id: Date.now(), text, from: 'user' }
    setMessages(p => [...p, userMsg])
    setInput('')
    setLoading(true)
    setRetryMsg(null)
    
    // Local-first: check FAQ instantly (sub-50ms response)
    const localAnswer = getLocalAnswer(text)
    if (localAnswer) {
      setMessages(p => [...p, { id: Date.now() + 1, text: localAnswer, from: 'bot', isLocal: true }])
      setLoading(false)
      return
    }

    // Only hit API for questions not covered by local FAQ
    try {
      const response = await fetchBotResponse(text, [...messages, userMsg])
      setMessages(p => [...p, { id: Date.now() + 1, text: response, from: 'bot' }])
    } catch {
      const fallbackText = "I can help with: 📋 Booking, 💼 Jobs & Gigs, 💳 Payments, 👤 Account, ⭐ Reviews. Try asking about any of these!"
      setMessages(p => [...p, { id: Date.now() + 1, text: fallbackText, from: 'bot', isLocal: true }])
      setRetryMsg(text)
    } finally { setLoading(false) }
  }, [input, loading, messages])

  const handleRetry = useCallback(() => {
    if (retryMsg) {
      // Remove last bot message (the fallback) and retry
      setMessages(p => p.slice(0, -1))
      send(retryMsg)
      setRetryMsg(null)
    }
  }, [retryMsg, send])

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, y: [0, -6, 0] }}
            exit={{ scale: 0 }}
            transition={{ y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }, scale: { duration: 0.3 } }}
            className="fixed bottom-6 right-6 z-40"
          >
            <button
              onClick={() => setOpen(true)}
              className="chat-float-btn w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110 active:scale-95"
              aria-label="Open chat">
              <ChatBubbleLeftRightIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white dark:border-gray-950 chat-online-dot" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-40 flex flex-col overflow-hidden"
            style={{ maxHeight: '560px' }}>

            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <QuestionMarkCircleIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">WorkSphere Assistant</p>
                  <p className="text-primary-200 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    Online • Help & FAQ
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950" style={{ minHeight: '280px', maxHeight: '320px' }}>
              {messages.map(m => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.from === 'user'
                      ? 'bg-primary-600 text-white rounded-br-md'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-bl-md'
                  }`}>
                    {m.text}
                    {m.isLocal && (
                      <span className="block text-[10px] mt-1 opacity-60">💡 Quick answer</span>
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex gap-1.5">
                      {[0, 0.15, 0.3].map((d, i) => (
                        <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Retry bar */}
            {retryMsg && !loading && (
              <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800 flex items-center justify-between">
                <span className="text-xs text-amber-700 dark:text-amber-400">Response from local FAQ</span>
                <button onClick={handleRetry} className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1 hover:text-amber-800 transition-colors">
                  <ArrowPathIcon className="w-3 h-3" /> Retry AI
                </button>
              </div>
            )}

            {/* Suggestions */}
            <div className="px-4 py-2.5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="flex-shrink-0 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-400 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap font-medium">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 dark:focus-within:ring-primary-900/30 transition-all">
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Ask about bookings, payments..."
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50" />
                <button onClick={() => send()} disabled={!input.trim() || loading}
                  className="text-primary-600 hover:text-primary-800 disabled:opacity-30 transition-colors flex-shrink-0 p-1">
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-1.5">Powered by WorkSphere • Help and Support</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
