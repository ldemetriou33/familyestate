'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Home, 
  User, 
  Calendar, 
  Wrench,
  ClipboardList,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  FileText,
  PoundSterling
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatGBP, formatUKDate } from '@/lib/utils'
import { units, leases, properties } from '@/lib/mock-data/seed'

// Mock maintenance history
const maintenanceHistory = [
  { id: '1', date: new Date('2024-01-10'), type: 'Repair', description: 'Boiler service', cost: 150, status: 'COMPLETED' },
  { id: '2', date: new Date('2024-03-15'), type: 'Routine', description: 'Annual gas safety check', cost: 85, status: 'COMPLETED' },
  { id: '3', date: new Date('2024-06-20'), type: 'Emergency', description: 'Leak repair', cost: 320, status: 'COMPLETED' },
]

// Mock payment history
const paymentHistory = [
  { id: '1', date: new Date('2024-11-01'), amount: 1200, status: 'PAID', method: 'Standing Order' },
  { id: '2', date: new Date('2024-10-01'), amount: 1200, status: 'PAID', method: 'Standing Order' },
  { id: '3', date: new Date('2024-09-01'), amount: 1200, status: 'LATE', method: 'Bank Transfer' },
  { id: '4', date: new Date('2024-08-01'), amount: 1200, status: 'PAID', method: 'Standing Order' },
]

export default function UnitDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  const [activeTab, setActiveTab] = useState<'overview' | 'maintenance' | 'payments' | 'documents'>('overview')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const unit = units.find(u => u.id === id)
  const property = properties.find(p => p.id === unit?.propertyId)
  const lease = leases.find(l => l.unitId === id)

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!unit) {
    return (
      <div className="p-6 text-center">
        <p className="text-[var(--text-muted)]">Unit not found</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-[var(--accent)] text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    )
  }

  const statusColors = {
    OCCUPIED: 'bg-green-500',
    VACANT: 'bg-blue-500',
    MAINTENANCE: 'bg-amber-500',
  }

  const isCompliant = lease?.rightToRentCheck && 
    (!lease.gasCertExpiry || new Date(lease.gasCertExpiry) > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
              <Home className="w-6 h-6 text-[var(--accent)]" />
              {unit.unitNumber}
              <span className={`px-3 py-1 text-xs font-medium text-white rounded-full ${statusColors[unit.status]}`}>
                {unit.status}
              </span>
            </h1>
            <p className="text-sm text-[var(--text-muted)]">{property?.name} • {unit.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors text-sm">
            Edit Unit
          </button>
          {lease && (
            <button className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors text-sm">
              Message Tenant
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-primary)]">
        {(['overview', 'maintenance', 'payments', 'documents'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tenant Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-5 h-5 text-[var(--accent)]" />
                {lease ? 'Current Tenant' : 'No Tenant'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lease ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg gap-4">
                    <div>
                      <p className="text-lg font-semibold text-[var(--text-primary)]">{lease.tenantName}</p>
                      <p className="text-sm text-[var(--text-muted)]">{lease.tenantEmail}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 bg-[var(--accent)]/10 rounded-lg hover:bg-[var(--accent)]/20">
                        <Phone className="w-4 h-4 text-[var(--accent)]" />
                      </button>
                      <button className="p-2 bg-[var(--accent)]/10 rounded-lg hover:bg-[var(--accent)]/20">
                        <Mail className="w-4 h-4 text-[var(--accent)]" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                      <p className="text-xs text-[var(--text-muted)]">Lease Start</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {formatUKDate(new Date(lease.startDate))}
                      </p>
                    </div>
                    <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                      <p className="text-xs text-[var(--text-muted)]">Lease End</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {formatUKDate(new Date(lease.endDate))}
                      </p>
                    </div>
                    <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                      <p className="text-xs text-[var(--text-muted)]">Monthly Rent</p>
                      <p className="text-sm font-bold text-[var(--success)]">
                        {formatGBP(lease.rentAmount)}
                      </p>
                    </div>
                    <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                      <p className="text-xs text-[var(--text-muted)]">Arrears</p>
                      <p className={`text-sm font-bold ${lease.arrearsAmount > 0 ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}>
                        {formatGBP(lease.arrearsAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                    <p className="text-xs text-[var(--text-muted)] mb-1">Payment Status</p>
                    <span className={`px-2 py-1 text-sm rounded ${
                      lease.paymentStatus === 'PAID' ? 'bg-green-500/20 text-green-500' :
                      lease.paymentStatus === 'PARTIAL' ? 'bg-amber-500/20 text-amber-500' :
                      lease.paymentStatus === 'OVERDUE' ? 'bg-red-500/20 text-red-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {lease.paymentStatus}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Home className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <p className="text-lg font-medium text-[var(--text-primary)]">Unit is Vacant</p>
                  <p className="text-sm text-[var(--text-muted)]">Ready for new tenant</p>
                  <button className="mt-4 px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm">
                    List on Market
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Unit Details & Compliance */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Home className="w-5 h-5 text-[var(--accent)]" />
                  Unit Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Type</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{unit.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Bedrooms</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{unit.bedrooms || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Size</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{unit.squareMeters || 'N/A'} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Current Rate</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{formatGBP(unit.currentRate)}/month</span>
                </div>
                {unit.floor && (
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-muted)]">Floor</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{unit.floor}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-5 h-5 text-[var(--accent)]" />
                  Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lease ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-muted)]">Right to Rent</span>
                      {lease.rightToRentCheck ? (
                        <span className="flex items-center gap-1 text-green-500 text-sm">
                          <CheckCircle className="w-4 h-4" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertTriangle className="w-4 h-4" /> Missing
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-muted)]">Gas Safety</span>
                      {lease.gasCertExpiry && new Date(lease.gasCertExpiry) > new Date() ? (
                        <span className="flex items-center gap-1 text-green-500 text-sm">
                          <CheckCircle className="w-4 h-4" /> Valid
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-500 text-sm">
                          <AlertTriangle className="w-4 h-4" /> Expiring
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-muted)]">EPC Rating</span>
                      <span className={`px-2 py-0.5 text-sm rounded ${
                        ['A', 'B', 'C'].includes(lease.epcRating || '') 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-amber-500/20 text-amber-500'
                      }`}>
                        {lease.epcRating || 'N/A'}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">No active lease</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wrench className="w-5 h-5 text-[var(--accent)]" />
              Maintenance History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {maintenanceHistory.map(item => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg gap-3">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      item.type === 'Emergency' ? 'bg-red-500/10' :
                      item.type === 'Repair' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                    }`}>
                      <Wrench className={`w-4 h-4 ${
                        item.type === 'Emergency' ? 'text-red-500' :
                        item.type === 'Repair' ? 'text-amber-500' : 'text-blue-500'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{item.description}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {formatUKDate(item.date)} • {item.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-medium text-[var(--text-primary)]">{formatGBP(item.cost)}</p>
                    <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-500 rounded">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border-primary)] flex justify-between">
              <span className="text-sm text-[var(--text-muted)]">Total Maintenance Cost (YTD)</span>
              <span className="font-bold text-[var(--text-primary)]">
                {formatGBP(maintenanceHistory.reduce((sum, m) => sum + m.cost, 0))}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'payments' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PoundSterling className="w-5 h-5 text-[var(--accent)]" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lease ? (
              <div className="space-y-3">
                {paymentHistory.map(payment => (
                  <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg gap-2">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{formatUKDate(payment.date)}</p>
                      <p className="text-xs text-[var(--text-muted)]">{payment.method}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-medium text-[var(--text-primary)]">{formatGBP(payment.amount)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        payment.status === 'PAID' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[var(--text-muted)] py-4">No payment history</p>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'documents' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="w-5 h-5 text-[var(--accent)]" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Tenancy Agreement', 'Gas Safety Certificate', 'EPC Certificate', 'Inventory'].map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[var(--accent)]" />
                    <span className="text-sm text-[var(--text-primary)]">{doc}</span>
                  </div>
                  <button className="px-3 py-1 text-xs text-[var(--accent)] hover:underline">
                    View
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

