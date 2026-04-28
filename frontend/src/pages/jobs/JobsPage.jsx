import React, { useState, useMemo, useEffect } from 'react'
import useSEO from '../../hooks/useSEO'
import { Link } from 'react-router-dom'
import { MagnifyingGlassIcon, PlusIcon, MapPinIcon, CurrencyDollarIcon, FunnelIcon, AcademicCapIcon, ArrowsUpDownIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolid, BriefcaseIcon, BuildingOffice2Icon, GlobeAltIcon, FireIcon } from '@heroicons/react/24/solid'
import { useAuth } from '../../context/AuthContext'
import { useDataCache } from '../../context/DataCacheContext'
import JobCard from '../../components/JobCard'
import useDebounce from '../../hooks/useDebounce'
import { CardGridSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'

const TYPES = ['All', 'full_time', 'part_time', 'contract', 'internship', 'remote']

const CATEGORIES = [
  { label: 'All', value: 'All', emoji: '📋' },
  { label: 'Technology', value: 'Technology', emoji: '💻' },
  { label: 'Design', value: 'Design', emoji: '🎨' },
  { label: 'Marketing', value: 'Marketing', emoji: '📢' },
  { label: 'Data & AI', value: 'Data & Analytics', emoji: '📊' },
  { label: 'Sales', value: 'Sales', emoji: '💼' },
  { label: 'Finance', value: 'Finance', emoji: '💰' },
  { label: 'HR', value: 'Human Resources', emoji: '🧑‍💼' },
  { label: 'Writing', value: 'Writing & Content', emoji: '✍️' },
  { label: 'Operations', value: 'Operations', emoji: '⚙️' },
  { label: 'Cybersecurity', value: 'Cybersecurity', emoji: '🔐' },
  { label: 'Management', value: 'Management', emoji: '📈' },
  { label: 'Education', value: 'Education', emoji: '📚' },
  { label: 'Healthcare', value: 'Healthcare', emoji: '🏥' },
  { label: 'Engineering', value: 'Engineering', emoji: '🔧' },
  { label: 'Legal', value: 'Legal', emoji: '⚖️' },
  { label: 'Support', value: 'Customer Support', emoji: '🎧' },
]

const LOCATIONS = [
  'All Locations', 'Remote', 'Delhi', 'Noida Sector 62', 'Gurgaon Cyber City',
  'Bengaluru', 'Hyderabad', 'Mumbai', 'Pune', 'Hauz Khas', 'Connaught Place'
]

const SALARY_RANGES = [
  { label: 'All Salaries', min: 0, max: Infinity },
  { label: 'Under ₹5L', min: 0, max: 500000 },
  { label: '₹5L – ₹10L', min: 500000, max: 1000000 },
  { label: '₹10L – ₹15L', min: 1000000, max: 1500000 },
  { label: '₹15L – ₹25L', min: 1500000, max: 2500000 },
  { label: 'Above ₹25L', min: 2500000, max: Infinity },
]

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Salary: High to Low', value: 'salary_desc' },
  { label: 'Salary: Low to High', value: 'salary_asc' },
  { label: 'Company A-Z', value: 'company_asc' },
]

export default function JobsPage() {
  const { user, userProfile } = useAuth()
  const { jobs, loaded, error, refreshCache } = useDataCache()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [type, setType] = useState('All')
  const [location, setLocation] = useState('All Locations')
  const [salaryRange, setSalaryRange] = useState(0)
  const [experience, setExperience] = useState('All Experience')
  const [showFilters, setShowFilters] = useState(false)
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [visibleCount, setVisibleCount] = useState(12)

  useSEO({
    title: 'Jobs — Find Your Dream Job | WorkSphere',
    description: 'Browse the latest job openings on WorkSphere. Find full-time, part-time, and remote jobs across India.',
    keywords: 'jobs, hiring, careers, worksphere jobs, local jobs',
    url: 'https://worksphere.com/jobs'
  })

  const filtered = useMemo(() => {
    const range = SALARY_RANGES[salaryRange]
    let result = jobs.filter(j => {
      const matchSearch = !debouncedSearch || j.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) || j.company?.toLowerCase().includes(debouncedSearch.toLowerCase()) || j.skills_required?.some(s => s.toLowerCase().includes(debouncedSearch.toLowerCase()))
      const matchType = type === 'All' || j.employment_type === type || j.type?.toLowerCase().replace(/[\s-]/g, '_') === type
      const matchCat = category === 'All' || j.category === category
      const matchLocation = location === 'All Locations' || j.location === location
      const matchSalary = (j.salary_min || 0) >= range.min && (j.salary_min || 0) <= range.max ||
                          (j.salary_max || 0) >= range.min && (j.salary_max || 0) <= range.max
      const matchExperience = experience === 'All Experience' || j.experience_required === experience
      return matchSearch && matchType && matchCat && matchLocation && matchSalary && matchExperience
    })

    // Sort
    switch (sortBy) {
      case 'salary_desc':
        result.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0))
        break
      case 'salary_asc':
        result.sort((a, b) => (a.salary_min || 0) - (b.salary_min || 0))
        break
      case 'company_asc':
        result.sort((a, b) => (a.company || '').localeCompare(b.company || ''))
        break
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        break
    }

    return result
  }, [jobs, debouncedSearch, type, category, location, salaryRange, experience, sortBy])

  const activeFilterCount = [type !== 'All', location !== 'All Locations', salaryRange !== 0, experience !== 'All Experience'].filter(Boolean).length

  const stats = useMemo(() => ({
    total: jobs.length,
    remote: jobs.filter(j => j.employment_type === 'remote' || j.location === 'Remote').length,
    internship: jobs.filter(j => j.employment_type === 'internship').length,
    highPaying: jobs.filter(j => (j.salary_max || 0) >= 1000000).length,
    companies: new Set(jobs.map(j => j.company)).size,
  }), [jobs])

  const clearAllFilters = () => {
    setSearch('')
    setType('All')
    setCategory('All')
    setLocation('All Locations')
    setSalaryRange(0)
    setExperience('All Experience')
    setSortBy('newest')
  }

  const hasAnyFilter = search || type !== 'All' || category !== 'All' || location !== 'All Locations' || salaryRange !== 0 || experience !== 'All Experience'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary-600 via-indigo-600 to-violet-600 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full opacity-5" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-sm font-medium px-3 py-1 rounded-full mb-3">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {stats.total} Open Positions
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Your Dream Job</h1>
              <p className="text-white/80 text-lg">Explore {stats.total}+ opportunities from {stats.companies}+ top companies</p>

              <div className="flex flex-wrap items-center gap-3 mt-4">
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-white/90">
                  <BriefcaseIcon className="w-4 h-4" /> {stats.total}+ Jobs
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-white/90">
                  <BuildingOffice2Icon className="w-4 h-4" /> {stats.companies}+ Companies
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-white/90">
                  <GlobeAltIcon className="w-4 h-4" /> {stats.remote}+ Remote
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-white/90">
                  <FireIcon className="w-4 h-4 text-orange-300" /> {stats.highPaying}+ High-paying
                </span>
              </div>
            </div>

            {user && userProfile?.user_type === 'employer' && (
              <Link to="/jobs/create" className="group bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-all shadow-lg flex items-center gap-2 self-start">
                <PlusIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Post a Job
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search & Primary Filter */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, company, or skill…" className="input-field pl-10" />
            </div>
            <select value={type} onChange={e => setType(e.target.value)} className="input-field w-auto min-w-[160px]">
              {TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t.replace(/_/g, ' ')}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field w-auto min-w-[180px]">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showFilters || activeFilterCount > 0
                  ? 'border-primary-300 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
              <FunnelIcon className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Categories Pill Bar */}
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map(c => (
            <button key={c.value}
              onClick={() => { setCategory(c.value); setVisibleCount(12); }}
              className={`text-sm px-4 py-2 rounded-full font-medium transition-all duration-200 flex items-center gap-1.5 ${
                category === c.value
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-200 dark:shadow-primary-900/30'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:text-primary-700 dark:hover:text-primary-300'
              }`}>
              <span>{c.emoji}</span>
              {c.label}
            </button>
          ))}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5 mb-6 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPinIcon className="w-4 h-4" /> Location
                </label>
                <select value={location} onChange={e => setLocation(e.target.value)} className="input-field">
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <CurrencyDollarIcon className="w-4 h-4" /> Salary Range
                </label>
                <select value={salaryRange} onChange={e => setSalaryRange(Number(e.target.value))} className="input-field">
                  {SALARY_RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <AcademicCapIcon className="w-4 h-4" /> Experience
                </label>
                <select value={experience} onChange={e => setExperience(e.target.value)} className="input-field">
                  {['All Experience', 'Fresher', '1–2 years', '1–3 years', '2–4 years', '2–5 years', '3–5 years', '3–6 years', '4–7 years', '5–8 years', '8+ years', '10+ years'].map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setLocation('All Locations'); setSalaryRange(0); setType('All'); setExperience('All Experience') }}
                className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Results header + Active filter pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              <span className="text-gray-900 dark:text-white font-bold">{filtered.length}</span> job{filtered.length !== 1 ? 's' : ''} found
            </p>
            {hasAnyFilter && (
              <button onClick={clearAllFilters} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium">
                <XMarkIcon className="w-3.5 h-3.5" /> Clear all
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <ArrowsUpDownIcon className="w-3.5 h-3.5" />
            {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
          </div>
        </div>

        {!loaded ? (
          <CardGridSkeleton count={8} type="job" />
        ) : error ? (
          <ErrorState title="Failed to load jobs" message={error} onRetry={refreshCache} />
        ) : filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.slice(0, visibleCount).map((j, i) => <JobCard key={j.id} job={j} featured={i < 3 && category === 'All' && !hasAnyFilter} />)}
            </div>
            {visibleCount < filtered.length && (
              <div className="mt-10 mb-4 flex flex-col items-center gap-2">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} jobs
                </p>
                <button
                  onClick={() => setVisibleCount(c => c + 12)}
                  className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow transition-all"
                >
                  Load More Jobs ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState icon={MagnifyingGlassIcon} title="No jobs found" description="Try adjusting your search filters" actionLabel={userProfile?.user_type === 'employer' ? "Post a Job" : undefined} actionTo={userProfile?.user_type === 'employer' ? "/jobs/create" : undefined} />
        )}
      </div>
    </div>
  )
}
