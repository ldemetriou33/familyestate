'use client'

import {
  LayoutDashboard,
  Building2,
  DollarSign,
  Users,
  FileText,
} from 'lucide-react'
import RegulatoryTimer from './RegulatoryTimer'
import ResidencyCounter from './ResidencyCounter'

const navigation = [
  { name: 'Overview', view: 'overview' as const, icon: LayoutDashboard },
  { name: 'Entities', view: 'entities' as const, icon: Building2 },
  { name: 'Financials', view: 'financials' as const, icon: DollarSign },
  { name: 'Ownership', view: 'ownership' as const, icon: Users },
  { name: 'Documents', view: 'documents' as const, icon: FileText },
]

interface DashboardSidebarProps {
  currentView?: 'overview' | 'entities' | 'assets' | 'financials' | 'ownership' | 'documents'
  onNavigate?: (view: 'overview' | 'entities' | 'assets' | 'financials' | 'ownership' | 'documents') => void
}

export default function DashboardSidebar({ currentView = 'overview', onNavigate }: DashboardSidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 overflow-y-auto flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900">Abbey OS</h1>
        <p className="text-xs text-slate-500 mt-1">Asset Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.view
          const handleClick = () => {
            if (onNavigate) {
              onNavigate(item.view)
            }
          }
          return (
            <button
              key={item.name}
              onClick={handleClick}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </button>
          )
        })}
      </nav>

      {/* Regulatory Timers */}
      <RegulatoryTimer />
      
      {/* Residency Counter */}
      <ResidencyCounter />
    </div>
  )
}
