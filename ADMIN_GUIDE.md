# Complete Admin Guide - Everything Editable Through Website

## ✅ Yes, You Can Edit Everything Through `/admin`!

You **never need to touch Supabase directly**. Everything is managed through the admin dashboard at `/admin`.

---

## 🎯 Admin Dashboard Overview

Access: **https://your-site.vercel.app/admin**

### What You Can Edit:

#### 1. **Properties** (`/admin/properties`)
- ✅ Add new properties (hotels, land, villas)
- ✅ Edit property details (name, description, location, images)
- ✅ Change status (Active, Maintenance, Sold, Development)
- ✅ Publish/unpublish properties
- ✅ Set featured properties
- ✅ Add amenities and highlights

#### 2. **Room Inventory** (`/admin/rooms`)
- ✅ Add new rooms/suites
- ✅ Edit room details (name, price, capacity, amenities)
- ✅ **Toggle Event Mode** (Wembley surge pricing)
- ✅ Set base price and surge multiplier
- ✅ Upload room images
- ✅ Publish/unpublish rooms
- ✅ Bulk actions (enable/disable Event Mode for multiple rooms)

#### 3. **Cafe Menu** (`/admin/cafe`)
- ✅ Add menu items
- ✅ Edit prices and descriptions
- ✅ Set categories (Breakfast, Lunch, Dinner, Alcohol, etc.)
- ✅ Mark items as available/sold out
- ✅ Add allergens and dietary info
- ✅ Upload item images

#### 4. **Site Content** (`/admin/content`)
- ✅ Edit homepage hero text
- ✅ Update about sections
- ✅ Modify FAQ content
- ✅ Change call-to-action buttons
- ✅ All content is JSONB - flexible structure

#### 5. **Media Library** (`/admin/media`)
- ✅ Upload images (drag & drop)
- ✅ Organize by bucket (properties, rooms, menu)
- ✅ Copy image URLs to clipboard
- ✅ Delete images
- ✅ All images stored in Supabase Storage

#### 6. **Operational Data** (`/admin/operational`)
- ✅ Overview of all admin modules
- ✅ Quick stats dashboard
- ✅ Links to all management pages

---

## 🔐 Authentication

**Admin Access:**
1. Sign in at `/sign-in` with your admin email
2. Only the email set in `ADMIN_EMAIL` environment variable can access `/admin`
3. All routes are protected with Supabase Auth

---

## 📝 Common Tasks

### Enable Event Mode for Wembley Rooms

1. Go to `/admin/rooms`
2. Click "Edit" on a room
3. Toggle "Wembley Event Mode" ON
4. Set surge multiplier (default 1.5 = 50% increase)
5. Save - surge price auto-calculates
6. Room now shows "HIGH DEMAND" badge on public site

### Update Homepage Text

1. Go to `/admin/content`
2. Find `home_hero` section
3. Edit the JSON content:
   ```json
   {
     "title": "Your New Title",
     "subtitle": "Your new subtitle",
     "cta_text": "Button Text"
   }
   ```
4. Click Save
5. Changes appear on homepage immediately

### Add a New Property

1. Go to `/admin/properties`
2. Click "Add Property"
3. Fill in:
   - Name, slug, description
   - Location (lat/long optional)
   - Type (Hotel, Land, Villa, etc.)
   - Upload hero image
   - Add amenities
4. Click "Create Property"
5. Property appears on public site (if published)

### Upload Room Images

1. Go to `/admin/media`
2. Select "Room Images" bucket
3. Drag & drop images
4. Copy the image URL
5. Go to `/admin/rooms/[id]`
6. Paste URL in image field
7. Save

---

## 🚫 What You DON'T Need to Do

- ❌ **Don't** edit Supabase database directly
- ❌ **Don't** run SQL queries manually
- ❌ **Don't** edit code to change content
- ❌ **Don't** use Supabase dashboard for content editing

---

## 🔄 Data Flow

```
Admin Dashboard (/admin)
    ↓
Supabase Database (via API)
    ↓
Public Website (fetches from Supabase)
```

**Everything flows through the admin dashboard!**

---

## 🎨 Two Admin Systems (For Now)

### 1. CMS Admin (`/admin`) - NEW ✨
- **Purpose**: Public website content
- **Database**: Supabase
- **What it manages**: Properties, rooms, content, menu, images
- **Use this for**: Everything website-related

### 2. Portfolio Admin (`/dashboard/admin/portfolio`) - OLD
- **Purpose**: Operational data
- **Database**: Prisma/PostgreSQL
- **What it manages**: Financials, bookings, rent roll, metrics
- **Use this for**: Internal operations data

**Future**: We can consolidate everything into `/admin`` for a single admin experience.

---

## 📚 Quick Reference

| What to Edit | Where to Go |
|-------------|-------------|
| Property details | `/admin/properties` |
| Room prices | `/admin/rooms` |
| Event Mode | `/admin/rooms/[id]` → Toggle Event Mode |
| Homepage text | `/admin/content` → `home_hero` |
| Menu items | `/admin/cafe` |
| Images | `/admin/media` |
| Property images | `/admin/properties/[id]` → Upload |

---

## 🆘 Troubleshooting

### "I can't access `/admin`"
- Make sure you're signed in with the admin email
- Check `ADMIN_EMAIL` environment variable matches your email

### "Changes don't appear on website"
- Check if property/room is "Published"
- Clear browser cache
- Check Supabase RLS policies

### "Can't upload images"
- Make sure Supabase Storage buckets are created
- Check bucket policies allow uploads
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set

---

## ✨ Summary

**You can edit 100% of website content through `/admin` - no Supabase dashboard needed!**

The admin dashboard is your "Sovereign CMS" - complete control without touching code or databases directly.

