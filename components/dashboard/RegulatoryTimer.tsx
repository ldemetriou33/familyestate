'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react'

interface RegulatoryDeadline {
  id: string
  label: string
  targetDate: Date
  description: string
}

const DEADLINES: RegulatoryDeadline[] = [
  {
    id: 'iht-bpr-cap',
    label: 'IHT BPR Cap (£2.5M)',
    targetDate: new Date('2026-04-06'),
    description: 'Business Property Relief threshold',
  },
  {
    id: 'renters-rights-ban',
    label: 'Renters Rights (Sec 21 Ban)',
    targetDate: new Date('2026-05-01'),
    description: 'Section 21 eviction ban deadline',
  },
]

function calculateDaysRemaining(targetDate: Date): number {
  const now = new Date()
  const diff = targetDate.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function getStatusColor(daysRemaining: number): string {
  if (daysRemaining < 0) return 'text-red-600 bg-red-50 border-red-200'
  if (daysRemaining <= 30) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  return 'text-green-600 bg-green-50 border-green-200'
}

function getStatusIcon(daysRemaining: number) {
  if (daysRemaining < 0) return AlertTriangle
  if (daysRemaining <= 30) return Clock
  return CheckCircle
}

export default function RegulatoryTimer() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000 * 60 * 60) // Update every hour

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-4 border-t border-slate-200 bg-slate-50">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Regulatory Timers
      </h3>
      <div className="space-y-3">
        {DEADLINES.map((deadline) => {
          const daysRemaining = calculateDaysRemaining(deadline.targetDate)
          const isOverdue = daysRemaining < 0
          const Icon = getStatusIcon(daysRemaining)
          const statusColor = getStatusColor(daysRemaining)

          return (
            <div
              key={deadline.id}
              className={`p-3 rounded-lg border text-xs ${statusColor}`}
            >
              <div className="flex items-start gap-2 mb-1">
                <Icon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{deadline.label}</div>
                  <div className="text-xs opacity-75 mt-0.5">{deadline.description}</div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                {isOverdue ? (
                  <div className="font-semibold">ACTIVE: {daysRemaining === -1 ? 'Deadline Passed' : `OVERDUE: ${Math.abs(daysRemaining)} days`}</div>
                ) : (
                  <div className="font-semibold">{daysRemaining} days remaining</div>
                )}
                <div className="text-xs opacity-75 mt-0.5">
                  Target: {deadline.targetDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

