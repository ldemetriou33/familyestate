// Supabase Auth Helpers
// Admin authentication using Supabase Auth
// Supports multiple admins via comma-separated ADMIN_EMAILS env variable

import { createServerClient } from './server'

// Support multiple admins via comma-separated list
// Falls back to single ADMIN_EMAIL for backward compatibility
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean)

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
  if (ADMIN_EMAILS.length === 0) {
    console.warn('No admin emails configured. Set ADMIN_EMAILS or ADMIN_EMAIL env variable.')
    return false
  }

  try {
    const user = await getCurrentUser()
    if (!user?.email) {
      return false
    }
    
    return ADMIN_EMAILS.includes(user.email.toLowerCase())
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function requireAdmin(): Promise<true> {
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

