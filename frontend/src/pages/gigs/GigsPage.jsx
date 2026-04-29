import React, { useState, useMemo } from 'react'
import useSEO from '../../hooks/useSEO'
import { Link } from 'react-router-dom'
import { MagnifyingGlassIcon, PlusIcon, StarIcon as StarSolid, BriefcaseIcon } from '@heroicons/react/24/solid'
import { ArrowsUpDownIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { useDataCache } from '../../context/DataCacheContext'
import GigCard from '../../components/GigCard'
import useDebounce from '../../hooks/useDebounce'
import { CardGridSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Budget: High to Low', value: 'budget_desc' },
  { label: 'Budget: Low to High', value: 'budget_asc' },
  { label: 'Deadline: Soonest', value: 'deadline_asc' },
]

const CATEGORIES = [
  { label: 'All', value: 'All', icon: '🌐' },
  { label: 'Web Dev', value: 'Web Development', icon: '💻' },
  { label: 'Mobile Dev', value: 'Mobile Development', icon: '📱' },
  { label: 'UI/UX Design', value: 'UI/UX Design', icon: '🎨' },
  { label: 'Digital Marketing', value: 'Digital Marketing', icon: '📊' },
  { label: 'Data & AI', value: 'Data Science & AI', icon: '🤖' },
  { label: 'DevOps & Cloud', value: 'DevOps & Cloud', icon: '☁️' },
  { label: 'Writing', value: 'Writing', icon: '✍️' },
  { label: 'Graphic Design', value: 'Graphic Design', icon: '🖼️' },
  { label: 'Video', value: 'Video Production', icon: '🎬' },
  { label: 'Cybersecurity', value: 'Cybersecurity', icon: '🔒' },
  { label: 'Data Entry', value: 'Data Entry', icon: '📝' },
]

const BUDGET_RANGES = [
  { label: 'Any Budget', min: 0, max: Infinity },
  { label: 'Under ₹5K', min: 0, max: 5000 },
  { label: '₹5K - ₹10K', min: 5000, max: 10000 },
  { label: '₹10K - ₹20K', min: 10000, max: 20000 },
  { label: 'Above ₹20K', min: 20000, max: Infinity },
]

const DURATION_FILTERS = [
  { label: 'Any Duration', value: 'all' },
  { label: 'Urgent (<3 days)', value: 'urgent' },
  { label: 'Short (3-7 days)', value: 'short' },
  { label: 'Medium (7-14 days)', value: 'medium' },
  { label: 'Long (14+ days)', value: 'long' },
]

export default function GigsPage() {
  const { user, userProfile } = useAuth()
  const { gigs, loaded, error, refreshCache } = useDataCache()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [category, setCategory] = useState('All')
  const [budgetRange, setBudgetRange] = useState(0)
  const [durationFilter, setDurationFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [visibleCount, setVisibleCount] = useState(12)

  useSEO({
    title: 'Freelance Gig Marketplace — Find & Post Gigs | WorkSphere',
    description: 'Find freelance gigs and short-term projects on WorkSphere. India\'s leading gig marketplace for web dev, design, marketing & more. Post or apply to gigs instantly.',
    keywords: 'gig marketplace, freelance gigs India, freelance jobs, remote gigs, hire freelancers, workforce platform India, WorkSphere gigs',
    url: 'https://wsphere.me/gigs'
  })

  const getDurationDays = (duration) => {
    if (!duration) return 0
    const match = duration.match(/(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  const filtered = useMemo(() => {
    const range = BUDGET_RANGES[budgetRange]
    let result = gigs.filter(g => {
      const matchSearch = !debouncedSearch || 
        g.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
        g.description?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        g.client_details?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (g.skills || []).some(s => s.toLowerCase().includes(debouncedSearch.toLowerCase()))
      const matchCat = category === 'All' || g.category === category
      const budget = Number(g.price || g.budget || 0)
      const matchBudget = budget >= range.min && budget <= range.max
      
      const days = getDurationDays(g.duration)
      let matchDuration = true
      if (durationFilter !== 'all') {
        if (durationFilter === 'urgent') matchDuration = days < 3
        else if (durationFilter === 'short') matchDuration = days >= 3 && days <= 7
        else if (durationFilter === 'medium') matchDuration = days > 7 && days <= 14
        else if (durationFilter === 'long') matchDuration = days > 14
      }
      
      return matchSearch && matchCat && matchBudget && matchDuration
    })

    // Sort
    switch (sortBy) {
      case 'budget_desc':
        result.sort((a, b) => (b.budget || b.price || 0) - (a.budget || a.price || 0))
        break
      case 'budget_asc':
        result.sort((a, b) => (a.budget || a.price || 0) - (b.budget || b.price || 0))
        break
      case 'deadline_asc':
        result.sort((a, b) => getDurationDays(a.duration) - getDurationDays(b.duration))
        break
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        break
    }

    return result
  }, [gigs, debouncedSearch, category, budgetRange, durationFilter, sortBy])

  const openCount = gigs.filter(g => g.status === 'open').length
  const avgBudget = gigs.length > 0 
    ? Math.round(gigs.reduce((sum, g) => sum + (g.budget || g.price || 0), 0) / gigs.length)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-sm font-medium px-3 py-1 rounded-full mb-3">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {openCount} Active Gigs
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Freelance Marketplace</h1>
              <p className="text-white/80 text-lg">Find gigs, earn money, grow your career</p>
              
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <StarSolid className="w-5 h-5 text-yellow-300" />
                  <span className="text-white/90">{gigs.length}+ Gigs</span>
                </div>
                <div className="flex items-center gap-2">
                  <BriefcaseIcon className="w-5 h-5 text-white/70" />
                  <span className="text-white/90">Avg ₹{(avgBudget / 1000).toFixed(0)}K budget</span>
                </div>
              </div>
            </div>
            {user && userProfile?.user_type === 'employer' && (
              <Link to="/gigs/create" className="group bg-white text-violet-700 font-semibold px-6 py-3 rounded-xl hover:bg-violet-50 transition-all shadow-lg flex items-center gap-2 self-start">
                <PlusIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Post a Gig
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-4 mb-6 -mt-6 relative z-10">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search gigs, skills, or clients..." 
                className="input-field pl-10" 
              />
            </div>
            <select 
              value={budgetRange} 
              onChange={e => setBudgetRange(Number(e.target.value))} 
              className="input-field w-auto min-w-[140px]"
            >
              {BUDGET_RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
            </select>
            <select 
              value={durationFilter} 
              onChange={e => setDurationFilter(e.target.value)} 
              className="input-field w-auto min-w-[160px]"
            >
              {DURATION_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field w-auto min-w-[170px]">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
          {CATEGORIES.map(c => (
            <button key={c.value}
              onClick={() => { setCategory(c.value); setVisibleCount(12); }}
              className={`text-sm px-4 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                category === c.value
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/30'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-violet-300 hover:text-violet-700 dark:hover:text-violet-300'
              }`}
            >
              <span>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            <span className="text-gray-900 dark:text-white font-bold">{filtered.length}</span> gig{filtered.length !== 1 ? 's' : ''} found
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <ArrowsUpDownIcon className="w-3.5 h-3.5" />
            {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
          </div>
        </div>

        {!loaded ? (
          <CardGridSkeleton count={8} type="gig" />
        ) : error ? (
          <ErrorState title="Failed to load gigs" message={error} onRetry={refreshCache} />
        ) : filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.slice(0, visibleCount).map(g => <GigCard key={g.id} gig={g} />)}
            </div>
            {visibleCount < filtered.length && (
              <div className="mt-10 mb-4 flex justify-center">
                <button
                  onClick={() => setVisibleCount(c => c + 12)}
                  className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md transition-all flex items-center gap-2"
                >
                  Load More Gigs
                  <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full text-xs">
                    +{Math.min(12, filtered.length - visibleCount)}
                  </span>
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState 
            icon={MagnifyingGlassIcon} 
            title="No gigs found" 
            description="Try adjusting your search or category filters"
            actionLabel={userProfile?.user_type === 'employer' ? "Post a Gig" : undefined}
            actionTo={userProfile?.user_type === 'employer' ? "/gigs/create" : undefined}
          />
        )}
      </div>
    </div>
  )
}
