import { NextRequest, NextResponse } from 'next/server'

// Xero OAuth Configuration
// You need to register your app at https://developer.xero.com/
const XERO_CLIENT_ID = process.env.XERO_CLIENT_ID
const XERO_CLIENT_SECRET = process.env.XERO_CLIENT_SECRET
const XERO_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/xero/callback`
  : 'http://localhost:3000/api/integrations/xero/callback'

export async function GET(request: NextRequest) {
  // Check if we have Xero credentials configured
  if (!XERO_CLIENT_ID) {
    // If not configured, redirect to Xero's developer page to set up
    return NextResponse.redirect('https://developer.xero.com/app/manage')
  }

  // Generate OAuth authorization URL
  const scope = encodeURIComponent([
    'openid',
    'profile',
    'email',
    'accounting.transactions',
    'accounting.contacts',
    'accounting.settings',
    'offline_access'
  ].join(' '))

  const state = Buffer.from(JSON.stringify({
    returnUrl: '/dashboard',
    timestamp: Date.now()
  })).toString('base64')

  const authUrl = `https://login.xero.com/identity/connect/authorize?` +
    `response_type=code&` +
    `client_id=${XERO_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(XERO_REDIRECT_URI)}&` +
    `scope=${scope}&` +
    `state=${state}`

  return NextResponse.redirect(authUrl)
}

export async function POST(request: NextRequest) {
  // Handle token exchange from callback
  try {
    const { code } = await request.json()

    if (!XERO_CLIENT_ID || !XERO_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Xero not configured. Add XERO_CLIENT_ID and XERO_CLIENT_SECRET to environment.' },
        { status: 500 }
      )
    }

    const tokenResponse = await fetch('https://identity.xero.com/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: XERO_REDIRECT_URI
      })
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      return NextResponse.json({ error: 'Token exchange failed', details: error }, { status: 400 })
    }

    const tokens = await tokenResponse.json()

    // In a real app, store these tokens securely in your database
    // For now, return success
    return NextResponse.json({
      success: true,
      expiresIn: tokens.expires_in,
      // Don't expose actual tokens in response
    })

  } catch (error) {
    console.error('Xero auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}

