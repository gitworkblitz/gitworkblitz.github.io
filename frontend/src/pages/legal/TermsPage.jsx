import React from 'react'
import { Link } from 'react-router-dom'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

const sections = [
  {
    title: 'Acceptance of Terms',
    content: `By accessing or using WorkSphere, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our platform.

These terms apply to all users of the platform, including customers, service providers (workers), employers, and freelancers.`
  },
  {
    title: 'Account Registration',
    content: `To use certain features of WorkSphere, you must create an account. You agree to:

- Provide accurate, current, and complete information during registration
- Maintain the security of your account credentials
- Notify us immediately of any unauthorized access to your account
- Accept responsibility for all activities under your account
- Not create multiple accounts or share your account with others

We reserve the right to suspend or terminate accounts that violate these terms.`
  },
  {
    title: 'Service Marketplace',
    content: `WorkSphere provides a platform connecting service providers with customers. We facilitate:

- Service Listings: Providers can list their services with descriptions, pricing, and availability
- Bookings: Customers can browse, compare, and book services through our platform
- Payments: Secure payment processing in Indian Rupees with GST-compliant invoicing
- Reviews: Honest ratings and reviews from verified customers

WorkSphere acts as an intermediary and is not responsible for the quality or outcome of services provided by individual workers.`
  },
  {
    title: 'Payments & Refunds',
    content: `- All prices are listed in Indian Rupees and include applicable taxes
- Payments are processed securely through our payment partners
- Service providers receive payouts after successful service completion
- Refund requests must be made within 48 hours of service completion
- WorkSphere charges a platform fee of 10% on each transaction
- GST invoices are auto-generated for all completed payments

Cancellation Policy:
- Free cancellation up to 24 hours before the scheduled service
- 50% charge for cancellations within 24 hours
- No refund for no-shows`
  },
  {
    title: 'User Conduct',
    content: `Users of WorkSphere agree not to:

- Violate any applicable laws or regulations
- Post false, misleading, or fraudulent content
- Harass, abuse, or threaten other users
- Manipulate ratings or reviews
- Use the platform for unauthorized commercial purposes
- Attempt to circumvent platform fees by transacting outside WorkSphere
- Upload malicious content or interfere with platform operations
- Impersonate other users or entities`
  },
  {
    title: 'Intellectual Property',
    content: `All content on the WorkSphere platform, including logos, designs, text, graphics, and software, is owned by WorkSphere or its licensors and is protected by intellectual property laws.

Users retain ownership of content they create (listings, reviews, profiles) but grant WorkSphere a non-exclusive, worldwide license to use, display, and distribute such content on the platform.`
  },
  {
    title: 'Limitation of Liability',
    content: `WorkSphere is provided "as is" without warranties of any kind. To the fullest extent permitted by law:

- We are not liable for any indirect, incidental, or consequential damages
- Our total liability shall not exceed the amount paid by you in the last 12 months
- We are not responsible for disputes between users and service providers
- We do not guarantee uninterrupted or error-free service availability`
  },
  {
    title: 'Dispute Resolution',
    content: `Any disputes arising from these terms shall be:

- First attempted to be resolved through our internal dispute resolution process
- If unresolved, submitted to binding arbitration under Indian Arbitration and Conciliation Act
- Subject to the exclusive jurisdiction of courts in Delhi NCR, India

Users may contact our dispute resolution team at disputes@worksphere.in.`
  },
  {
    title: 'Modifications to Terms',
    content: `We reserve the right to modify these Terms of Service at any time. We will notify users of material changes through email or platform notifications. Continued use of WorkSphere after changes constitute acceptance of the modified terms.`
  },
  {
    title: 'Contact Information',
    content: `For questions about these Terms of Service, please contact us:

- Email: legal@worksphere.in
- Phone: +91 11 4567 8900
- Address: WorkSphere HQ, Connaught Place, New Delhi 110001, India`
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-primary-700 to-primary-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm font-medium text-primary-100 mb-4">
            <DocumentTextIcon className="w-4 h-4" /> Legal
          </div>
          <h1 className="text-4xl font-extrabold mb-3">Terms of Service</h1>
          <p className="text-primary-100">Last updated: April 1, 2026</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-card p-8 md:p-12">
            <p className="text-gray-600 leading-relaxed mb-8">
              Welcome to WorkSphere. These Terms of Service ("Terms") govern your use of the WorkSphere platform and all related services. By using our platform, you agree to comply with these Terms.
            </p>

            <div className="space-y-10">
              {sections.map((section, i) => (
                <div key={i}>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                    <span className="w-8 h-8 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
                    {section.title}
                  </h2>
                  <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line pl-11">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-sm">
                See also: <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">Privacy Policy</Link>
                {' · '}
                <Link to="/contact" className="text-primary-600 hover:text-primary-700 font-medium">Contact Us</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
