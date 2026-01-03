// Admin Authentication - Restrict access to specific users
// Uses Clerk for now, can switch to Supabase Auth later

import { currentUser } from '@clerk/nextjs/server'

// Authorized admin emails
const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL || 'admin@abbeyos.com',
  // Add additional admin emails here
]

export async function isAdmin(): Promise<boolean> {
  try {
    const user = await currentUser()
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      return false
    }
    
    const userEmail = user.emailAddresses[0].emailAddress.toLowerCase()
    return ADMIN_EMAILS.some(email => email.toLowerCase() === userEmail)
  } catch {
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
  const user = await currentUser()
  if (!user) return null
  
  const userEmail = user.emailAddresses?.[0]?.emailAddress
  if (!userEmail) return null
  
  const admin = ADMIN_EMAILS.some(email => email.toLowerCase() === userEmail.toLowerCase())
  
  return {
    id: user.id,
    email: userEmail,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || userEmail,
    imageUrl: user.imageUrl,
    isAdmin: admin,
  }
}

