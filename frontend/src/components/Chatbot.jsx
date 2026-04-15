import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import api from '../services/api'

const SUGGESTIONS = ['How to book?', 'Payment methods', 'Cancel booking', 'Find a worker', 'Track my booking']

const LOCAL_FAQ = {
  'how to book': 'Booking is easy! Go to Services -> select a service -> pick a date and time slot -> confirm your booking. Track everything in Dashboard -> My Bookings.',
  'payment': 'We support secure payments in INR. After payment, GST invoices are auto-generated. View them in Dashboard -> My Invoices.',
  'cancel': 'You can cancel a booking from My Bookings before the service starts. Refunds are processed within 3-5 business days.',
  'find worker': 'Visit the "Find Workers" page to browse professionals. Our smart matching ranks workers by rating, experience, and completion rate.',
  'track': 'Track your booking from Dashboard -> My Bookings. Status updates: Requested -> Confirmed -> In Progress -> Completed.',
  'review': 'After a booking is completed, you can leave a star rating and review. Your feedback helps others find the best professionals!',
  'refund': 'Refunds for cancelled bookings are processed within 3-5 business days to your original payment method.',
  'service': 'We have 20+ service categories - Electrician, Plumber, Carpenter, AC Repair, Salon at Home, Pest Control, and more! Browse them in Services.',
  'job': 'Check the Jobs section for full-time, part-time, and contract opportunities. Filter by location and skills!',
  'gig': 'Browse freelance gigs in the Gigs section. Fixed-price projects with clear deliverables. You can also post your own!',
  'account': 'Manage your profile from Dashboard -> Profile. Update name, phone, location, and skills anytime.',
  'contact': 'Need help? Email support@worksphere.com or visit the Help Center. You can also report issues from Dashboard.',
  'match': 'Workers are matched using: 35% Rating + 25% Experience + 20% Distance + 20% Completion Rate. Smart math, not AI!',
}

function getLocalAnswer(message) {
  const msg = message.toLowerCase()
  for (const [key, answer] of Object.entries(LOCAL_FAQ)) {
    if (msg.includes(key)) return answer
  }
  if (/hello|hi|hey|help/.test(msg)) {
    return "Hello! I am WorkSphere Assistant. I can help with booking services, payments, finding workers, jobs and gigs. What do you need?"
  }
  return null
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I am WorkSphere Assistant. Ask me about booking services, payments, jobs, or anything about the platform!", from: 'bot' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text = input.trim()) => {
    if (!text) return
    const userMsg = { id: Date.now(), text, from: 'user' }
    setMessages(p => [...p, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await api.post('/api/chatbot/chat', { message: text })
      setMessages(p => [...p, { id: Date.now() + 1, text: res.data.response, from: 'bot' }])
    } catch {
      const localAnswer = getLocalAnswer(text)
      const fallbackText = localAnswer || "I can help with: Booking, Jobs and Gigs, Payments, Account help. Try asking about any of these!"
      setMessages(p => [...p, { id: Date.now() + 1, text: fallbackText, from: 'bot' }])
    } finally { setLoading(false) }
  }

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
            style={{ maxHeight: '540px' }}>

            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <QuestionMarkCircleIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">WorkSphere Assistant</p>
                  <p className="text-primary-200 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    Help and FAQ
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ minHeight: '280px', maxHeight: '320px' }}>
              {messages.map(m => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.from === 'user'
                      ? 'bg-primary-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                  }`}>{m.text}</div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
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

            <div className="px-4 py-2.5 bg-white border-t border-gray-100">
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="flex-shrink-0 text-xs bg-gray-100 hover:bg-primary-50 hover:text-primary-700 text-gray-600 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap font-medium">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-4 py-3 bg-white border-t border-gray-100">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Ask about bookings, payments..."
                  className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400" />
                <button onClick={() => send()} disabled={!input.trim() || loading}
                  className="text-primary-600 hover:text-primary-800 disabled:opacity-30 transition-colors flex-shrink-0 p-1">
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-1.5">Powered by WorkSphere - Help and Support only</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
