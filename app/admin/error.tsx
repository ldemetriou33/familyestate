'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Admin error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 gap-6 p-8">
      <div className="flex items-center gap-3 text-red-400">
        <AlertTriangle className="w-8 h-8" />
        <h2 className="text-xl font-semibold">Something went wrong!</h2>
      </div>
      
      <div className="max-w-md text-center">
        <p className="text-slate-400 mb-2">{error.message}</p>
        {error.digest && (
          <p className="text-xs text-slate-500">Error ID: {error.digest}</p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
        
        <Link
          href="/admin"
          className="px-4 py-2 border border-slate-600 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

