import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { getAllServices, getAllJobs, getAllGigs, queryDocuments, queryDocumentsLimited } from '../services/firestoreService'
import { dummyServices, dummyJobs, dummyGigs, dummyWorkers } from '../utils/dummyData'

const DataCacheContext = createContext()
export const useDataCache = () => useContext(DataCacheContext)

// Cache TTL in ms (8 minutes)
const CACHE_TTL = 8 * 60 * 1000

// Helper: wrap promise with timeout to prevent hanging on slow networks
const withTimeout = (promise, ms = 8000) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Fetch timeout')), ms))
  ])

export function DataCacheProvider({ children }) {
  const [services, setServices] = useState(dummyServices)
  const [jobs, setJobs] = useState(dummyJobs)
  const [gigs, setGigs] = useState(dummyGigs)
  const [workers, setWorkers] = useState(dummyWorkers)
  const [loaded, setLoaded] = useState(true) // Stale-while-revalidate - immediately true
  const [error, setError] = useState(null)
  const lastFetch = useRef(0)
  const fetchInProgress = useRef(false)
  const mountedRef = useRef(true)

  const loadAll = useCallback(async (force = false) => {
    // Prevent duplicate parallel fetches
    if (fetchInProgress.current) return
    // Skip if data is fresh and not forced
    if (!force && Date.now() - lastFetch.current < CACHE_TTL && lastFetch.current > 0) return

    fetchInProgress.current = true
    setError(null)

    try {
      const [svcData, jobData, gigData, workerData] = await Promise.all([
        withTimeout(getAllServices(100)).catch(() => []),
        withTimeout(getAllJobs(100)).catch(() => []),
        withTimeout(getAllGigs(100)).catch(() => []),
        withTimeout(queryDocumentsLimited('users', 'user_type', '==', 'worker', 50)).catch(() => []),
      ])

      if (!mountedRef.current) return

      setServices(svcData.length > 0 ? svcData : dummyServices)
      setJobs(jobData.length > 0 ? jobData : dummyJobs)
      setGigs(gigData.length > 0 ? gigData : dummyGigs)
      setWorkers(workerData.length > 0 ? workerData : dummyWorkers)
      lastFetch.current = Date.now()
    } catch (err) {
      console.error('DataCache load error:', err)
      if (!mountedRef.current) return
      setError('Failed to load data')
      // Keep dummy data as fallback — already set as initial state
    } finally {
      if (mountedRef.current) {
        setLoaded(true)
        fetchInProgress.current = false
      }
    }
  }, []) // No deps needed — uses refs for staleness check

  useEffect(() => {
    mountedRef.current = true
    // Delay initial fetch to prioritize fast first paint
    const timer = setTimeout(() => {
      loadAll()
    }, 1500)
    return () => { 
      mountedRef.current = false 
      clearTimeout(timer)
    }
  }, [loadAll])

  // Refresh entire cache
  const refreshCache = useCallback(() => {
    lastFetch.current = 0
    return loadAll(true)
  }, [loadAll])

  // Refresh a single collection
  const refreshCollection = useCallback(async (name) => {
    try {
      switch (name) {
        case 'services': {
          const data = await getAllServices(100)
          if (mountedRef.current) setServices(data.length > 0 ? data : dummyServices)
          break
        }
        case 'jobs': {
          const data = await getAllJobs(100)
          if (mountedRef.current) setJobs(data.length > 0 ? data : dummyJobs)
          break
        }
        case 'gigs': {
          const data = await getAllGigs(100)
          if (mountedRef.current) setGigs(data.length > 0 ? data : dummyGigs)
          break
        }
        case 'workers': {
          const data = await queryDocumentsLimited('users', 'user_type', '==', 'worker', 50)
          if (mountedRef.current) setWorkers(data.length > 0 ? data : dummyWorkers)
          break
        }
      }
    } catch (err) {
      console.error(`Error refreshing ${name}:`, err)
    }
  }, [])

  const contextValue = useMemo(() => ({
    services, jobs, gigs, workers,
    loaded, error,
    refreshCache, refreshCollection
  }), [services, jobs, gigs, workers, loaded, error, refreshCache, refreshCollection])

  return (
    <DataCacheContext.Provider value={contextValue}>
      {children}
    </DataCacheContext.Provider>
  )
}
