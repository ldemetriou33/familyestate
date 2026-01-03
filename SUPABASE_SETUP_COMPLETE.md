# Complete Supabase Setup Guide for Abbey OS

This guide will walk you through setting up Supabase for your Abbey OS project.

## 📋 Prerequisites

- A Supabase account (free tier works fine)
- Your project deployed on Vercel (or local development)
- Access to your Vercel project settings

---

## 🚀 Step-by-Step Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `abbey-os` (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine to start
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to initialize

### Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** (gear icon) → **API**
2. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
   - **service_role key**: `eyJhbGc...` (long string) - **⚠️ Keep this secret!**

3. **Copy these values** - you'll need them in the next step

### Step 3: Run Database Migrations

You need to create the database tables. Choose one method:

#### Option A: Via Supabase Dashboard (Easiest)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Open `supabase/migrations/001_sovereign_cms_schema.sql` from your project
4. Copy the **entire contents** and paste into the SQL Editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"
7. Repeat for `supabase/migrations/002_seed_abbey_point_data.sql`

#### Option B: Via Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (get project ref from Supabase dashboard URL)
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Step 4: Set Up Storage Buckets

1. In Supabase Dashboard, go to **Storage**
2. Create these buckets (click **"New bucket"** for each):

   | Bucket Name | Public? |
   |------------|---------|
   | `property-images` | ✅ Yes |
   | `room-images` | ✅ Yes |
   | `cafe-menu-images` | ✅ Yes |
   | `media-vault` | ✅ Yes |

3. For each bucket:
   - Check **"Public bucket"** ✅
   - Click **"Create bucket"**

### Step 5: Configure Environment Variables

#### For Local Development

1. Create `.env.local` in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key

# Admin Email (must match the email you'll use to sign in)
ADMIN_EMAIL=your-email@example.com
NEXT_PUBLIC_ADMIN_EMAIL=your-email@example.com
```

2. Replace:
   - `xxxxx.supabase.co` with your actual Project URL
   - `eyJhbGc...` with your actual keys
   - `your-email@example.com` with your admin email

#### For Vercel Production

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Production, Preview, Development |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Production, Preview, Development |
   | `ADMIN_EMAIL` | `your-email@example.com` | Production, Preview, Development |
   | `NEXT_PUBLIC_ADMIN_EMAIL` | `your-email@example.com` | Production, Preview, Development |

4. Click **"Save"**
5. **Redeploy** your site (Vercel → Deployments → ... → Redeploy)

### Step 6: Enable Email Authentication

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **"Email"** provider
3. Make sure it's **enabled** ✅
4. (Optional) Configure email templates under **"Email Templates"**

### Step 7: Test the Setup

1. **Start your dev server** (if local):
   ```bash
   npm run dev
   ```

2. **Visit your site**:
   - Local: `http://localhost:3000`
   - Vercel: `https://your-site.vercel.app`

3. **Test Admin Access**:
   - Go to `/admin` or `/sign-in`
   - Sign in with your admin email (the one you set in `ADMIN_EMAIL`)
   - You should see the Admin Dashboard

4. **Test Content**:
   - Go to `/admin/properties` - you should see Abbey Point Hotel
   - Go to `/admin/rooms` - you should see rooms
   - Go to `/admin/cafe` - you should see menu items

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Database migrations run successfully
- [ ] Storage buckets created (4 buckets)
- [ ] Environment variables set (local + Vercel)
- [ ] Email authentication enabled
- [ ] Can sign in at `/sign-in` with admin email
- [ ] Can access `/admin` dashboard
- [ ] Can see properties, rooms, and menu items

---

## 🔧 Troubleshooting

### "Missing Supabase environment variables" Error

**Solution:**
- Check that all 5 environment variables are set in Vercel
- Make sure variable names match exactly (case-sensitive)
- Redeploy after adding variables

### "Unauthorized" or Can't Access Admin

**Solution:**
- Verify `ADMIN_EMAIL` matches the email you're signing in with
- Check that you've signed in with Supabase Auth (not just any email)
- Make sure email authentication is enabled in Supabase

### "Failed to fetch" or Database Errors

**Solution:**
- Verify migrations ran successfully (check SQL Editor history)
- Check Supabase Dashboard → Logs for errors
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (needed for admin operations)

### Images Not Uploading

**Solution:**
- Verify storage buckets exist and are public
- Check file size (max 50MB default)
- Verify bucket names match exactly: `property-images`, `room-images`, etc.

### Seed Data Not Showing

**Solution:**
- Run `002_seed_abbey_point_data.sql` in SQL Editor
- Or use the seed script: `npx tsx scripts/seed-supabase.ts`
- Check that `is_published = true` in the database

---

## 📊 Database Schema Overview

Your Supabase database has these tables:

| Table | Purpose |
|-------|---------|
| `properties` | Hotels, land, villas (parent assets) |
| `units` | Rooms, suites, plots (child units) |
| `content_blocks` | Homepage text, hero sections, FAQs |
| `amenities_global` | Central amenities catalog |
| `cafe_menu` | F&B menu items |

**Row Level Security (RLS):**
- ✅ Public can **read** published content
- ✅ Only admin can **write** (create/update/delete)
- ✅ Admin check uses your `ADMIN_EMAIL`

---

## 🎯 Next Steps After Setup

1. **Customize Content**:
   - Go to `/admin/content` to edit homepage text
   - Update hero sections, FAQs, etc.

2. **Add Properties**:
   - Go to `/admin/properties` → "Add Property"
   - Add your hotels, land, villas

3. **Manage Rooms**:
   - Go to `/admin/rooms` to edit room details
   - Enable "Event Mode" for Wembley surge pricing

4. **Update Menu**:
   - Go to `/admin/cafe` to manage menu items
   - Add/remove items, set prices

5. **Upload Images**:
   - Go to `/admin/media` to upload images
   - Copy URLs and use in properties/rooms

---

## 🔐 Security Notes

- **Never commit** `.env.local` to git (it's in `.gitignore`)
- **Never expose** `SUPABASE_SERVICE_ROLE_KEY` publicly
- The service role key bypasses RLS - keep it secret!
- Use `NEXT_PUBLIC_*` variables only for client-side code

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Setup](https://supabase.com/docs/guides/storage)

---

## 💡 Quick Reference

**Where to find things in Supabase:**
- **API Keys**: Settings → API
- **SQL Editor**: SQL Editor (left sidebar)
- **Storage**: Storage (left sidebar)
- **Auth**: Authentication (left sidebar)
- **Logs**: Logs → API Logs (for debugging)

**Important URLs:**
- Supabase Dashboard: `https://supabase.com/dashboard`
- Your Project: `https://supabase.com/dashboard/project/xxxxx`
- API Docs: `https://xxxxx.supabase.co/rest/v1/` (auto-generated)

---

## ✨ You're All Set!

Once you've completed these steps, your Abbey OS admin dashboard will be fully functional. You can manage all content, properties, rooms, and menu items directly from `/admin` without touching code or databases directly.

If you run into any issues, check the troubleshooting section above or review the Supabase logs for detailed error messages.

