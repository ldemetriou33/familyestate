'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/auth'
import type { ActionResult } from '@/lib/types'
import {
  calculateMonthlyPayment,
  calculateLTV,
  calculateRemainingBalance,
  calculateTotalInterest,
  stressTestRateChange,
  stressTestValuationChange,
} from '@/lib/mortgage-calculations'

// ============================================
// TYPES
// ============================================

export interface Mortgage {
  id: string
  property_id: string | null
  entity_id: string | null
  lender_name: string
  account_number: string | null
  reference_number: string | null
  original_loan_amount: number
  current_balance: number
  currency: string
  interest_rate: number
  structure: string
  base_rate: string | null
  margin: number | null
  start_date: string
  maturity_date: string | null
  term_years: number | null
  remaining_years: number | null
  monthly_payment: number | null
  payment_frequency: string
  next_payment_date: string | null
  penalty_free_date: string | null
  early_repayment_penalty: number | null
  penalty_percentage: number | null
  property_valuation: number | null
  valuation_date: string | null
  ltv_ratio: number | null
  max_ltv_allowed: number | null
  status: string
  security_type: string | null
  guarantor_entity_id: string | null
  mortgage_deed_url: string | null
  offer_letter_url: string | null
  valuation_report_url: string | null
  notes: string | null
  refinance_opportunity: boolean
  refinance_notes: string | null
  data_source: string
  created_at: string
  updated_at: string
}

export interface Debt {
  id: string
  entity_id: string | null
  property_id: string | null
  creditor_name: string
  account_number: string | null
  reference_number: string | null
  debt_type: string
  original_amount: number
  current_balance: number
  currency: string
  interest_rate: number | null
  structure: string | null
  base_rate: string | null
  margin: number | null
  start_date: string
  maturity_date: string | null
  term_years: number | null
  monthly_payment: number | null
  payment_frequency: string
  next_payment_date: string | null
  minimum_payment: number | null
  status: string
  secured_against: string | null
  guarantor_entity_id: string | null
  agreement_url: string | null
  notes: string | null
  data_source: string
  created_at: string
  updated_at: string
}

export interface Entity {
  id: string
  name: string
  type: string
  registration_number: string | null
  jurisdiction: string
  tax_id: string | null
  registered_address: string | null
  contact_email: string | null
  contact_phone: string | null
  legal_representative: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StressTestResult {
  scenario_name: string
  new_monthly_payment: number
  new_ltv: number | null
  debt_service_ratio: number | null
  can_service_debt: boolean
  months_until_default: number | null
  risk_level: string
  recommendation: string
}

// ============================================
// MORTGAGE CRUD
// ============================================

export async function getMortgages(): Promise<ActionResult<Mortgage[]>> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' }
    }

    const { data, error } = await supabaseAdmin
      .from('mortgages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Mortgage[] }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function getMortgage(id: string): Promise<ActionResult<Mortgage>> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' }
    }

    const { data, error } = await supabaseAdmin
      .from('mortgages')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Mortgage }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function createMortgage(formData: FormData): Promise<ActionResult<Mortgage>> {
  try {
    await requireAdmin()

    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' }
    }

    const mortgageData: Record<string, unknown> = {
      lender_name: formData.get('lender_name') as string,
      account_number: formData.get('account_number') as string | null,
      reference_number: formData.get('reference_number') as string | null,
      original_loan_amount: parseFloat(formData.get('original_loan_amount') as string),
      current_balance: parseFloat(formData.get('current_balance') as string),
      currency: formData.get('currency') || 'GBP',
      interest_rate: parseFloat(formData.get('interest_rate') as string),
      structure: formData.get('structure') || 'FIXED',
      base_rate: formData.get('base_rate') as string | null,
      margin: formData.get('margin') ? parseFloat(formData.get('margin') as string) : null,
      start_date: formData.get('start_date') as string,
      maturity_date: formData.get('maturity_date') as string | null,
      term_years: formData.get('term_years') ? parseInt(formData.get('term_years') as string) : null,
      payment_frequency: formData.get('payment_frequency') || 'MONTHLY',
      next_payment_date: formData.get('next_payment_date') as string | null,
      penalty_free_date: formData.get('penalty_free_date') as string | null,
      early_repayment_penalty: formData.get('early_repayment_penalty')
        ? parseFloat(formData.get('early_repayment_penalty') as string)
        : null,
      penalty_percentage: formData.get('penalty_percentage')
        ? parseFloat(formData.get('penalty_percentage') as string)
        : null,
      property_valuation: formData.get('property_valuation')
        ? parseFloat(formData.get('property_valuation') as string)
        : null,
      valuation_date: formData.get('valuation_date') as string | null,
      max_ltv_allowed: formData.get('max_ltv_allowed')
        ? parseFloat(formData.get('max_ltv_allowed') as string)
        : null,
      status: formData.get('status') || 'ACTIVE',
      security_type: formData.get('security_type') as string | null,
      mortgage_deed_url: formData.get('mortgage_deed_url') as string | null,
      offer_letter_url: formData.get('offer_letter_url') as string | null,
      valuation_report_url: formData.get('valuation_report_url') as string | null,
      notes: formData.get('notes') as string | null,
      property_id: formData.get('property_id') as string | null,
      entity_id: formData.get('entity_id') as string | null,
      guarantor_entity_id: formData.get('guarantor_entity_id') as string | null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Calculate monthly payment if term is provided
    if (mortgageData.term_years && mortgageData.interest_rate) {
      mortgageData.monthly_payment = calculateMonthlyPayment(
        mortgageData.current_balance as number,
        mortgageData.interest_rate as number,
        mortgageData.term_years as number
      )
    }

    const { data, error } = await supabaseAdmin
      .from('mortgages')
      .insert(mortgageData)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/mortgages')
    revalidatePath('/admin/finance')
    return { success: true, data: data as Mortgage }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function updateMortgage(formData: FormData): Promise<ActionResult<Mortgage>> {
  try {
    await requireAdmin()

    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' }
    }

    const id = formData.get('id') as string
    if (!id) {
      return { success: false, error: 'Mortgage ID is required' }
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    // Build update object from form data
    const fields = [
      'lender_name',
      'account_number',
      'reference_number',
      'original_loan_amount',
      'current_balance',
      'currency',
      'interest_rate',
      'structure',
      'base_rate',
      'margin',
      'start_date',
      'maturity_date',
      'term_years',
      'payment_frequency',
      'next_payment_date',
      'penalty_free_date',
      'early_repayment_penalty',
      'penalty_percentage',
      'property_valuation',
      'valuation_date',
      'max_ltv_allowed',
      'status',
      'security_type',
      'mortgage_deed_url',
      'offer_letter_url',
      'valuation_report_url',
      'notes',
      'property_id',
      'entity_id',
      'guarantor_entity_id',
      'refinance_opportunity',
      'refinance_notes',
    ]

    for (const field of fields) {
      const value = formData.get(field)
      if (value !== null && value !== '') {
        if (['original_loan_amount', 'current_balance', 'interest_rate', 'margin', 'early_repayment_penalty', 'penalty_percentage', 'property_valuation', 'max_ltv_allowed'].includes(field)) {
          updateData[field] = parseFloat(value as string)
        } else if (['term_years'].includes(field)) {
          updateData[field] = parseInt(value as string)
        } else if (field === 'refinance_opportunity') {
          updateData[field] = value === 'true' || value === 'on'
        } else {
          updateData[field] = value
        }
      }
    }

    // Recalculate monthly payment if term/rate changed
    if (updateData.term_years && updateData.interest_rate && updateData.current_balance) {
      updateData.monthly_payment = calculateMonthlyPayment(
        updateData.current_balance as number,
        updateData.interest_rate as number,
        updateData.term_years as number
      )
    }

    const { data, error } = await supabaseAdmin
      .from('mortgages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/mortgages')
    revalidatePath('/admin/mortgages/[id]')
    revalidatePath('/admin/finance')
    return { success: true, data: data as Mortgage }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function deleteMortgage(id: string): Promise<ActionResult<null>> {
  try {
    await requireAdmin()

    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' }
    }

    const { error } = await supabaseAdmin.from('mortgages').delete().eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/mortgages')
    revalidatePath('/admin/finance')
    return { success: true, data: null }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================
// DEBT CRUD
// ============================================

export async function getDebts(): Promise<ActionResult<Debt[]>> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' }
    }

    const { data, error } = await supabaseAdmin
      .from('debts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Debt[] }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function getDebt(id: string): Promise<ActionResult<Debt>> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' }
    }

    const { data, error } = await supabaseAdmin
      .from('debts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Debt }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function createDebt(formData: FormData): Promise<ActionResult<Debt>> {
  try {
    await requireAdmin()

    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' }
    }

    const debtData: Record<string, unknown> = {
      creditor_name: formData.get('creditor_name') as string,
      account_number: formData.get('account_number') as string | null,
      reference_number: formData.get('reference_number') as string | null,
      debt_type: formData.get('debt_type') || 'OTHER',
      original_amount: parseFloat(formData.get('original_amount') as string),
      current_balance: parseFloat(formData.get('current_balance') as string),
      currency: formData.get('currency') || 'GBP',
      interest_rate: formData.get('interest_rate')
        ? parseFloat(formData.get('interest_rate') as string)
        : null,
      structure: formData.get('structure') as string | null,
      base_rate: formData.get('base_rate') as string | null,
      margin: formData.get('margin') ? parseFloat(formData.get('margin') as string) : null,
      start_date: formData.get('start_date') as string,
      maturity_date: formData.get('maturity_date') as string | null,
      term_years: formData.get('term_years') ? parseInt(formData.get('term_years') as string) : null,
      payment_frequency: formData.get('payment_frequency') || 'MONTHLY',
      next_payment_date: formData.get('next_payment_date') as string | null,
      minimum_payment: formData.get('minimum_payment')
        ? parseFloat(formData.get('minimum_payment') as string)
        : null,
      status: formData.get('status') || 'ACTIVE',
      secured_against: formData.get('secured_against') as string | null,
      agreement_url: formData.get('agreement_url') as string | null,
      notes: formData.get('notes') as string | null,
      property_id: formData.get('property_id') as string | null,
      entity_id: formData.get('entity_id') as string | null,
      guarantor_entity_id: formData.get('guarantor_entity_id') as string | null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Calculate monthly payment if term is provided
    if (debtData.term_years && debtData.interest_rate && debtData.current_balance) {
      debtData.monthly_payment = calculateMonthlyPayment(
        debtData.current_balance as number,
        debtData.interest_rate as number,
        debtData.term_years as number
      )
    }

    const { data, error } = await supabaseAdmin
      .from('debts')
      .insert(debtData)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/debts')
    revalidatePath('/admin/finance')
    return { success: true, data: data as Debt }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function updateDebt(formData: FormData): Promise<ActionResult<Debt>> {
  try {
    await requireAdmin()

    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' }
    }

    const id = formData.get('id') as string
    if (!id) {
      return { success: false, error: 'Debt ID is required' }
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    const fields = [
      'creditor_name',
      'account_number',
      'reference_number',
      'debt_type',
      'original_amount',
      'current_balance',
      'currency',
      'interest_rate',
      'structure',
      'base_rate',
      'margin',
      'start_date',
      'maturity_date',
      'term_years',
      'payment_frequency',
      'next_payment_date',
      'minimum_payment',
      'status',
      'secured_against',
      'agreement_url',
      'notes',
      'property_id',
      'entity_id',
      'guarantor_entity_id',
    ]

    for (const field of fields) {
      const value = formData.get(field)
      if (value !== null && value !== '') {
        if (
          [
            'original_amount',
            'current_balance',
            'interest_rate',
            'margin',
            'minimum_payment',
          ].includes(field)
        ) {
          updateData[field] = parseFloat(value as string)
        } else if (['term_years'].includes(field)) {
          updateData[field] = parseInt(value as string)
        } else {
          updateData[field] = value
        }
      }
    }

    // Recalculate monthly payment if term/rate changed
    if (updateData.term_years && updateData.interest_rate && updateData.current_balance) {
      updateData.monthly_payment = calculateMonthlyPayment(
        updateData.current_balance as number,
        updateData.interest_rate as number,
        updateData.term_years as number
      )
    }

    const { data, error } = await supabaseAdmin
      .from('debts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/debts')
    revalidatePath('/admin/debts/[id]')
    revalidatePath('/admin/finance')
    return { success: true, data: data as Debt }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function deleteDebt(id: string): Promise<ActionResult<null>> {
  try {
    await requireAdmin()

    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' }
    }

    const { error } = await supabaseAdmin.from('debts').delete().eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/debts')
    revalidatePath('/admin/finance')
    return { success: true, data: null }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================
// ENTITY CRUD
// ============================================

export async function getEntities(): Promise<ActionResult<Entity[]>> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' }
    }

    const { data, error } = await supabaseAdmin
      .from('entities')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Entity[] }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function getEntity(id: string): Promise<ActionResult<Entity>> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' }
    }

    const { data, error } = await supabaseAdmin
      .from('entities')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Entity }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function createEntity(formData: FormData): Promise<ActionResult<Entity>> {
  try {
    await requireAdmin()

    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' }
    }

    const entityData: Record<string, unknown> = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      registration_number: formData.get('registration_number') as string | null,
      jurisdiction: formData.get('jurisdiction') as string,
      tax_id: formData.get('tax_id') as string | null,
      registered_address: formData.get('registered_address') as string | null,
      contact_email: formData.get('contact_email') as string | null,
      contact_phone: formData.get('contact_phone') as string | null,
      legal_representative: formData.get('legal_representative') as string | null,
      notes: formData.get('notes') as string | null,
      is_active: formData.get('is_active') === 'true' || formData.get('is_active') === 'on',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('entities')
      .insert(entityData)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/entities')
    revalidatePath('/admin/finance')
    return { success: true, data: data as Entity }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function updateEntity(formData: FormData): Promise<ActionResult<Entity>> {
  try {
    await requireAdmin()

    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' }
    }

    const id = formData.get('id') as string
    if (!id) {
      return { success: false, error: 'Entity ID is required' }
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    const fields = [
      'name',
      'type',
      'registration_number',
      'jurisdiction',
      'tax_id',
      'registered_address',
      'contact_email',
      'contact_phone',
      'legal_representative',
      'notes',
      'is_active',
    ]

    for (const field of fields) {
      const value = formData.get(field)
      if (value !== null && value !== '') {
        if (field === 'is_active') {
          updateData[field] = value === 'true' || value === 'on'
        } else {
          updateData[field] = value
        }
      }
    }

    const { data, error } = await supabaseAdmin
      .from('entities')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/entities')
    revalidatePath('/admin/entities/[id]')
    revalidatePath('/admin/finance')
    return { success: true, data: data as Entity }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================
// STRESS TEST
// ============================================

export async function runStressTest(
  mortgageId: string,
  scenario: {
    name: string
    rateChange?: number
    valuationChange?: number
    incomeChange?: number
  }
): Promise<ActionResult<StressTestResult>> {
  try {
    await requireAdmin()

    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' }
    }

    // Get mortgage
    const { data: mortgage, error: mortgageError } = await supabaseAdmin
      .from('mortgages')
      .select('*')
      .eq('id', mortgageId)
      .single()

    if (mortgageError || !mortgage) {
      return { success: false, error: 'Mortgage not found' }
    }

    let newMonthlyPayment = mortgage.monthly_payment || 0
    let newLTV = mortgage.ltv_ratio
    let debtServiceRatio: number | null = null
    let canServiceDebt = true
    let monthsUntilDefault: number | null = null
    let riskLevel = 'LOW'
    let recommendation = ''

    // Calculate new payment if rate changed
    if (scenario.rateChange && mortgage.remaining_years) {
      const newRate = mortgage.interest_rate + scenario.rateChange
      const stressResult = stressTestRateChange(
        mortgage.current_balance,
        mortgage.interest_rate,
        newRate,
        mortgage.remaining_years
      )
      newMonthlyPayment = stressResult.newPayment
    }

    // Calculate new LTV if valuation changed
    if (scenario.valuationChange && mortgage.property_valuation) {
      const newValue = mortgage.property_valuation * (1 + scenario.valuationChange / 100)
      const ltvResult = stressTestValuationChange(
        mortgage.current_balance,
        mortgage.property_valuation,
        newValue
      )
      newLTV = ltvResult.newLTV
    }

    // Calculate debt service ratio (simplified - would need income data)
    // DSR = (Debt Payments / Income) * 100
    // For now, we'll estimate based on property income
    if (mortgage.property_id) {
      // Would fetch property income here
      // For now, assume 30% DSR threshold
      debtServiceRatio = 30 // Placeholder
    }

    // Risk assessment
    if (newLTV && newLTV > 80) {
      riskLevel = 'HIGH'
      recommendation = 'Consider reducing LTV through additional payments or refinancing'
    } else if (newLTV && newLTV > 70) {
      riskLevel = 'MEDIUM'
      recommendation = 'Monitor LTV closely. Consider partial repayment if possible.'
    } else if (newMonthlyPayment > (mortgage.monthly_payment || 0) * 1.2) {
      riskLevel = 'MEDIUM'
      recommendation = 'Payment increase significant. Review cash flow capacity.'
    }

    if (newLTV && newLTV > 90) {
      riskLevel = 'CRITICAL'
      canServiceDebt = false
      recommendation = 'URGENT: LTV exceeds safe threshold. Immediate action required.'
    }

    // Save stress test result
    const stressTestData = {
      mortgage_id: mortgageId,
      scenario_name: scenario.name,
      test_date: new Date().toISOString().split('T')[0],
      assumed_interest_rate: scenario.rateChange
        ? mortgage.interest_rate + scenario.rateChange
        : mortgage.interest_rate,
      assumed_property_value: scenario.valuationChange
        ? mortgage.property_valuation
          ? mortgage.property_valuation * (1 + scenario.valuationChange / 100)
          : null
        : mortgage.property_valuation,
      new_monthly_payment: newMonthlyPayment,
      new_ltv: newLTV,
      debt_service_ratio: debtServiceRatio,
      can_service_debt: canServiceDebt,
      months_until_default: monthsUntilDefault,
      risk_level: riskLevel,
      recommendation,
      created_at: new Date().toISOString(),
    }

    const { error: insertError } = await supabaseAdmin
      .from('debt_stress_tests')
      .insert(stressTestData)

    if (insertError) {
      console.error('Error saving stress test:', insertError)
    }

    return {
      success: true,
      data: {
        scenario_name: scenario.name,
        new_monthly_payment: newMonthlyPayment,
        new_ltv: newLTV,
        debt_service_ratio: debtServiceRatio,
        can_service_debt: canServiceDebt,
        months_until_default: monthsUntilDefault,
        risk_level: riskLevel,
        recommendation,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================
// PORTFOLIO METRICS
// ============================================

export async function getPortfolioMetrics(): Promise<
  ActionResult<{
    totalMortgages: number
    totalDebt: number
    totalMonthlyPayments: number
    averageLTV: number
    totalEntities: number
    byEntity: Array<{
      entity_id: string
      entity_name: string
      totalDebt: number
      totalMonthlyPayments: number
    }>
  }>
> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' }
    }

    // Get all mortgages
    const { data: mortgages, error: mortgagesError } = await supabaseAdmin
      .from('mortgages')
      .select('*')
      .eq('status', 'ACTIVE')

    if (mortgagesError) {
      return { success: false, error: mortgagesError.message }
    }

    // Get all debts
    const { data: debts, error: debtsError } = await supabaseAdmin
      .from('debts')
      .select('*')
      .eq('status', 'ACTIVE')

    if (debtsError) {
      return { success: false, error: debtsError.message }
    }

    // Get entities
    const { data: entities, error: entitiesError } = await supabaseAdmin
      .from('entities')
      .select('*')
      .eq('is_active', true)

    if (entitiesError) {
      return { success: false, error: entitiesError.message }
    }

    // Calculate totals
    const totalMortgages = mortgages?.length || 0
    const totalDebt =
      (mortgages?.reduce((sum, m) => sum + (m.current_balance || 0), 0) || 0) +
      (debts?.reduce((sum, d) => sum + (d.current_balance || 0), 0) || 0)
    const totalMonthlyPayments =
      (mortgages?.reduce((sum, m) => sum + (m.monthly_payment || 0), 0) || 0) +
      (debts?.reduce((sum, d) => sum + (d.monthly_payment || 0), 0) || 0)

    // Calculate average LTV
    const ltvMortgages = mortgages?.filter((m) => m.ltv_ratio !== null) || []
    const averageLTV =
      ltvMortgages.length > 0
        ? ltvMortgages.reduce((sum, m) => sum + (m.ltv_ratio || 0), 0) / ltvMortgages.length
        : 0

    // Group by entity
    const byEntity: Array<{
      entity_id: string
      entity_name: string
      totalDebt: number
      totalMonthlyPayments: number
    }> = []

    for (const entity of entities || []) {
      const entityMortgages =
        mortgages?.filter((m) => m.entity_id === entity.id) || []
      const entityDebts = debts?.filter((d) => d.entity_id === entity.id) || []

      const entityTotalDebt =
        entityMortgages.reduce((sum, m) => sum + (m.current_balance || 0), 0) +
        entityDebts.reduce((sum, d) => sum + (d.current_balance || 0), 0)

      const entityTotalPayments =
        entityMortgages.reduce((sum, m) => sum + (m.monthly_payment || 0), 0) +
        entityDebts.reduce((sum, d) => sum + (d.monthly_payment || 0), 0)

      if (entityTotalDebt > 0) {
        byEntity.push({
          entity_id: entity.id,
          entity_name: entity.name,
          totalDebt: entityTotalDebt,
          totalMonthlyPayments: entityTotalPayments,
        })
      }
    }

    return {
      success: true,
      data: {
        totalMortgages,
        totalDebt,
        totalMonthlyPayments,
        averageLTV: Math.round(averageLTV * 100) / 100,
        totalEntities: entities?.length || 0,
        byEntity,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

