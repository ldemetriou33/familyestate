# 🔧 Fix "Column status does not exist" Error

## ✅ Solution: Use the Fix Migration

The error means the `properties` table exists but is missing the `status` column (and possibly others). I've created a migration that **adds missing columns** to existing tables.

## 🚀 Quick Fix (1 minute)

### Step 1: Run the Fix Migration

1. **Open Supabase SQL Editor**: https://supabase.com/dashboard/project/ucuchjdexctdvwgafnaa/sql/new

2. **Open the fix migration file**:
   - File: `supabase/migrations/001_fix_existing_tables.sql`
   - **Select ALL** (Cmd+A)
   - **Copy** (Cmd+C)

3. **Paste into SQL Editor** and click **"Run"**

   ✅ This migration:
   - Adds missing columns to existing `properties` table
   - Creates other tables if they don't exist
   - Sets up all indexes, policies, and triggers
   - Won't error if things already exist!

### Step 2: Run Seed Data

1. Click **"New query"** in SQL Editor

2. **Open**: `supabase/migrations/002_seed_abbey_point_data.sql`
   - **Select ALL** (Cmd+A)
   - **Copy** (Cmd+C)

3. **Paste** and click **"Run"**

   ✅ Done! Your database is now complete.

## ✅ What This Migration Does

- ✅ Checks if each column exists before adding it
- ✅ Adds all missing columns to `properties` table
- ✅ Creates other tables (`units`, `content_blocks`, etc.) if they don't exist
- ✅ Sets up indexes, RLS policies, and triggers
- ✅ Safe to run multiple times (idempotent)

---

**After running both migrations, your database will be fully set up!** 🎉

