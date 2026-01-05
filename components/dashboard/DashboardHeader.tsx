'use client'

import { Calendar, User } from 'lucide-react'

export default function DashboardHeader() {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4" />
          <span>{currentDate}</span>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <div className="text-sm">
          <span className="text-slate-500">Entity: </span>
          <span className="font-medium text-slate-900">MAD Ltd / Dem Bro Ltd</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
          Role: Principal (Admin)
        </span>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
          <User className="w-4 h-4" />
          <span>Admin</span>
        </button>
      </div>
    </div>
  )
}

