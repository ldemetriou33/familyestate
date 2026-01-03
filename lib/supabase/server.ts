// Supabase Server Client (for Server Components & API Routes)
// Uses service role key for admin operations

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server client with service role (bypasses RLS) - only if service key exists
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

// Client for authenticated user operations (respects RLS)
export async function createServerClient() {
  try {
    const { createServerClient: createSupabaseClient } = await import('@supabase/ssr')
    const { cookies } = await import('next/headers')
    
    if (!supabaseUrl || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables not set. Returning mock client.')
      return createMockClient()
    }
    
    const cookieStore = await cookies()
    
    return createSupabaseClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie setting errors (e.g., in middleware)
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie removal errors
          }
        },
      },
    })
  } catch (error) {
    console.error('Failed to create Supabase server client:', error)
    return createMockClient()
  }
}

// Mock client that has all the methods to prevent crashes
function createMockClient() {
  const createQueryBuilder = () => {
    const builder = {
      select: () => builder,
      insert: () => builder,
      update: () => builder,
      delete: () => builder,
      eq: () => builder,
      neq: () => builder,
      gt: () => builder,
      gte: () => builder,
      lt: () => builder,
      lte: () => builder,
      like: () => builder,
      ilike: () => builder,
      is: () => builder,
      in: () => builder,
      contains: () => builder,
      containedBy: () => builder,
      rangeGt: () => builder,
      rangeGte: () => builder,
      rangeLt: () => builder,
      rangeLte: () => builder,
      rangeAdjacent: () => builder,
      overlaps: () => builder,
      textSearch: () => builder,
      match: () => builder,
      not: () => builder,
      or: () => builder,
      filter: () => builder,
      order: () => builder,
      limit: () => builder,
      range: () => builder,
      abortSignal: () => builder,
      single: () => builder,
      maybeSingle: () => builder,
      csv: () => builder,
      geojson: () => builder,
      explain: () => builder,
      rollback: () => builder,
      returns: () => builder,
      then: (resolve: any) => Promise.resolve({ data: [], error: null }).then(resolve),
      catch: (reject: any) => Promise.resolve({ data: [], error: null }).catch(reject),
    }
    return builder
  }

  return {
    from: () => createQueryBuilder(),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        remove: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  } as any
}

