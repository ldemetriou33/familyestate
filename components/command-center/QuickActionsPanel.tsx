'use client'

import { useState } from 'react'
import { 
  Zap, 
  Mail, 
  Wrench, 
  PoundSterling, 
  Megaphone, 
  Phone, 
  ClipboardCheck,
  ChevronRight,
  Clock,
  CheckCircle
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface QuickAction {
  id: string
  label: string
  icon: keyof typeof iconMap
  category: string
  estimatedTime: string
  description: string
}

const iconMap = {
  Mail,
  Wrench,
  PoundSterling,
  Megaphone,
  Phone,
  ClipboardCheck,
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'qa-arrears-letter',
    label: 'Send Arrears Letter',
    icon: 'Mail',
    category: 'Finance',
    estimatedTime: '5 min',
    description: 'Generate and send formal arrears notice to tenant',
  },
  {
    id: 'qa-book-contractor',
    label: 'Book Contractor',
    icon: 'Wrench',
    category: 'Maintenance',
    estimatedTime: '10 min',
    description: 'Schedule maintenance contractor for repairs',
  },
  {
    id: 'qa-update-rates',
    label: 'Update Hotel Rates',
    icon: 'PoundSterling',
    category: 'Revenue',
    estimatedTime: '15 min',
    description: 'Adjust room rates based on demand forecast',
  },
  {
    id: 'qa-run-promotion',
    label: 'Launch Promotion',
    icon: 'Megaphone',
    category: 'Marketing',
    estimatedTime: '20 min',
    description: 'Create and publish promotional campaign',
  },
  {
    id: 'qa-tenant-contact',
    label: 'Contact Tenant',
    icon: 'Phone',
    category: 'Lettings',
    estimatedTime: '10 min',
    description: 'Reach out to tenant regarding property matters',
  },
  {
    id: 'qa-compliance-check',
    label: 'Book Safety Inspection',
    icon: 'ClipboardCheck',
    category: 'Compliance',
    estimatedTime: '15 min',
    description: 'Schedule gas safety or electrical inspection',
  },
]

export function QuickActionsPanel() {
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set())
  const [activeAction, setActiveAction] = useState<string | null>(null)

  const handleAction = (actionId: string) => {
    setActiveAction(actionId)
    
    // Simulate action completion
    setTimeout(() => {
      setCompletedActions(prev => new Set([...prev, actionId]))
      setActiveAction(null)
    }, 1500)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="w-5 h-5 text-bloomberg-warning" />
          Quick Actions
        </CardTitle>
        <p className="text-xs text-bloomberg-textMuted">One-click common tasks</p>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {QUICK_ACTIONS.map((action) => {
          const Icon = iconMap[action.icon]
          const isCompleted = completedActions.has(action.id)
          const isActive = activeAction === action.id

          return (
            <button
              key={action.id}
              onClick={() => !isCompleted && !isActive && handleAction(action.id)}
              disabled={isCompleted || isActive}
              className={`
                relative p-4 rounded-lg border text-left transition-all
                ${isCompleted 
                  ? 'bg-bloomberg-success/10 border-bloomberg-success/30 cursor-default'
                  : isActive
                  ? 'bg-bloomberg-accent/10 border-bloomberg-accent/30 cursor-wait'
                  : 'bg-bloomberg-darker border-bloomberg-border hover:border-bloomberg-accent hover:bg-bloomberg-panel cursor-pointer group'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg transition-colors ${
                  isCompleted 
                    ? 'bg-bloomberg-success/20'
                    : isActive
                    ? 'bg-bloomberg-accent/20'
                    : 'bg-bloomberg-panel group-hover:bg-bloomberg-accent/20'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-bloomberg-success" />
                  ) : isActive ? (
                    <div className="w-5 h-5 border-2 border-bloomberg-accent border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5 text-bloomberg-textMuted group-hover:text-bloomberg-accent transition-colors" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${
                    isCompleted ? 'text-bloomberg-success' : 'text-bloomberg-text'
                  }`}>
                    {action.label}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-bloomberg-textMuted">{action.category}</span>
                    <span className="text-xs text-bloomberg-textMuted">•</span>
                    <span className="text-xs text-bloomberg-textMuted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {action.estimatedTime}
                    </span>
                  </div>
                </div>
              </div>
              
              {!isCompleted && !isActive && (
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bloomberg-textMuted opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}

