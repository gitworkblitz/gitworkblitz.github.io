import React from 'react'
import {
  BoltIcon, WrenchScrewdriverIcon, PaintBrushIcon, CubeIcon,
  HomeIcon, SparklesIcon, ComputerDesktopIcon, DevicePhoneMobileIcon,
  TruckIcon, ShieldCheckIcon, ScissorsIcon, BeakerIcon,
  SunIcon, CloudIcon, UserGroupIcon, SwatchIcon,
  WifiIcon, CogIcon
} from '@heroicons/react/24/outline'

const CATEGORY_ICONS = {
  'Electrician': BoltIcon,
  'Plumber': WrenchScrewdriverIcon,
  'Carpenter': CubeIcon,
  'Mason': HomeIcon,
  'Painter': PaintBrushIcon,
  'AC Repair': SunIcon,
  'Washing Machine Repair': CogIcon,
  'Refrigerator Repair': CloudIcon,
  'RO Water Purifier Service': BeakerIcon,
  'Home Cleaning': SparklesIcon,
  'Pest Control': ShieldCheckIcon,
  'Appliance Repair': WifiIcon,
  'Mobile Repair': DevicePhoneMobileIcon,
  'Computer/Laptop Repair': ComputerDesktopIcon,
  'Delivery Services': TruckIcon,
  'Driver Services': TruckIcon,
  'Security Guard': ShieldCheckIcon,
  'Housekeeping': HomeIcon,
  'Salon at Home': ScissorsIcon,
  'Tailor Services': SwatchIcon,
}

export function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || WrenchScrewdriverIcon
}

export default function CategoryIcon({ category, className = 'w-6 h-6' }) {
  const Icon = getCategoryIcon(category)
  return <Icon className={className} />
}

export function CategoryIconBadge({ category, size = 'lg' }) {
  const Icon = getCategoryIcon(category)
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  }
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  }
  return (
    <div className={`${sizeClasses[size]} bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center`}>
      <Icon className={iconSizes[size]} />
    </div>
  )
}
