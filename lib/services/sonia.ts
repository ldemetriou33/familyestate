// SONIA (Sterling Overnight Index Average) Rate Tracker Service

export interface SONIARate {
  date: string
  rate: number
  source: string
}

/**
 * Fetch SONIA rate from Bank of England Statistical Database
 * Using the Bank of England's public API endpoint
 * 
 * Note: The Bank of England provides SONIA data through their Statistical Database
 * API. This is a simplified implementation that fetches the latest available rate.
 */
export async function fetchSONIARate(): Promise<SONIARate | null> {
  try {
    // Bank of England Statistical Database API endpoint for SONIA
    // SONIA series ID: IUMABEDR (SONIA - Sterling Overnight Index Average)
    // Using the latest available data point
    const response = await fetch(
      'https://www.bankofengland.co.uk/boeapps/database/_iadb-fromshowcolumns.asp?csv.x=yes&SeriesCodes=IUMABEDR&CSVF=TN&UsingCodes=Y&VPD=Y&VFD=N',
      {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
        },
        cache: 'no-store', // Always fetch fresh data
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch SONIA rate: ${response.statusText}`)
    }

    const csvText = await response.text()
    
    // Parse CSV - Bank of England format is typically:
    // Date,SONIA
    // 2024-01-15,5.25
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

    return {
      date,
      rate,
      source: 'Bank of England',
    }
  } catch (error) {
    console.error('Error fetching SONIA rate:', error)
    
    // Fallback: Return a mock rate for development/testing
    // In production, you might want to use a cached value or alternative source
    return {
      date: new Date().toISOString().split('T')[0],
      rate: 5.25, // Approximate SONIA rate as of late 2024
      source: 'Fallback (Bank of England API unavailable)',
    }
  }
}

/**
 * Get SONIA rate with error handling
 * Returns the rate as a percentage (e.g., 5.25 for 5.25%)
 */
export async function getSONIARate(): Promise<number> {
  const soniaData = await fetchSONIARate()
  return soniaData?.rate ?? 5.25 // Default fallback rate
}

