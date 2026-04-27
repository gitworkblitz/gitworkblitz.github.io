import React from 'react';
import { Settings as CogIcon } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="text-center max-w-md animate-slide-up">
        <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CogIcon className="w-10 h-10 text-primary-600 dark:text-primary-400 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Under Maintenance</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          We are currently upgrading our platform to serve you better. Please check back soon!
        </p>
      </div>
    </div>
  );
}
