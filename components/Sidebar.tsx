'use client'

import { 
  LayoutDashboard, 
  Hotel, 
  UtensilsCrossed,
  Building2,
  Wallet,
  AlertTriangle,
  ChevronRight,
  User,
  X,
  Settings,
  Link2,
  Brain,
  Settings2,
  LogOut
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

export type Section = 'home' | 'hotel' | 'f&b' | 'portfolio' | 'finance' | 'legal-brain'

interface SidebarProps {
  activeSection: Section
  setActiveSection: (section: Section) => void
  criticalAlerts?: number
  onClose?: () => void
  onOpenSettings?: (tab?: string) => void
}

const menuItems = [
  { id: 'home' as Section, label: 'Command Center', icon: LayoutDashboard, description: 'Overview & Actions' },
  { id: 'hotel' as Section, label: 'Hotel', icon: Hotel, description: 'Occupancy & Bookings' },
  { id: 'f&b' as Section, label: 'F&B', icon: UtensilsCrossed, description: 'Cafe Operations' },
  { id: 'portfolio' as Section, label: 'Portfolio', icon: Building2, description: 'Residential Lettings' },
  { id: 'finance' as Section, label: 'Finance', icon: Wallet, description: 'Cashflow & Debt' },
  { id: 'legal-brain' as Section, label: 'Legal Brain', icon: Brain, description: 'AI Document Analysis', badge: 'AI' },
]

export default function Sidebar({ activeSection, setActiveSection, criticalAlerts = 0, onClose, onOpenSettings }: SidebarProps) {
  const [user, setUser] = useState<{ email?: string; name?: string; avatar?: string } | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          setUser({
            email: authUser.email,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0],
            avatar: authUser.user_metadata?.avatar_url,
          })
        }
      } catch (error) {
        console.error('Failed to load user:', error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadUser()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <aside className="w-72 h-full border-r border-[var(--border-primary)] bg-[var(--bg-secondary)] flex flex-col">
      {/* Logo & Close button */}
      <div className="p-5 border-b border-[var(--border-primary)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent)] to-blue-600 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">Abbey OS</h1>
              <p className="text-xs text-[var(--text-muted)]">Family Estate Autopilot</p>
            </div>
          </div>
          {/* Close button - only on mobile */}
          {onClose && (
            <button 
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text-muted)]" />
            </button>
          )}
        </div>
      </div>

      {/* Critical Alerts Badge */}
      {criticalAlerts > 0 && (
        <div className="mx-4 mt-4 p-3 bg-[var(--danger-bg)] border border-[var(--danger)]/30 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[var(--danger)]" />
            <span className="text-sm font-medium text-[var(--danger)]">
              {criticalAlerts} Critical Alert{criticalAlerts !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-lg
                transition-all duration-200 group
                ${
                  isActive
                    ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.label}</span>
                    {'badge' in item && item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs ${isActive ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
                    {item.description}
                  </span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`} />
            </button>
          )
        })}
      </nav>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-[var(--border-primary)]">
        <Link
          href="/admin"
          className="flex items-center justify-center gap-2 px-3 py-2 mb-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
        >
          <Settings2 className="w-4 h-4" />
          Full Admin Dashboard
        </Link>
        <div className="flex gap-2">
          <button 
            onClick={() => onOpenSettings?.('integrations')}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
          >
            <Link2 className="w-4 h-4" />
            Integrations
          </button>
          <button 
            onClick={() => onOpenSettings?.('appearance')}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-[var(--border-primary)]">
        {isLoaded && user ? (
          <div className="flex items-center gap-3 px-2">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name || 'User'} 
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                <User className="w-5 h-5 text-[var(--accent)]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {user.email || 'Estate Manager'}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
              <User className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">Loading...</p>
              <p className="text-xs text-[var(--text-muted)]">Estate Manager</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="px-4 pb-4">
        <p className="text-xs text-[var(--text-muted)] text-center">
          v2.0 • Family Estate Autopilot
        </p>
      </div>
    </aside>
  )
}
