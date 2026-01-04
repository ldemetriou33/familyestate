#!/usr/bin/env node

/**
 * Check what columns exist in the properties table
 */

const SUPABASE_URL = 'https://ucuchjdexctdvwgafnaa.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdWNoamRleGN0ZHZ3Z2FmbmFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzM3MjYwMiwiZXhwIjoyMDgyOTQ4NjAyfQ.aPwTWveRh0V8_dAG0s-65np2Bmp360PqTq8buljJVJI'

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_SERVICE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
}

async function checkTableStructure() {
  console.log('🔍 Checking properties table structure...\n')

  try {
    // Try to get a sample row to see what columns exist
    const response = await fetch(`${SUPABASE_URL}/rest/v1/properties?select=*&limit=1`, {
      method: 'GET',
      headers,
    })

    if (response.ok) {
      const data = await response.json()
      if (data && data.length > 0) {
        console.log('✅ Properties table exists')
        console.log('📋 Current columns:')
        Object.keys(data[0]).forEach(col => {
          console.log(`   - ${col}`)
        })
      } else {
        console.log('✅ Properties table exists but is empty')
        // Try to get column info another way
        console.log('\n💡 To see all columns, run this in Supabase SQL Editor:')
        console.log('   SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'properties\';')
      }
    } else {
      const error = await response.text()
      console.log('❌ Error:', error)
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }

  console.log('\n💡 If you see errors, the table might have a different structure.')
  console.log('   Run this SQL in Supabase to see all columns:')
  console.log('   SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'properties\' ORDER BY ordinal_position;')
}

checkTableStructure()

