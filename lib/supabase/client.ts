// Supabase Client Configuration
// For use in both server and client components

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client for interacting with your database
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// For server-side operations with elevated privileges
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createSupabaseClient(supabaseUrl, serviceRoleKey)
}

// Storage helper functions
export const STORAGE_BUCKETS = {
  PROPERTY_IMAGES: 'property-images',
  ROOM_IMAGES: 'room-images',
  DOCUMENTS: 'documents',
} as const

export async function uploadImage(
  bucket: keyof typeof STORAGE_BUCKETS,
  file: File,
  path: string
): Promise<{ url: string; path: string } | { error: string }> {
  const bucketName = STORAGE_BUCKETS[bucket]
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) {
    console.error('Upload error:', error)
    return { error: error.message }
  }

  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path)

  return {
    url: urlData.publicUrl,
    path: data.path,
  }
}

export async function deleteImage(bucket: keyof typeof STORAGE_BUCKETS, path: string) {
  const bucketName = STORAGE_BUCKETS[bucket]
  
  const { error } = await supabase.storage
    .from(bucketName)
    .remove([path])

  if (error) {
    console.error('Delete error:', error)
    return { error: error.message }
  }

  return { success: true }
}

export function getImageUrl(bucket: keyof typeof STORAGE_BUCKETS, path: string): string {
  const bucketName = STORAGE_BUCKETS[bucket]
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path)
  return data.publicUrl
}

