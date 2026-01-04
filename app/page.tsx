'use client'

import SovereignCommandDashboard from '@/components/sovereign/SovereignCommandDashboard'

// Mark as dynamic since we use client-side hooks
export const dynamic = 'force-dynamic'

// Fetch data from Supabase (with fallback to seed data)
async function getHomepageData() {
  try {
    const supabase = await createServerClient()
    
    // Check if Supabase is configured
    if (!supabase.from || typeof supabase.from !== 'function') {
      throw new Error('Supabase not configured')
    }
    
    // Fetch content blocks
    const { data: contentBlocks, error: contentError } = await supabase
      .from('content_blocks')
      .select('section_key, content')
      .eq('is_active', true)

    if (contentError) throw contentError

    // Fetch published properties
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select(`
        id,
        name,
        slug,
        description,
        hero_image_url,
        location:city,
        highlights,
        units:units!inner(
          id,
          name,
          base_price,
          surge_price,
          is_event_mode_active,
          category,
          capacity
        )
      `)
      .eq('is_published', true)
      .eq('status', 'Active')
      .limit(1) // Just get the hotel for now

    if (propertiesError) throw propertiesError

    // Transform content blocks to object
    const content: Record<string, any> = {}
    if (contentBlocks) {
      contentBlocks.forEach((block: any) => {
        content[block.section_key] = block.content
      })
    }

    return {
      content,
      property: properties?.[0] || null,
    }
  } catch (error) {
    console.error('Failed to fetch homepage data:', error)
    // Return fallback data
    return {
      content: {
        home_hero: {
          title: 'Your Mixed Portfolio. One Command Center.',
          subtitle: 'Manage your hotel, cafe, and residential properties from a single dashboard. AI-powered insights. Automated actions. Complete control.',
          cta_text: 'Access Dashboard',
          cta_link: '/sign-in',
          secondary_cta_text: 'Create Account',
          secondary_cta_link: '/sign-up',
        },
        home_about: {
          title: 'One System. Three Businesses.',
          description: 'Abbey OS unifies your entire property portfolio into a single, intelligent operating system.',
        },
        home_value: {
          title: 'Best Value Wembley Accommodation',
          description: 'Experience luxury at Abbey Point Hotel. Stunning views of Wembley Arch. Perfect for event-goers and business travelers.',
        },
      },
      property: null,
    }
  }
}

export default async function LandingPage() {
  const { content, property } = await getHomepageData()
  
  const hero = content.home_hero || {
    title: 'Your Mixed Portfolio. One Command Center.',
    subtitle: 'Manage your hotel, cafe, and residential properties from a single dashboard. AI-powered insights. Automated actions. Complete control.',
    cta_text: 'Access Dashboard',
    cta_link: '/sign-in',
    secondary_cta_text: 'Create Account',
    secondary_cta_link: '/sign-up',
  }

  const about = content.home_about || {
    title: 'One System. Three Businesses.',
    description: 'Abbey OS unifies your entire property portfolio into a single, intelligent operating system.',
  }

  const value = content.home_value || {
    title: 'Best Value Wembley Accommodation',
    description: 'Experience luxury at Abbey Point Hotel. Stunning views of Wembley Arch. Perfect for event-goers and business travelers.',
  }

  // Get rooms with event mode for display
  const eventModeRooms = property?.units?.filter((u: any) => u.is_event_mode_active) || []
  const regularRooms = property?.units?.filter((u: any) => !u.is_event_mode_active) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-bloomberg-darker via-bloomberg-panel to-bloomberg-darker">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, #00d4ff 2px, transparent 0)`,
            backgroundSize: '50px 50px',
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          {/* Nav */}
          <nav className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bloomberg-accent to-blue-600 flex items-center justify-center shadow-lg shadow-bloomberg-accent/30">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-bloomberg-text">Abbey OS</h1>
                <p className="text-xs text-bloomberg-textMuted">Family Estate Autopilot</p>
              </div>
            </div>
            <Link 
              href="/sign-in"
              className="px-6 py-2.5 bg-bloomberg-accent hover:bg-bloomberg-accentHover text-white rounded-lg font-semibold transition-all shadow-lg shadow-bloomberg-accent/20 hover:shadow-bloomberg-accent/40"
            >
              Sign In
            </Link>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-bloomberg-accent/10 border border-bloomberg-accent/30 rounded-full mb-8">
              <Zap className="w-4 h-4 text-bloomberg-accent" />
              <span className="text-sm text-bloomberg-accent font-medium">AI-Powered Estate Management</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold text-bloomberg-text mb-6 leading-tight">
              {hero.title || 'Your Mixed Portfolio. One Command Center.'}
            </h2>
            
            <p className="text-xl text-bloomberg-textMuted mb-10 max-w-2xl mx-auto">
              {hero.subtitle || 'Manage your hotel, cafe, and residential properties from a single dashboard. AI-powered insights. Automated actions. Complete control.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href={hero.cta_link || '/sign-in'}
                className="inline-flex items-center gap-2 px-8 py-4 bg-bloomberg-accent hover:bg-bloomberg-accentHover text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-bloomberg-accent/30 hover:shadow-bloomberg-accent/50 hover:scale-105"
              >
                {hero.cta_text || 'Access Dashboard'}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href={hero.secondary_cta_link || '/sign-up'}
                className="inline-flex items-center gap-2 px-8 py-4 bg-bloomberg-panel hover:bg-bloomberg-darker border border-bloomberg-border text-bloomberg-text rounded-xl font-semibold text-lg transition-all"
              >
                {hero.secondary_cta_text || 'Create Account'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Property Showcase (if available) */}
      {property && (
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-bloomberg-text mb-4">{value.title}</h3>
            <p className="text-bloomberg-textMuted max-w-2xl mx-auto">{value.description}</p>
          </div>

          {/* Rooms Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Event Mode Rooms (Highlighted) */}
            {eventModeRooms.slice(0, 3).map((room: any) => (
              <div
                key={room.id}
                className="p-6 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/50 rounded-2xl hover:border-amber-400 transition-all relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-slate-900 text-xs font-bold rounded-full">
                  HIGH DEMAND
                </div>
                <h4 className="text-xl font-bold text-bloomberg-text mb-2">{room.name}</h4>
                <p className="text-bloomberg-textMuted text-sm mb-4">{room.category}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-amber-400">£{room.surge_price?.toFixed(0) || room.base_price.toFixed(0)}</span>
                  <span className="text-sm text-bloomberg-textMuted line-through">£{room.base_price.toFixed(0)}</span>
                  <span className="text-xs text-amber-400 font-semibold">Event Rate</span>
                </div>
              </div>
            ))}

            {/* Regular Rooms */}
            {regularRooms.slice(0, 3).map((room: any) => (
              <div
                key={room.id}
                className="p-6 bg-bloomberg-panel/50 border border-bloomberg-border rounded-2xl hover:border-blue-500/50 transition-all"
              >
                <h4 className="text-xl font-bold text-bloomberg-text mb-2">{room.name}</h4>
                <p className="text-bloomberg-textMuted text-sm mb-4">{room.category}</p>
                <div className="text-2xl font-bold text-bloomberg-text">
                  £{room.base_price.toFixed(0)}<span className="text-sm text-bloomberg-textMuted">/night</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-bloomberg-text mb-4">{about.title}</h3>
          <p className="text-bloomberg-textMuted max-w-2xl mx-auto">{about.description}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Hotel */}
          <div className="p-8 bg-bloomberg-panel/50 border border-bloomberg-border rounded-2xl hover:border-blue-500/50 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Hotel className="w-7 h-7 text-blue-500" />
            </div>
            <h4 className="text-xl font-bold text-bloomberg-text mb-3">Hotel Management</h4>
            <p className="text-bloomberg-textMuted mb-4">
              Real-time occupancy tracking, ADR optimization, and automated revenue management.
            </p>
            <ul className="space-y-2 text-sm text-bloomberg-textMuted">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Occupancy forecasting
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Channel management
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                RevPAR optimization
              </li>
            </ul>
          </div>

          {/* Cafe */}
          <div className="p-8 bg-bloomberg-panel/50 border border-bloomberg-border rounded-2xl hover:border-orange-500/50 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UtensilsCrossed className="w-7 h-7 text-orange-500" />
            </div>
            <h4 className="text-xl font-bold text-bloomberg-text mb-3">F&B Operations</h4>
            <p className="text-bloomberg-textMuted mb-4">
              Margin tracking, labour cost management, and daily sales monitoring.
            </p>
            <ul className="space-y-2 text-sm text-bloomberg-textMuted">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Gross margin alerts
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Labour % tracking
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Covers analysis
              </li>
            </ul>
          </div>

          {/* Residential */}
          <div className="p-8 bg-bloomberg-panel/50 border border-bloomberg-border rounded-2xl hover:border-green-500/50 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Home className="w-7 h-7 text-green-500" />
            </div>
            <h4 className="text-xl font-bold text-bloomberg-text mb-3">Residential Lettings</h4>
            <p className="text-bloomberg-textMuted mb-4">
              Rent collection, arrears management, and compliance tracking.
            </p>
            <ul className="space-y-2 text-sm text-bloomberg-textMuted">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Arrears monitoring
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Compliance calendar
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Maintenance logs
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* AI Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-bloomberg-accent/10 to-blue-600/10 border border-bloomberg-accent/30 rounded-3xl p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-bloomberg-accent/20 rounded-full mb-6">
                <TrendingUp className="w-4 h-4 text-bloomberg-accent" />
                <span className="text-sm text-bloomberg-accent font-medium">AI-Powered</span>
              </div>
              <h3 className="text-3xl font-bold text-bloomberg-text mb-4">
                Predictive Intelligence
              </h3>
              <p className="text-bloomberg-textMuted mb-6">
                Abbey OS uses AI to forecast revenue, detect anomalies, and recommend actions 
                before problems occur. Stay ahead of the curve.
              </p>
              <ul className="space-y-3">
                {[
                  'Revenue & occupancy forecasting',
                  'Anomaly detection engine',
                  'Automated action recommendations',
                  'Predictive maintenance alerts',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-bloomberg-text">
                    <div className="w-6 h-6 rounded-full bg-bloomberg-success/20 flex items-center justify-center">
                      <Shield className="w-3.5 h-3.5 text-bloomberg-success" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square bg-bloomberg-panel rounded-2xl border border-bloomberg-border p-6 shadow-2xl">
                <div className="text-center mb-6">
                  <p className="text-bloomberg-textMuted text-sm mb-2">Portfolio Health Score</p>
                  <p className="text-6xl font-bold text-bloomberg-success">78</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-bloomberg-textMuted">Hotel</span>
                    <span className="text-bloomberg-success">Healthy</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-bloomberg-textMuted">Cafe</span>
                    <span className="text-bloomberg-warning">Review Needed</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-bloomberg-textMuted">Residential</span>
                    <span className="text-bloomberg-success">Healthy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-bloomberg-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-bloomberg-accent" />
            <span className="text-bloomberg-textMuted text-sm">Abbey OS v2.0</span>
          </div>
          <p className="text-bloomberg-textMuted text-sm">
            © 2026 Family Estate Autopilot. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Floating Admin Button (only visible to admins) */}
      <FloatingAdminButton />
    </div>
  )
}
