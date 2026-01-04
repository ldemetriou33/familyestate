# Quick Supabase Setup - Your Keys

## 🔑 Your Keys

Based on what you provided:
- **Publishable Key**: `sb_publishable_PD6VoJctsHBuBD3GOQmuaA_q8xl81J-`
- **Secret Key**: `sb_secret_qT40n2U6Wf5xh9zD0DWpYg_nM7lUnWC`

⚠️ **Note**: These look like they might be from a different format. We need to verify the correct keys from your Supabase dashboard.

## 📍 Step 1: Get Your Project URL and Standard Keys

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** (gear icon) → **API**
4. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co` ← Copy this!
   - **anon public** key: `eyJhbGc...` (starts with `eyJ`) ← Copy this!
   - **service_role** key: `eyJhbGc...` (starts with `eyJ`) ← Copy this! (Keep secret!)

## 🔧 Step 2: Set Environment Variables in Vercel

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these 5 variables:

### Variable 1:
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://xxxxx.supabase.co` (from Step 1)
- **Environment**: Production, Preview, Development ✅

### Variable 2:
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGc...` (anon public key from Step 1)
- **Environment**: Production, Preview, Development ✅

### Variable 3:
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `eyJhbGc...` (service_role key from Step 1)
- **Environment**: Production, Preview, Development ✅

### Variable 4:
- **Name**: `ADMIN_EMAIL`
- **Value**: `your-email@example.com` (your email address)
- **Environment**: Production, Preview, Development ✅

### Variable 5:
- **Name**: `NEXT_PUBLIC_ADMIN_EMAIL`
- **Value**: `your-email@example.com` (same email as above)
- **Environment**: Production, Preview, Development ✅

5. Click **"Save"** after each variable
6. **Redeploy**: Go to **Deployments** → Click **"..."** on latest deployment → **Redeploy**

## 🗄️ Step 3: Run Database Migrations

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open `supabase/migrations/001_sovereign_cms_schema.sql` from your project
4. Copy the **entire file contents** and paste into SQL Editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)
6. You should see: ✅ "Success. No rows returned"
7. Repeat for `supabase/migrations/002_seed_abbey_point_data.sql`

## 📦 Step 4: Create Storage Buckets

1. In Supabase Dashboard, go to **Storage** (left sidebar)
2. Click **"New bucket"** and create these 4 buckets:

   | Bucket Name | Public? |
   |------------|---------|
   | `property-images` | ✅ Yes |
   | `room-images` | ✅ Yes |
   | `cafe-menu-images` | ✅ Yes |
   | `media-vault` | ✅ Yes |

3. For each bucket:
   - Check **"Public bucket"** ✅
   - Click **"Create bucket"**

## 🔐 Step 5: Enable Email Authentication

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **"Email"** provider
3. Make sure it's **enabled** ✅

## ✅ Step 6: Test It!

1. Wait for Vercel redeploy to finish (2-3 minutes)
2. Visit your site: `https://your-site.vercel.app/admin`
3. You should be redirected to `/sign-in`
4. Sign in with your admin email (the one you set in `ADMIN_EMAIL`)
5. You should see the Admin Dashboard! 🎉

## 🐛 If Something Doesn't Work

### Can't find the keys?
- Make sure you're in **Settings** → **API** (not somewhere else)
- The keys should be long strings starting with `eyJ`
- If you see different keys, use the ones labeled "anon public" and "service_role"

### Still seeing "Missing Supabase environment variables"?
- Double-check variable names are exact (case-sensitive)
- Make sure you redeployed after adding variables
- Check Vercel → Settings → Environment Variables to verify they're there

### Can't access `/admin`?
- Make sure you signed in with the email matching `ADMIN_EMAIL`
- Check that email authentication is enabled in Supabase

---

## 📝 Quick Checklist

- [ ] Got Project URL from Supabase Dashboard
- [ ] Got anon public key (starts with `eyJ`)
- [ ] Got service_role key (starts with `eyJ`)
- [ ] Added all 5 environment variables to Vercel
- [ ] Redeployed Vercel site
- [ ] Ran both SQL migrations in Supabase
- [ ] Created 4 storage buckets
- [ ] Enabled email authentication
- [ ] Tested `/admin` access

---

Once you complete these steps, your admin dashboard will be fully functional! 🚀

