import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'

const sections = [
  {
    title: 'Information We Collect',
    content: `We collect information you provide directly to us when creating an account, making a booking, or contacting support. This includes:
    
- Personal Information: Name, email address, phone number, and location
- Payment Information: Payment method details processed securely through our payment partners
- Service Data: Booking history, service preferences, reviews, and ratings
- Device Information: IP address, browser type, device identifiers, and usage patterns
- Communications: Messages sent through our platform between customers and service providers`
  },
  {
    title: 'How We Use Your Information',
    content: `We use the information we collect to:
    
- Provide, maintain, and improve our services
- Process transactions and send related notifications
- Match you with relevant service providers using our smart matching system based on ratings and performance
- Send you important updates about your bookings and account
- Personalize your experience and provide tailored recommendations
- Detect, prevent, and address fraud and security issues
- Comply with legal obligations and enforce our terms`
  },
  {
    title: 'Information Sharing',
    content: `We do not sell your personal information. We may share your information in the following circumstances:
    
- With Service Providers: We share necessary details (name, contact, address) with workers you book to fulfill services
- With Payment Processors: Payment details are shared with our secure payment partners
- For Legal Compliance: When required by law, regulation, or legal process
- With Your Consent: When you explicitly authorize us to share information
- Business Transfers: In connection with a merger, acquisition, or sale of assets`
  },
  {
    title: 'Data Security',
    content: `We implement industry-standard security measures to protect your information:
    
- All data in transit is encrypted using TLS/SSL
- Sensitive data at rest is encrypted using AES-256 encryption
- We conduct regular security audits and penetration testing
- Access to personal data is restricted to authorized personnel only
- We use Firebase Authentication for secure login and session management`
  },
  {
    title: 'Your Rights',
    content: `You have the following rights regarding your personal data:
    
- Access: Request a copy of the personal data we hold about you
- Correction: Update or correct inaccurate information in your profile
- Deletion: Request deletion of your account and associated data
- Export: Download your data in a portable format
- Withdraw Consent: Opt out of marketing communications at any time
    
To exercise these rights, contact us at privacy@worksphere.in`
  },
  {
    title: 'Cookies & Tracking',
    content: `We use cookies and similar technologies to:
    
- Keep you signed in to your account
- Remember your preferences and settings
- Understand how you use our platform
- Improve our services and user experience
    
You can manage cookie preferences through your browser settings.`
  },
  {
    title: 'Data Retention',
    content: `We retain your personal information for as long as your account is active or as needed to provide services. After account deletion, we may retain certain data for legal compliance, dispute resolution, and fraud prevention for up to 3 years. Anonymous, aggregated data may be retained indefinitely for analytics purposes.`
  },
  {
    title: 'Children\'s Privacy',
    content: `WorkSphere is not intended for users under 18 years of age. We do not knowingly collect or solicit personal information from children. If we learn that we have collected personal data from a child under 18, we will delete that information promptly.`
  },
  {
    title: 'Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our platform or sending you an email. Your continued use of WorkSphere after changes take effect constitutes acceptance of the updated policy.`
  },
  {
    title: 'Contact Us',
    content: `If you have questions about this Privacy Policy or our data practices, please contact us:

- Email: privacy@worksphere.in
- Phone: +91 11 4567 8900
- Address: WorkSphere HQ, Connaught Place, New Delhi 110001, India`
  },
]

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-primary-700 to-primary-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm font-medium text-primary-100 mb-4">
            <ShieldCheckIcon className="w-4 h-4" /> Legal
          </div>
          <h1 className="text-4xl font-extrabold mb-3">Privacy Policy</h1>
          <p className="text-primary-100">Last updated: April 1, 2026</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-card p-8 md:p-12">
            <p className="text-gray-600 leading-relaxed mb-8">
              At WorkSphere, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this policy carefully.
            </p>

            <div className="space-y-10">
              {sections.map((section, i) => (
                <div key={i} id={`section-${i}`}>
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
              <p className="text-gray-500 text-sm">Have questions? <Link to="/contact" className="text-primary-600 hover:text-primary-700 font-medium">Contact our team</Link></p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
