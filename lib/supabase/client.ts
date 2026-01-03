// Supabase Client Configuration
// For use in client components (browser)

import { createBrowserClient } from '@supabase/ssr'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a browser client for client components
// Returns a mock client if env vars are missing (for build time)
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not set. Returning mock client.')
    // Return a mock client that won't crash
    return {
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: { message: 'Supabase not configured' } }),
        update: () => ({ data: null, error: { message: 'Supabase not configured' } }),
        delete: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      }),
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        signInWithOtp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      },
      storage: {
        from: () => ({
          upload: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
          remove: async () => ({ error: { message: 'Supabase not configured' } }),
        }),
      },
    } as any
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// For backward compatibility
export const supabase = createClient()

// Note: For server-side operations, use lib/supabase/server.ts instead

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

