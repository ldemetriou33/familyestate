# ✅ Use This Migration - It Fixes Everything

## The Problem
Your `properties` table exists but is missing columns. The error "column property_id does not exist" happens because the `units` table tries to reference `properties(id)` before the `id` column exists.

## ✅ Solution: Use the Fixed Migration

### Step 1: Run the Fixed Migration

1. **Open Supabase SQL Editor**: https://supabase.com/dashboard/project/ucuchjdexctdvwgafnaa/sql/new

2. **Open this file**: `supabase/migrations/001_fix_existing_tables.sql`
   - **Select ALL** (Cmd+A)
   - **Copy** (Cmd+C)

3. **Paste into SQL Editor** and click **"Run"**

   ✅ This migration:
   - Ensures `properties` table has an `id` column first
   - Adds all missing columns to `properties`
   - Creates `units` table without foreign key first
   - Then adds the foreign key constraint separately
   - Won't error if things already exist!

### Step 2: Run Seed Data

1. Click **"New query"** in SQL Editor

2. **Open**: `supabase/migrations/002_seed_abbey_point_data.sql`
   - **Select ALL** (Cmd+A)
   - **Copy** (Cmd+C)

3. **Paste** and click **"Run"**

## ✅ What This Migration Does

1. ✅ Checks if `properties.id` exists, creates it if missing
2. ✅ Adds ALL missing columns to `properties` table
3. ✅ Creates `units` table without foreign key first
4. ✅ Adds foreign key constraint separately (only if `properties.id` exists)
5. ✅ Creates other tables (`content_blocks`, `amenities_global`, `cafe_menu`)
6. ✅ Sets up indexes, RLS policies, and triggers

**This migration is safe to run multiple times!**

---

After running both migrations, your database will be complete! 🎉

