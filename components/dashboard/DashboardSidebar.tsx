'use client'

import {
  LayoutDashboard,
  Building2,
  DollarSign,
  Users,
  FileText,
  X,
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
  isOpen?: boolean
  onClose?: () => void
}

export default function DashboardSidebar({ currentView = 'overview', onNavigate, isOpen = false, onClose }: DashboardSidebarProps) {
  const handleNavClick = (view: typeof currentView) => {
    if (onNavigate) {
      onNavigate(view)
    }
    // Close sidebar on mobile after navigation
    if (onClose && window.innerWidth < 1024) {
      onClose()
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 overflow-y-auto flex flex-col z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:relative lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
      <div className="p-4 lg:p-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-lg lg:text-xl font-bold text-slate-900">Abbey OS</h1>
          <p className="text-xs text-slate-500 mt-1">Asset Management</p>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>
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
              onClick={() => handleNavClick(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 lg:py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
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
    </>
  )
}
