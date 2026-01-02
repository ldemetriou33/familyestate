'use client'

import { ReactNode } from 'react'
import { LucideIcon, Plus, Database, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  children?: ReactNode
}

export function EmptyState({
  icon: Icon = Database,
  title,
  description,
  action,
  secondaryAction,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="p-4 rounded-full bg-[var(--bg-secondary)] mb-4">
        <Icon className="w-8 h-8 text-[var(--text-muted)]" />
      </div>
      
      <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-[var(--text-muted)] mb-6 max-w-md">
          {description}
        </p>
      )}
      
      {children}
      
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-4">
          {action && (
            action.href ? (
              <Link
                href={action.href}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {action.label}
              </button>
            )
          )}
          
          {secondaryAction && (
            secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                {secondaryAction.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={secondaryAction.onClick}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                {secondaryAction.label}
                <ArrowRight className="w-4 h-4" />
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

// Preset empty states for common scenarios
export function NoDataEmptyState({ onSeedData }: { onSeedData?: () => void }) {
  return (
    <EmptyState
      title="No Data Yet"
      description="Get started by adding your first property or import demo data to explore the dashboard."
      action={{
        label: 'Add Property',
        href: '/dashboard/admin/portfolio',
      }}
      secondaryAction={onSeedData ? {
        label: 'Seed Demo Data',
        onClick: onSeedData,
      } : undefined}
    />
  )
}

export function NoPropertiesEmptyState() {
  return (
    <EmptyState
      title="No Properties"
      description="Add your first property to start tracking your portfolio."
      action={{
        label: 'Add Property',
        href: '/dashboard/admin/portfolio',
      }}
    />
  )
}

export function NoHotelEmptyState() {
  return (
    <EmptyState
      title="No Hotel Configured"
      description="Add a hotel property to track occupancy, bookings, and revenue."
      action={{
        label: 'Add Hotel',
        href: '/dashboard/admin/portfolio',
      }}
    />
  )
}

export function NoCafeEmptyState() {
  return (
    <EmptyState
      title="No Café Configured"
      description="Add a café property to track daily sales and performance."
      action={{
        label: 'Add Café',
        href: '/dashboard/admin/portfolio',
      }}
    />
  )
}

export function NoResidentialEmptyState() {
  return (
    <EmptyState
      title="No Residential Properties"
      description="Add residential properties to track rent, tenants, and yields."
      action={{
        label: 'Add Property',
        href: '/dashboard/admin/portfolio',
      }}
    />
  )
}

export function ConnectDataEmptyState({ integration }: { integration: string }) {
  return (
    <EmptyState
      title={`Connect ${integration}`}
      description={`Link your ${integration} account to automatically sync data.`}
      action={{
        label: 'Connect Integration',
        href: '/dashboard/settings',
      }}
    />
  )
}

