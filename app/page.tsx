'use client'

import SovereignCommandDashboard from '@/components/sovereign/SovereignCommandDashboard'

// Mark as dynamic since we use client-side hooks
export const dynamic = 'force-dynamic'

export default function HomePage() {
  return <SovereignCommandDashboard />
}
