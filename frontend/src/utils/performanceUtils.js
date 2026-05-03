/**
 * WorkSphere — Performance Utilities
 * Prefetch, debounce, throttle, and performance helpers
 */

// ─── Route Prefetcher ─────────────────────────────────────────────────────────
// Preloads route chunks on link hover/focus for instant navigation

const prefetchedRoutes = new Set()

const ROUTE_CHUNKS = {
  '/services': () => import('../pages/services/ServicesPage'),
  '/jobs': () => import('../pages/jobs/JobsPage'),
  '/gigs': () => import('../pages/gigs/GigsPage'),
  '/find-workers': () => import('../pages/workers/FindWorkersPage'),
  '/about': () => import('../pages/about/AboutPage'),
  '/contact': () => import('../pages/contact/ContactPage'),
  '/blog': () => import('../pages/blog/BlogPage'),
  '/dashboard': () => import('../pages/dashboard/DashboardPage'),
  '/profile': () => import('../pages/profile/ProfilePage'),
  '/login': () => import('../pages/auth/LoginPage'),
  '/signup': () => import('../pages/auth/SignupPage'),
}

/**
 * Prefetch a route's JS chunk in the background
 * Call on mouseenter/focus of navigation links
 */
export function prefetchRoute(path) {
  // Normalize path
  const base = '/' + path.split('/').filter(Boolean).slice(0, 1).join('/')
  
  if (prefetchedRoutes.has(base)) return
  
  const loader = ROUTE_CHUNKS[base]
  if (loader) {
    prefetchedRoutes.add(base)
    // Use requestIdleCallback for non-blocking prefetch
    const prefetch = () => {
      loader().catch(() => {
        // Silently fail — route will load normally on click
        prefetchedRoutes.delete(base)
      })
    }
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetch, { timeout: 2000 })
    } else {
      setTimeout(prefetch, 100)
    }
  }
}

// ─── Debounce ─────────────────────────────────────────────────────────────────

export function debounce(fn, delay = 300) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

// ─── Throttle ─────────────────────────────────────────────────────────────────

export function throttle(fn, delay = 100) {
  let lastCall = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      return fn.apply(this, args)
    }
  }
}

// ─── Image Lazy Load Helper ──────────────────────────────────────────────────

export function getImageProps(src, alt = '', priority = false) {
  return {
    src,
    alt,
    loading: priority ? 'eager' : 'lazy',
    decoding: priority ? 'sync' : 'async',
  }
}

// ─── Performance Monitor (dev only) ──────────────────────────────────────────

export function measureRender(componentName) {
  if (process.env.NODE_ENV !== 'development') return { start: () => {}, end: () => {} }
  
  const start = () => performance.mark(`${componentName}-start`)
  const end = () => {
    performance.mark(`${componentName}-end`)
    performance.measure(componentName, `${componentName}-start`, `${componentName}-end`)
    const entries = performance.getEntriesByName(componentName)
    if (entries.length > 0) {
      console.log(`[Perf] ${componentName}: ${entries[entries.length - 1].duration.toFixed(1)}ms`)
    }
  }
  
  return { start, end }
}

// ─── Stale-While-Revalidate Cache ────────────────────────────────────────────

const memoryCache = new Map()

export function getCached(key) {
  const entry = memoryCache.get(key)
  if (!entry) return null
  return entry.data
}

export function setCache(key, data, ttlMs = 5 * 60 * 1000) {
  memoryCache.set(key, { data, expires: Date.now() + ttlMs })
}

export function isCacheStale(key) {
  const entry = memoryCache.get(key)
  if (!entry) return true
  return Date.now() > entry.expires
}
