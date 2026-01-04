# Vercel Environment Variables - Manual Setup

Since we can't automatically set Vercel env vars, here are the exact values to add:

## Go to Vercel Dashboard

**URL**: https://vercel.com/leos-projects-48833722/familyestate/settings/environment-variables

## Add These 5 Variables

### 1. NEXT_PUBLIC_SUPABASE_URL
- **Value**: `https://ucuchjdexctdvwgafnaa.supabase.co`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdWNoamRleGN0ZHZ3Z2FmbmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzI2MDIsImV4cCI6MjA4Mjk0ODYwMn0.eU4yeBoJKWVr8poHykEYhrYIq5_uREfgGirmJy50c7g`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 3. SUPABASE_SERVICE_ROLE_KEY
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdWNoamRleGN0ZHZ3Z2FmbmFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzM3MjYwMiwiZXhwIjoyMDgyOTQ4NjAyfQ.aPwTWveRh0V8_dAG0s-65np2Bmp360PqTq8buljJVJI`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 4. ADMIN_EMAIL
- **Value**: `ldemetriou33@gmail.com`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 5. NEXT_PUBLIC_ADMIN_EMAIL
- **Value**: `ldemetriou33@gmail.com`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

## After Adding Variables

1. Click **"Save"** after each variable
2. Go to **Deployments** tab
3. Click **"..."** on the latest deployment
4. Click **"Redeploy"**
5. Wait 2-3 minutes for deployment to complete

## Verify Setup

1. Visit: `https://familyestate.vercel.app/admin`
2. You should be redirected to `/sign-in`
3. Sign in with: `ldemetriou33@gmail.com`
4. You should see the Admin Dashboard! 🎉

