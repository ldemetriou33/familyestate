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
  Link2
} from 'lucide-react'
import { UserButton, useUser } from '@clerk/nextjs'

export type Section = 'home' | 'hotel' | 'f&b' | 'portfolio' | 'finance'

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
]

export default function Sidebar({ activeSection, setActiveSection, criticalAlerts = 0, onClose, onOpenSettings }: SidebarProps) {
  const { user, isLoaded } = useUser()

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
                  <span className="font-medium block">{item.label}</span>
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

      {/* User Section with Clerk */}
      <div className="p-4 border-t border-[var(--border-primary)]">
        {isLoaded && user ? (
          <div className="flex items-center gap-3 px-2">
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10',
                  userButtonPopoverCard: 'bg-[var(--bg-secondary)] border border-[var(--border-primary)]',
                  userButtonPopoverActionButton: 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]',
                  userButtonPopoverActionButtonText: 'text-[var(--text-primary)]',
                  userButtonPopoverActionButtonIcon: 'text-[var(--text-muted)]',
                  userButtonPopoverFooter: 'hidden',
                },
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {user.emailAddresses[0]?.emailAddress || 'Estate Manager'}
              </p>
            </div>
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
