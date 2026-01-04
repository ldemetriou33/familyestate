import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const user = (await supabase.auth.getUser()).data.user

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    family_id,
    asset_id,
    entity_id,
    creditor_name,
    principal,
    interest_rate,
    debt_type,
    is_compound,
    currency,
    maturity_date,
  } = body

  if (!family_id || !creditor_name || principal === undefined || !interest_rate || !debt_type || !currency) {
    return NextResponse.json(
      { error: 'family_id, creditor_name, principal, interest_rate, debt_type, and currency are required' },
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

  // Create debt
  const { data: debt, error: debtError } = await supabase
    .from('debts')
    .insert({
      family_id,
      asset_id: asset_id || null,
      entity_id: entity_id || null,
      creditor_name,
      principal,
      interest_rate,
      debt_type,
      is_compound: is_compound || false,
      currency,
      maturity_date: maturity_date || null,
    })
    .select()
    .single()

  if (debtError || !debt) {
    console.error('Error creating debt:', debtError)
    return NextResponse.json({ error: 'Failed to create debt' }, { status: 500 })
  }

  return NextResponse.json({ debt })
}

