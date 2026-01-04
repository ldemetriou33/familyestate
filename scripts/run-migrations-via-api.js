#!/usr/bin/env node

/**
 * Attempt to run migrations via Supabase Management API
 * This uses the service role key to execute SQL
 */

const SUPABASE_URL = 'https://ucuchjdexctdvwgafnaa.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdWNoamRleGN0ZHZ3Z2FmbmFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzM3MjYwMiwiZXhwIjoyMDgyOTQ4NjAyfQ.aPwTWveRh0V8_dAG0s-65np2Bmp360PqTq8buljJVJI'

const fs = require('fs')
const path = require('path')

async function executeSQL(sql) {
  // Try using PostgREST with service role
  // Note: This may not work for DDL statements, but worth trying
  
  // Alternative: Use Supabase Management API if available
  // For now, we'll try the REST API approach
  
  try {
    // Try to execute via REST API (this won't work for DDL, but let's try)
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    })

    if (response.ok) {
      return { success: true, data: await response.json() }
    } else {
      const error = await response.text()
      return { success: false, error }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function runMigration(filePath) {
  console.log(`\n📄 Processing: ${path.basename(filePath)}`)
  
  if (!fs.existsSync(filePath)) {
    console.log(`  ❌ File not found: ${filePath}`)
    return false
  }

  const sql = fs.readFileSync(filePath, 'utf8')
  console.log(`  📝 File size: ${sql.length} characters`)
  console.log(`  ⚠️  Supabase doesn't allow SQL execution via REST API for security`)
  console.log(`  💡 You need to run this manually in the SQL Editor`)
  
  // Create a formatted version for easy copy-paste
  const outputFile = filePath.replace('.sql', '-READY-TO-PASTE.sql')
  fs.writeFileSync(outputFile, sql)
  console.log(`  ✅ Created ready-to-paste file: ${outputFile}`)
  
  return true
}

async function main() {
  console.log('🚀 Preparing Migration Files for Easy Copy-Paste\n')

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
  
  const migration1 = path.join(migrationsDir, '001_sovereign_cms_schema.sql')
  const migration2 = path.join(migrationsDir, '002_seed_abbey_point_data.sql')

  console.log('='.repeat(60))
  console.log('STEP 1: Schema Migration')
  console.log('='.repeat(60))
  await runMigration(migration1)

  console.log('\n' + '='.repeat(60))
  console.log('STEP 2: Seed Data Migration')
  console.log('='.repeat(60))
  await runMigration(migration2)

  console.log('\n' + '='.repeat(60))
  console.log('NEXT STEPS')
  console.log('='.repeat(60))
  console.log('1. Go to: https://supabase.com/dashboard/project/ucuchjdexctdvwgafnaa/sql/new')
  console.log('2. Open: supabase/migrations/001_sovereign_cms_schema.sql')
  console.log('3. Copy ALL contents and paste into SQL Editor')
  console.log('4. Click "Run" (or Cmd/Ctrl + Enter)')
  console.log('5. Wait for ✅ Success')
  console.log('6. Click "New query"')
  console.log('7. Open: supabase/migrations/002_seed_abbey_point_data.sql')
  console.log('8. Copy ALL contents and paste into SQL Editor')
  console.log('9. Click "Run"')
  console.log('10. Wait for ✅ Success')
  console.log('\n✨ Done!')
}

main().catch(error => {
  console.error('\n❌ Error:', error.message)
  process.exit(1)
})

