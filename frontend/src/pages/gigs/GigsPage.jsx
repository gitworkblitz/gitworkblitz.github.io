import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { useDataCache } from '../../context/DataCacheContext'
import GigCard from '../../components/GigCard'
import useDebounce from '../../hooks/useDebounce'
import { CardGridSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'

const CATEGORIES = [
  { label: 'All', value: 'All' },
  { label: 'Web Development', value: 'Web Development' },
  { label: 'App Development', value: 'App Development' },
  { label: 'AI/ML', value: 'AI/ML' },
  { label: 'Python', value: 'Python' },
  { label: 'Digital Marketing', value: 'Digital Marketing' },
  { label: 'UI/UX Design', value: 'UI/UX Design' },
  { label: 'Data Science', value: 'Data Science' },
]

const BUDGET_RANGES = [
  { label: 'Any Budget', min: 0, max: Infinity },
  { label: 'Under Rs.5000', min: 0, max: 5000 },
  { label: 'Rs.5000 - Rs.10000', min: 5000, max: 10000 },
  { label: 'Rs.10000 - Rs.20000', min: 10000, max: 20000 },
  { label: 'Above Rs.20000', min: 20000, max: Infinity },
]

export default function GigsPage() {
  const { user, userProfile } = useAuth()
  const { gigs, loaded, error, refreshCache } = useDataCache()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [category, setCategory] = useState('All')
  const [budgetRange, setBudgetRange] = useState(0)
  const [visibleCount, setVisibleCount] = useState(12)

  const filtered = useMemo(() => {
    const range = BUDGET_RANGES[budgetRange]
    return gigs.filter(g => {
      const matchSearch = !debouncedSearch || g.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) || g.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
      const matchCat = category === 'All' || g.category === category
      const budget = Number(g.price || g.budget || 0)
      const matchBudget = budget >= range.min && budget <= range.max
      return matchSearch && matchCat && matchBudget
    })
  }, [gigs, debouncedSearch, category, budgetRange])

  const openCount = gigs.filter(g => g.status === 'open').length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-gradient-to-r from-violet-600 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-sm font-medium px-3 py-1 rounded-full mb-3">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {openCount} Active Gigs
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Freelance Gig Marketplace</h1>
              <p className="text-white/80 text-lg">Find gigs, earn money, grow your freelance career</p>
            </div>
            {user && userProfile?.user_type === 'employer' && (
              <Link to="/gigs/create" className="group bg-white text-violet-700 font-semibold px-6 py-3 rounded-xl hover:bg-violet-50 transition-all shadow-lg flex items-center gap-2 self-start">
                <PlusIcon className="w-5 h-5" />
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
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search gigs..." className="input-field pl-10" />
            </div>
            <select value={budgetRange} onChange={e => setBudgetRange(Number(e.target.value))} className="input-field w-auto min-w-[160px]">
              {BUDGET_RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map(c => (
            <button key={c.value}
              onClick={() => { setCategory(c.value); setVisibleCount(12); }}
              className={`text-sm px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                category === c.value
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/30'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-violet-300 hover:text-violet-700 dark:hover:text-violet-300'
              }`}>
              {c.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{filtered.length} gig{filtered.length !== 1 ? 's' : ''} found</p>

        {!loaded ? (
          <CardGridSkeleton count={6} />
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
                  className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow transition-all"
                >
                  Load More Gigs
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState icon={MagnifyingGlassIcon} title="No gigs found" description="Try adjusting your search or category" actionLabel="Post a Gig" actionTo="/gigs/create" />
        )}
      </div>
    </div>
  )
}
