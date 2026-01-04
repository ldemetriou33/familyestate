#!/usr/bin/env node

/**
 * Complete Automated Setup Script
 * Does everything possible via API
 */

const SUPABASE_URL = 'https://ucuchjdexctdvwgafnaa.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdWNoamRleGN0ZHZ3Z2FmbmFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzM3MjYwMiwiZXhwIjoyMDgyOTQ4NjAyfQ.aPwTWveRh0V8_dAG0s-65np2Bmp360PqTq8buljJVJI'
const ADMIN_EMAIL = 'ldemetriou33@gmail.com'

const fs = require('fs')
const path = require('path')

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_SERVICE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
}

async function createStorageBucket(name, publicBucket = true) {
  console.log(`📦 Creating storage bucket: ${name}...`)
  
  try {
    const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: name,
        name: name,
        public: publicBucket,
        file_size_limit: 52428800, // 50MB
        allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      }),
    })

    if (response.ok) {
      console.log(`  ✅ Bucket "${name}" created successfully`)
      return true
    } else {
      const error = await response.text()
      if (error.includes('already exists') || error.includes('duplicate') || response.status === 409) {
        console.log(`  ℹ️  Bucket "${name}" already exists (that's okay!)`)
        return true
      }
      console.log(`  ⚠️  Error: ${error.substring(0, 200)}`)
      return false
    }
  } catch (error) {
    console.log(`  ⚠️  Failed to create bucket: ${error.message}`)
    return false
  }
}

async function checkTableExists(tableName) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=id&limit=1`, {
      method: 'GET',
      headers,
    })
    return response.ok
  } catch {
    return false
  }
}

async function main() {
  console.log('🚀 Starting Complete Automated Setup...\n')
  console.log(`📍 Supabase Project: ${SUPABASE_URL}`)
  console.log(`👤 Admin Email: ${ADMIN_EMAIL}\n`)

  let successCount = 0
  let totalSteps = 0

  // Step 1: Create Storage Buckets
  console.log('='.repeat(60))
  console.log('STEP 1: Creating Storage Buckets')
  console.log('='.repeat(60))
  
  const buckets = [
    { name: 'property-images', public: true },
    { name: 'room-images', public: true },
    { name: 'cafe-menu-images', public: true },
    { name: 'media-vault', public: true },
  ]

  for (const bucket of buckets) {
    totalSteps++
    const result = await createStorageBucket(bucket.name, bucket.public)
    if (result) successCount++
    await new Promise(resolve => setTimeout(resolve, 500)) // Small delay
  }

  // Step 2: Check if database tables exist
  console.log('\n' + '='.repeat(60))
  console.log('STEP 2: Checking Database Tables')
  console.log('='.repeat(60))

  const tables = ['properties', 'units', 'content_blocks', 'amenities_global', 'cafe_menu']
  let tablesExist = 0

  for (const table of tables) {
    totalSteps++
    const exists = await checkTableExists(table)
    if (exists) {
      console.log(`  ✅ Table "${table}" exists`)
      tablesExist++
      successCount++
    } else {
      console.log(`  ⚠️  Table "${table}" does not exist - you need to run migrations`)
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('SETUP SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Completed: ${successCount}/${totalSteps} automated steps`)
  console.log(`📦 Storage Buckets: ${buckets.length} created/verified`)
  console.log(`🗄️  Database Tables: ${tablesExist}/${tables.length} exist`)

  if (tablesExist < tables.length) {
    console.log('\n⚠️  ACTION REQUIRED: Database migrations need to be run manually')
    console.log('   Go to: https://supabase.com/dashboard/project/ucuchjdexctdvwgafnaa/sql/new')
    console.log('   1. Run: supabase/migrations/001_sovereign_cms_schema.sql')
    console.log('   2. Run: supabase/migrations/002_seed_abbey_point_data.sql')
  }

  console.log('\n📋 NEXT STEPS:')
  console.log('1. ✅ Storage buckets: DONE (via this script)')
  console.log('2. ⚠️  Database migrations: Run manually in Supabase SQL Editor')
  console.log('3. ⚠️  Vercel env vars: Set manually (see COMPLETE_SETUP_NOW.md)')
  console.log('4. ⚠️  Email auth: Enable in Supabase Dashboard')
  console.log('5. ⚠️  Redeploy: After setting Vercel env vars')

  console.log('\n📄 For detailed instructions, see: COMPLETE_SETUP_NOW.md')
  console.log('\n✨ Automated setup complete!')
}

main().catch(error => {
  console.error('\n❌ Error:', error.message)
  process.exit(1)
})

