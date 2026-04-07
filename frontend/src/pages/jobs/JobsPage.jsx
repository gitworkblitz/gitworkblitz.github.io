import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlassIcon, PlusIcon, MapPinIcon, CurrencyDollarIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { useDataCache } from '../../context/DataCacheContext'
import JobCard from '../../components/JobCard'
import { CardGridSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'

const TYPES = ['All', 'full_time', 'part_time', 'contract', 'internship', 'remote']

const LOCATIONS = [
  'All Locations', 'Connaught Place', 'Hauz Khas', 'Noida Sector 62',
  'Khan Market', 'Gurgaon Cyber City', 'Noida Sector 15', 'Defence Colony',
  'Golf Course Road', 'Saket', 'Dwarka', 'Rohini', 'Chandni Chowk'
]

const SALARY_RANGES = [
  { label: 'All Salaries', min: 0, max: Infinity },
  { label: 'Under ₹5L', min: 0, max: 500000 },
  { label: '₹5L – ₹10L', min: 500000, max: 1000000 },
  { label: '₹10L – ₹15L', min: 1000000, max: 1500000 },
  { label: '₹15L – ₹25L', min: 1500000, max: 2500000 },
  { label: 'Above ₹25L', min: 2500000, max: Infinity },
]

export default function JobsPage() {
  const { user } = useAuth()
  const { jobs, loaded, error, refreshCache } = useDataCache()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('All')
  const [location, setLocation] = useState('All Locations')
  const [salaryRange, setSalaryRange] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    const range = SALARY_RANGES[salaryRange]
    return jobs.filter(j => {
      const matchSearch = !search || j.title?.toLowerCase().includes(search.toLowerCase()) || j.company?.toLowerCase().includes(search.toLowerCase())
      const matchType = type === 'All' || j.employment_type === type || j.type?.toLowerCase().replace(/[\s-]/g, '_') === type
      const matchLocation = location === 'All Locations' || j.location === location
      const matchSalary = (j.salary_min || 0) >= range.min && (j.salary_min || 0) <= range.max ||
                          (j.salary_max || 0) >= range.min && (j.salary_max || 0) <= range.max
      return matchSearch && matchType && matchLocation && matchSalary
    })
  }, [jobs, search, type, location, salaryRange])

  const activeFilterCount = [type !== 'All', location !== 'All Locations', salaryRange !== 0].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Job Portal</h1>
            <p className="text-gray-500 dark:text-gray-400">{jobs.length} open positions across Delhi NCR</p>
          </div>
          {user && <Link to="/jobs/create" className="btn-primary flex items-center gap-2 self-start"><PlusIcon className="w-4 h-4" />Post Job</Link>}
        </div>

        {/* Search & Primary Filter */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or company…" className="input-field pl-10" />
            </div>
            <select value={type} onChange={e => setType(e.target.value)} className="input-field w-auto min-w-[160px]">
              {TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t.replace(/_/g, ' ')}</option>)}
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

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-5 mb-6 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setLocation('All Locations'); setSalaryRange(0); setType('All') }}
                className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{filtered.length} job{filtered.length !== 1 ? 's' : ''} found</p>

        {!loaded ? (
          <CardGridSkeleton count={6} />
        ) : error ? (
          <ErrorState title="Failed to load jobs" message={error} onRetry={refreshCache} />
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map(j => <JobCard key={j.id} job={j} />)}</div>
        ) : (
          <EmptyState icon={MagnifyingGlassIcon} title="No jobs found" description="Try adjusting your search filters" actionLabel={user ? "Post a Job" : "Sign up to post"} actionTo={user ? "/jobs/create" : "/signup"} />
        )}
      </div>
    </div>
  )
}
