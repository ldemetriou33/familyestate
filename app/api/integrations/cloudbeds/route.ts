import { NextRequest, NextResponse } from 'next/server'

// Cloudbeds OAuth Configuration
// Register your app at https://hotels.cloudbeds.com/api/docs/
const CLOUDBEDS_CLIENT_ID = process.env.CLOUDBEDS_CLIENT_ID
const CLOUDBEDS_CLIENT_SECRET = process.env.CLOUDBEDS_CLIENT_SECRET
const CLOUDBEDS_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/cloudbeds/callback`
  : 'http://localhost:3000/api/integrations/cloudbeds/callback'

export async function GET(request: NextRequest) {
  // Check if Cloudbeds is configured
  if (!CLOUDBEDS_CLIENT_ID) {
    // Redirect to Cloudbeds API registration
    return NextResponse.redirect('https://hotels.cloudbeds.com/api/docs/')
  }

  // Cloudbeds OAuth URL
  const state = Buffer.from(JSON.stringify({
    returnUrl: '/dashboard',
    timestamp: Date.now()
  })).toString('base64')

  const authUrl = `https://hotels.cloudbeds.com/api/v1.1/oauth?` +
    `client_id=${CLOUDBEDS_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(CLOUDBEDS_REDIRECT_URI)}&` +
    `response_type=code&` +
    `state=${state}`

  return NextResponse.redirect(authUrl)
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!CLOUDBEDS_CLIENT_ID || !CLOUDBEDS_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Cloudbeds not configured. Add CLOUDBEDS_CLIENT_ID and CLOUDBEDS_CLIENT_SECRET to environment.' },
        { status: 500 }
      )
    }

    const tokenResponse = await fetch('https://hotels.cloudbeds.com/api/v1.1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLOUDBEDS_CLIENT_ID,
        client_secret: CLOUDBEDS_CLIENT_SECRET,
        code,
        redirect_uri: CLOUDBEDS_REDIRECT_URI
      })
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      return NextResponse.json({ error: 'Token exchange failed', details: error }, { status: 400 })
    }

    const tokens = await tokenResponse.json()

    return NextResponse.json({
      success: true,
      expiresIn: tokens.expires_in,
    })

  } catch (error) {
    console.error('Cloudbeds auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}

