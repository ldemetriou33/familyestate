#!/usr/bin/env node

/**
 * Vercel Environment Variables Setup
 * This creates a file with curl commands you can run to set Vercel env vars
 * OR provides the exact values to copy/paste
 */

const fs = require('fs')
const path = require('path')

const envVars = {
  'NEXT_PUBLIC_SUPABASE_URL': 'https://ucuchjdexctdvwgafnaa.supabase.co',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdWNoamRleGN0ZHZ3Z2FmbmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzI2MDIsImV4cCI6MjA4Mjk0ODYwMn0.eU4yeBoJKWVr8poHykEYhrYIq5_uREfgGirmJy50c7g',
  'SUPABASE_SERVICE_ROLE_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdWNoamRleGN0ZHZ3Z2FmbmFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzM3MjYwMiwiZXhwIjoyMDgyOTQ4NjAyfQ.aPwTWveRh0V8_dAG0s-65np2Bmp360PqTq8buljJVJI',
  'ADMIN_EMAIL': 'ldemetriou33@gmail.com',
  'NEXT_PUBLIC_ADMIN_EMAIL': 'ldemetriou33@gmail.com',
}

const environments = ['production', 'preview', 'development']

console.log('🔧 Vercel Environment Variables Setup\n')
console.log('Since Vercel requires authentication, here are your options:\n')

console.log('OPTION 1: Manual Setup (Easiest - 5 minutes)')
console.log('='.repeat(60))
console.log('Go to: https://vercel.com/leos-projects-48833722/familyestate/settings/environment-variables\n')

Object.entries(envVars).forEach(([key, value]) => {
  console.log(`Variable: ${key}`)
  console.log(`Value: ${value}`)
  console.log(`Environments: Production, Preview, Development`)
  console.log('---\n')
})

console.log('\nOPTION 2: Vercel CLI (If you have it installed)')
console.log('='.repeat(60))
console.log('Run these commands:\n')

Object.entries(envVars).forEach(([key, value]) => {
  environments.forEach(env => {
    console.log(`vercel env add ${key} ${env} <<< "${value}"`)
  })
  console.log('')
})

console.log('\nOPTION 3: Copy/Paste Script')
console.log('='.repeat(60))
console.log('I\'ve created a file with all the commands. See: scripts/vercel-env-commands.sh\n')

// Create shell script
const scriptContent = `#!/bin/bash
# Vercel Environment Variables Setup
# Run this if you have Vercel CLI installed and authenticated

${Object.entries(envVars).map(([key, value]) => 
  environments.map(env => 
    `vercel env add ${key} ${env} <<< "${value}"`
  ).join('\n')
).join('\n\n')}

echo ""
echo "✅ All environment variables set!"
echo "Now redeploy: vercel --prod"
`

fs.writeFileSync(
  path.join(__dirname, 'vercel-env-commands.sh'),
  scriptContent
)

fs.chmodSync(path.join(__dirname, 'vercel-env-commands.sh'), '755')

console.log('✅ Created: scripts/vercel-env-commands.sh')
console.log('\n💡 RECOMMENDED: Use Option 1 (Manual Setup) - it\'s the fastest and most reliable!')

