'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/server'
import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/auth'
import { z } from 'zod'

// ============================================
// VALIDATION SCHEMAS
// ============================================

const PropertyUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['Active', 'Maintenance', 'Sold', 'Development', 'Archived']).optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  hero_image_url: z.string().url().optional().nullable(),
  mortgage_details: z.object({
    lender: z.string().optional(),
    rate: z.string().optional(),
    balance: z.number().optional(),
    monthly_payment: z.number().optional(),
    loan_type: z.string().optional(),
    term_years: z.number().optional(),
    start_date: z.string().optional(),
  }).optional(),
})

const UnitUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  base_price: z.number().min(0).optional(),
  surge_price: z.number().min(0).optional().nullable(),
  is_event_mode_active: z.boolean().optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  capacity: z.number().min(1).optional(),
  room_number: z.string().optional(),
  description: z.string().optional(),
  is_available: z.boolean().optional(),
  is_published: z.boolean().optional(),
})

const UnitCreateSchema = z.object({
  property_id: z.string().uuid(),
  name: z.string().min(1),
  category: z.enum(['Room', 'Suite', 'Plot', 'Apartment', 'Villa']).default('Room'),
  base_price: z.number().min(0),
  surge_price: z.number().min(0).optional().nullable(),
  is_event_mode_active: z.boolean().default(false),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  capacity: z.number().min(1).default(2),
  room_number: z.string().optional(),
  description: z.string().optional(),
  is_available: z.boolean().default(true),
  is_published: z.boolean().default(true),
})

const SiteContentUpdateSchema = z.object({
  section_key: z.string().min(1),
  content: z.record(z.any()),
  is_active: z.boolean().optional(),
})

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Update Property - Updates name, description, status, and mortgage info
 */
export async function updateProperty(formData: FormData) {
  try {
    // Require admin authentication
    await requireAdmin()

    // Extract and validate data from FormData
    const rawData = {
      id: formData.get('id') as string,
      name: formData.get('name') as string | null,
      description: formData.get('description') as string | null,
      status: formData.get('status') as string | null,
      city: formData.get('city') as string | null,
      country: formData.get('country') as string | null,
      address: formData.get('address') as string | null,
      hero_image_url: formData.get('hero_image_url') as string | null,
      // Mortgage details
      mortgage_lender: formData.get('mortgage_lender') as string | null,
      mortgage_rate: formData.get('mortgage_rate') as string | null,
      mortgage_balance: formData.get('mortgage_balance') as string | null,
      mortgage_monthly_payment: formData.get('mortgage_monthly_payment') as string | null,
      mortgage_loan_type: formData.get('mortgage_loan_type') as string | null,
      mortgage_term_years: formData.get('mortgage_term_years') as string | null,
      mortgage_start_date: formData.get('mortgage_start_date') as string | null,
    }

    // Build mortgage_details JSONB object if any mortgage fields are provided
    let mortgage_details = null
    if (
      rawData.mortgage_lender ||
      rawData.mortgage_rate ||
      rawData.mortgage_balance ||
      rawData.mortgage_monthly_payment
    ) {
      mortgage_details = {}
      if (rawData.mortgage_lender) mortgage_details.lender = rawData.mortgage_lender
      if (rawData.mortgage_rate) mortgage_details.rate = rawData.mortgage_rate
      if (rawData.mortgage_balance) mortgage_details.balance = parseFloat(rawData.mortgage_balance)
      if (rawData.mortgage_monthly_payment) mortgage_details.monthly_payment = parseFloat(rawData.mortgage_monthly_payment)
      if (rawData.mortgage_loan_type) mortgage_details.loan_type = rawData.mortgage_loan_type
      if (rawData.mortgage_term_years) mortgage_details.term_years = parseInt(rawData.mortgage_term_years)
      if (rawData.mortgage_start_date) mortgage_details.start_date = rawData.mortgage_start_date
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (rawData.name) {
      updateData.name = rawData.name
      // Auto-generate slug from name
      updateData.slug = rawData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }
    if (rawData.description !== null) updateData.description = rawData.description
    if (rawData.status) updateData.status = rawData.status
    if (rawData.city !== null) updateData.city = rawData.city
    if (rawData.country !== null) updateData.country = rawData.country
    if (rawData.address !== null) updateData.address = rawData.address
    if (rawData.hero_image_url !== null) updateData.hero_image_url = rawData.hero_image_url
    if (mortgage_details !== null) updateData.mortgage_details = mortgage_details

    // Use admin client to bypass RLS
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured')
    }

    const { data, error } = await supabaseAdmin
      .from('properties')
      .update(updateData)
      .eq('id', rawData.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating property:', error)
      throw new Error(`Failed to update property: ${error.message}`)
    }

    // Revalidate paths
    revalidatePath('/admin')
    revalidatePath('/admin/properties')
    revalidatePath('/admin/properties/[id]', 'page')
    revalidatePath('/')

    return { success: true, data }
  } catch (error) {
    console.error('updateProperty error:', error)
    throw error
  }
}

/**
 * Update Unit - Updates price, surge price, and event toggles
 */
export async function updateUnit(formData: FormData) {
  try {
    await requireAdmin()

    const rawData = {
      id: formData.get('id') as string,
      name: formData.get('name') as string | null,
      base_price: formData.get('base_price') as string | null,
      surge_price: formData.get('surge_price') as string | null,
      is_event_mode_active: formData.get('is_event_mode_active') === 'true' || formData.get('is_event_mode_active') === 'on',
      amenities: formData.get('amenities') as string | null,
      images: formData.get('images') as string | null,
      capacity: formData.get('capacity') as string | null,
      room_number: formData.get('room_number') as string | null,
      description: formData.get('description') as string | null,
      is_available: formData.get('is_available') === 'true' || formData.get('is_available') === 'on',
      is_published: formData.get('is_published') === 'true' || formData.get('is_published') === 'on',
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (rawData.name) updateData.name = rawData.name
    if (rawData.base_price) updateData.base_price = parseFloat(rawData.base_price)
    if (rawData.surge_price !== null && rawData.surge_price !== '') {
      updateData.surge_price = parseFloat(rawData.surge_price)
    } else if (rawData.surge_price === '') {
      updateData.surge_price = null
    }
    if (rawData.is_event_mode_active !== undefined) {
      updateData.is_event_mode_active = rawData.is_event_mode_active
    }
    if (rawData.amenities) {
      try {
        updateData.amenities = JSON.parse(rawData.amenities)
      } catch {
        updateData.amenities = rawData.amenities.split(',').map(a => a.trim())
      }
    }
    if (rawData.images) {
      try {
        updateData.images = JSON.parse(rawData.images)
      } catch {
        updateData.images = rawData.images.split(',').map(i => i.trim())
      }
    }
    if (rawData.capacity) updateData.capacity = parseInt(rawData.capacity)
    if (rawData.room_number !== null) updateData.room_number = rawData.room_number
    if (rawData.description !== null) updateData.description = rawData.description
    if (rawData.is_available !== undefined) updateData.is_available = rawData.is_available
    if (rawData.is_published !== undefined) updateData.is_published = rawData.is_published

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured')
    }

    const { data, error } = await supabaseAdmin
      .from('units')
      .update(updateData)
      .eq('id', rawData.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating unit:', error)
      throw new Error(`Failed to update unit: ${error.message}`)
    }

    revalidatePath('/admin')
    revalidatePath('/admin/rooms')
    revalidatePath('/admin/rooms/[id]', 'page')
    revalidatePath('/')

    return { success: true, data }
  } catch (error) {
    console.error('updateUnit error:', error)
    throw error
  }
}

/**
 * Create Unit - Adds new room to a property
 */
export async function createUnit(propertyId: string, data: any) {
  try {
    await requireAdmin()

    const unitData = {
      property_id: propertyId,
      name: data.name || 'New Room',
      category: data.category || 'Room',
      base_price: parseFloat(data.base_price) || 0,
      surge_price: data.surge_price ? parseFloat(data.surge_price) : null,
      is_event_mode_active: data.is_event_mode_active || false,
      amenities: Array.isArray(data.amenities) ? data.amenities : [],
      images: Array.isArray(data.images) ? data.images : [],
      capacity: parseInt(data.capacity) || 2,
      room_number: data.room_number || null,
      description: data.description || null,
      is_available: data.is_available !== false,
      is_published: data.is_published !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured')
    }

    const { data: newUnit, error } = await supabaseAdmin
      .from('units')
      .insert(unitData)
      .select()
      .single()

    if (error) {
      console.error('Error creating unit:', error)
      throw new Error(`Failed to create unit: ${error.message}`)
    }

    revalidatePath('/admin')
    revalidatePath('/admin/rooms')
    revalidatePath('/admin/properties')
    revalidatePath('/')

    return { success: true, data: newUnit }
  } catch (error) {
    console.error('createUnit error:', error)
    throw error
  }
}

/**
 * Update Site Content - Edits website text blocks
 */
export async function updateSiteContent(key: string, content: any) {
  try {
    await requireAdmin()

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured')
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
      throw new Error(`Failed to update site content: ${error.message}`)
    }

    revalidatePath('/admin')
    revalidatePath('/admin/content')
    revalidatePath('/')

    return { success: true, data }
  } catch (error) {
    console.error('updateSiteContent error:', error)
    throw error
  }
}

