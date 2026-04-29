import React from 'react'
import useSEO from '../../hooks/useSEO'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  SparklesIcon, ShieldCheckIcon, UserGroupIcon, GlobeAltIcon,
  HeartIcon, RocketLaunchIcon, LightBulbIcon, CheckBadgeIcon,
  EyeIcon, FlagIcon
} from '@heroicons/react/24/outline'

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }

const values = [
  { icon: ShieldCheckIcon, title: 'Trust & Safety', desc: 'Every professional is background-verified. Your safety is our #1 priority.', color: 'bg-blue-50 text-blue-600' },
  { icon: LightBulbIcon, title: 'Innovation', desc: 'Smart matching based on ratings and performance — always improving the way you connect.', color: 'bg-yellow-50 text-yellow-600' },
  { icon: HeartIcon, title: 'Community First', desc: 'We empower local workers, small businesses, and freelancers across Delhi NCR.', color: 'bg-pink-50 text-pink-600' },
  { icon: GlobeAltIcon, title: 'Accessibility', desc: 'Available across Delhi NCR with affordable pricing and easy-to-use interface.', color: 'bg-green-50 text-green-600' },
]

const team = [
  { name: 'Asif Jamil Ahmad', role: 'Founder', initials: 'AJA', gradient: 'from-blue-500 to-indigo-600' },
  { name: 'Danish', role: 'Co-Founder', initials: 'D', gradient: 'from-purple-500 to-pink-600' },
  { name: 'Team Lead', role: 'CTO', initials: 'TL', gradient: 'from-orange-500 to-red-600' },
]

export default function AboutPage() {
  useSEO({
    title: 'About WorkSphere — India\'s Leading Workforce Platform',
    description: 'Learn about WorkSphere, India\'s trusted workforce platform connecting professionals with customers. Our mission, vision, team, and core values.',
    keywords: 'about WorkSphere, workforce platform India, home services platform, hire workers online, Delhi NCR services',
    url: 'https://wsphere.me/about'
  })

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20z\' fill=\'%23ffffff\' fill-opacity=\'0.08\'/%3E%3C/svg%3E")' }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.12 } } }}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm font-medium text-primary-100 mb-6">
              <SparklesIcon className="w-4 h-4" /> About WorkSphere
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Empowering Delhi NCR's
              <span className="block text-primary-200 mt-1">Workforce Ecosystem</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-primary-100 max-w-3xl mx-auto">
              We're building a trusted platform connecting skilled professionals, employers, and customers — making quality services accessible to everyone in Delhi NCR.
            </motion.p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-50 dark:bg-gray-950" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* Mission */}
      <section className="bg-gray-50 dark:bg-gray-950 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                <FlagIcon className="w-3.5 h-3.5" /> OUR MISSION
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                WorkSphere was founded with a simple yet powerful mission: to bridge the gap between skilled workers and those who need their expertise in Delhi NCR. We believe every professional deserves fair opportunities and every customer deserves quality services.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                From plumbers and electricians to software developers and designers — we provide a unified platform where talent meets opportunity, with smart matching based on ratings and performance.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '500+', label: 'Active Users', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
                { value: '19+', label: 'Delhi NCR Areas', color: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
                { value: '1,000+', label: 'Jobs Completed', color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
                { value: '96%', label: 'Satisfaction', color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  className={`${stat.color} rounded-2xl p-6 text-center`}>
                  <p className="text-3xl font-extrabold mb-1">{stat.value}</p>
                  <p className="text-sm font-medium opacity-80">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="bg-white dark:bg-gray-900 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-gradient-to-br from-primary-50 to-violet-50 dark:from-primary-900/20 dark:to-violet-900/20 rounded-2xl p-8 text-center">
                <EyeIcon className="w-16 h-16 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Building the Future</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">One connection at a time</p>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                <EyeIcon className="w-3.5 h-3.5" /> OUR VISION
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                To become Delhi NCR's most trusted workforce platform — where finding the right professional is as simple as a few clicks. We envision a future where every skilled worker has digital visibility and every household has access to reliable services.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We aim to expand across all major localities in Delhi NCR, from Connaught Place to Noida, from Gurgaon to Dwarka — ensuring no area is underserved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-gray-50 dark:bg-gray-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Our Core Values</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">The principles that guide everything we do at WorkSphere.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow border border-gray-50 dark:border-gray-800">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}><Icon className="w-6 h-6" /></div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Meet Our Team</h2>
            <p className="text-gray-500 dark:text-gray-400">The passionate people behind WorkSphere.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {team.map((member, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="text-center group">
                <div className={`w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-105 transition-transform`}>
                  {member.initials}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{member.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Join the WorkSphere Community</h2>
          <p className="text-primary-100 text-lg mb-8">Whether you're a customer, worker, or employer — there's a place for you.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="bg-white text-primary-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-colors shadow-lg">Get Started Free</Link>
            <Link to="/contact" className="border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
