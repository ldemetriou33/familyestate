'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ApprovalThresholds {
  staff: number      // Max amount staff can approve
  gm: number         // Max amount GM can approve  
  owner: number      // Unlimited (set to Infinity)
}

interface PendingApproval {
  id: string
  type: 'expense' | 'rate_change' | 'contractor'
  title: string
  amount: number
  description: string
  requestedBy: string
  requestedAt: Date
  status: 'pending' | 'approved' | 'rejected'
  requiredRole: 'staff' | 'gm' | 'owner'
}

interface ApprovalsContextType {
  thresholds: ApprovalThresholds
  setThresholds: (thresholds: ApprovalThresholds) => void
  pendingApprovals: PendingApproval[]
  addApproval: (approval: Omit<PendingApproval, 'id' | 'requestedAt' | 'status' | 'requiredRole'>) => void
  approveItem: (id: string) => void
  rejectItem: (id: string) => void
  getRequiredRole: (amount: number) => 'staff' | 'gm' | 'owner'
  canApprove: (amount: number, userRole: 'staff' | 'gm' | 'owner') => boolean
}

const defaultThresholds: ApprovalThresholds = {
  staff: 500,
  gm: 5000,
  owner: Infinity,
}

const mockApprovals: PendingApproval[] = [
  {
    id: '1',
    type: 'expense',
    title: 'Boiler Repair - Flat 3A',
    amount: 850,
    description: 'Emergency boiler replacement required',
    requestedBy: 'John (Maintenance)',
    requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'pending',
    requiredRole: 'gm',
  },
  {
    id: '2',
    type: 'expense',
    title: 'Coffee Machine Supplies',
    amount: 320,
    description: 'Monthly cafe supplies order',
    requestedBy: 'Emma (Cafe Manager)',
    requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'pending',
    requiredRole: 'staff',
  },
  {
    id: '3',
    type: 'contractor',
    title: 'Roof Inspection - Victoria Apts',
    amount: 2500,
    description: 'Annual roof survey and minor repairs',
    requestedBy: 'Property Manager',
    requestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'pending',
    requiredRole: 'gm',
  },
  {
    id: '4',
    type: 'rate_change',
    title: 'Hotel Rate Increase',
    amount: 15000, // Estimated monthly impact
    description: 'Increase weekend rates by 12% for Q4',
    requestedBy: 'Revenue Manager',
    requestedAt: new Date(),
    status: 'pending',
    requiredRole: 'owner',
  },
]

const ApprovalsContext = createContext<ApprovalsContextType | undefined>(undefined)

export function ApprovalsProvider({ children }: { children: ReactNode }) {
  const [thresholds, setThresholdsState] = useState<ApprovalThresholds>(defaultThresholds)
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>(mockApprovals)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('abbey-approval-thresholds')
    if (saved) {
      setThresholdsState(JSON.parse(saved))
    }
    const savedApprovals = localStorage.getItem('abbey-pending-approvals')
    if (savedApprovals) {
      const parsed = JSON.parse(savedApprovals)
      setPendingApprovals(parsed.map((a: PendingApproval) => ({
        ...a,
        requestedAt: new Date(a.requestedAt)
      })))
    }
  }, [])

  // Save thresholds
  useEffect(() => {
    localStorage.setItem('abbey-approval-thresholds', JSON.stringify(thresholds))
  }, [thresholds])

  // Save approvals
  useEffect(() => {
    localStorage.setItem('abbey-pending-approvals', JSON.stringify(pendingApprovals))
  }, [pendingApprovals])

  const getRequiredRole = (amount: number): 'staff' | 'gm' | 'owner' => {
    if (amount <= thresholds.staff) return 'staff'
    if (amount <= thresholds.gm) return 'gm'
    return 'owner'
  }

  const canApprove = (amount: number, userRole: 'staff' | 'gm' | 'owner'): boolean => {
    if (userRole === 'owner') return true
    if (userRole === 'gm') return amount <= thresholds.gm
    if (userRole === 'staff') return amount <= thresholds.staff
    return false
  }

  const setThresholds = (newThresholds: ApprovalThresholds) => {
    setThresholdsState(newThresholds)
    // Recalculate required roles for pending approvals
    setPendingApprovals(prev => prev.map(a => ({
      ...a,
      requiredRole: getRequiredRoleInternal(a.amount, newThresholds)
    })))
  }

  const getRequiredRoleInternal = (amount: number, t: ApprovalThresholds): 'staff' | 'gm' | 'owner' => {
    if (amount <= t.staff) return 'staff'
    if (amount <= t.gm) return 'gm'
    return 'owner'
  }

  const addApproval = (approval: Omit<PendingApproval, 'id' | 'requestedAt' | 'status' | 'requiredRole'>) => {
    const newApproval: PendingApproval = {
      ...approval,
      id: Date.now().toString(),
      requestedAt: new Date(),
      status: 'pending',
      requiredRole: getRequiredRole(approval.amount),
    }
    setPendingApprovals(prev => [...prev, newApproval])
  }

  const approveItem = (id: string) => {
    setPendingApprovals(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'approved' as const } : a
    ))
  }

  const rejectItem = (id: string) => {
    setPendingApprovals(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'rejected' as const } : a
    ))
  }

  return (
    <ApprovalsContext.Provider value={{
      thresholds,
      setThresholds,
      pendingApprovals,
      addApproval,
      approveItem,
      rejectItem,
      getRequiredRole,
      canApprove,
    }}>
      {children}
    </ApprovalsContext.Provider>
  )
}

export function useApprovals() {
  const context = useContext(ApprovalsContext)
  if (context === undefined) {
    throw new Error('useApprovals must be used within an ApprovalsProvider')
  }
  return context
}

