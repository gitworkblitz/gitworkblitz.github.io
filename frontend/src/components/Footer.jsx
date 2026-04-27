import React from 'react'
import { Link } from 'react-router-dom'
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { useSettings } from '../context/SettingsContext'

const platformLinks = [
  ['Services', '/services'],
  ['Jobs', '/jobs'],
  ['Gigs', '/gigs'],
  ['Find Workers', '/find-workers'],
  ['Dashboard', '/dashboard'],
]

const companyLinks = [
  ['About Us', '/about'],
  ['Contact', '/contact'],
  ['Privacy Policy', '/privacy'],
  ['Terms of Service', '/terms'],
]

const supportLinks = [
  ['Help Center', '/help'],
  ['FAQ', '/faq'],
  ['Blog & Articles', '/blog'],
  ['Report Issue', '/report-issue'],
  ['Feedback', '/feedback'],
]

export default function Footer() {
  const { settings } = useSettings()
  const platformName = settings?.platformName || 'WorkSphere'
  const brandInitials = platformName.substring(0, 2).toUpperCase()

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300">
      {/* Top accent line */}
      <div className="h-1 bg-gradient-to-r from-primary-600 via-violet-500 to-primary-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">{brandInitials}</span>
              </div>
              <span className="text-white font-bold text-2xl">{platformName}</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-5 max-w-sm">
              Your all-in-one platform for services, jobs, and gigs. Connecting professionals with opportunities across Delhi NCR.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4 text-gray-500" />
                <span>support@worksphere.com</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-gray-500" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-gray-500" />
                <span>Connaught Place, New Delhi</span>
              </div>
            </div>
            {/* Social links */}
            <div className="flex gap-3 mt-5">
              {[
                { label: 'X', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                { label: 'LinkedIn', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                { label: 'GitHub', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg> },
              ].map(({ label, icon }) => (
                <a key={label} href="#" aria-label={label}
                  className="w-9 h-9 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5">
              {platformLinks.map(([label, to]) => (
                <li key={to}><Link to={to} className="text-sm hover:text-white transition-colors hover:translate-x-1 inline-block">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map(([label, to]) => (
                <li key={to}><Link to={to} className="text-sm hover:text-white transition-colors hover:translate-x-1 inline-block">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-2.5">
              {supportLinks.map(([label, to]) => (
                <li key={to}><Link to={to} className="text-sm hover:text-white transition-colors hover:translate-x-1 inline-block">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} {platformName}. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
            <span className="flex items-center gap-1 text-gray-400 font-medium">Made by Asif Jamil Ahmad</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
