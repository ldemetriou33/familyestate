// Server Component for SONIA Rate Display
import { fetchSONIAServer } from '@/lib/services/sonia-server'
import { formatPercentage } from '@/lib/utils'
import { Activity } from 'lucide-react'

export default async function SONIARateDisplay() {
  const soniaData = await fetchSONIAServer()

  return (
    <div className="flex items-center gap-2">
      <Activity className="w-4 h-4 text-bloomberg-accent" />
      <div>
        <div className="text-2xl font-bold text-bloomberg-text">
          {formatPercentage(soniaData.rate)}
        </div>
        <div className="text-xs text-bloomberg-textMuted">
          {soniaData.source === 'Bank of England' 
            ? `As of ${soniaData.date}` 
            : 'Fallback rate'}
        </div>
      </div>
    </div>
  )
}

