#!/usr/bin/env node

/**
 * Seed Data via Supabase REST API
 * This can insert data into existing tables, but can't create tables
 */

const SUPABASE_URL = 'https://ucuchjdexctdvwgafnaa.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdWNoamRleGN0ZHZ3Z2FmbmFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzM3MjYwMiwiZXhwIjoyMDgyOTQ4NjAyfQ.aPwTWveRh0V8_dAG0s-65np2Bmp360PqTq8buljJVJI'

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_SERVICE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  'Prefer': 'return=minimal',
}

async function insertData(table, data) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })

    if (response.ok || response.status === 201) {
      return { success: true }
    } else {
      const error = await response.text()
      // If it's a conflict error, that's okay (data already exists)
      if (error.includes('duplicate') || error.includes('already exists') || response.status === 409) {
        return { success: true, message: 'Already exists' }
      }
      return { success: false, error }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function seedAmenities() {
  console.log('\n📦 Seeding amenities...')
  const amenities = [
    { name: 'WiFi', icon: 'wifi', category: 'Connectivity', description: 'Free high-speed WiFi', sort_order: 1, is_active: true },
    { name: 'EV Charging', icon: 'charging-station', category: 'Parking', description: 'Electric vehicle charging points', sort_order: 2, is_active: true },
    { name: '24/7 Kiosk', icon: 'clock', category: 'Services', description: 'Round-the-clock check-in kiosk', sort_order: 3, is_active: true },
    { name: 'Air Conditioning', icon: 'wind', category: 'Comfort', description: 'Climate control in all rooms', sort_order: 4, is_active: true },
    { name: 'TV', icon: 'tv', category: 'Entertainment', description: 'Smart TV with streaming', sort_order: 5, is_active: true },
    { name: 'Mini Bar', icon: 'coffee', category: 'Amenities', description: 'Stocked mini bar', sort_order: 6, is_active: true },
    { name: 'Balcony', icon: 'home', category: 'Features', description: 'Private balcony access', sort_order: 7, is_active: true },
    { name: 'Kitchenette', icon: 'utensils', category: 'Features', description: 'Fully equipped kitchenette', sort_order: 8, is_active: true },
    { name: 'Parking', icon: 'car', category: 'Parking', description: 'On-site parking available', sort_order: 9, is_active: true },
    { name: 'Gym Access', icon: 'dumbbell', category: 'Fitness', description: 'Fitness center access', sort_order: 10, is_active: true },
  ]

  let success = 0
  for (const amenity of amenities) {
    const result = await insertData('amenities_global', amenity)
    if (result.success) {
      success++
      console.log(`  ✅ ${amenity.name}`)
    } else {
      console.log(`  ⚠️  ${amenity.name}: ${result.error?.substring(0, 100)}`)
    }
  }
  console.log(`  📊 Inserted ${success}/${amenities.length} amenities`)
  return success
}

async function seedContentBlocks() {
  console.log('\n📝 Seeding content blocks...')
  const blocks = [
    {
      section_key: 'home_hero',
      content: {
        title: 'Your Mixed Portfolio. One Command Center.',
        subtitle: 'Manage your hotel, cafe, and residential properties from a single dashboard. AI-powered insights. Automated actions. Complete control.',
        cta_text: 'Access Dashboard',
        cta_link: '/sign-in',
        secondary_cta_text: 'Create Account',
        secondary_cta_link: '/sign-up',
      },
      is_active: true,
    },
    {
      section_key: 'home_about',
      content: {
        title: 'One System. Three Businesses.',
        description: 'Abbey OS unifies your entire property portfolio into a single, intelligent operating system.',
        features: [
          'Real-time occupancy tracking',
          'Automated revenue management',
          'Predictive maintenance alerts',
        ],
      },
      is_active: true,
    },
    {
      section_key: 'home_value',
      content: {
        title: 'Best Value Wembley Accommodation',
        description: 'Experience luxury at Abbey Point Hotel. Stunning views of Wembley Arch. Perfect for event-goers and business travelers.',
        highlights: [
          'Direct booking discounts',
          'Event day packages',
          '24/7 check-in kiosk',
          'EV charging available',
        ],
      },
      is_active: true,
    },
    {
      section_key: 'home_faq',
      content: {
        title: 'Frequently Asked Questions',
        items: [
          {
            question: 'Do you offer event day packages?',
            answer: 'Yes! We offer special packages for Wembley Stadium events. Book early for best rates.',
          },
          {
            question: 'Is parking available?',
            answer: 'Yes, we have on-site parking and EV charging points available.',
          },
          {
            question: 'What time is check-in?',
            answer: 'Check-in is from 3 PM. We also have a 24/7 self-service kiosk for late arrivals.',
          },
        ],
      },
      is_active: true,
    },
    {
      section_key: 'footer',
      content: {
        copyright: '© 2026 Abbey OS. All rights reserved.',
        tagline: 'Family Estate Autopilot',
      },
      is_active: true,
    },
  ]

  let success = 0
  for (const block of blocks) {
    const result = await insertData('content_blocks', block)
    if (result.success) {
      success++
      console.log(`  ✅ ${block.section_key}`)
    } else {
      console.log(`  ⚠️  ${block.section_key}: ${result.error?.substring(0, 100)}`)
    }
  }
  console.log(`  📊 Inserted ${success}/${blocks.length} content blocks`)
  return success
}

async function seedCafeMenu() {
  console.log('\n🍽️  Seeding cafe menu...')
  const menuItems = [
    { name: 'Full English Breakfast', description: 'Two eggs, bacon, sausage, black pudding, baked beans, grilled tomato, toast', price: 12.50, category: 'Breakfast', is_available: true, sort_order: 1 },
    { name: 'Continental Breakfast', description: 'Pastries, fresh fruit, yogurt, cereal, coffee or tea', price: 8.50, category: 'Breakfast', is_available: true, sort_order: 2 },
    { name: 'Avocado Toast', description: 'Sourdough toast, smashed avocado, poached eggs, feta, chilli flakes', price: 9.50, category: 'Breakfast', is_available: true, sort_order: 3 },
    { name: 'Pancakes & Maple Syrup', description: 'Stack of fluffy pancakes with butter and maple syrup', price: 7.50, category: 'Breakfast', is_available: true, sort_order: 4 },
    { name: 'Caesar Salad', description: 'Romaine lettuce, grilled chicken, parmesan, croutons, caesar dressing', price: 11.50, category: 'Lunch', is_available: true, sort_order: 5 },
    { name: 'Fish & Chips', description: 'Beer-battered cod, hand-cut chips, mushy peas, tartar sauce', price: 14.50, category: 'Lunch', is_available: true, sort_order: 6 },
    { name: 'Club Sandwich', description: 'Triple-decker with chicken, bacon, lettuce, tomato, mayo', price: 10.50, category: 'Lunch', is_available: true, sort_order: 7 },
    { name: 'Margherita Pizza', description: 'Classic margherita with fresh mozzarella and basil', price: 9.50, category: 'Lunch', is_available: true, sort_order: 8 },
    { name: 'Grilled Salmon', description: 'Pan-seared salmon, seasonal vegetables, lemon butter sauce', price: 18.50, category: 'Dinner', is_available: true, sort_order: 9 },
    { name: 'Beef Burger', description: '8oz prime beef, brioche bun, cheddar, bacon, chips', price: 15.50, category: 'Dinner', is_available: true, sort_order: 10 },
    { name: 'Vegetable Risotto', description: 'Creamy arborio rice, seasonal vegetables, parmesan', price: 12.50, category: 'Dinner', is_available: true, sort_order: 11 },
    { name: 'House Wine (Glass)', description: 'Red or white house wine', price: 6.50, category: 'Alcohol', is_available: true, sort_order: 12 },
    { name: 'Craft Beer', description: 'Selection of local craft beers', price: 5.50, category: 'Alcohol', is_available: true, sort_order: 13 },
    { name: 'Cocktail of the Day', description: 'Ask your server for today\'s special', price: 9.50, category: 'Alcohol', is_available: true, sort_order: 14 },
    { name: 'Event Day Package', description: 'Pre-event meal deal: main + drink + dessert', price: 22.00, category: 'Event_Special', is_available: true, sort_order: 15 },
    { name: 'Stadium Snack Box', description: 'Perfect for taking to events: sandwich, crisps, drink', price: 8.50, category: 'Event_Special', is_available: true, sort_order: 16 },
    { name: 'Espresso', description: 'Single shot espresso', price: 2.50, category: 'Beverage', is_available: true, sort_order: 17 },
    { name: 'Cappuccino', description: 'Espresso with steamed milk and foam', price: 3.50, category: 'Beverage', is_available: true, sort_order: 18 },
    { name: 'Fresh Orange Juice', description: 'Freshly squeezed orange juice', price: 4.50, category: 'Beverage', is_available: true, sort_order: 19 },
    { name: 'Soft Drinks', description: 'Coca-Cola, Fanta, Sprite', price: 3.00, category: 'Beverage', is_available: true, sort_order: 20 },
    { name: 'Chocolate Brownie', description: 'Warm chocolate brownie with vanilla ice cream', price: 6.50, category: 'Dessert', is_available: true, sort_order: 21 },
    { name: 'Sticky Toffee Pudding', description: 'Classic British dessert with toffee sauce', price: 7.50, category: 'Dessert', is_available: true, sort_order: 22 },
    { name: 'Cheesecake', description: 'New York style cheesecake, seasonal fruit', price: 6.50, category: 'Dessert', is_available: true, sort_order: 23 },
  ]

  let success = 0
  for (const item of menuItems) {
    const result = await insertData('cafe_menu', item)
    if (result.success) {
      success++
      console.log(`  ✅ ${item.name}`)
    } else {
      console.log(`  ⚠️  ${item.name}: ${result.error?.substring(0, 100)}`)
    }
    await new Promise(resolve => setTimeout(resolve, 100)) // Small delay
  }
  console.log(`  📊 Inserted ${success}/${menuItems.length} menu items`)
  return success
}

async function main() {
  console.log('🚀 Seeding Data via API...\n')
  console.log('⚠️  Note: This can only insert data into existing tables.')
  console.log('    You still need to run the schema migration first!\n')

  // Check if tables exist first
  const tables = ['amenities_global', 'content_blocks', 'cafe_menu']
  let tablesExist = 0

  for (const table of tables) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`, {
        method: 'GET',
        headers,
      })
      if (response.ok) {
        console.log(`✅ Table "${table}" exists`)
        tablesExist++
      } else {
        console.log(`❌ Table "${table}" does not exist - run schema migration first!`)
      }
    } catch {
      console.log(`❌ Table "${table}" does not exist - run schema migration first!`)
    }
  }

  if (tablesExist < tables.length) {
    console.log('\n⚠️  Some tables are missing. Please run the schema migration first:')
    console.log('   1. Go to: https://supabase.com/dashboard/project/ucuchjdexctdvwgafnaa/sql/new')
    console.log('   2. Copy/paste: supabase/migrations/001_sovereign_cms_schema.sql')
    console.log('   3. Click "Run"')
    console.log('\n   Then run this script again to seed the data.')
    return
  }

  // Seed data
  await seedAmenities()
  await seedContentBlocks()
  await seedCafeMenu()

  console.log('\n✅ Data seeding complete!')
  console.log('\n📋 Next: Set Vercel environment variables and redeploy')
}

main().catch(error => {
  console.error('\n❌ Error:', error.message)
  process.exit(1)
})

