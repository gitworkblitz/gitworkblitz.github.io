import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPlatformSettings } from '../services/firestoreService';

const SettingsContext = createContext();

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    platformName: 'WorkSphere',
    adminEmail: 'worksphere.admin@gmail.com',
    maintenanceMode: false,
    emailNotifications: true,
    autoApproveReviews: false,
    maxBookingsPerDay: 10,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlatformSettings()
      .then(data => {
        if (data) setSettings(prev => ({ ...prev, ...data }));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}
