# 🚀 Complete Setup - Do This Now

I've prepared everything for you. Follow these steps in order:

## ✅ Step 1: Run Database Migrations (5 minutes)

### Migration 1: Schema
1. **Click this link**: https://supabase.com/dashboard/project/ucuchjdexctdvwgafnaa/sql/new
2. Open `supabase/migrations/001_sovereign_cms_schema.sql` from your project
3. **Copy the entire file** (all 275 lines)
4. **Paste into the SQL Editor**
5. Click **"Run"** (or press Cmd/Ctrl + Enter)
6. Wait for ✅ "Success. No rows returned"

### Migration 2: Seed Data
1. In the same SQL Editor, click **"New query"**
2. Open `supabase/migrations/002_seed_abbey_point_data.sql`
3. **Copy the entire file** (all 324 lines)
4. **Paste into the SQL Editor**
5. Click **"Run"**
6. Wait for ✅ Success

## ✅ Step 2: Create Storage Buckets (2 minutes)

1. **Click this link**: https://supabase.com/dashboard/project/ucuchjdexctdvwgafnaa/storage/buckets
2. Click **"New bucket"** and create these 4 buckets:

   **Bucket 1:**
   - Name: `property-images`
   - ✅ Check "Public bucket"
   - Click **"Create bucket"**

   **Bucket 2:**
   - Name: `room-images`
   - ✅ Check "Public bucket"
   - Click **"Create bucket"**

   **Bucket 3:**
   - Name: `cafe-menu-images`
   - ✅ Check "Public bucket"
   - Click **"Create bucket"**

   **Bucket 4:**
   - Name: `media-vault`
   - ✅ Check "Public bucket"
   - Click **"Create bucket"**

## ✅ Step 3: Enable Email Authentication (1 minute)

1. **Click this link**: https://supabase.com/dashboard/project/ucuchjdexctdvwgafnaa/auth/providers
2. Find **"Email"** in the list
3. Make sure the toggle is **ON** ✅
4. (Optional) Configure email templates if you want

## ✅ Step 4: Set Vercel Environment Variables (5 minutes)

1. **Click this link**: https://vercel.com/leos-projects-48833722/familyestate/settings/environment-variables

2. Add these 5 variables (one at a time):

   **Variable 1:**
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://ucuchjdexctdvwgafnaa.supabase.co`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

   **Variable 2:**
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdWNoamRleGN0ZHZ3Z2FmbmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzI2MDIsImV4cCI6MjA4Mjk0ODYwMn0.eU4yeBoJKWVr8poHykEYhrYIq5_uREfgGirmJy50c7g`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

   **Variable 3:**
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdWNoamRleGN0ZHZ3Z2FmbmFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzM3MjYwMiwiZXhwIjoyMDgyOTQ4NjAyfQ.aPwTWveRh0V8_dAG0s-65np2Bmp360PqTq8buljJVJI`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

   **Variable 4:**
   - Key: `ADMIN_EMAIL`
   - Value: `ldemetriou33@gmail.com`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

   **Variable 5:**
   - Key: `NEXT_PUBLIC_ADMIN_EMAIL`
   - Value: `ldemetriou33@gmail.com`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

## ✅ Step 5: Redeploy Vercel (2 minutes)

1. **Click this link**: https://vercel.com/leos-projects-48833722/familyestate/deployments
2. Find the latest deployment
3. Click the **"..."** menu (three dots)
4. Click **"Redeploy"**
5. Wait 2-3 minutes for deployment to complete

## ✅ Step 6: Test Everything (2 minutes)

1. Visit: **https://familyestate.vercel.app/admin**
2. You should be redirected to `/sign-in`
3. Sign in with: **ldemetriou33@gmail.com**
4. You should see the Admin Dashboard! 🎉

## 🎯 What You Should See

After setup, you should be able to:
- ✅ Access `/admin` dashboard
- ✅ See "Abbey Point Hotel" in Properties
- ✅ See 18 rooms in Room Inventory (some with Event Mode active)
- ✅ See 23 menu items in Cafe Menu
- ✅ Upload images in Media Library
- ✅ Edit homepage content in Site Content

## 🐛 Troubleshooting

### Can't access `/admin`
- Make sure all 5 environment variables are set in Vercel
- Make sure you redeployed after adding variables
- Make sure email auth is enabled in Supabase
- Try signing in with: `ldemetriou33@gmail.com`

### "Missing Supabase environment variables"
- Double-check all 5 variables are in Vercel
- Make sure variable names are exact (case-sensitive)
- Redeploy after adding variables

### Database errors
- Make sure both migrations ran successfully
- Check Supabase → Logs for errors
- Verify tables exist: Go to Table Editor in Supabase

---

## 📋 Quick Checklist

- [ ] Ran migration 1 (schema) in Supabase SQL Editor
- [ ] Ran migration 2 (seed data) in Supabase SQL Editor
- [ ] Created 4 storage buckets (all public)
- [ ] Enabled email authentication
- [ ] Added all 5 environment variables to Vercel
- [ ] Redeployed Vercel site
- [ ] Tested `/admin` access

---

**Total time: ~15 minutes**

Once complete, your admin dashboard will be fully functional! 🚀

