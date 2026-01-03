# Supabase Setup Guide for Abbey OS

## 🚀 Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings > API

### 2. Set Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Email (for RLS policies)
ADMIN_EMAIL=your-email@example.com
NEXT_PUBLIC_ADMIN_EMAIL=your-email@example.com
```

### 3. Run Database Migrations

**Option A: Via Supabase Dashboard**
1. Go to SQL Editor in Supabase Dashboard
2. Copy contents of `supabase/migrations/001_sovereign_cms_schema.sql`
3. Run it in the SQL Editor
4. Copy contents of `supabase/migrations/002_seed_abbey_point_data.sql`
5. Run it in the SQL Editor

**Option B: Via Supabase CLI**
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 4. Set Admin Email in Database

In Supabase SQL Editor, run:

```sql
ALTER DATABASE postgres SET app.admin_email = 'your-email@example.com';
```

Or set it via Supabase Dashboard > Settings > Database > Custom Config

### 5. Seed the Database

**Option A: Run the TypeScript seed script**
```bash
npm install -D tsx dotenv
npx tsx scripts/seed-supabase.ts
```

**Option B: Use the SQL seed file**
Run `supabase/migrations/002_seed_abbey_point_data.sql` in SQL Editor

### 6. Configure Storage Buckets

1. Go to Storage in Supabase Dashboard
2. Create buckets:
   - `property-images` (Public)
   - `room-images` (Public)
   - `cafe-menu-images` (Public)
   - `media-vault` (Public)

3. Set bucket policies (Public read, Admin write):
   ```sql
   -- Example for property-images
   CREATE POLICY "Public read access"
     ON storage.objects FOR SELECT
     USING (bucket_id = 'property-images');
   
   CREATE POLICY "Admin write access"
     ON storage.objects FOR ALL
     USING (bucket_id = 'property-images' AND is_admin());
   ```

### 7. Enable Email Auth

1. Go to Authentication > Providers in Supabase Dashboard
2. Enable Email provider
3. Configure email templates (optional)

### 8. Test the Setup

1. Start your dev server: `npm run dev`
2. Visit `/admin` - you should be redirected to sign in
3. Sign in with your admin email
4. You should see the Admin Dashboard

## 📋 Database Schema Overview

### Tables

- **`properties`** - Parent assets (hotels, land, villas)
- **`units`** - Child units (rooms, suites, plots)
- **`content_blocks`** - Key-value store for site content
- **`amenities_global`** - Central amenities catalog
- **`cafe_menu`** - F&B menu items

### Row Level Security (RLS)

- **Public Read**: Published content is readable by anyone
- **Admin Write**: Only authenticated admin can create/update/delete
- **Admin Check**: Uses `is_admin()` function that checks user email

## 🔐 Admin Authentication

The system uses Supabase Auth with email/password or magic link.

**Admin Access:**
- Set `ADMIN_EMAIL` in environment variables
- Only users with matching email can access `/admin` routes
- RLS policies enforce this at the database level

## 🎨 Next Steps

1. **Upload Images**: Use the Media Vault in Admin Dashboard
2. **Edit Content**: Use Site Content Editor to customize homepage text
3. **Manage Rooms**: Enable/disable Event Mode for Wembley events
4. **Update Menu**: Add/remove cafe items via F&B Manager

## 🐛 Troubleshooting

### RLS Policies Not Working

- Check that `app.admin_email` is set in database
- Verify your email matches exactly (case-sensitive)
- Check Supabase logs for auth errors

### Seed Script Fails

- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (bypasses RLS)
- Check that migrations ran successfully
- Verify table names match exactly

### Images Not Uploading

- Check bucket exists and is public
- Verify storage policies are set correctly
- Check file size limits (default 50MB)

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

