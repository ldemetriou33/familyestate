// Supabase Auth Helpers
// Admin authentication using Supabase Auth

import { createServerClient } from './server'
import { cookies } from 'next/headers'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL

export async function getCurrentUser() {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function isAdmin(): Promise<boolean> {
  if (!ADMIN_EMAIL) {
    console.warn('ADMIN_EMAIL not set in environment variables')
    return false
  }

  try {
    const user = await getCurrentUser()
    if (!user?.email) {
      return false
    }
    
    return user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function requireAdmin() {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized: Admin access required')
  }
  return true
}

export async function getAdminUser() {
  const user = await getCurrentUser()
  if (!user) return null
  
  const admin = await isAdmin()
  if (!admin) return null
  
  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name || user.email,
    imageUrl: user.user_metadata?.avatar_url,
    isAdmin: true,
  }
}

