/**
 * Family/Estate Management for Multi-Tenant SaaS
 */

import { createServerClient } from '@/lib/supabase/server'
import type { Family, FamilyUser, EstatePortfolio } from '@/lib/types/saas'

/**
 * Get all families for the current user
 */
export async function getUserFamilies(): Promise<Family[]> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('family_users')
    .select(`
      family_id,
      role,
      families (*)
    `)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)

  if (error) {
    console.error('Error fetching user families:', error)
    return []
  }

  return (data || []).map((item: any) => item.families).filter(Boolean)
}

/**
 * Get current user's active family (from session or first family)
 */
export async function getActiveFamily(): Promise<Family | null> {
  const supabase = await createServerClient()
  const user = (await supabase.auth.getUser()).data.user

  if (!user) return null

  const families = await getUserFamilies()
  return families[0] || null
}

/**
 * Get complete estate portfolio for a family
 */
export async function getEstatePortfolio(familyId: string): Promise<EstatePortfolio | null> {
  const supabase = await createServerClient()

  // Fetch family
  const { data: family, error: familyError } = await supabase
    .from('families')
    .select('*')
    .eq('id', familyId)
    .single()

  if (familyError || !family) {
    console.error('Error fetching family:', familyError)
    return null
  }

  // Fetch entities
  const { data: entities, error: entitiesError } = await supabase
    .from('entities')
    .select('*')
    .eq('family_id', familyId)
    .order('name')

  if (entitiesError) {
    console.error('Error fetching entities:', entitiesError)
  }

  // Fetch assets
  const { data: assets, error: assetsError } = await supabase
    .from('assets')
    .select('*')
    .eq('family_id', familyId)
    .order('name')

  if (assetsError) {
    console.error('Error fetching assets:', assetsError)
  }

  // Fetch debts
  const { data: debts, error: debtsError } = await supabase
    .from('debts')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at')

  if (debtsError) {
    console.error('Error fetching debts:', debtsError)
  }

  // Calculate totals (convert all to base currency)
  const totals = calculateEstateTotals(
    assets || [],
    debts || [],
    family.currency
  )

  return {
    family,
    entities: entities || [],
    assets: assets || [],
    debts: debts || [],
    totals,
  }
}

/**
 * Calculate estate totals from assets and debts
 */
function calculateEstateTotals(
  assets: any[],
  debts: any[],
  baseCurrency: string
): {
  totalGrossValue: number
  totalDebt: number
  principalEquity: number
  minorityEquity: number
} {
  // Currency conversion rates (simplified - in production, use real-time rates)
  const rates: Record<string, Record<string, number>> = {
    GBP: { USD: 1.27, EUR: 1.17 },
    USD: { GBP: 0.79, EUR: 0.92 },
    EUR: { GBP: 0.85, USD: 1.09 },
  }

  const convertCurrency = (amount: number, from: string, to: string): number => {
    if (from === to) return amount
    return amount * (rates[from]?.[to] || 1)
  }

  let totalGrossValue = 0
  let totalDebt = 0
  let principalEquity = 0
  let minorityEquity = 0

  // Calculate from assets
  for (const asset of assets) {
    const valueInBase = convertCurrency(asset.valuation, asset.currency, baseCurrency)
    totalGrossValue += valueInBase

    // Find debt for this asset
    const assetDebt = debts.find((d) => d.asset_id === asset.id)
    const debtAmount = assetDebt
      ? convertCurrency(assetDebt.principal, assetDebt.currency, baseCurrency)
      : 0
    totalDebt += debtAmount

    const netValue = valueInBase - debtAmount
    principalEquity += (netValue * asset.principal_ownership) / 100
    minorityEquity += (netValue * asset.minority_ownership) / 100
  }

  // Add standalone debts (not linked to assets)
  for (const debt of debts) {
    if (!debt.asset_id) {
      const debtAmount = convertCurrency(debt.principal, debt.currency, baseCurrency)
      totalDebt += debtAmount
    }
  }

  return {
    totalGrossValue,
    totalDebt,
    principalEquity,
    minorityEquity,
  }
}

/**
 * Create a new family
 */
export async function createFamily(data: {
  name: string
  currency: 'USD' | 'GBP' | 'EUR'
}): Promise<Family | null> {
  const supabase = await createServerClient()
  const user = (await supabase.auth.getUser()).data.user

  if (!user) return null

  // Create family
  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({
      name: data.name,
      currency: data.currency,
    })
    .select()
    .single()

  if (familyError || !family) {
    console.error('Error creating family:', familyError)
    return null
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
  }

  return family
}

