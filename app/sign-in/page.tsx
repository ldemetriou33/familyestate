'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Mail, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function SignInPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      toast.success('Check your email for the magic link!')
    } catch (error: any) {
      console.error('Sign in error:', error)
      toast.error(error.message || 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, #f59e0b 2px, transparent 0)`,
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Logo */}
      <Link href="/" className="relative flex items-center gap-3 mb-8 group">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-all">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Abbey OS</h1>
          <p className="text-sm text-slate-400">Family Estate Autopilot</p>
        </div>
      </Link>

      {/* Sign In Form */}
      <div className="relative w-full max-w-md">
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
          <p className="text-slate-400 mb-6">Enter your email to receive a magic link</p>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your-email@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Magic Link'
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400 text-center">
            We&apos;ll send you a secure link to sign in without a password
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="relative mt-8 text-sm text-slate-500">
        © 2026 Abbey OS • Family Estate Autopilot
      </p>
    </div>
  )
}

