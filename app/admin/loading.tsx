import { Loader2 } from 'lucide-react'

export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-slate-400">Loading admin dashboard...</p>
      </div>
    </div>
  )
}

