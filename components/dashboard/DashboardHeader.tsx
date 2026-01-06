'use client'

import { Calendar, User, Menu } from 'lucide-react'

interface DashboardHeaderProps {
  onMenuClick?: () => void
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="h-14 lg:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0">
        {/* Hamburger Menu Button - Mobile Only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors touch-manipulation"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>

        <div className="flex items-center gap-2 lg:gap-4 min-w-0">
          <div className="hidden sm:flex items-center gap-2 text-xs lg:text-sm text-slate-600">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{currentDate}</span>
          </div>
          <div className="hidden lg:block h-4 w-px bg-slate-200" />
          <div className="hidden lg:block text-sm">
            <span className="text-slate-500">Entity: </span>
            <span className="font-medium text-slate-900">MAD Ltd / Dem Bro Ltd</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
        <span className="hidden sm:inline-block px-2 lg:px-3 py-1 lg:py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
          Role: John Demetriou (Admin)
        </span>
        <button className="flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1.5 text-xs lg:text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors touch-manipulation">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Admin</span>
        </button>
      </div>
    </div>
  )
}

