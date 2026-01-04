import { z } from 'zod'
import { PROPERTY_STATUS, UNIT_CATEGORY } from '@/lib/types'

export const MortgageDetailsSchema = z.object({
  lender: z.string().optional(),
  rate: z.string().optional(),
  balance: z.number().min(0).optional(),
  monthly_payment: z.number().min(0).optional(),
  loan_type: z.string().optional(),
  term_years: z.number().int().min(1).max(50).optional(),
  start_date: z.string().optional(),
}).optional()

export const PropertyUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  status: z.enum(PROPERTY_STATUS).optional(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  hero_image_url: z.string().url().optional().nullable(),
  mortgage_details: MortgageDetailsSchema,
})

export const UnitUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  base_price: z.number().min(0).optional(),
  surge_price: z.number().min(0).optional().nullable(),
  is_event_mode_active: z.boolean().optional(),
  amenities: z.array(z.string()).max(50).optional(),
  images: z.array(z.string().url()).max(10).optional(),
  capacity: z.number().int().min(1).max(100).optional(),
  room_number: z.string().max(50).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  is_available: z.boolean().optional(),
  is_published: z.boolean().optional(),
})

export const UnitCreateSchema = z.object({
  property_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  category: z.enum(UNIT_CATEGORY).default('Room'),
  base_price: z.number().min(0),
  surge_price: z.number().min(0).optional().nullable(),
  is_event_mode_active: z.boolean().default(false),
  amenities: z.array(z.string()).max(50).default([]),
  images: z.array(z.string().url()).max(10).default([]),
  capacity: z.number().int().min(1).max(100).default(2),
  room_number: z.string().max(50).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  is_available: z.boolean().default(true),
  is_published: z.boolean().default(true),
})

export const ContentUpdateSchema = z.object({
  section_key: z.string().min(1).max(100),
  content: z.record(z.any()),
  is_active: z.boolean().optional(),
})

