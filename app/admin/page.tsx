'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Building2, 
  BedDouble, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  Plus,
  RefreshCw
} from 'lucide-react'

interface Stats {
  totalProperties: number
  activeProperties: number
  soldProperties: number
  totalRooms: number
  eventModeRooms: number
  contentItems: number
  recentChanges: Array<{
    id: string
    type: string
    action: string
    name: string
    timestamp: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const quickActions = [
    { href: '/admin/properties/new', label: 'Add Property', icon: Building2, color: 'bg-blue-500' },
    { href: '/admin/rooms/new', label: 'Add Room', icon: BedDouble, color: 'bg-purple-500' },
    { href: '/admin/content', label: 'Edit Content', icon: FileText, color: 'bg-green-500' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage your properties, rooms, and site content</p>
        </div>
        <button
          onClick={loadStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-slate-600 transition-all group"
          >
            <div className={`${action.color} p-3 rounded-lg`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <span className="font-medium">{action.label}</span>
            </div>
            <Plus className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Properties"
          value={stats?.totalProperties ?? 0}
          icon={Building2}
          loading={loading}
        />
        <StatCard
          label="Active Properties"
          value={stats?.activeProperties ?? 0}
          icon={TrendingUp}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Total Rooms"
          value={stats?.totalRooms ?? 0}
          icon={BedDouble}
          loading={loading}
        />
        <StatCard
          label="Event Mode Active"
          value={stats?.eventModeRooms ?? 0}
          icon={AlertTriangle}
          variant="warning"
          loading={loading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Properties Overview */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Properties Overview</h2>
            <Link 
              href="/admin/properties" 
              className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-700">
              <span className="text-slate-400">Active</span>
              <span className="font-semibold text-green-400">{stats?.activeProperties ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-700">
              <span className="text-slate-400">Sold/Past Projects</span>
              <span className="font-semibold text-slate-400">{stats?.soldProperties ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-slate-400">Total Value</span>
              <span className="font-semibold">£{((stats?.totalProperties ?? 0) * 1200000).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Room Inventory */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Room Inventory</h2>
            <Link 
              href="/admin/rooms" 
              className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-700">
              <span className="text-slate-400">Total Rooms</span>
              <span className="font-semibold">{stats?.totalRooms ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-700">
              <span className="text-slate-400">Event Mode Active</span>
              <span className="font-semibold text-amber-400">{stats?.eventModeRooms ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-slate-400">Content Items</span>
              <span className="font-semibold">{stats?.contentItems ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Event Mode Toggle Card */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-amber-500/20 p-3 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-400">Wembley Event Mode</h3>
            <p className="text-slate-400 text-sm mt-1">
              When activated, rooms with &ldquo;Event Premium&rdquo; enabled will display surge pricing 
              and a &ldquo;High Demand&rdquo; badge on the public site.
            </p>
            <div className="mt-4">
              <Link
                href="/admin/rooms?filter=event"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
              >
                Manage Event Pricing
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  variant = 'default',
  loading = false 
}: { 
  label: string
  value: number
  icon: typeof Building2
  variant?: 'default' | 'success' | 'warning'
  loading?: boolean
}) {
  const variants = {
    default: 'bg-slate-800 border-slate-700',
    success: 'bg-green-500/10 border-green-500/30',
    warning: 'bg-amber-500/10 border-amber-500/30',
  }
  
  const iconVariants = {
    default: 'text-slate-400',
    success: 'text-green-400',
    warning: 'text-amber-400',
  }

  return (
    <div className={`${variants[variant]} border rounded-xl p-4`}>
      <div className="flex items-center justify-between">
        <Icon className={`w-5 h-5 ${iconVariants[variant]}`} />
      </div>
      <div className="mt-3">
        {loading ? (
          <div className="h-8 w-16 bg-slate-700 animate-pulse rounded" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
        <p className="text-sm text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  )
}

