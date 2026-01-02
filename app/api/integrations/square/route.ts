import { NextRequest, NextResponse } from 'next/server'

// Square OAuth Configuration
// Register your app at https://developer.squareup.com/
const SQUARE_CLIENT_ID = process.env.SQUARE_CLIENT_ID
const SQUARE_CLIENT_SECRET = process.env.SQUARE_CLIENT_SECRET
const SQUARE_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/square/callback`
  : 'http://localhost:3000/api/integrations/square/callback'

// Use sandbox for development
const SQUARE_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://connect.squareup.com'
  : 'https://connect.squareupsandbox.com'

export async function GET(request: NextRequest) {
  if (!SQUARE_CLIENT_ID) {
    return NextResponse.redirect('https://developer.squareup.com/apps')
  }

  const state = Buffer.from(JSON.stringify({
    returnUrl: '/dashboard',
    timestamp: Date.now()
  })).toString('base64')

  const scopes = [
    'MERCHANT_PROFILE_READ',
    'PAYMENTS_READ',
    'ORDERS_READ',
    'ITEMS_READ',
    'INVENTORY_READ'
  ].join('+')

  const authUrl = `${SQUARE_BASE_URL}/oauth2/authorize?` +
    `client_id=${SQUARE_CLIENT_ID}&` +
    `response_type=code&` +
    `scope=${scopes}&` +
    `state=${state}`

  return NextResponse.redirect(authUrl)
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!SQUARE_CLIENT_ID || !SQUARE_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Square not configured. Add SQUARE_CLIENT_ID and SQUARE_CLIENT_SECRET to environment.' },
        { status: 500 }
      )
    }

    const tokenResponse = await fetch(`${SQUARE_BASE_URL}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Square-Version': '2024-01-18'
      },
      body: JSON.stringify({
        client_id: SQUARE_CLIENT_ID,
        client_secret: SQUARE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: SQUARE_REDIRECT_URI
      })
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      return NextResponse.json({ error: 'Token exchange failed', details: error }, { status: 400 })
    }

    const tokens = await tokenResponse.json()

    return NextResponse.json({
      success: true,
      expiresIn: tokens.expires_at,
    })

  } catch (error) {
    console.error('Square auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}

