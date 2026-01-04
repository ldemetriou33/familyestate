'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  DollarSign,
  Users,
  FileText,
  Settings,
  AlertTriangle,
  ChevronDown,
  Plus,
} from 'lucide-react'
import type { Family } from '@/lib/types/saas'

const navigation = [
  { name: 'Overview', view: 'overview' as const, icon: LayoutDashboard },
  { name: 'Assets', view: 'assets' as const, icon: Building2 },
  { name: 'Financials', view: 'financials' as const, icon: DollarSign },
  { name: 'Ownership', view: 'ownership' as const, icon: Users },
  { name: 'Calculator', view: 'calculator' as const, icon: AlertTriangle },
]

interface DashboardSidebarProps {
  currentView?: 'overview' | 'assets' | 'financials' | 'ownership' | 'calculator'
  onNavigate?: (view: 'overview' | 'assets' | 'financials' | 'ownership' | 'calculator') => void
}

export default function DashboardSidebar({ currentView = 'overview', onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [families, setFamilies] = useState<Family[]>([])
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null)
  const [isFamilyDropdownOpen, setIsFamilyDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFamilies()
    const familyId = searchParams.get('family')
    if (familyId) {
      setSelectedFamilyId(familyId)
    }
  }, [searchParams])

  const fetchFamilies = async () => {
    try {
      const response = await fetch('/api/families')
      if (response.ok) {
        const { families: fetchedFamilies } = await response.json()
        setFamilies(fetchedFamilies)
        if (fetchedFamilies.length > 0 && !selectedFamilyId) {
          setSelectedFamilyId(fetchedFamilies[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching families:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedFamily = families.find((f) => f.id === selectedFamilyId)

  const handleFamilyChange = (familyId: string) => {
    setSelectedFamilyId(familyId)
    setIsFamilyDropdownOpen(false)
    // Update URL without reload
    const url = new URL(window.location.href)
    url.searchParams.set('family', familyId)
    window.history.pushState({}, '', url.toString())
    // Trigger a soft reload of the page
    window.dispatchEvent(new Event('familyChanged'))
  }

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 overflow-y-auto flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900">Abbey OS</h1>
        <p className="text-xs text-slate-500 mt-1">Asset Management</p>
      </div>

      {/* Family Selection */}
      <div className="p-4 border-b border-slate-200">
        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
          Estate/Family
        </label>
        {loading ? (
          <div className="text-sm text-slate-400">Loading...</div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setIsFamilyDropdownOpen(!isFamilyDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100"
            >
              <span className="truncate">
                {selectedFamily ? selectedFamily.name : 'Select Family'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isFamilyDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isFamilyDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {families.map((family) => (
                  <button
                    key={family.id}
                    onClick={() => handleFamilyChange(family.id)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${
                      selectedFamilyId === family.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{family.name}</span>
                      <span className="text-xs text-slate-400">{family.currency}</span>
                    </div>
                  </button>
                ))}
                <Link
                  href="/onboarding"
                  className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 border-t border-slate-200 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New Family
                </Link>
              </div>
            )}
          </div>
        )}
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
    </div>
  )
}


