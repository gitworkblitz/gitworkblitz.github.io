import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { getAllServices, getAllJobs, getAllGigs, queryDocuments } from '../services/firestoreService'
import { dummyServices, dummyJobs, dummyGigs, dummyWorkers } from '../utils/dummyData'

const DataCacheContext = createContext()
export const useDataCache = () => useContext(DataCacheContext)

// Cache TTL in ms (5 minutes)
const CACHE_TTL = 5 * 60 * 1000

export function DataCacheProvider({ children }) {
  const [services, setServices] = useState([])
  const [jobs, setJobs] = useState([])
  const [gigs, setGigs] = useState([])
  const [workers, setWorkers] = useState(dummyWorkers)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(null)
  const lastFetch = useRef(0)
  const fetchInProgress = useRef(false)

  const loadAll = useCallback(async (force = false) => {
    // Prevent duplicate parallel fetches
    if (fetchInProgress.current) return
    // Skip if data is fresh and not forced
    if (!force && loaded && Date.now() - lastFetch.current < CACHE_TTL) return

    fetchInProgress.current = true
    setError(null)

    try {
      const [svcData, jobData, gigData, workerData] = await Promise.all([
        getAllServices(100).catch(() => []),
        getAllJobs(100).catch(() => []),
        getAllGigs(100).catch(() => []),
        queryDocuments('users', 'user_type', '==', 'worker').catch(() => []),
      ])

      setServices(svcData.length > 0 ? svcData : dummyServices)
      setJobs(jobData.length > 0 ? jobData : dummyJobs)
      setGigs(gigData.length > 0 ? gigData : dummyGigs)
      setWorkers(workerData.length > 0 ? workerData : dummyWorkers)
      lastFetch.current = Date.now()
    } catch (err) {
      console.error('DataCache load error:', err)
      setError('Failed to load data')
      setServices(dummyServices)
      setJobs(dummyJobs)
      setGigs(dummyGigs)
      setWorkers(dummyWorkers)
    } finally {
      setLoaded(true)
      fetchInProgress.current = false
    }
  }, [loaded])

  useEffect(() => { loadAll() }, []) // eslint-disable-line

  // Refresh entire cache
  const refreshCache = useCallback(() => {
    setLoaded(false)
    lastFetch.current = 0
    return loadAll(true)
  }, [loadAll])

  // Refresh a single collection
  const refreshCollection = useCallback(async (name) => {
    try {
      switch (name) {
        case 'services': {
          const data = await getAllServices(100)
          setServices(data.length > 0 ? data : dummyServices)
          break
        }
        case 'jobs': {
          const data = await getAllJobs(100)
          setJobs(data.length > 0 ? data : dummyJobs)
          break
        }
        case 'gigs': {
          const data = await getAllGigs(100)
          setGigs(data.length > 0 ? data : dummyGigs)
          break
        }
        case 'workers': {
          const data = await queryDocuments('users', 'user_type', '==', 'worker')
          setWorkers(data.length > 0 ? data : dummyWorkers)
          break
        }
      }
    } catch (err) {
      console.error(`Error refreshing ${name}:`, err)
    }
  }, [])

  return (
    <DataCacheContext.Provider value={{
      services, jobs, gigs, workers,
      loaded, error,
      refreshCache, refreshCollection
    }}>
      {children}
    </DataCacheContext.Provider>
  )
}
