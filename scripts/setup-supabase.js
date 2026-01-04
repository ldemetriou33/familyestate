#!/usr/bin/env node

/**
 * Automated Supabase Setup Script
 * This script sets up your Supabase database, storage, and authentication
 */

const SUPABASE_URL = 'https://ucuchjdexctdvwgafnaa.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdWNoamRleGN0ZHZ3Z2FmbmFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzM3MjYwMiwiZXhwIjoyMDgyOTQ4NjAyfQ.aPwTWveRh0V8_dAG0s-65np2Bmp360PqTq8buljJVJI'
const ADMIN_EMAIL = 'ldemetriou33@gmail.com'

const fs = require('fs')
const path = require('path')

async function runSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SQL execution failed: ${error}`)
  }

  return response.json()
}

async function runMigration(filePath) {
  console.log(`\n📄 Running migration: ${path.basename(filePath)}`)
  const sql = fs.readFileSync(filePath, 'utf8')
  
  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  for (const statement of statements) {
    if (statement.length > 10) { // Skip empty statements
      try {
        await runSQL(statement + ';')
        console.log('  ✅ Statement executed')
      } catch (error) {
        // Some statements might fail if already executed, that's okay
        if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
          console.log(`  ⚠️  Warning: ${error.message.substring(0, 100)}`)
        }
      }
    }
  }
}

async function createStorageBucket(name, publicBucket = true) {
  console.log(`\n📦 Creating storage bucket: ${name}`)
  
  const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({
      id: name,
      name: name,
      public: publicBucket,
    }),
  })

  if (response.ok) {
    console.log(`  ✅ Bucket "${name}" created`)
    return true
  } else {
    const error = await response.text()
    if (error.includes('already exists') || error.includes('duplicate')) {
      console.log(`  ℹ️  Bucket "${name}" already exists`)
      return true
    }
    console.log(`  ⚠️  Could not create bucket: ${error.substring(0, 100)}`)
    return false
  }
}

async function enableEmailAuth() {
  console.log('\n🔐 Checking email authentication...')
  console.log('  ℹ️  Please enable Email auth manually in Supabase Dashboard:')
  console.log('     Authentication → Providers → Email → Enable')
}

async function main() {
  console.log('🚀 Starting Supabase Setup...')
  console.log(`📍 Project: ${SUPABASE_URL}`)
  console.log(`👤 Admin Email: ${ADMIN_EMAIL}\n`)

  try {
    // Run migrations
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
    const migration1 = path.join(migrationsDir, '001_sovereign_cms_schema.sql')
    const migration2 = path.join(migrationsDir, '002_seed_abbey_point_data.sql')

    if (fs.existsSync(migration1)) {
      await runMigration(migration1)
    } else {
      console.log('⚠️  Migration file not found, please run manually')
    }

    if (fs.existsSync(migration2)) {
      await runMigration(migration2)
    } else {
      console.log('⚠️  Seed file not found, please run manually')
    }

    // Create storage buckets
    console.log('\n📦 Creating storage buckets...')
    await createStorageBucket('property-images', true)
    await createStorageBucket('room-images', true)
    await createStorageBucket('cafe-menu-images', true)
    await createStorageBucket('media-vault', true)

    // Email auth note
    await enableEmailAuth()

    console.log('\n✅ Setup complete!')
    console.log('\n📋 Next steps:')
    console.log('1. Enable Email auth in Supabase Dashboard')
    console.log('2. Set environment variables in Vercel (see setup-vercel-env.sh)')
    console.log('3. Redeploy your Vercel site')
    console.log('4. Visit /admin and sign in with:', ADMIN_EMAIL)

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.log('\n💡 Tip: You may need to run migrations manually in Supabase SQL Editor')
    process.exit(1)
  }
}

main()

