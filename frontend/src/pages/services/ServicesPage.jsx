import React, { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useDataCache } from '../../context/DataCacheContext'
import { SERVICE_CATEGORIES, dummyWorkers, formatCurrencyINR } from '../../utils/dummyData'
import useDebounce from '../../hooks/useDebounce'
import ServiceCard from '../../components/ServiceCard'
import { CardGridSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { MagnifyingGlassIcon, StarIcon, MapPinIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Most Reviews', value: 'reviews' },
]

export default function ServicesPage() {
  const { services, loaded, error, refreshCache } = useDataCache()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [category, setCategory] = useState('')
  const [sortBy, setSortBy] = useState('relevance')
  const [showWorkers, setShowWorkers] = useState(false)

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

  const getAvatarColor = (name) => {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500']
    let hash = 0
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Find Services</h1>
          <p className="text-gray-500 dark:text-gray-400">Book trusted professionals for all your needs</p>
        </div>
        <Link to="/services/create" className="btn-primary text-sm px-5 py-2.5 self-start flex items-center gap-2">
          <span className="text-lg">+</span> Post Service
        </Link>
      </div>

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
            onClick={() => { setShowWorkers(false); setCategory(''); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !showWorkers && !category
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All Services
          </button>
          <button
            onClick={() => { setShowWorkers(true); setCategory(''); }}
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
              onClick={() => { setCategory(c.value); setShowWorkers(false); }}
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

      {!loaded ? (
        <CardGridSkeleton count={6} />
      ) : error ? (
        <ErrorState title="Failed to load services" message={error} onRetry={refreshCache} />
      ) : showWorkers ? (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            {filteredWorkers.length} worker{filteredWorkers.length !== 1 ? 's' : ''} available
          </p>
          {filteredWorkers.length === 0 ? (
            <EmptyState
              icon={MagnifyingGlassIcon}
              title="No workers found"
              description="Try adjusting your search or filters"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredWorkers.slice(0, 20).map(w => (
                <Link 
                  key={w.id} 
                  to={`/workers/${w.id}`}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-full ${getAvatarColor(w.name)} flex items-center justify-center text-white font-bold text-xl mb-3 group-hover:scale-110 transition-transform`}>
                      {w.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{w.name}</h3>
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-2">{w.category}</p>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <StarSolid className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{w.rating}</span>
                      <span className="text-xs text-gray-400">({w.total_reviews})</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                      <MapPinIcon className="w-3 h-3" />
                      <span className="truncate max-w-[120px]">{w.location}</span>
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
          )}
        </>
      ) : filteredServices.length === 0 ? (
        <EmptyState
          icon={MagnifyingGlassIcon}
          title="No services found"
          description="Try adjusting your search or filters"
          actionLabel="Post a Service"
          actionTo="/services/create"
        />
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        </>
      )}
    </div>
  )
}
