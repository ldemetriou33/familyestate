'use client'

import { useState } from 'react'
import { Building2, Users, AlertTriangle, FileCheck, TrendingUp, TrendingDown, Home } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { formatGBP, formatUKDate, formatPercentage } from '@/lib/utils'
import { units, leases, properties, portfolioMetrics, alerts } from '@/lib/mock-data/seed'

export default function PortfolioSection() {
  const residentialProperty = properties.find(p => p.type === 'RESIDENTIAL')
  const residentialUnits = units.filter(u => u.propertyId === residentialProperty?.id)
  
  // Get leases with unit info
  const leasesWithUnits = leases.map(lease => {
    const unit = units.find(u => u.id === lease.unitId)
    return { ...lease, unit }
  })

  // Compliance checks
  const complianceIssues = leasesWithUnits.filter(l => {
    const now = new Date()
    const gasCertExpiring = l.gasCertExpiry && new Date(l.gasCertExpiry) < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    return gasCertExpiring || !l.rightToRentCheck
  })

  const totalRentRoll = residentialUnits.reduce((sum, u) => sum + u.currentRate, 0)
  const totalArrears = leasesWithUnits.reduce((sum, l) => sum + l.arrearsAmount, 0)
  const occupancyRate = (portfolioMetrics.occupiedUnits / portfolioMetrics.totalUnits) * 100

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Home className="w-5 h-5 text-bloomberg-accent" />
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                occupancyRate >= 90 ? 'bg-bloomberg-success/10 text-bloomberg-success' : 'bg-bloomberg-warning/10 text-bloomberg-warning'
              }`}>
                {formatPercentage(occupancyRate)}
              </span>
            </div>
            <p className="text-sm text-bloomberg-textMuted mb-1">Portfolio Units</p>
            <p className="text-2xl font-bold text-bloomberg-text">{portfolioMetrics.totalUnits}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs text-bloomberg-success">{portfolioMetrics.occupiedUnits} Let</span>
              <span className="text-xs text-bloomberg-textMuted">•</span>
              <span className="text-xs text-bloomberg-warning">{portfolioMetrics.vacantUnits} Vacant</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-5 h-5 text-bloomberg-success" />
            </div>
            <p className="text-sm text-bloomberg-textMuted mb-1">Monthly Rent Roll</p>
            <p className="text-2xl font-bold text-bloomberg-text">{formatGBP(totalRentRoll)}</p>
            <p className="text-xs text-bloomberg-success mt-1">
              Annual: {formatGBP(totalRentRoll * 12)}
            </p>
          </CardContent>
        </Card>

        <Card className={totalArrears > 0 ? 'border-bloomberg-danger/50' : ''}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <TrendingDown className="w-5 h-5 text-bloomberg-danger" />
              {totalArrears > 0 && (
                <AlertTriangle className="w-4 h-4 text-bloomberg-danger" />
              )}
            </div>
            <p className="text-sm text-bloomberg-textMuted mb-1">Total Arrears</p>
            <p className={`text-2xl font-bold ${totalArrears > 0 ? 'text-bloomberg-danger' : 'text-bloomberg-success'}`}>
              {formatGBP(totalArrears)}
            </p>
            <p className="text-xs text-bloomberg-textMuted mt-1">
              {leasesWithUnits.filter(l => l.arrearsAmount > 0).length} tenant(s) in arrears
            </p>
          </CardContent>
        </Card>

        <Card className={complianceIssues.length > 0 ? 'border-bloomberg-warning/50' : ''}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <FileCheck className="w-5 h-5 text-bloomberg-warning" />
            </div>
            <p className="text-sm text-bloomberg-textMuted mb-1">Compliance Issues</p>
            <p className={`text-2xl font-bold ${complianceIssues.length > 0 ? 'text-bloomberg-warning' : 'text-bloomberg-success'}`}>
              {complianceIssues.length}
            </p>
            <p className="text-xs text-bloomberg-textMuted mt-1">
              Certificates & Checks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rent Roll Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-5 h-5 text-bloomberg-accent" />
            Rent Roll
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead className="text-right">Rent PCM</TableHead>
                <TableHead className="text-right">Arrears</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Lease End</TableHead>
                <TableHead>Compliance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leasesWithUnits.map((lease) => {
                const isOverdue = lease.paymentStatus === 'OVERDUE'
                const hasArrears = lease.arrearsAmount > 0
                const gasCertExpiring = lease.gasCertExpiry && 
                  new Date(lease.gasCertExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                
                const statusColors = {
                  PAID: 'bg-bloomberg-success/10 text-bloomberg-success',
                  PARTIAL: 'bg-bloomberg-warning/10 text-bloomberg-warning',
                  OVERDUE: 'bg-bloomberg-danger/10 text-bloomberg-danger',
                  PENDING: 'bg-bloomberg-textMuted/10 text-bloomberg-textMuted',
                }

                return (
                  <TableRow key={lease.id} className={hasArrears ? 'bg-bloomberg-danger/5' : ''}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-bloomberg-text">{lease.unit?.unitNumber}</p>
                        <p className="text-xs text-bloomberg-textMuted">{lease.unit?.type}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-bloomberg-text">{lease.tenantName}</p>
                        <p className="text-xs text-bloomberg-textMuted">{lease.tenantEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-bloomberg-text">
                      {formatGBP(lease.rentAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-mono ${hasArrears ? 'text-bloomberg-danger font-semibold' : 'text-bloomberg-success'}`}>
                        {formatGBP(lease.arrearsAmount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded ${statusColors[lease.paymentStatus]}`}>
                        {lease.paymentStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-bloomberg-textMuted">
                      {formatUKDate(new Date(lease.endDate))}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          lease.rightToRentCheck 
                            ? 'bg-bloomberg-success/10 text-bloomberg-success' 
                            : 'bg-bloomberg-danger/10 text-bloomberg-danger'
                        }`}>
                          RTR
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          gasCertExpiring 
                            ? 'bg-bloomberg-warning/10 text-bloomberg-warning' 
                            : 'bg-bloomberg-success/10 text-bloomberg-success'
                        }`}>
                          GAS
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          lease.epcRating && ['A', 'B', 'C'].includes(lease.epcRating)
                            ? 'bg-bloomberg-success/10 text-bloomberg-success' 
                            : 'bg-bloomberg-warning/10 text-bloomberg-warning'
                        }`}>
                          EPC:{lease.epcRating || '?'}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Unit Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vacant Units */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-bloomberg-warning">Vacant Units</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {residentialUnits.filter(u => u.status === 'VACANT').map(unit => (
              <div key={unit.id} className="p-3 bg-bloomberg-darker rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-bloomberg-text">{unit.unitNumber}</p>
                    <p className="text-xs text-bloomberg-textMuted">{unit.type} • {unit.bedrooms} bed</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-bloomberg-success">{formatGBP(unit.currentRate)}/m</p>
                    <p className="text-xs text-bloomberg-textMuted">{unit.squareMeters}m²</p>
                  </div>
                </div>
              </div>
            ))}
            {residentialUnits.filter(u => u.status === 'VACANT').length === 0 && (
              <p className="text-sm text-bloomberg-textMuted text-center py-4">No vacant units</p>
            )}
          </CardContent>
        </Card>

        {/* Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-bloomberg-danger">Under Maintenance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {residentialUnits.filter(u => u.status === 'MAINTENANCE').map(unit => {
              const alert = alerts.find(a => a.relatedId === unit.id)
              return (
                <div key={unit.id} className="p-3 bg-bloomberg-danger/10 rounded-lg border border-bloomberg-danger/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-bloomberg-text">{unit.unitNumber}</p>
                      <p className="text-xs text-bloomberg-textMuted">{unit.type}</p>
                    </div>
                    <AlertTriangle className="w-4 h-4 text-bloomberg-danger" />
                  </div>
                  {alert && (
                    <p className="text-xs text-bloomberg-danger mt-2">{alert.title}</p>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Arrears Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-bloomberg-danger">Arrears Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {leasesWithUnits.filter(l => l.arrearsAmount > 0).map(lease => (
              <div key={lease.id} className="p-3 bg-bloomberg-danger/10 rounded-lg border border-bloomberg-danger/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-bloomberg-text">{lease.unit?.unitNumber}</p>
                    <p className="text-xs text-bloomberg-textMuted">{lease.tenantName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-bloomberg-danger">
                      {formatGBP(lease.arrearsAmount)}
                    </p>
                    <p className="text-xs text-bloomberg-textMuted">
                      {Math.ceil(lease.arrearsAmount / lease.rentAmount)} month(s)
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {leasesWithUnits.filter(l => l.arrearsAmount > 0).length === 0 && (
              <p className="text-sm text-bloomberg-success text-center py-4">No arrears</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
