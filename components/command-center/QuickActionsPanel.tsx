'use client'

import { useState } from 'react'
import { 
  Zap, 
  MessageSquare, 
  Mail, 
  Phone, 
  FileText, 
  Send, 
  X,
  Check,
  User,
  Building2,
  AlertTriangle,
  Clock,
  ArrowRight
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatGBP } from '@/lib/utils'

interface Tenant {
  id: string
  name: string
  unit: string
  arrears: number
  daysBehind: number
  phone: string
  email: string
}

interface ActionContext {
  type: 'arrears' | 'maintenance' | 'compliance' | 'rate_review'
  title: string
  description: string
  data: Tenant[] | any[]
}

// Mock arrears data
const arrearsData: Tenant[] = [
  { id: '1', name: 'Sarah Connor', unit: 'Flat 4B', arrears: 1350, daysBehind: 45, phone: '+44 7700 900123', email: 'sarah@email.com' },
  { id: '2', name: 'James Wilson', unit: 'Flat 2A', arrears: 950, daysBehind: 15, phone: '+44 7700 900456', email: 'james@email.com' },
  { id: '3', name: 'Emma Davis', unit: 'Flat 6C', arrears: 450, daysBehind: 7, phone: '+44 7700 900789', email: 'emma@email.com' },
]

// Audit trail
interface AuditEntry {
  id: string
  action: string
  target: string
  timestamp: Date
  status: 'pending' | 'completed' | 'failed'
}

const quickActions = [
  { 
    id: 'chase_arrears', 
    label: 'Chase Arrears', 
    icon: MessageSquare, 
    color: 'text-red-500',
    bgColor: 'bg-red-500/10 hover:bg-red-500/20',
    actionType: 'arrears' as const
  },
  { 
    id: 'maintenance_followup', 
    label: 'Maintenance Follow-up', 
    icon: AlertTriangle, 
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 hover:bg-amber-500/20',
    actionType: 'maintenance' as const
  },
  { 
    id: 'compliance_check', 
    label: 'Compliance Check', 
    icon: FileText, 
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
    actionType: 'compliance' as const
  },
  { 
    id: 'rate_review', 
    label: 'Rate Review', 
    icon: Building2, 
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
    actionType: 'rate_review' as const
  },
]

export function QuickActionsPanel() {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeAction, setActiveAction] = useState<typeof quickActions[0] | null>(null)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [messageType, setMessageType] = useState<'whatsapp' | 'email' | 'sms'>('whatsapp')
  const [customMessage, setCustomMessage] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([])
  const [showSuccess, setShowSuccess] = useState(false)

  const handleActionClick = (action: typeof quickActions[0]) => {
    setActiveAction(action)
    setModalOpen(true)
    setSelectedTenant(null)
    setCustomMessage('')
    setShowSuccess(false)
  }

  const generateMessage = (tenant: Tenant) => {
    const templates = {
      whatsapp: `Hi ${tenant.name.split(' ')[0]}, this is a reminder about your outstanding rent for ${tenant.unit}. The current balance is ${formatGBP(tenant.arrears)}. Please contact us to discuss payment options. Thank you.`,
      email: `Dear ${tenant.name},\n\nWe are writing regarding the outstanding rent for ${tenant.unit}.\n\nCurrent Balance: ${formatGBP(tenant.arrears)}\nDays Overdue: ${tenant.daysBehind}\n\nPlease contact us at your earliest convenience to arrange payment.\n\nBest regards,\nAbbey Estate Management`,
      sms: `Rent reminder: ${formatGBP(tenant.arrears)} outstanding for ${tenant.unit}. Please contact us to discuss. Abbey Estate`
    }
    return templates[messageType]
  }

  const handleExecute = async () => {
    if (!selectedTenant || !activeAction) return
    
    setIsExecuting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Add to audit trail
    const entry: AuditEntry = {
      id: Date.now().toString(),
      action: `${messageType.toUpperCase()} sent`,
      target: `${selectedTenant.name} (${selectedTenant.unit})`,
      timestamp: new Date(),
      status: 'completed'
    }
    
    setAuditTrail(prev => [entry, ...prev])
    setIsExecuting(false)
    setShowSuccess(true)
    
    // Store in localStorage for persistence
    const existingAudit = JSON.parse(localStorage.getItem('abbey-audit-trail') || '[]')
    localStorage.setItem('abbey-audit-trail', JSON.stringify([entry, ...existingAudit].slice(0, 50)))
  }

  const closeModal = () => {
    setModalOpen(false)
    setActiveAction(null)
    setSelectedTenant(null)
    setShowSuccess(false)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-5 h-5 text-[var(--accent)]" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map(action => {
              const Icon = action.icon
              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className={`p-4 rounded-xl border border-[var(--border-primary)] ${action.bgColor} transition-all hover:scale-[1.02] flex flex-col items-center gap-2`}
                >
                  <Icon className={`w-6 h-6 ${action.color}`} />
                  <span className="text-sm font-medium text-[var(--text-primary)]">{action.label}</span>
                  <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
              )
            })}
          </div>
          
          {/* Recent Audit Trail */}
          {auditTrail.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border-primary)]">
              <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Recent Actions</p>
              <div className="space-y-2">
                {auditTrail.slice(0, 3).map(entry => (
                  <div key={entry.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-500" />
                      <span className="text-[var(--text-primary)]">{entry.action}</span>
                      <span className="text-[var(--text-muted)]">→ {entry.target}</span>
                    </div>
                    <span className="text-[var(--text-muted)]">
                      {entry.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Command Modal */}
      {modalOpen && activeAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${activeAction.bgColor}`}>
                  <activeAction.icon className={`w-5 h-5 ${activeAction.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">{activeAction.label}</h3>
                  <p className="text-xs text-[var(--text-muted)]">Select a recipient and compose your message</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg">
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {showSuccess ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <h4 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Action Completed</h4>
                  <p className="text-[var(--text-muted)]">
                    {messageType.charAt(0).toUpperCase() + messageType.slice(1)} sent to {selectedTenant?.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-4">
                    Logged to Audit Trail at {new Date().toLocaleTimeString('en-GB')}
                  </p>
                </div>
              ) : (
                <>
                  {/* Tenant Selection */}
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)] mb-3">
                      {activeAction.actionType === 'arrears' && `${arrearsData.length} tenants currently in arrears:`}
                      {activeAction.actionType === 'maintenance' && 'Select maintenance item:'}
                      {activeAction.actionType === 'compliance' && 'Upcoming compliance checks:'}
                      {activeAction.actionType === 'rate_review' && 'Properties for rate review:'}
                    </p>
                    
                    <div className="space-y-2">
                      {arrearsData.map(tenant => (
                        <button
                          key={tenant.id}
                          onClick={() => {
                            setSelectedTenant(tenant)
                            setCustomMessage(generateMessage(tenant))
                          }}
                          className={`w-full p-4 rounded-lg border text-left transition-all ${
                            selectedTenant?.id === tenant.id
                              ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                              : 'border-[var(--border-primary)] hover:border-[var(--accent)]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-[var(--text-muted)]" />
                              </div>
                              <div>
                                <p className="font-medium text-[var(--text-primary)]">{tenant.name}</p>
                                <p className="text-xs text-[var(--text-muted)]">{tenant.unit}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-red-500">{formatGBP(tenant.arrears)}</p>
                              <p className="text-xs text-[var(--text-muted)]">{tenant.daysBehind} days overdue</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Composition */}
                  {selectedTenant && (
                    <div className="space-y-4 pt-4 border-t border-[var(--border-primary)]">
                      {/* Channel Selection */}
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Send via:</p>
                        <div className="flex gap-2">
                          {[
                            { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'text-green-500' },
                            { id: 'email', label: 'Email', icon: Mail, color: 'text-blue-500' },
                            { id: 'sms', label: 'SMS', icon: Phone, color: 'text-purple-500' },
                          ].map(channel => (
                            <button
                              key={channel.id}
                              onClick={() => {
                                setMessageType(channel.id as 'whatsapp' | 'email' | 'sms')
                                setCustomMessage(generateMessage(selectedTenant))
                              }}
                              className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                                messageType === channel.id
                                  ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                                  : 'border-[var(--border-primary)] hover:border-[var(--accent)]/50'
                              }`}
                            >
                              <channel.icon className={`w-4 h-4 ${channel.color}`} />
                              <span className="text-sm text-[var(--text-primary)]">{channel.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Message Preview */}
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Message:</p>
                        <textarea
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          rows={5}
                          className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            {!showSuccess && (
              <div className="p-4 border-t border-[var(--border-primary)] flex justify-between">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecute}
                  disabled={!selectedTenant || isExecuting}
                  className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isExecuting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Execute Action
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
