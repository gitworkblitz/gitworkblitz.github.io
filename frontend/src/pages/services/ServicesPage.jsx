import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDataCache } from '../../context/DataCacheContext'
import { SERVICE_CATEGORIES, formatCurrencyINR } from '../../utils/dummyData'
import ServiceCard from '../../components/ServiceCard'
import { CardGridSkeleton } from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

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
  const [category, setCategory] = useState('')
  const [sortBy, setSortBy] = useState('relevance')

  const filtered = useMemo(() => {
    let result = services.filter(s => {
      const matchSearch = !search || s.title?.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase())
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
  }, [services, search, category, sortBy])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Services</h1>
          <p className="text-gray-500 dark:text-gray-400">Browse trusted professionals for all your needs</p>
        </div>
        <Link to="/services/create" className="btn-primary text-sm px-5 py-2.5 self-start">+ Post Service</Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-5 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search services..." className="input-field pl-10" />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="input-field w-auto min-w-[160px]">
            <option value="">All Categories</option>
            {SERVICE_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
            ))}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field w-auto min-w-[160px]">
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">{filtered.length} service{filtered.length !== 1 ? 's' : ''} found</p>

      {!loaded ? (
        <CardGridSkeleton count={6} />
      ) : error ? (
        <ErrorState title="Failed to load services" message={error} onRetry={refreshCache} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MagnifyingGlassIcon}
          title="No services found"
          description="Try adjusting your search or filters"
          actionLabel="Post a Service"
          actionTo="/services/create"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(s => <ServiceCard key={s.id} service={s} />)}
        </div>
      )}
    </div>
  )
}
