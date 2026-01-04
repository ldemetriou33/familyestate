import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const user = (await supabase.auth.getUser()).data.user

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { family_id, name, type } = body

  if (!family_id || !name || !type) {
    return NextResponse.json({ error: 'family_id, name, and type are required' }, { status: 400 })
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

  // Create entity
  const { data: entity, error: entityError } = await supabase
    .from('entities')
    .insert({
      family_id,
      name,
      type,
    })
    .select()
    .single()

  if (entityError || !entity) {
    console.error('Error creating entity:', entityError)
    return NextResponse.json({ error: 'Failed to create entity' }, { status: 500 })
  }

  return NextResponse.json({ entity })
}

