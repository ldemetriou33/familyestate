#!/bin/bash
# Vercel Environment Variables Setup
# Run this if you have Vercel CLI installed and authenticated

vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://ucuchjdexctdvwgafnaa.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_URL preview <<< "https://ucuchjdexctdvwgafnaa.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_URL development <<< "https://ucuchjdexctdvwgafnaa.supabase.co"

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdWNoamRleGN0ZHZ3Z2FmbmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzI2MDIsImV4cCI6MjA4Mjk0ODYwMn0.eU4yeBoJKWVr8poHykEYhrYIq5_uREfgGirmJy50c7g"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdWNoamRleGN0ZHZ3Z2FmbmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzI2MDIsImV4cCI6MjA4Mjk0ODYwMn0.eU4yeBoJKWVr8poHykEYhrYIq5_uREfgGirmJy50c7g"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdWNoamRleGN0ZHZ3Z2FmbmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzI2MDIsImV4cCI6MjA4Mjk0ODYwMn0.eU4yeBoJKWVr8poHykEYhrYIq5_uREfgGirmJy50c7g"

vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdWNoamRleGN0ZHZ3Z2FmbmFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzM3MjYwMiwiZXhwIjoyMDgyOTQ4NjAyfQ.aPwTWveRh0V8_dAG0s-65np2Bmp360PqTq8buljJVJI"
vercel env add SUPABASE_SERVICE_ROLE_KEY preview <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdWNoamRleGN0ZHZ3Z2FmbmFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzM3MjYwMiwiZXhwIjoyMDgyOTQ4NjAyfQ.aPwTWveRh0V8_dAG0s-65np2Bmp360PqTq8buljJVJI"
vercel env add SUPABASE_SERVICE_ROLE_KEY development <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdWNoamRleGN0ZHZ3Z2FmbmFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzM3MjYwMiwiZXhwIjoyMDgyOTQ4NjAyfQ.aPwTWveRh0V8_dAG0s-65np2Bmp360PqTq8buljJVJI"

vercel env add ADMIN_EMAIL production <<< "ldemetriou33@gmail.com"
vercel env add ADMIN_EMAIL preview <<< "ldemetriou33@gmail.com"
vercel env add ADMIN_EMAIL development <<< "ldemetriou33@gmail.com"

vercel env add NEXT_PUBLIC_ADMIN_EMAIL production <<< "ldemetriou33@gmail.com"
vercel env add NEXT_PUBLIC_ADMIN_EMAIL preview <<< "ldemetriou33@gmail.com"
vercel env add NEXT_PUBLIC_ADMIN_EMAIL development <<< "ldemetriou33@gmail.com"

echo ""
echo "✅ All environment variables set!"
echo "Now redeploy: vercel --prod"
