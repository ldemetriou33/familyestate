'use client'

import { useState, useEffect } from 'react'
import { Settings, X, Building2, BedDouble, UtensilsCrossed, FileText, Image, Database } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function FloatingAdminButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Check if user is admin via API
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/admin/auth')
        if (res.ok) {
          const data = await res.json()
          if (data.isAdmin) {
            setIsAdmin(true)
            return
          }
        }
        // Fallback: check client-side if API fails
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || ''
          if (user.email?.toLowerCase() === adminEmail.toLowerCase()) {
            setIsAdmin(true)
          }
        }
      } catch (error) {
        console.error('Failed to check admin status:', error)
      }
    }

    checkAdmin()
  }, [supabase])

  if (!isAdmin) return null

  const adminLinks = [
    { href: '/admin', label: 'Admin Dashboard', icon: Settings },
    { href: '/admin/properties', label: 'Properties', icon: Building2 },
    { href: '/admin/rooms', label: 'Rooms', icon: BedDouble },
    { href: '/admin/cafe', label: 'Cafe Menu', icon: UtensilsCrossed },
    { href: '/admin/content', label: 'Site Content', icon: FileText },
    { href: '/admin/media', label: 'Media Library', icon: Image },
  ]

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110"
        aria-label="Admin Panel"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Settings className="w-6 h-6" />
        )}
      </button>

      {/* Admin Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="fixed bottom-24 right-6 z-50 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                Admin Panel
              </h3>
              <p className="text-xs text-slate-400 mt-1">Quick access to content management</p>
            </div>
            
            <div className="p-2 max-h-96 overflow-y-auto">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors group"
                >
                  <link.icon className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                  <span className="text-sm text-slate-300 group-hover:text-white">{link.label}</span>
                </Link>
              ))}
            </div>
            
            <div className="p-3 border-t border-slate-700 bg-slate-800">
              <Link
                href="/admin"
                className="block w-full text-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Open Full Admin Dashboard
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  )
}

