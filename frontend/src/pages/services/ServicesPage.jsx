import React, { useState, useMemo, useEffect } from 'react'
import useSEO from '../../hooks/useSEO'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useDataCache } from '../../context/DataCacheContext'
import { SERVICE_CATEGORIES, dummyWorkers, formatCurrencyINR } from '../../utils/dummyData'
import useDebounce from '../../hooks/useDebounce'
import ServiceCard from '../../components/ServiceCard'
import { CardGridSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { MagnifyingGlassIcon, StarIcon, MapPinIcon, CheckBadgeIcon, ShieldCheckIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Most Reviews', value: 'reviews' },
]

// Category colors for the hero grid
const CATEGORY_COLORS = {
  'Electrician': 'from-yellow-400 to-amber-500',
  'Plumber': 'from-blue-400 to-blue-600',
  'Carpenter': 'from-orange-400 to-orange-600',
  'Mason': 'from-stone-400 to-stone-600',
  'Painter': 'from-purple-400 to-purple-600',
  'AC Repair': 'from-sky-400 to-cyan-600',
  'Home Cleaning': 'from-emerald-400 to-green-600',
  'Pest Control': 'from-lime-500 to-green-700',
  'Salon at Home': 'from-pink-400 to-rose-600',
  'Mobile Repair': 'from-indigo-400 to-indigo-600',
  'Computer/Laptop Repair': 'from-violet-400 to-violet-600',
  'Housekeeping': 'from-teal-400 to-teal-600',
  'Driver Services': 'from-slate-400 to-slate-600',
  'Tailor Services': 'from-fuchsia-400 to-fuchsia-600',
  'Delivery Services': 'from-orange-300 to-orange-500',
  'Security Guard': 'from-gray-500 to-gray-700',
  'Appliance Repair': 'from-red-400 to-red-600',
  'Washing Machine Repair': 'from-sky-300 to-blue-500',
  'RO Water Purifier Service': 'from-cyan-300 to-cyan-500',
  'Refrigerator Repair': 'from-blue-300 to-blue-500',
}

export default function ServicesPage() {
  const { isCustomer } = useAuth()
  const { services, loaded, error, refreshCache } = useDataCache()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [category, setCategory] = useState('')
  const [sortBy, setSortBy] = useState('relevance')
  const [showWorkers, setShowWorkers] = useState(false)
  const [visibleCount, setVisibleCount] = useState(12)
  const [showAllCategories, setShowAllCategories] = useState(false)

  useSEO({
    title: category ? `${category} Services — Hire Verified Professionals | WorkSphere` : 'Home Services Platform — Book Trusted Professionals | WorkSphere',
    description: `Book trusted ${category || 'home services'} professionals on WorkSphere. Verified experts, instant booking, secure payments. India's leading workforce platform for 20+ service categories.`,
    keywords: `${category || 'home services platform'}, workforce platform India, hire workers online, ${category ? category.toLowerCase() + ' services' : 'plumber, electrician, carpenter'}, WorkSphere services`,
    type: 'service',
    url: `https://wsphere.me/services${category ? '?category=' + encodeURIComponent(category) : ''}`
  })

  const filteredServices = useMemo(() => {
    let result = services.filter(s => {
      const matchSearch = !debouncedSearch || 
        s.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
        s.description?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        s.worker_name?.toLowerCase().includes(debouncedSearch.toLowerCase())
      const matchCat = !category || s.category?.toLowerCase() === category.toLowerCase()
      return matchSearch && matchCat
    })

    switch (sortBy) {
      case 'price_asc': result.sort((a, b) => (a.price || 0) - (b.price || 0)); break
      case 'price_desc': result.sort((a, b) => (b.price || 0) - (a.price || 0)); break
      case 'rating': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break
      case 'reviews': result.sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0)); break
      default: break
    }

    return result
  }, [services, debouncedSearch, category, sortBy])

  const filteredWorkers = useMemo(() => {
    let result = dummyWorkers.filter(w => {
      const matchSearch = !debouncedSearch || 
        w.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        w.category?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        w.bio?.toLowerCase().includes(debouncedSearch.toLowerCase())
      const matchCat = !category || w.category?.toLowerCase() === category.toLowerCase()
      return matchSearch && matchCat
    })

    switch (sortBy) {
      case 'rating': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break
      case 'reviews': result.sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0)); break
      case 'price_asc': result.sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0)); break
      case 'price_desc': result.sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0)); break
      default: break
    }

    return result
  }, [debouncedSearch, category, sortBy])

  // Count services per category for the hero grid
  const categoryCounts = useMemo(() => {
    const counts = {}
    services.forEach(s => {
      if (s.category) counts[s.category] = (counts[s.category] || 0) + 1
    })
    return counts
  }, [services])

  const getAvatarColor = (name) => {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500']
    let hash = 0
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  const displayedCategories = showAllCategories ? SERVICE_CATEGORIES : SERVICE_CATEGORIES.slice(0, 10)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* ============================================= */}
      {/* URBAN COMPANY-STYLE HERO SECTION              */}
      {/* ============================================= */}
      {!category && !showWorkers && !debouncedSearch && (
        <div className="mb-10 animate-fade-in">
          {/* Hero Header */}
          <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700 rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white rounded-full" />
            </div>
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Home services at your doorstep</h1>
              <p className="text-primary-100 text-sm sm:text-base mb-5 max-w-lg">Book verified professionals for 20+ service categories. Instant booking, transparent pricing.</p>
              <div className="flex flex-wrap gap-4 text-white/90 text-xs sm:text-sm">
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <ShieldCheckIcon className="w-4 h-4" /> Verified Professionals
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <StarSolid className="w-4 h-4 text-yellow-300" /> 4.7★ Average Rating
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <SparklesIcon className="w-4 h-4" /> 50+ Workers
                </span>
              </div>
            </div>
          </div>

          {/* Category Grid */}
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {displayedCategories.map(cat => {
                const CatIcon = cat.icon
                const gradient = CATEGORY_COLORS[cat.value] || 'from-gray-400 to-gray-600'
                const count = categoryCounts[cat.value] || 0
                return (
                  <button
                    key={cat.value}
                    onClick={() => { setCategory(cat.value); setShowWorkers(false); setVisibleCount(12); }}
                    className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left relative overflow-hidden"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
                      <CatIcon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors leading-tight">{cat.label}</p>
                    {count > 0 && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{count} service{count !== 1 ? 's' : ''}</p>
                    )}
                    <ArrowRightIcon className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )
              })}
            </div>
            {SERVICE_CATEGORIES.length > 10 && (
              <button
                onClick={() => setShowAllCategories(v => !v)}
                className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 mx-auto"
              >
                {showAllCategories ? 'Show Less' : `View All ${SERVICE_CATEGORIES.length} Categories`}
                <ArrowRightIcon className={`w-3.5 h-3.5 transition-transform ${showAllCategories ? 'rotate-90' : ''}`} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================= */}
      {/* PAGE HEADER (when category is selected)       */}
      {/* ============================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          {category ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => { setCategory(''); setVisibleCount(12); }}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  ← All Services
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{category}</h1>
              <p className="text-gray-500 dark:text-gray-400">
                {showWorkers ? `${filteredWorkers.length} workers` : `${filteredServices.length} services`} available
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {showWorkers ? 'Top Workers' : 'All Services'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {showWorkers 
                  ? `${filteredWorkers.length} verified professionals` 
                  : 'Book trusted professionals for all your needs'}
              </p>
            </>
          )}
        </div>
        {!isCustomer && (
          <Link to="/services/create" className="btn-primary text-sm px-5 py-2.5 self-start flex items-center gap-2">
            <span className="text-lg">+</span> Post Service
          </Link>
        )}
      </div>

      {/* ============================================= */}
      {/* SEARCH & FILTER BAR                           */}
      {/* ============================================= */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-5 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              placeholder="Search services, workers..." 
              className="input-field pl-10" 
            />
          </div>
          <select 
            value={category} 
            onChange={e => setCategory(e.target.value)} 
            className="input-field w-auto min-w-[160px]"
          >
            <option value="">All Categories</option>
            {SERVICE_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)} 
            className="input-field w-auto min-w-[160px]"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-2 mt-4 flex-wrap">
          <button
            onClick={() => { setShowWorkers(false); setCategory(''); setVisibleCount(12); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !showWorkers && !category
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All Services
          </button>
          <button
            onClick={() => { setShowWorkers(true); setCategory(''); setVisibleCount(12); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              showWorkers
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Top Workers
          </button>
          {SERVICE_CATEGORIES.slice(0, 5).map(c => (
            <button
              key={c.value}
              onClick={() => { setCategory(c.value); setShowWorkers(false); setVisibleCount(12); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                category === c.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================= */}
      {/* RESULTS                                       */}
      {/* ============================================= */}
      {!loaded ? (
        <CardGridSkeleton count={6} />
      ) : error ? (
        <ErrorState title="Failed to load services" message={error} onRetry={refreshCache} />
      ) : showWorkers ? (
        <>
          {filteredWorkers.length === 0 ? (
            <EmptyState
              icon={MagnifyingGlassIcon}
              title="No workers found"
              description="Try adjusting your search or filters"
            />
          ) : (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredWorkers.slice(0, visibleCount).map(w => (
                <Link 
                  key={w.id} 
                  to={`/workers/${w.id}`}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-full ${getAvatarColor(w.name)} flex items-center justify-center text-white font-bold text-xl mb-3 group-hover:scale-110 transition-transform`}>
                      {w.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors flex items-center gap-1">
                      {w.name}
                      <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
                    </h3>
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-2">{w.category}</p>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <StarSolid className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{w.rating}</span>
                      <span className="text-xs text-gray-400">({w.total_reviews})</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-0.5">
                        <MapPinIcon className="w-3 h-3" />
                        <span className="truncate max-w-[80px]">{w.location?.split(',')[0]}</span>
                      </span>
                      <span>•</span>
                      <span>{w.experience_years}yr exp</span>
                      <span>•</span>
                      <span>{w.completion_rate}%</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 justify-center mb-3">
                      {w.services?.slice(0, 2).map(s => (
                        <span key={s} className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                    
                    <div className="w-full pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Starting at</span>
                        <span className="font-bold text-primary-600">{formatCurrencyINR(w.hourly_rate)}/hr</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {visibleCount < filteredWorkers.length && (
              <div className="mt-10 mb-4 flex justify-center">
                <button
                  onClick={() => setVisibleCount(c => c + 12)}
                  className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md transition-all flex items-center gap-2"
                >
                  Load More Workers
                  <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full text-xs">
                    +{Math.min(12, filteredWorkers.length - visibleCount)}
                  </span>
                </button>
              </div>
            )}
            </>
          )}
        </>
      ) : filteredServices.length === 0 ? (
        <EmptyState
          icon={MagnifyingGlassIcon}
          title="No services found"
          description="Try adjusting your search or filters"
          actionLabel={!isCustomer ? "Post a Service" : undefined}
          actionTo={!isCustomer ? "/services/create" : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.slice(0, visibleCount).map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
          {visibleCount < filteredServices.length && (
            <div className="mt-10 mb-4 flex justify-center">
              <button
                onClick={() => setVisibleCount(c => c + 12)}
                className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md transition-all flex items-center gap-2"
              >
                Load More Services
                <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full text-xs">
                  +{Math.min(12, filteredServices.length - visibleCount)}
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
