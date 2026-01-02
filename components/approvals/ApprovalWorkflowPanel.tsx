'use client'

import { useState } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  User,
  PoundSterling,
  TrendingUp,
  FileText,
  Send,
  MoreHorizontal
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatGBP } from '@/lib/utils'

// Types
interface ApprovalItem {
  id: string
  type: 'EXPENSE' | 'RATE_CHANGE' | 'REFUND' | 'WRITE_OFF'
  title: string
  description: string
  amount: number
  requestedBy: string
  requestedAt: Date
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  propertyName?: string
}

interface RateProposal {
  id: string
  propertyName: string
  currentRate: number
  proposedRate: number
  changePercent: number
  reasoning: string
  aiGenerated: boolean
  effectiveFrom: Date
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'APPLIED'
  createdBy: string
  createdAt: Date
}

// Mock data
const mockApprovals: ApprovalItem[] = [
  {
    id: '1',
    type: 'EXPENSE',
    title: 'Emergency Boiler Repair',
    description: 'Boiler replacement at Flat 4B - tenant reported no hot water',
    amount: 2500,
    requestedBy: 'John Manager',
    requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'PENDING',
    priority: 'HIGH',
    propertyName: 'Victoria Apartments',
  },
  {
    id: '2',
    type: 'EXPENSE',
    title: 'Monthly Cleaning Service',
    description: 'Recurring cleaning for hotel common areas',
    amount: 450,
    requestedBy: 'Sarah Admin',
    requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'PENDING',
    priority: 'LOW',
    propertyName: 'The Grand Hotel',
  },
  {
    id: '3',
    type: 'REFUND',
    title: 'Guest Refund - Room Issue',
    description: 'Partial refund for AC malfunction during stay',
    amount: 85,
    requestedBy: 'Reception Team',
    requestedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    status: 'PENDING',
    priority: 'MEDIUM',
    propertyName: 'The Grand Hotel',
  },
]

const mockRateProposals: RateProposal[] = [
  {
    id: '1',
    propertyName: 'The Grand Hotel',
    currentRate: 95,
    proposedRate: 115,
    changePercent: 21.05,
    reasoning: 'Local event (Music Festival) next weekend. Historical data shows 40% increase in demand during similar events.',
    aiGenerated: true,
    effectiveFrom: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'PENDING_APPROVAL',
    createdBy: 'AI Engine',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: '2',
    propertyName: 'The Grand Hotel',
    currentRate: 95,
    proposedRate: 75,
    changePercent: -21.05,
    reasoning: 'Occupancy forecast at 42% for next week. Recommend 20% discount to drive bookings.',
    aiGenerated: true,
    effectiveFrom: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: 'PENDING_APPROVAL',
    createdBy: 'AI Engine',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
]

const typeConfig = {
  EXPENSE: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  RATE_CHANGE: { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
  REFUND: { icon: PoundSterling, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  WRITE_OFF: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
}

const priorityConfig = {
  HIGH: { color: 'text-red-500', bg: 'bg-red-500/10' },
  MEDIUM: { color: 'text-amber-500', bg: 'bg-amber-500/10' },
  LOW: { color: 'text-green-500', bg: 'bg-green-500/10' },
}

export function ApprovalWorkflowPanel() {
  const [activeTab, setActiveTab] = useState<'expenses' | 'rates'>('expenses')
  const [approvals, setApprovals] = useState(mockApprovals)
  const [rateProposals, setRateProposals] = useState(mockRateProposals)

  const handleApprove = (id: string) => {
    setApprovals(prev => 
      prev.map(a => a.id === id ? { ...a, status: 'APPROVED' as const } : a)
    )
  }

  const handleReject = (id: string) => {
    setApprovals(prev => 
      prev.map(a => a.id === id ? { ...a, status: 'REJECTED' as const } : a)
    )
  }

  const handleApproveRate = (id: string) => {
    setRateProposals(prev => 
      prev.map(r => r.id === id ? { ...r, status: 'APPROVED' as const } : r)
    )
  }

  const handleRejectRate = (id: string) => {
    setRateProposals(prev => 
      prev.map(r => r.id === id ? { ...r, status: 'REJECTED' as const } : r)
    )
  }

  const pendingApprovals = approvals.filter(a => a.status === 'PENDING')
  const pendingRates = rateProposals.filter(r => r.status === 'PENDING_APPROVAL')

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-5 h-5 text-bloomberg-accent" />
            Pending Approvals
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-semibold bg-amber-500/20 text-amber-500 rounded-full">
              {pendingApprovals.length + pendingRates.length} Pending
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'expenses'
                ? 'bg-bloomberg-accent text-white'
                : 'bg-bloomberg-darker text-bloomberg-textMuted hover:text-bloomberg-text'
            }`}
          >
            Expenses & Refunds ({pendingApprovals.length})
          </button>
          <button
            onClick={() => setActiveTab('rates')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'rates'
                ? 'bg-bloomberg-accent text-white'
                : 'bg-bloomberg-darker text-bloomberg-textMuted hover:text-bloomberg-text'
            }`}
          >
            Rate Changes ({pendingRates.length})
          </button>
        </div>

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-3">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-8 text-bloomberg-textMuted">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No pending approvals</p>
              </div>
            ) : (
              pendingApprovals.map((item) => {
                const config = typeConfig[item.type]
                const priorityCfg = priorityConfig[item.priority]
                const Icon = config.icon

                return (
                  <div
                    key={item.id}
                    className="p-4 bg-bloomberg-darker rounded-lg border border-bloomberg-border hover:border-bloomberg-accent/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${config.bg}`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-bloomberg-text">{item.title}</p>
                            <p className="text-xs text-bloomberg-textMuted mt-0.5">{item.propertyName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-bloomberg-text">{formatGBP(item.amount)}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${priorityCfg.bg} ${priorityCfg.color}`}>
                              {item.priority}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-bloomberg-textMuted mt-2 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 text-xs text-bloomberg-textMuted">
                            <User className="w-3 h-3" />
                            <span>{item.requestedBy}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(item.requestedAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleReject(item.id)}
                              className="px-3 py-1.5 text-sm font-medium text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                            <button
                              onClick={() => handleApprove(item.id)}
                              className="px-3 py-1.5 text-sm font-medium text-white bg-bloomberg-success rounded-lg hover:bg-bloomberg-success/80 transition-colors flex items-center gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Rates Tab */}
        {activeTab === 'rates' && (
          <div className="space-y-3">
            {pendingRates.length === 0 ? (
              <div className="text-center py-8 text-bloomberg-textMuted">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No pending rate changes</p>
              </div>
            ) : (
              pendingRates.map((proposal) => {
                const isIncrease = proposal.changePercent > 0

                return (
                  <div
                    key={proposal.id}
                    className="p-4 bg-bloomberg-darker rounded-lg border border-bloomberg-border hover:border-bloomberg-accent/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${isIncrease ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        <TrendingUp className={`w-5 h-5 ${isIncrease ? 'text-green-500' : 'text-red-500 rotate-180'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-bloomberg-text">{proposal.propertyName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-lg text-bloomberg-textMuted">{formatGBP(proposal.currentRate)}</span>
                              <ChevronRight className="w-4 h-4 text-bloomberg-textMuted" />
                              <span className={`text-lg font-bold ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                                {formatGBP(proposal.proposedRate)}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                isIncrease ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                              }`}>
                                {isIncrease ? '+' : ''}{proposal.changePercent.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          {proposal.aiGenerated && (
                            <span className="text-xs px-2 py-1 bg-bloomberg-accent/10 text-bloomberg-accent rounded-full">
                              AI Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-bloomberg-textMuted mt-2">
                          {proposal.reasoning}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="text-xs text-bloomberg-textMuted">
                            <span>Effective: {proposal.effectiveFrom.toLocaleDateString('en-GB')}</span>
                            <span className="mx-2">•</span>
                            <span>By {proposal.createdBy}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRejectRate(proposal.id)}
                              className="px-3 py-1.5 text-sm font-medium text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                            <button
                              onClick={() => handleApproveRate(proposal.id)}
                              className="px-3 py-1.5 text-sm font-medium text-white bg-bloomberg-success rounded-lg hover:bg-bloomberg-success/80 transition-colors flex items-center gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Apply Rate
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Recent Activity */}
        <div className="mt-6 pt-4 border-t border-bloomberg-border">
          <p className="text-xs font-semibold text-bloomberg-textMuted mb-3">Recent Activity</p>
          <div className="space-y-2">
            {approvals.filter(a => a.status !== 'PENDING').slice(0, 3).map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {item.status === 'APPROVED' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-bloomberg-textMuted">{item.title}</span>
                </div>
                <span className={item.status === 'APPROVED' ? 'text-green-500' : 'text-red-500'}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMins > 0) return `${diffMins}m ago`
  return 'Just now'
}

export default ApprovalWorkflowPanel

