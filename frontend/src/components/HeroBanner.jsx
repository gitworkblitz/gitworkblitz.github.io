import React from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'

/**
 * Reusable hero banner matching the Services/Gigs premium design.
 *
 * Props:
 *  - title        string   (required)
 *  - subtitle     string   (required)
 *  - placeholder  string   search input placeholder
 *  - gradient     string   tailwind gradient classes (default: primary→violet)
 *  - search       string   controlled search value
 *  - onSearch     fn       onChange handler
 *  - stats        array    [{ icon, label }] — up to 3 badge-style stats
 *  - badge        string   optional top-left badge label
 *  - badgeDot     bool     show animated green dot in badge
 *  - ctaLabel     string   CTA button label
 *  - ctaTo        string | fn  Link target or onClick handler
 *  - categories   array    [{ label, value }] quick-access chips
 *  - onCategoryClick  fn   (value) => void
 *  - activeCategory   string  currently selected category
 *  - children     any      extra elements inside hero
 */
export default React.memo(function HeroBanner({
  title,
  subtitle,
  placeholder = 'Search...',
  gradient = 'from-primary-600 via-primary-700 to-violet-700',
  search = '',
  onSearch,
  stats = [],
  badge,
  badgeDot = false,
  ctaLabel,
  ctaTo,
  categories = [],
  onCategoryClick,
  activeCategory = '',
  children,
}) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden`}>
      {/* Decorative circles */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Badge */}
        {badge && (
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-sm font-medium px-3 py-1 rounded-full mb-3 text-white">
            {badgeDot && <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
            {badge}
          </span>
        )}

        {/* Title / Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{title}</h1>
        <p className="text-white/80 text-sm sm:text-base mb-5 max-w-lg">{subtitle}</p>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="flex flex-wrap gap-4 text-white/90 text-xs sm:text-sm mb-5">
            {stats.map((s, i) => (
              <span key={i} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                {s.icon && <s.icon className="w-4 h-4" />}
                {s.label}
              </span>
            ))}
          </div>
        )}

        {/* Search bar inside hero */}
        {onSearch && (
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => onSearch(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-white/95 dark:bg-gray-900/95 text-gray-900 dark:text-white placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg transition-all"
              />
            </div>
            {ctaLabel && typeof ctaTo === 'string' && (
              <a href={ctaTo} className="bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-all shadow-lg text-sm flex items-center gap-2 self-start whitespace-nowrap">
                {ctaLabel}
              </a>
            )}
          </div>
        )}

        {/* Category chips */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map(c => (
              <button
                key={c.value}
                onClick={() => onCategoryClick?.(c.value)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200 ${
                  activeCategory === c.value
                    ? 'bg-white text-primary-700 shadow-md'
                    : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {children}
      </div>
    </div>
  )
})
