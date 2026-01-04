import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createServerClient()
  const user = (await supabase.auth.getUser()).data.user

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get families for this user
  const { data, error } = await supabase
    .from('family_users')
    .select(`
      family_id,
      role,
      families (*)
    `)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching families:', error)
    return NextResponse.json({ error: 'Failed to fetch families' }, { status: 500 })
  }

  const families = (data || []).map((item: any) => item.families).filter(Boolean)

  return NextResponse.json({ families })
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const user = (await supabase.auth.getUser()).data.user

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, currency } = body

  if (!name || !currency) {
    return NextResponse.json({ error: 'Name and currency are required' }, { status: 400 })
  }

  // Create family
  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({
      name,
      currency,
    })
    .select()
    .single()

  if (familyError || !family) {
    console.error('Error creating family:', familyError)
    return NextResponse.json({ error: 'Failed to create family' }, { status: 500 })
  }

  // Add user as owner
  const { error: userError } = await supabase
    .from('family_users')
    .insert({
      family_id: family.id,
      user_id: user.id,
      role: 'owner',
    })

  if (userError) {
    console.error('Error adding user to family:', userError)
    return NextResponse.json({ error: 'Failed to add user to family' }, { status: 500 })
  }

  return NextResponse.json({ family })
}

