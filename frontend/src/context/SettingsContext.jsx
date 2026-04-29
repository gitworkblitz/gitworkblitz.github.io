import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { getPlatformSettings } from '../services/firestoreService';

const SettingsContext = createContext();

export function useSettings() {
  return useContext(SettingsContext);
}

const DEFAULT_SETTINGS = {
  platformName: 'WorkSphere',
  adminEmail: 'worksphere.admin@gmail.com',
  maintenanceMode: false,
  emailNotifications: true,
  autoApproveReviews: false,
  maxBookingsPerDay: 10,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  // Start non-blocking: show UI immediately with defaults, update silently
  const [loading, setLoading] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    getPlatformSettings()
      .then(data => {
        if (data) setSettings(prev => ({ ...prev, ...data }));
      })
      .catch(console.error);
  }, []);

  const value = useMemo(() => ({ settings, loading }), [settings, loading]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
