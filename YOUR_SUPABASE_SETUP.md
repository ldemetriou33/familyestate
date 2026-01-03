# Your Supabase Setup - Step by Step

## ✅ What You Have

- **Project URL**: `https://ucuchjdexctdvwgafnaa.supabase.co`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdWNoamRleGN0ZHZ3Z2FmbmFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzM3MjYwMiwiZXhwIjoyMDgyOTQ4NjAyfQ.aPwTWveRh0V8_dAG0s-65np2Bmp360PqTq8buljJVJI`
- **Publishable Key**: `sb_publishable_PD6VoJctsHBuBD3GOQmuaA_q8xl81J-`

## 🔍 Step 1: Get Your Anon Key

The "publishable key" you have might be different. We need the **anon public key** (JWT format).

1. Go to: https://supabase.com/dashboard/project/ucuchjdexctdvwgafnaa
2. Click **Settings** (gear icon) → **API**
3. Look for **"anon public"** key (should start with `eyJhbGc...`)
4. Copy that key - you'll need it in Step 2

**If you don't see it:**
- Look for "Project API keys" section
- The anon key is usually labeled "anon" or "public"
- It's a long JWT token (starts with `eyJ`)

## 🔧 Step 2: Set Environment Variables in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these 5 variables:

### Variable 1: Project URL
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://ucuchjdexctdvwgafnaa.supabase.co`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

### Variable 2: Anon Key
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGc...` (the anon key from Step 1)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

### Variable 3: Service Role Key
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdWNoamRleGN0ZHZ3Z2FmbmFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzM3MjYwMiwiZXhwIjoyMDgyOTQ4NjAyfQ.aPwTWveRh0V8_dAG0s-65np2Bmp360PqTq8buljJVJI`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

### Variable 4: Admin Email
- **Name**: `ADMIN_EMAIL`
- **Value**: `your-email@example.com` (replace with your actual email)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

### Variable 5: Admin Email (Public)
- **Name**: `NEXT_PUBLIC_ADMIN_EMAIL`
- **Value**: `your-email@example.com` (same email as above)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

5. Click **"Save"** after each variable
6. **Redeploy**: Go to **Deployments** → Click **"..."** on latest → **Redeploy**

## 🗄️ Step 3: Run Database Migrations

1. Go to: https://supabase.com/dashboard/project/ucuchjdexctdvwgafnaa
2. Click **SQL Editor** (left sidebar)
3. Click **"New query"**
4. Open `supabase/migrations/001_sovereign_cms_schema.sql` from your project
5. Copy the **entire file** and paste into SQL Editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. You should see: ✅ "Success. No rows returned"
8. Click **"New query"** again
9. Open `supabase/migrations/002_seed_abbey_point_data.sql`
10. Copy and paste, then click **"Run"**

## 📦 Step 4: Create Storage Buckets

1. In Supabase Dashboard, click **Storage** (left sidebar)
2. Click **"New bucket"** and create these 4 buckets:

   **Bucket 1:**
   - Name: `property-images`
   - ✅ Public bucket
   - Click **"Create bucket"**

   **Bucket 2:**
   - Name: `room-images`
   - ✅ Public bucket
   - Click **"Create bucket"**

   **Bucket 3:**
   - Name: `cafe-menu-images`
   - ✅ Public bucket
   - Click **"Create bucket"**

   **Bucket 4:**
   - Name: `media-vault`
   - ✅ Public bucket
   - Click **"Create bucket"**

## 🔐 Step 4: Enable Email Authentication

1. In Supabase Dashboard, click **Authentication** → **Providers**
2. Find **"Email"** provider
3. Make sure it's **enabled** ✅
4. (Optional) Configure email templates

## ✅ Step 5: Test Everything

1. Wait 2-3 minutes for Vercel to redeploy
2. Visit: `https://your-site.vercel.app/admin`
3. You should be redirected to `/sign-in`
4. Sign in with your admin email (the one you set in `ADMIN_EMAIL`)
5. You should see the Admin Dashboard! 🎉

## 🎯 What You Should See

After setup, you should be able to:
- ✅ Access `/admin` dashboard
- ✅ See "Abbey Point Hotel" in Properties
- ✅ See rooms in Room Inventory
- ✅ See menu items in Cafe Menu
- ✅ Upload images in Media Library

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Check all 5 variables are set in Vercel
- Make sure variable names are exact (case-sensitive)
- Redeploy after adding variables

### "Unauthorized" when accessing `/admin`
- Make sure you signed in with the email matching `ADMIN_EMAIL`
- Check that email authentication is enabled in Supabase

### Can't find the anon key
- In Supabase Dashboard → Settings → API
- Look for "Project API keys" section
- The anon key is usually the first one listed
- It should be a long JWT token starting with `eyJ`

---

## 📝 Quick Checklist

- [ ] Got anon public key from Supabase Dashboard
- [ ] Added all 5 environment variables to Vercel
- [ ] Redeployed Vercel site
- [ ] Ran both SQL migrations in Supabase
- [ ] Created 4 storage buckets
- [ ] Enabled email authentication
- [ ] Tested `/admin` access

---

Once you complete these steps, your admin dashboard will be fully functional! 🚀

