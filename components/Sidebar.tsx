'use client'

import { 
  Briefcase, 
  CreditCard, 
  Hotel, 
  UtensilsCrossed,
  Building2
} from 'lucide-react'

type Section = 'portfolio' | 'uk-debt' | 'hospitality' | 'f&b'

interface SidebarProps {
  activeSection: Section
  setActiveSection: (section: Section) => void
}

const menuItems = [
  { id: 'portfolio' as Section, label: 'Portfolio', icon: Briefcase },
  { id: 'uk-debt' as Section, label: 'UK Debt', icon: CreditCard },
  { id: 'hospitality' as Section, label: 'Hospitality', icon: Hotel },
  { id: 'f&b' as Section, label: 'F&B', icon: UtensilsCrossed },
]

export default function Sidebar({ activeSection, setActiveSection }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-bloomberg-border bg-bloomberg-darker flex flex-col">
      <div className="p-6 border-b border-bloomberg-border">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-bloomberg-accent" />
          <div>
            <h1 className="text-xl font-bold text-bloomberg-text">Abbey OS</h1>
            <p className="text-xs text-bloomberg-textMuted">v2.0</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-bloomberg-accent text-white shadow-lg'
                    : 'text-bloomberg-textMuted hover:bg-bloomberg-panel hover:text-bloomberg-text'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-bloomberg-border">
        <p className="text-xs text-bloomberg-textMuted text-center">
          © 2024 Abbey OS
        </p>
      </div>
    </aside>
  )
}

