import React, { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDataCache } from '../../context/DataCacheContext'
import { SERVICE_CATEGORIES, calculateWorkerScore, formatCurrencyINR } from '../../utils/dummyData'
import { CardGridSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import {
  MapPinIcon, MagnifyingGlassIcon, CheckBadgeIcon, ShieldCheckIcon, UserGroupIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import HeroBanner from '../../components/HeroBanner'

export default function FindWorkersPage() {
  const [searchParams] = useSearchParams()
  const { workers, loaded, error, refreshCache } = useDataCache()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('category') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [sortBy, setSortBy] = useState('score')

  const filteredWorkers = useMemo(() => {
    let result = [...workers]

    if (selectedCategory) {
      result = result.filter(w => (w.category || '').toLowerCase() === selectedCategory.toLowerCase())
    }

    if (searchTerm && searchTerm !== selectedCategory) {
      const term = searchTerm.toLowerCase()
      result = result.filter(w => {
        const services = (w.services || []).map(s => s.toLowerCase())
        const name = (w.name || '').toLowerCase()
        const location = (w.location || '').toLowerCase()
        const category = (w.category || '').toLowerCase()
        return services.some(s => s.includes(term)) || name.includes(term) || location.includes(term) || category.includes(term)
      })
    }

    result = result.map(w => ({
      ...w,
      match_score: calculateWorkerScore(w),
      distance: w.distance || Math.round(Math.random() * 10 + 1)
    }))

    if (sortBy === 'score') result.sort((a, b) => b.match_score - a.match_score)
    else if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating)
    else if (sortBy === 'experience') result.sort((a, b) => b.experience_years - a.experience_years)
    else if (sortBy === 'price') result.sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0))

    return result
  }, [workers, searchTerm, selectedCategory, sortBy])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner */}
      <HeroBanner
        title="Hire Skilled Professionals"
        subtitle="Browse and connect with trusted, verified workers for your projects and home needs."
        gradient="from-blue-600 via-indigo-600 to-violet-700"
        stats={[
          { icon: ShieldCheckIcon, label: 'Verified Profiles' },
          { icon: StarSolid, label: 'Top Rated' },
          { icon: UserGroupIcon, label: 'Smart Matching' }
        ]}
        badge={`${workers.length} Professionals Available`}
        badgeDot={true}
      />

      {/* Search & Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-5 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setSelectedCategory('') }}
              placeholder="Search by skill, name, or location..."
              className="input-field pl-10" />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field w-auto min-w-[160px]">
            <option value="score">Best Match</option>
            <option value="rating">Highest Rated</option>
            <option value="experience">Most Experienced</option>
            <option value="price">Lowest Price</option>
          </select>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={() => { setSelectedCategory(''); setSearchTerm('') }}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
              !selectedCategory ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}>All</button>
          {SERVICE_CATEGORIES.map(c => (
            <button key={c.value} onClick={() => { setSelectedCategory(c.value); setSearchTerm(c.value) }}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                selectedCategory === c.value ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}>{c.emoji} {c.label}</button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{filteredWorkers.length} worker{filteredWorkers.length !== 1 ? 's' : ''} found</p>

      {/* Score formula explanation */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
        <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">Match Score Formula (Transparent)</p>
        <p className="text-xs text-blue-700 dark:text-blue-400">
          Score = (35% x Rating) + (25% x Experience) + (20% x Distance) + (20% x Completion Rate)
        </p>
      </div>

      {/* Workers grid */}
      {!loaded ? (
        <CardGridSkeleton count={6} />
      ) : error ? (
        <ErrorState title="Failed to load workers" message={error} onRetry={refreshCache} />
      ) : filteredWorkers.length === 0 ? (
        <EmptyState
          icon={MagnifyingGlassIcon}
          title="No workers found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkers.map((w, i) => (
            <motion.div key={w.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-5 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-full ${w.avatar_color || 'bg-primary-500'} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                  {(w.name || 'W')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{w.name}</h3>
                    <CheckBadgeIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    <MapPinIcon className="w-3.5 h-3.5" />
                    <span>{w.location || 'India'}</span>
                  </div>
                </div>
              </div>

              {/* Category & Services */}
              <div className="mb-4">
                <span className="inline-block mb-2 text-xs font-bold text-primary-700 bg-primary-50 dark:bg-primary-900/40 dark:text-primary-300 px-2.5 py-1 rounded-md border border-primary-100 dark:border-primary-800">
                  {w.category || 'Professional'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(w.services || w.skills || []).slice(0, 3).map(s => (
                    <span key={s} className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 font-medium truncate max-w-[120px]">{s}</span>
                  ))}
                </div>
              </div>

              {/* Match score bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Match Score</span>
                  <span className="font-bold text-primary-600">{w.match_score}/100</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                    style={{ width: `${w.match_score}%` }} />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg py-2">
                  <div className="flex items-center justify-center gap-0.5">
                    <StarSolid className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{w.rating}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">Rating</p>
                </div>
                <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg py-2">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{w.experience_years}yr</p>
                  <p className="text-[10px] text-gray-400">Experience</p>
                </div>
                <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg py-2">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{w.completion_rate}%</p>
                  <p className="text-[10px] text-gray-400">Completion</p>
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrencyINR(w.hourly_rate || 500)}</span>
                  <span className="text-xs text-gray-400">/hr</span>
                </div>
                <Link to={`/workers/${w.id}`}
                  className="btn-primary text-xs px-4 py-2">
                  View Profile
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
