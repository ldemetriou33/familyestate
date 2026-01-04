import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const user = (await supabase.auth.getUser()).data.user

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    family_id,
    entity_id,
    name,
    location,
    currency,
    valuation,
    principal_ownership,
    minority_ownership,
    tier,
    category,
    asset_class,
    status,
    metadata,
  } = body

  if (!family_id || !name || !location || !currency || valuation === undefined) {
    return NextResponse.json(
      { error: 'family_id, name, location, currency, and valuation are required' },
      { status: 400 }
    )
  }

  // Verify user has access to this family
  const { data: access, error: accessError } = await supabase
    .from('family_users')
    .select('role')
    .eq('family_id', family_id)
    .eq('user_id', user.id)
    .single()

  if (accessError || !access || !['owner', 'admin'].includes(access.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Create asset
  const { data: asset, error: assetError } = await supabase
    .from('assets')
    .insert({
      family_id,
      entity_id: entity_id || null,
      name,
      location,
      currency,
      valuation,
      principal_ownership: principal_ownership || 100,
      minority_ownership: minority_ownership || 0,
      tier: tier || 'B',
      category: category || null,
      asset_class: asset_class || null,
      status: status || 'OPERATIONAL',
      metadata: metadata || {},
    })
    .select()
    .single()

  if (assetError || !asset) {
    console.error('Error creating asset:', assetError)
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 })
  }

  return NextResponse.json({ asset })
}

