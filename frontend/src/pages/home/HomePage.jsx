import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  WrenchScrewdriverIcon, BriefcaseIcon, CurrencyDollarIcon,
  CalendarIcon, ShieldCheckIcon, StarIcon, ClockIcon, UserGroupIcon,
  MapPinIcon, ArrowRightIcon, CheckCircleIcon, UserIcon, MagnifyingGlassIcon, SparklesIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid, CheckBadgeIcon } from '@heroicons/react/24/solid'
import { getPublicTestimonials } from '../../services/firestoreService'
import { useDataCache } from '../../context/DataCacheContext'
import {
  dummyReviews, dummyJobs, dummyGigs,
  SERVICE_CATEGORIES, calculateWorkerScore, formatCurrencyINR, formatSalaryRange
} from '../../utils/dummyData'
import ServiceCard from '../../components/ServiceCard'
import { CategoryIconBadge } from '../../components/CategoryIcon'

const features = [
  { icon: WrenchScrewdriverIcon, title: 'Local Services', desc: 'Find trusted professionals for all your home & office needs', color: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' },
  { icon: BriefcaseIcon, title: 'Job Portal', desc: 'Discover your dream job or hire the perfect candidate', color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' },
  { icon: CurrencyDollarIcon, title: 'Freelance Gigs', desc: 'Post or find gigs — grow your freelance career', color: 'bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800' },
  { icon: UserGroupIcon, title: 'Smart Matching', desc: 'Performance-based matching connects you to the best professionals', color: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' },
  { icon: CalendarIcon, title: 'Easy Booking', desc: 'Schedule appointments with a few clicks — choose your preferred time slot', color: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800' },
  { icon: ClockIcon, title: 'Status Tracking', desc: 'Track service status updates in real-time from requested to completed', color: 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' },
  { icon: ShieldCheckIcon, title: 'Secure Payments', desc: 'GST-compliant invoices & secure ₹ INR payments', color: 'bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800' },
  { icon: StarIcon, title: 'Verified Reviews', desc: 'Honest ratings from real customers you can trust', color: 'bg-cyan-50 text-cyan-600 border-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800' },
]

const stats = [
  { value: '10,000+', label: 'Services Completed', icon: CheckCircleIcon },
  { value: '5,000+', label: 'Active Users', icon: UserGroupIcon },
  { value: '1,200+', label: 'Job Placements', icon: BriefcaseIcon },
  { value: '800+', label: 'Freelance Gigs', icon: SparklesIcon },
]

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }
const stagger = { show: { transition: { staggerChildren: 0.08 } } }

export default function HomePage() {
  const { services: cachedServices, jobs: cachedJobs, gigs: cachedGigs, workers: cachedWorkers } = useDataCache()
  const [testimonials, setTestimonials] = useState([])

  const featuredServices = useMemo(() => cachedServices.slice(0, 6), [cachedServices])

  const topWorkers = useMemo(() => {
    return cachedWorkers
      .map(w => ({
        ...w,
        match_score: calculateWorkerScore({ ...w, distance: Math.round(Math.random() * 5 + 1) })
      }))
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 4)
  }, [cachedWorkers])

  const latestJobs = useMemo(() => (cachedJobs.length > 0 ? cachedJobs : dummyJobs).slice(0, 4), [cachedJobs])
  const activeGigs = useMemo(() => (cachedGigs.length > 0 ? cachedGigs : dummyGigs).filter(g => g.status === 'open').slice(0, 4), [cachedGigs])

  useEffect(() => {
    getPublicTestimonials()
      .then(reviews => setTestimonials(reviews.length >= 3 ? reviews.slice(0, 6) : dummyReviews.filter(r => r.rating >= 4)))
      .catch(() => setTestimonials(dummyReviews.filter(r => r.rating >= 4)))
  }, [])

  return (
    <div className="min-h-screen">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-900 to-primary-800 text-white">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <motion.div initial="hidden" animate="show" variants={stagger} className="text-center max-w-4xl mx-auto">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 text-sm font-medium text-primary-200 mb-8 border border-white/10">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Trusted by thousands across Delhi NCR
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
              Smart Workforce Platform
              <span className="block bg-gradient-to-r from-primary-300 via-blue-300 to-violet-300 bg-clip-text text-transparent mt-2">
                for Urban India
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Book Services • Find Jobs • Complete Gigs — All in One Place
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/services" className="group bg-white text-primary-700 font-semibold px-8 py-4 rounded-xl hover:bg-primary-50 transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2">
                Find Services
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/jobs" className="border-2 border-white/20 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm flex items-center justify-center">
                Browse Jobs
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              {['Verified Professionals', 'Secure Payments', 'Real-time Tracking'].map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {t}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full"><path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" className="fill-gray-50 dark:fill-gray-950" /></svg>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className="bg-gray-50 dark:bg-gray-950 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Popular Categories</h2>
            <p className="text-gray-500 dark:text-gray-400">Find the right service for your needs</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {SERVICE_CATEGORIES.map(({ label, value, icon: Icon }) => (
              <Link key={label} to={`/find-workers?category=${encodeURIComponent(value)}`}
                className="flex flex-col items-center gap-2.5 bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center group border border-gray-100 dark:border-gray-800">
                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="bg-white dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-white/10 flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-3xl md:text-4xl font-extrabold text-white mb-1">{s.value}</p>
                  <p className="text-primary-200 text-sm">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ TOP MATCHED WORKERS ============ */}
      <section className="bg-gray-50 dark:bg-gray-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="inline-block bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">TOP MATCHES</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Highest Rated Professionals</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Top matched workers near you based on ratings and performance</p>
            </div>
            <Link to="/find-workers" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1 group">
              View all
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {topWorkers.map((w, i) => (
              <motion.div key={w.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-5 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-full ${w.avatar_color || 'bg-primary-500'} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                    {(w.name || 'W')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{w.name}</h3>
                      <CheckBadgeIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <MapPinIcon className="w-3 h-3" />
                      <span>{w.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {(w.skills || []).slice(0, 2).map(s => (
                    <span key={s} className="text-[10px] bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full font-medium">{s}</span>
                  ))}
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Match Score</span>
                    <span className="font-bold text-primary-600">{w.match_score}/100</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full" style={{ width: `${w.match_score}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center mb-3">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg py-1.5">
                    <div className="flex items-center justify-center gap-0.5">
                      <StarSolid className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{w.rating}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg py-1.5">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{w.experience_years}yr</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg py-1.5">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{w.completion_rate}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrencyINR(w.hourly_rate || 500)}<span className="text-[10px] text-gray-400 font-normal">/hr</span></span>
                  <Link to="/find-workers" className="text-xs text-primary-600 hover:text-primary-700 font-semibold">View Profile →</Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED SERVICES ============ */}
      <section className="bg-white dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">TOP RATED</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Top Services</h2>
            </div>
            <Link to="/services" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1 group">
              View all
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.slice(0, 6).map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        </div>
      </section>

      {/* ============ LATEST JOBS ============ */}
      <section className="bg-gray-50 dark:bg-gray-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="inline-block bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">LATEST OPENINGS</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Latest Jobs</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Fresh opportunities across Delhi NCR</p>
            </div>
            <Link to="/jobs" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1 group">
              View all jobs
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestJobs.map((job, i) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} viewport={{ once: true }}>
                <Link to={`/jobs/${job.id}`}
                  className="block bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors truncate">{job.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{job.company}</p>
                    </div>
                    <span className="ml-3 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 capitalize bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                      {(job.employment_type || '').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5" />{job.location}</span>
                    <span className="flex items-center gap-1"><CurrencyDollarIcon className="w-3.5 h-3.5" />{formatSalaryRange(job.salary_min, job.salary_max)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(job.skills_required || []).slice(0, 3).map(s => (
                      <span key={s} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ACTIVE GIGS ============ */}
      <section className="bg-white dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="inline-block bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">FREELANCE</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Active Gigs</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Grab a gig and start earning today</p>
            </div>
            <Link to="/gigs" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1 group">
              View all gigs
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {activeGigs.map((gig, i) => (
              <motion.div key={gig.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} viewport={{ once: true }}>
                <Link to={`/gigs/${gig.id}`}
                  className="block bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group">
                  <div className="h-1.5 bg-gradient-to-r from-violet-500 to-primary-600" />
                  <div className="p-5">
                    <span className="text-xs font-medium px-2.5 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">{gig.category}</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white mt-3 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">{gig.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2">{gig.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(gig.skills || []).slice(0, 2).map(s => (
                        <span key={s} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <MapPinIcon className="w-3.5 h-3.5" />{gig.location}
                      </div>
                      <p className="text-lg font-bold text-primary-600">{formatCurrencyINR(Number(gig.budget || 0))}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="bg-gray-50 dark:bg-gray-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">PLATFORM FEATURES</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Everything You Need, in One Place</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">From hiring professionals to landing your next opportunity — WorkSphere has you covered.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} viewport={{ once: true }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-800 group">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 border group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="bg-white dark:bg-gray-900 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">SIMPLE PROCESS</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">How WorkSphere Works</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Get started in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 dark:from-primary-800 dark:via-primary-600 dark:to-primary-800" />
            {[
              { n: '1', title: 'Create Account', desc: 'Sign up in seconds. Choose your role and set up your profile.', icon: UserIcon },
              { n: '2', title: 'Find & Connect', desc: 'Browse services, jobs, or gigs. Our smart matching finds the best fit.', icon: MagnifyingGlassIcon },
              { n: '3', title: 'Book & Grow', desc: 'Schedule appointments, make secure payments, and track status.', icon: SparklesIcon },
            ].map(({ n, title, desc, icon: Icon }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} viewport={{ once: true }} className="text-center relative z-10">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 border-2 border-primary-200 dark:border-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <Icon className="w-7 h-7 text-primary-600" />
                </div>
                <div className="bg-primary-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mx-auto -mt-8 mb-3 relative z-10 shadow-md">{n}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="bg-gray-50 dark:bg-gray-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">TESTIMONIALS</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">What Our Users Say</h2>
            <p className="text-gray-500 dark:text-gray-400">Real reviews from our trusted community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((t, i) => (
              <motion.div key={t.id || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-card border border-gray-100 dark:border-gray-800 hover:shadow-card-hover transition-shadow">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <StarSolid key={j} className={`w-4 h-4 ${j < t.rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`} />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-5">"{t.comment || t.text}"</p>
                {t.tags && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {t.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm">
                    {(t.customer_name || t.name || 'U')[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{t.customer_name || t.name}</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs">{t.service_type || t.role || 'Customer'}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-violet-700" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-primary-100 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of professionals and customers on India's fastest growing workforce platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="group bg-white text-primary-700 font-semibold px-8 py-4 rounded-xl hover:bg-primary-50 transition-all shadow-lg flex items-center justify-center gap-2">
              Create Free Account
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/services" className="border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm flex items-center justify-center">
              Browse Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
