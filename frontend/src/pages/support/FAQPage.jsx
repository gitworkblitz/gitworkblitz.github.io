import React, { useState } from 'react'
import useSEO from '../../hooks/useSEO'
import { Link } from 'react-router-dom'
import { ChevronDownIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

const faqCategories = [
  {
    name: 'General',
    faqs: [
      { q: 'What is WorkSphere?', a: 'WorkSphere is an all-in-one platform connecting customers with skilled service providers, employers with job seekers, and businesses with freelancers. We offer local services booking, a job portal, and a gig marketplace — all powered by AI-driven matching.' },
      { q: 'Is WorkSphere available across India?', a: 'Yes! WorkSphere operates in 50+ cities across India. We are rapidly expanding and aim to cover all major cities and towns. Check our services page to see availability in your area.' },
      { q: 'How do I create an account?', a: 'Click "Get Started" on the homepage, fill in your name, email, phone, and location. Choose your role (Customer, Worker, or Employer) and you\'re ready to go! The process takes less than 2 minutes.' },
      { q: 'Is WorkSphere free to use?', a: 'Yes, creating an account and browsing services is completely free. We charge a small platform fee (10%) only when a transaction is completed. Service providers set their own prices.' },
    ]
  },
  {
    name: 'Bookings & Services',
    faqs: [
      { q: 'How do I book a service?', a: 'Browse our services marketplace, select a service provider, choose your preferred date and time slot, and click "Book Now". You\'ll receive a confirmation once the provider accepts your booking.' },
      { q: 'Can I cancel a booking?', a: 'Yes. Free cancellation is available up to 24 hours before the scheduled service. Cancellations within 24 hours may incur a 50% charge. No refunds for no-shows.' },
      { q: 'How does the matching system work?', a: 'Our AI-powered matching engine analyzes your requirements, location, budget, and service history to recommend the most suitable professionals. The more you use WorkSphere, the smarter the recommendations become.' },
      { q: 'Can I reschedule a booking?', a: 'Yes, you can reschedule through your Dashboard > My Bookings section. Free rescheduling is available up to 12 hours before the appointment.' },
    ]
  },
  {
    name: 'Payments & Invoices',
    faqs: [
      { q: 'What payment methods are accepted?', a: 'We accept UPI, credit/debit cards, net banking, and popular wallets like Paytm and PhonePe. All transactions are processed securely through our payment partner Razorpay.' },
      { q: 'When do I need to pay?', a: 'Payment is required after the service provider confirms your booking. You can pay before the service starts. The amount is shown in Indian Rupees (₹) including applicable GST.' },
      { q: 'How do I download an invoice?', a: 'Go to Dashboard > Invoices. Each completed payment automatically generates a GST-compliant invoice. Click "Download PDF" or "Print" to save your invoice.' },
      { q: 'How do refunds work?', a: 'Eligible refunds are processed within 5-7 business days to your original payment method. You can request a refund through the booking details page or by contacting support.' },
    ]
  },
  {
    name: 'For Service Providers',
    faqs: [
      { q: 'How do I list my services?', a: 'Sign up as a Worker, go to Dashboard > My Services, and click "Post a Service". Fill in your service details, pricing, availability, and location. Your listing will be live immediately.' },
      { q: 'How do I get paid?', a: 'After completing a service and receiving customer confirmation, payments are automatically transferred to your linked bank account within 48 hours.' },
      { q: 'How does verification work?', a: 'We verify providers through ID verification, background checks, and skill assessments. Verified providers get a badge on their profile, leading to more bookings and customer trust.' },
      { q: 'Can I set my own prices?', a: 'Absolutely! You have full control over your pricing. We recommend checking competitor rates in your area to stay competitive. WorkSphere charges a 10% platform fee on completed transactions.' },
    ]
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden transition-shadow hover:shadow-sm">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50/50 transition-colors">
        <span className="font-medium text-gray-900 text-sm pr-4">{q}</span>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 bg-white">
          <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('General')

  // Collect all FAQ items for schema
  const allFaqItems = faqCategories.flatMap(cat =>
    cat.faqs.map(faq => ({ question: faq.q, answer: faq.a }))
  )

  useSEO({
    title: 'FAQ — Frequently Asked Questions | WorkSphere',
    description: 'Find answers to common questions about WorkSphere. Learn about bookings, payments, services, jobs, gigs, and how our workforce platform works across India.',
    keywords: 'WorkSphere FAQ, frequently asked questions, home services help, jobs platform FAQ, gig marketplace support, workforce platform India',
    url: 'https://wsphere.me/faq',
    faqData: allFaqItems
  })

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm font-medium text-primary-100 mb-4">
            <QuestionMarkCircleIcon className="w-4 h-4" /> Support
          </div>
          <h1 className="text-4xl font-extrabold mb-3">Frequently Asked Questions</h1>
          <p className="text-primary-100 text-lg">Quick answers to common questions about WorkSphere.</p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
            {faqCategories.map(cat => (
              <button key={cat.name} onClick={() => setActiveCategory(cat.name)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.name ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                }`}>{cat.name}</button>
            ))}
          </div>

          {/* FAQ items */}
          {faqCategories.filter(c => c.name === activeCategory).map(cat => (
            <div key={cat.name} className="space-y-3">
              {cat.faqs.map((faq, i) => <FAQItem key={i} {...faq} />)}
            </div>
          ))}

          {/* Still need help */}
          <div className="mt-12 bg-white rounded-2xl p-8 shadow-card text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Didn't find your answer?</h3>
            <p className="text-gray-500 text-sm mb-6">Our support team is ready to help you with any questions.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/contact" className="btn-primary px-6">Contact Support</Link>
              <Link to="/help" className="btn-secondary px-6">Help Center</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
