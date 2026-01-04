# Abbey OS - Code Overview

## 🎯 Project Summary
Full-stack Property Management System (PMS) and Content Management System (CMS) built with Next.js 15, Supabase, and TypeScript.

## 📁 Key Files & Structure

### **Server Actions** (The "Brain")
- `app/actions/admin-actions.ts` - All admin CRUD operations
  - `updateProperty()` - Updates property info + mortgage details
  - `updateUnit()` - Updates room pricing + event mode
  - `createUnit()` - Creates new rooms
  - `updateSiteContent()` - Edits website content blocks

### **Admin Dashboard Pages**
- `app/admin/properties/[id]/page.tsx` - Property edit form with React Hook Form
- `app/admin/rooms/[id]/page.tsx` - Room edit form with Event Mode toggle
- `app/admin/properties/page.tsx` - Properties list view
- `app/admin/rooms/page.tsx` - Rooms list view
- `app/admin/content/page.tsx` - Site content editor
- `app/admin/layout.tsx` - Admin layout with Toaster for notifications

### **Database Migrations**
- `supabase/migrations/001_fix_existing_tables.sql` - Base schema setup
- `supabase/migrations/003_add_mortgage_details.sql` - Adds mortgage_details JSONB column
- `supabase/migrations/004_seed_abbey_os_data.sql` - Seed data (Abbey Point Hotel + Cyprus Land)

### **Supabase Configuration**
- `lib/supabase/server.ts` - Server-side Supabase client (admin + user)
- `lib/supabase/client.ts` - Client-side Supabase client
- `lib/supabase/auth.ts` - Authentication helpers (requireAdmin, isAdmin)

### **Public Frontend**
- `app/page.tsx` - Homepage (SSR, fetches from Supabase)
- `components/admin/FloatingAdminButton.tsx` - Quick admin access button

## 🔑 Key Features

1. **Property Management**
   - Edit property name, description, status
   - Mortgage details (lender, rate, balance, monthly payment)
   - Hero images and gallery

2. **Room Management**
   - Base pricing
   - Event Mode toggle (surge pricing)
   - Auto-calculated surge price (1.5x base when active)
   - Amenities selection
   - Availability and publishing controls

3. **Content Management**
   - Edit homepage hero text
   - Edit "Best Value" sections
   - Edit About Us content
   - All stored in `content_blocks` table (JSONB)

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Magic Link/Email)
- **Forms**: React Hook Form + Zod validation
- **UI**: Tailwind CSS + Shadcn/UI components
- **Notifications**: Sonner (toast notifications)
- **Icons**: Lucide React

## 📊 Database Schema

### `properties` table
- `id` (UUID)
- `name`, `slug`, `type`, `status`
- `description`, `city`, `country`, `address`
- `hero_image_url`, `gallery_images`
- `mortgage_details` (JSONB) - Stores: lender, rate, balance, monthly_payment, loan_type, term_years, start_date
- `is_featured`, `is_published`

### `units` table
- `id` (UUID)
- `property_id` (FK to properties)
- `name`, `category`, `room_number`
- `base_price`, `surge_price`
- `is_event_mode_active` (boolean)
- `amenities` (text array)
- `images` (text array)
- `capacity`, `description`
- `is_available`, `is_published`

### `content_blocks` table
- `id` (UUID)
- `section_key` (unique)
- `content` (JSONB)
- `is_active` (boolean)

## 🚀 How It Works

1. **Admin logs in** → Supabase Auth checks email against `ADMIN_EMAIL`
2. **Admin edits property** → React Hook Form validates → Server Action (`updateProperty`) → Supabase Admin Client (bypasses RLS) → Database updated → `revalidatePath()` → UI updates instantly
3. **Admin toggles Event Mode** → Server Action calculates surge price → Updates `is_event_mode_active` and `surge_price` → Frontend shows red/gold "High Demand" badge
4. **Public homepage** → Server-side fetches from Supabase → Displays properties, rooms, and content blocks → Shows Event Mode pricing when active

## 📝 Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
ADMIN_EMAIL=your-email@example.com
NEXT_PUBLIC_ADMIN_EMAIL=your-email@example.com
```

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Public can read published properties/units
- Only admin (via service role key) can write/update/delete
- `requireAdmin()` function checks authentication before server actions

## 📦 Recent Changes

- ✅ Added `mortgage_details` JSONB column to properties
- ✅ Created seed script with Abbey Point Hotel + Cyprus Land
- ✅ Implemented Server Actions for all CRUD operations
- ✅ Refactored forms to use React Hook Form + Zod
- ✅ Added toast notifications (Sonner)
- ✅ Created property edit page with Financials tab
- ✅ Refactored room edit page with Event Mode toggle

