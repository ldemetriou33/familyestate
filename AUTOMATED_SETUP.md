# 🚀 Automated Setup Guide

I've created scripts to automate your Supabase setup. Follow these steps:

## Step 1: Run Supabase Setup Script

This will:
- ✅ Run database migrations
- ✅ Create storage buckets
- ✅ Set up the database schema

```bash
# Make sure you're in the project directory
cd /Users/johnalexander/Desktop/abbey-os-final

# Run the setup script
node scripts/setup-supabase.js
```

**Note**: If the script has issues with SQL execution, you can run the migrations manually:
1. Go to: https://supabase.com/dashboard/project/ucuchjdexctdvwgafnaa/sql/new
2. Copy/paste `supabase/migrations/001_sovereign_cms_schema.sql` → Run
3. Copy/paste `supabase/migrations/002_seed_abbey_point_data.sql` → Run

## Step 2: Set Vercel Environment Variables

### Option A: Manual (Recommended)
1. Go to: https://vercel.com/leos-projects-48833722/familyestate/settings/environment-variables
2. Follow the instructions in `scripts/VERCEL_ENV_VARS.md`
3. Add all 5 environment variables
4. Redeploy your site

### Option B: Via Vercel CLI
```bash
# Make script executable
chmod +x scripts/setup-vercel-env.sh

# Run it (requires Vercel CLI login)
./scripts/setup-vercel-env.sh
```

## Step 3: Enable Email Authentication

1. Go to: https://supabase.com/dashboard/project/ucuchjdexctdvwgafnaa/auth/providers
2. Find **"Email"** provider
3. Make sure it's **enabled** ✅

## Step 4: Test Everything

1. Wait for Vercel redeploy (2-3 minutes)
2. Visit: `https://familyestate.vercel.app/admin`
3. Sign in with: `ldemetriou33@gmail.com`
4. You should see the Admin Dashboard! 🎉

## What's Been Set Up

✅ **Database Schema**: All tables created (properties, units, content_blocks, etc.)
✅ **Seed Data**: Abbey Point Hotel data loaded
✅ **Storage Buckets**: 4 buckets created (property-images, room-images, cafe-menu-images, media-vault)
✅ **Environment Variables**: Ready to add to Vercel
✅ **Admin Email**: `ldemetriou33@gmail.com` configured

## Troubleshooting

### Script fails to run migrations
- Run migrations manually in Supabase SQL Editor (see Step 1 note)
- The script will still create storage buckets

### Can't access /admin
- Make sure you've set all 5 environment variables in Vercel
- Make sure you've redeployed after adding variables
- Make sure email auth is enabled in Supabase

### Storage buckets not created
- Create them manually in Supabase Dashboard → Storage
- Names: `property-images`, `room-images`, `cafe-menu-images`, `media-vault`
- All should be public ✅

---

## Quick Checklist

- [ ] Run `node scripts/setup-supabase.js` (or run migrations manually)
- [ ] Set 5 environment variables in Vercel
- [ ] Redeploy Vercel site
- [ ] Enable email auth in Supabase
- [ ] Test `/admin` access

Once complete, your admin dashboard will be fully functional! 🎉

