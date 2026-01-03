'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, Hotel, Coffee, Home, TrendingUp, DollarSign, Users, FileText, Image, Database } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function OperationalDataPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    properties: 0,
    units: 0,
    bookings: 0,
    revenue: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Count properties from Supabase CMS
        const { count: propCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })

        // Count units from Supabase CMS
        const { count: unitCount } = await supabase
          .from('units')
          .select('*', { count: 'exact', head: true })

        setStats({
          properties: propCount || 0,
          units: unitCount || 0,
          bookings: 0, // Would come from Prisma if connected
          revenue: 0, // Would come from Prisma if connected
        })
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [supabase])

  const adminModules = [
    {
      title: 'CMS Properties',
      description: 'Manage properties for the public website (hotels, land, villas)',
      href: '/admin/properties',
      icon: Building2,
      color: 'bg-blue-500',
      status: 'Active',
    },
    {
      title: 'Room Inventory',
      description: 'Edit rooms, enable Event Mode, set pricing',
      href: '/admin/rooms',
      icon: Hotel,
      color: 'bg-purple-500',
      status: 'Active',
    },
    {
      title: 'Cafe Menu',
      description: 'Manage F&B items, prices, availability',
      href: '/admin/cafe',
      icon: Coffee,
      color: 'bg-orange-500',
      status: 'Active',
    },
    {
      title: 'Site Content',
      description: 'Edit homepage text, hero sections, FAQs',
      href: '/admin/content',
      icon: FileText,
      color: 'bg-green-500',
      status: 'Active',
    },
    {
      title: 'Media Library',
      description: 'Upload and manage images for properties and rooms',
      href: '/admin/media',
      icon: Image,
      color: 'bg-pink-500',
      status: 'Active',
    },
    {
      title: 'Portfolio Admin',
      description: 'Manage operational data (rent roll, bookings, metrics)',
      href: '/dashboard/admin/portfolio',
      icon: Database,
      color: 'bg-indigo-500',
      status: 'Available',
      note: 'Uses Prisma database',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Operational Data Management</h1>
          <p className="text-slate-400">Manage all your estate data from one place</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">CMS Properties</span>
            <Building2 className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold">{stats.properties}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Rooms/Units</span>
            <Hotel className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold">{stats.units}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Bookings</span>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold">{stats.bookings}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Revenue</span>
            <DollarSign className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-bold">£{stats.revenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Admin Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminModules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="group bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${module.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <module.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                module.status === 'Active' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-amber-500/20 text-amber-400'
              }`}>
                {module.status}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2">{module.title}</h3>
            <p className="text-sm text-slate-400 mb-2">{module.description}</p>
            {module.note && (
              <p className="text-xs text-slate-500">{module.note}</p>
            )}
          </Link>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
        <h3 className="font-semibold text-amber-400 mb-2">✨ Everything is Editable Through Admin</h3>
        <p className="text-sm text-slate-300 mb-4">
          You can manage <strong>everything</strong> through the admin dashboard - no need to touch Supabase or the database directly.
        </p>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>✅ Properties, rooms, and content - All editable via `/admin`</li>
          <li>✅ Cafe menu items - Full CRUD in admin</li>
          <li>✅ Images - Upload via Media Vault</li>
          <li>✅ Homepage content - Edit via Site Content Editor</li>
          <li>✅ Event Mode pricing - Toggle in Room Editor</li>
        </ul>
      </div>
    </div>
  )
}

