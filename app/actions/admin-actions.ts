'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/auth'
import { 
  PropertyUpdateSchema, 
  UnitUpdateSchema, 
  UnitCreateSchema,
  ContentUpdateSchema 
} from '@/lib/validations'
import type { ActionResult, Property, Unit, ContentBlock, MortgageDetails } from '@/lib/types'
import { REVALIDATION_PATHS, PRICING } from '@/lib/constants'

// Helper to revalidate multiple paths
function revalidatePaths(paths: readonly string[]) {
  paths.forEach(path => revalidatePath(path))
}

/**
 * Update Property - Updates name, description, status, and mortgage info
 */
export async function updateProperty(formData: FormData): Promise<ActionResult<Property>> {
  try {
    await requireAdmin()

    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' }
    }

    const id = formData.get('id') as string
    if (!id) {
      return { success: false, error: 'Property ID is required' }
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    // Basic fields
    const name = formData.get('name') as string | null
    if (name) {
      updateData.name = name
      // Generate slug from name
      updateData.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 100) || 'untitled'
    }

    const description = formData.get('description')
    if (description !== null) updateData.description = description

    const status = formData.get('status')
    if (status) updateData.status = status

    const city = formData.get('city')
    if (city !== null) updateData.city = city

    const country = formData.get('country')
    if (country !== null) updateData.country = country

    const address = formData.get('address')
    if (address !== null) updateData.address = address

    const heroImageUrl = formData.get('hero_image_url')
    if (heroImageUrl !== null) updateData.hero_image_url = heroImageUrl

    // Mortgage details
    const mortgageLender = formData.get('mortgage_lender') as string | null
    const mortgageRate = formData.get('mortgage_rate') as string | null
    const mortgageBalance = formData.get('mortgage_balance') as string | null
    const mortgageMonthlyPayment = formData.get('mortgage_monthly_payment') as string | null
    const mortgageLoanType = formData.get('mortgage_loan_type') as string | null
    const mortgageTermYears = formData.get('mortgage_term_years') as string | null
    const mortgageStartDate = formData.get('mortgage_start_date') as string | null

    if (mortgageLender || mortgageRate || mortgageBalance || mortgageMonthlyPayment) {
      const mortgageDetails: MortgageDetails = {}
      if (mortgageLender) mortgageDetails.lender = mortgageLender
      if (mortgageRate) mortgageDetails.rate = mortgageRate
      if (mortgageBalance) mortgageDetails.balance = parseFloat(mortgageBalance)
      if (mortgageMonthlyPayment) mortgageDetails.monthly_payment = parseFloat(mortgageMonthlyPayment)
      if (mortgageLoanType) mortgageDetails.loan_type = mortgageLoanType
      if (mortgageTermYears) mortgageDetails.term_years = parseInt(mortgageTermYears)
      if (mortgageStartDate) mortgageDetails.start_date = mortgageStartDate
      updateData.mortgage_details = mortgageDetails
    }

    // Validate with Zod
    const validation = PropertyUpdateSchema.safeParse({ id, ...updateData })
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0]?.message || 'Validation failed' }
    }

    const { data, error } = await supabaseAdmin
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating property:', error)
      return { success: false, error: error.message }
    }

    revalidatePaths(REVALIDATION_PATHS.property)
    return { success: true, data: data as Property }
  } catch (error) {
    console.error('updateProperty error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Update Unit - Updates price, surge price, and event toggles
 */
export async function updateUnit(formData: FormData): Promise<ActionResult<Unit>> {
  try {
    await requireAdmin()

    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' }
    }

    const id = formData.get('id') as string
    if (!id) {
      return { success: false, error: 'Unit ID is required' }
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    const name = formData.get('name')
    if (name) updateData.name = name

    const basePrice = formData.get('base_price') as string | null
    if (basePrice) updateData.base_price = parseFloat(basePrice)

    const surgePrice = formData.get('surge_price') as string | null
    if (surgePrice !== null) {
      updateData.surge_price = surgePrice === '' ? null : parseFloat(surgePrice)
    }

    const isEventModeActive = formData.get('is_event_mode_active')
    if (isEventModeActive !== null) {
      updateData.is_event_mode_active = isEventModeActive === 'true' || isEventModeActive === 'on'
    }

    const amenities = formData.get('amenities') as string | null
    if (amenities) {
      try {
        updateData.amenities = JSON.parse(amenities)
      } catch {
        updateData.amenities = amenities.split(',').map(a => a.trim()).filter(Boolean)
      }
    }

    const images = formData.get('images') as string | null
    if (images) {
      try {
        updateData.images = JSON.parse(images)
      } catch {
        updateData.images = images.split(',').map(i => i.trim()).filter(Boolean)
      }
    }

    const capacity = formData.get('capacity') as string | null
    if (capacity) updateData.capacity = parseInt(capacity)

    const roomNumber = formData.get('room_number')
    if (roomNumber !== null) updateData.room_number = roomNumber

    const description = formData.get('description')
    if (description !== null) updateData.description = description

    const isAvailable = formData.get('is_available')
    if (isAvailable !== null) {
      updateData.is_available = isAvailable === 'true' || isAvailable === 'on'
    }

    const isPublished = formData.get('is_published')
    if (isPublished !== null) {
      updateData.is_published = isPublished === 'true' || isPublished === 'on'
    }

    // Validate with Zod
    const validation = UnitUpdateSchema.safeParse({ id, ...updateData })
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0]?.message || 'Validation failed' }
    }

    const { data, error } = await supabaseAdmin
      .from('units')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating unit:', error)
      return { success: false, error: error.message }
    }

    revalidatePaths(REVALIDATION_PATHS.unit)
    return { success: true, data: data as Unit }
  } catch (error) {
    console.error('updateUnit error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Create Unit - Adds new room to a property
 */
export async function createUnit(
  propertyId: string, 
  data: unknown
): Promise<ActionResult<Unit>> {
  try {
    await requireAdmin()

    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' }
    }

    // Validate input
    const validation = UnitCreateSchema.safeParse({ property_id: propertyId, ...data })
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0]?.message || 'Validation failed' }
    }

    const unitData = {
      ...validation.data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: newUnit, error } = await supabaseAdmin
      .from('units')
      .insert(unitData)
      .select()
      .single()

    if (error) {
      console.error('Error creating unit:', error)
      return { success: false, error: error.message }
    }

    revalidatePaths(REVALIDATION_PATHS.unit)
    return { success: true, data: newUnit as Unit }
  } catch (error) {
    console.error('createUnit error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Update Site Content - Edits website text blocks
 */
export async function updateSiteContent(
  key: string, 
  content: Record<string, unknown>
): Promise<ActionResult<ContentBlock>> {
  try {
    await requireAdmin()

    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' }
    }

    // Validate
    const validation = ContentUpdateSchema.safeParse({ section_key: key, content })
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0]?.message || 'Validation failed' }
    }

    const { data, error } = await supabaseAdmin
      .from('content_blocks')
      .upsert({
        section_key: key,
        content: content,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'section_key',
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating site content:', error)
      return { success: false, error: error.message }
    }

    revalidatePaths(REVALIDATION_PATHS.content)
    return { success: true, data: data as ContentBlock }
  } catch (error) {
    console.error('updateSiteContent error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Delete Unit
 */
export async function deleteUnit(id: string): Promise<ActionResult<null>> {
  try {
    await requireAdmin()

    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' }
    }

    const { error } = await supabaseAdmin
      .from('units')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting unit:', error)
      return { success: false, error: error.message }
    }

    revalidatePaths(REVALIDATION_PATHS.unit)
    return { success: true, data: null }
  } catch (error) {
    console.error('deleteUnit error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Toggle Event Mode (convenience action)
 */
export async function toggleEventMode(
  unitId: string, 
  enabled: boolean,
  surgeMultiplier: number = PRICING.DEFAULT_SURGE_MULTIPLIER
): Promise<ActionResult<Unit>> {
  try {
    await requireAdmin()

    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' }
    }

    // Get current unit to calculate surge price
    const { data: unit, error: fetchError } = await supabaseAdmin
      .from('units')
      .select('base_price')
      .eq('id', unitId)
      .single()

    if (fetchError || !unit) {
      return { success: false, error: 'Unit not found' }
    }

    const surgePrice = enabled ? unit.base_price * surgeMultiplier : null

    const { data, error } = await supabaseAdmin
      .from('units')
      .update({
        is_event_mode_active: enabled,
        surge_price: surgePrice,
        updated_at: new Date().toISOString(),
      })
      .eq('id', unitId)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePaths(REVALIDATION_PATHS.unit)
    return { success: true, data: data as Unit }
  } catch (error) {
    console.error('toggleEventMode error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
