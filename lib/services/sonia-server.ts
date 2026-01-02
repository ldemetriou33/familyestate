// SONIA Server Component Fetcher
// This runs on the server side for better performance and caching

export interface SONIARate {
  date: string
  rate: number
  source: string
  lastUpdated: string
}

const FALLBACK_RATE = 3.72 // Fallback rate as specified (3.72%)
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// In-memory cache for the rate
let cachedRate: SONIARate | null = null
let cacheTimestamp: number = 0

/**
 * Fetch SONIA rate from Bank of England (Server Component)
 * Uses daily refresh logic with fallback
 */
export async function fetchSONIAServer(): Promise<SONIARate> {
  const now = Date.now()
  
  // Return cached rate if still valid (within 24 hours)
  if (cachedRate && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedRate
  }

  try {
    // Bank of England Statistical Database API endpoint for SONIA
    const response = await fetch(
      'https://www.bankofengland.co.uk/boeapps/database/_iadb-fromshowcolumns.asp?csv.x=yes&SeriesCodes=IUMABEDR&CSVF=TN&UsingCodes=Y&VPD=Y&VFD=N',
      {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
        },
        // Revalidate every 24 hours
        next: { revalidate: 86400 },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch SONIA rate: ${response.statusText}`)
    }

    const csvText = await response.text()
    const lines = csvText.trim().split('\n')
    
    if (lines.length < 2) {
      throw new Error('Invalid CSV format from Bank of England')
    }

    // Get the last line (most recent data point)
    const lastLine = lines[lines.length - 1]
    const [dateStr, rateStr] = lastLine.split(',')

    if (!dateStr || !rateStr) {
      throw new Error('Could not parse SONIA data')
    }

    const rate = parseFloat(rateStr.trim())
    const date = dateStr.trim()

    if (isNaN(rate)) {
      throw new Error('Invalid rate value')
    }

    const soniaRate: SONIARate = {
      date,
      rate,
      source: 'Bank of England',
      lastUpdated: new Date().toISOString(),
    }

    // Cache the result
    cachedRate = soniaRate
    cacheTimestamp = now

    return soniaRate
  } catch (error) {
    console.error('Error fetching SONIA rate:', error)
    
    // Return fallback rate
    const fallbackRate: SONIARate = {
      date: new Date().toISOString().split('T')[0],
      rate: FALLBACK_RATE,
      source: 'Fallback (Bank of England API unavailable)',
      lastUpdated: new Date().toISOString(),
    }

    // Cache fallback for shorter duration (1 hour) to retry sooner
    if (!cachedRate) {
      cachedRate = fallbackRate
      cacheTimestamp = now - (CACHE_DURATION - 60 * 60 * 1000) // Cache for 1 hour
    }

    return fallbackRate
  }
}

/**
 * Get SONIA rate (server-side)
 * Returns the rate as a percentage (e.g., 3.72 for 3.72%)
 */
export async function getSONIAServerRate(): Promise<number> {
  const soniaData = await fetchSONIAServer()
  return soniaData.rate
}

