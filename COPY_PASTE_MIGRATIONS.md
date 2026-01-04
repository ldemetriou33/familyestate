# 🚀 Copy-Paste Migration Guide

The migration files are located at:
- `supabase/migrations/001_sovereign_cms_schema.sql`
- `supabase/migrations/002_seed_abbey_point_data.sql`

## Quick Steps

### Step 1: Open Supabase SQL Editor
**Click this link**: https://supabase.com/dashboard/project/ucuchjdexctdvwgafnaa/sql/new

### Step 2: Run Schema Migration

1. Open the file: `supabase/migrations/001_sovereign_cms_schema.sql`
2. **Select ALL** (Cmd/Ctrl + A)
3. **Copy** (Cmd/Ctrl + C)
4. **Paste** into the Supabase SQL Editor
5. Click **"Run"** button (or press Cmd/Ctrl + Enter)
6. Wait for ✅ "Success. No rows returned"

### Step 3: Run Seed Data Migration

1. In the SQL Editor, click **"New query"** (top right)
2. Open the file: `supabase/migrations/002_seed_abbey_point_data.sql`
3. **Select ALL** (Cmd/Ctrl + A)
4. **Copy** (Cmd/Ctrl + C)
5. **Paste** into the new query in SQL Editor
6. Click **"Run"** button
7. Wait for ✅ Success

## ✅ Verification

After running both migrations, you should see:
- ✅ 5 tables created (properties, units, content_blocks, amenities_global, cafe_menu)
- ✅ Seed data inserted (Abbey Point Hotel, rooms, menu items, content blocks)

## 🐛 Troubleshooting

**"relation already exists"** - Some tables might already exist, that's okay!

**"permission denied"** - Make sure you're using the SQL Editor (not REST API)

**"syntax error"** - Make sure you copied the ENTIRE file, including all lines

---

**That's it!** Once both migrations run successfully, your database is ready! 🎉

