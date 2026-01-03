#!/usr/bin/env tsx
/**
 * Seed Supabase Database with Abbey Point Hotel Data
 * 
 * Usage:
 *   npx tsx scripts/seed-supabase.ts
 * 
 * Or with environment variables:
 *   DATABASE_URL=postgresql://... npx tsx scripts/seed-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  console.log('🌱 Seeding Supabase database...\n')

  try {
    // 1. Seed Global Amenities
    console.log('📦 Seeding amenities...')
    const { error: amenitiesError } = await supabase
      .from('amenities_global')
      .upsert([
        { name: 'WiFi', icon: 'wifi', category: 'Connectivity', description: 'Free high-speed WiFi', sort_order: 1 },
        { name: 'EV Charging', icon: 'charging-station', category: 'Parking', description: 'Electric vehicle charging points', sort_order: 2 },
        { name: '24/7 Kiosk', icon: 'clock', category: 'Services', description: 'Round-the-clock check-in kiosk', sort_order: 3 },
        { name: 'Air Conditioning', icon: 'wind', category: 'Comfort', description: 'Climate control in all rooms', sort_order: 4 },
        { name: 'TV', icon: 'tv', category: 'Entertainment', description: 'Smart TV with streaming', sort_order: 5 },
        { name: 'Mini Bar', icon: 'coffee', category: 'Amenities', description: 'Stocked mini bar', sort_order: 6 },
        { name: 'Balcony', icon: 'home', category: 'Features', description: 'Private balcony access', sort_order: 7 },
        { name: 'Kitchenette', icon: 'utensils', category: 'Features', description: 'Fully equipped kitchenette', sort_order: 8 },
        { name: 'Parking', icon: 'car', category: 'Parking', description: 'On-site parking available', sort_order: 9 },
        { name: 'Gym Access', icon: 'dumbbell', category: 'Fitness', description: 'Fitness center access', sort_order: 10 },
      ], { onConflict: 'name' })

    if (amenitiesError) throw amenitiesError
    console.log('✅ Amenities seeded\n')

    // 2. Seed Properties
    console.log('🏨 Seeding properties...')
    const { data: hotel, error: hotelError } = await supabase
      .from('properties')
      .upsert({
        name: 'Abbey Point Hotel',
        type: 'Hotel',
        slug: 'abbey-point-hotel',
        location_lat: 51.5564,
        location_long: -0.2965,
        status: 'Active',
        description: 'Boutique hotel in the heart of Wembley, offering stunning views of Wembley Arch. Perfect for event-goers, business travelers, and families. 24 beautifully appointed rooms with modern amenities.',
        address: 'Olympic Way',
        city: 'Wembley',
        postcode: 'HA9 0WS',
        country: 'UK',
        meta_title: 'Abbey Point Hotel | Best Value Wembley Accommodation',
        meta_description: 'Experience luxury at Abbey Point Hotel. Best value accommodation near Wembley Stadium with stunning arch views. Book direct for exclusive rates.',
        is_featured: true,
        is_published: true,
        published_at: new Date().toISOString(),
        amenities: ['WiFi', 'EV Charging', '24/7 Kiosk', 'Parking', 'Gym Access'],
        highlights: ['Wembley Arch Views', 'Event Day Packages', 'Best Value', 'Direct Booking Discounts'],
      }, { onConflict: 'slug' })
      .select()
      .single()

    if (hotelError) throw hotelError
    console.log('✅ Properties seeded\n')

    // 3. Seed Units (Rooms)
    console.log('🛏️  Seeding rooms...')
    const rooms = [
      // Wembley Arch View Rooms (Event Mode Enabled)
      { name: 'Superking Arch View', category: 'Room', base_price: 120.00, surge_price: 180.00, is_event_mode_active: true, room_number: '101', floor: 1, capacity: 2, bed_type: 'Super King', square_meters: 25, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Wembley Arch View'], description: 'Stunning views of Wembley Arch. Perfect for event days. Premium room with super king bed.', sort_order: 1 },
      { name: 'Superking Arch View', category: 'Room', base_price: 120.00, surge_price: 180.00, is_event_mode_active: true, room_number: '102', floor: 1, capacity: 2, bed_type: 'Super King', square_meters: 25, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Wembley Arch View'], description: 'Stunning views of Wembley Arch. Perfect for event days. Premium room with super king bed.', sort_order: 2 },
      { name: 'Superking Arch View', category: 'Room', base_price: 120.00, surge_price: 180.00, is_event_mode_active: true, room_number: '103', floor: 1, capacity: 2, bed_type: 'Super King', square_meters: 25, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Wembley Arch View'], description: 'Stunning views of Wembley Arch. Perfect for event days. Premium room with super king bed.', sort_order: 3 },
      
      // Standard Rooms
      ...Array.from({ length: 12 }, (_, i) => ({
        name: i % 2 === 0 ? 'Standard Double' : 'Standard Twin',
        category: 'Room' as const,
        base_price: 85.00,
        surge_price: null,
        is_event_mode_active: false,
        room_number: String(201 + i),
        floor: 2,
        capacity: 2,
        bed_type: i % 2 === 0 ? 'Double' : 'Twin',
        square_meters: 20,
        amenities: ['WiFi', 'TV', 'Air Conditioning'],
        description: i % 2 === 0 
          ? 'Comfortable double room with modern amenities. Great value for money.'
          : 'Twin room perfect for friends or colleagues traveling together.',
        sort_order: 4 + i,
      })),
      
      // Suites
      ...Array.from({ length: 3 }, (_, i) => ({
        name: 'Deluxe Suite',
        category: 'Suite' as const,
        base_price: 180.00,
        surge_price: 270.00,
        is_event_mode_active: true,
        room_number: String(301 + i),
        floor: 3,
        capacity: 4,
        bed_type: 'Super King',
        square_meters: 45,
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Kitchenette', 'Wembley Arch View'],
        description: 'Spacious suite with separate living area, kitchenette, and private balcony. Ideal for families or extended stays.',
        sort_order: 16 + i,
      })),
    ]

    const { error: roomsError } = await supabase
      .from('units')
      .upsert(
        rooms.map(room => ({
          ...room,
          property_id: hotel.id,
        })),
        { onConflict: 'property_id,room_number' }
      )

    if (roomsError) throw roomsError
    console.log(`✅ ${rooms.length} rooms seeded\n`)

    // 4. Seed Content Blocks
    console.log('📝 Seeding content blocks...')
    const { error: contentError } = await supabase
      .from('content_blocks')
      .upsert([
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
      ], { onConflict: 'section_key' })

    if (contentError) throw contentError
    console.log('✅ Content blocks seeded\n')

    // 5. Seed Cafe Menu
    console.log('🍽️  Seeding cafe menu...')
    const menuItems = [
      // Breakfast
      { name: 'Full English Breakfast', description: 'Two eggs, bacon, sausage, black pudding, baked beans, grilled tomato, toast', price: 12.50, category: 'Breakfast', sort_order: 1 },
      { name: 'Continental Breakfast', description: 'Pastries, fresh fruit, yogurt, cereal, coffee or tea', price: 8.50, category: 'Breakfast', sort_order: 2 },
      { name: 'Avocado Toast', description: 'Sourdough toast, smashed avocado, poached eggs, feta, chilli flakes', price: 9.50, category: 'Breakfast', sort_order: 3 },
      { name: 'Pancakes & Maple Syrup', description: 'Stack of fluffy pancakes with butter and maple syrup', price: 7.50, category: 'Breakfast', sort_order: 4 },
      
      // Lunch
      { name: 'Caesar Salad', description: 'Romaine lettuce, grilled chicken, parmesan, croutons, caesar dressing', price: 11.50, category: 'Lunch', sort_order: 5 },
      { name: 'Fish & Chips', description: 'Beer-battered cod, hand-cut chips, mushy peas, tartar sauce', price: 14.50, category: 'Lunch', sort_order: 6 },
      { name: 'Club Sandwich', description: 'Triple-decker with chicken, bacon, lettuce, tomato, mayo', price: 10.50, category: 'Lunch', sort_order: 7 },
      { name: 'Margherita Pizza', description: 'Classic margherita with fresh mozzarella and basil', price: 9.50, category: 'Lunch', sort_order: 8 },
      
      // Dinner
      { name: 'Grilled Salmon', description: 'Pan-seared salmon, seasonal vegetables, lemon butter sauce', price: 18.50, category: 'Dinner', sort_order: 9 },
      { name: 'Beef Burger', description: '8oz prime beef, brioche bun, cheddar, bacon, chips', price: 15.50, category: 'Dinner', sort_order: 10 },
      { name: 'Vegetable Risotto', description: 'Creamy arborio rice, seasonal vegetables, parmesan', price: 12.50, category: 'Dinner', sort_order: 11 },
      
      // Alcohol
      { name: 'House Wine (Glass)', description: 'Red or white house wine', price: 6.50, category: 'Alcohol', sort_order: 12 },
      { name: 'Craft Beer', description: 'Selection of local craft beers', price: 5.50, category: 'Alcohol', sort_order: 13 },
      { name: 'Cocktail of the Day', description: 'Ask your server for today\'s special', price: 9.50, category: 'Alcohol', sort_order: 14 },
      
      // Event Specials
      { name: 'Event Day Package', description: 'Pre-event meal deal: main + drink + dessert', price: 22.00, category: 'Event_Special', sort_order: 15 },
      { name: 'Stadium Snack Box', description: 'Perfect for taking to events: sandwich, crisps, drink', price: 8.50, category: 'Event_Special', sort_order: 16 },
      
      // Beverages
      { name: 'Espresso', description: 'Single shot espresso', price: 2.50, category: 'Beverage', sort_order: 17 },
      { name: 'Cappuccino', description: 'Espresso with steamed milk and foam', price: 3.50, category: 'Beverage', sort_order: 18 },
      { name: 'Fresh Orange Juice', description: 'Freshly squeezed orange juice', price: 4.50, category: 'Beverage', sort_order: 19 },
      { name: 'Soft Drinks', description: 'Coca-Cola, Fanta, Sprite', price: 3.00, category: 'Beverage', sort_order: 20 },
      
      // Desserts
      { name: 'Chocolate Brownie', description: 'Warm chocolate brownie with vanilla ice cream', price: 6.50, category: 'Dessert', sort_order: 21 },
      { name: 'Sticky Toffee Pudding', description: 'Classic British dessert with toffee sauce', price: 7.50, category: 'Dessert', sort_order: 22 },
      { name: 'Cheesecake', description: 'New York style cheesecake, seasonal fruit', price: 6.50, category: 'Dessert', sort_order: 23 },
    ]

    const { error: menuError } = await supabase
      .from('cafe_menu')
      .upsert(menuItems, { onConflict: 'name' })

    if (menuError) throw menuError
    console.log(`✅ ${menuItems.length} menu items seeded\n`)

    console.log('🎉 Database seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log('  ✅ Amenities: 10')
    console.log('  ✅ Properties: 1 (Abbey Point Hotel)')
    console.log('  ✅ Rooms: 18 (3 Arch View, 12 Standard, 3 Suites)')
    console.log('  ✅ Content Blocks: 4')
    console.log('  ✅ Menu Items: 23')
    console.log('\n✨ Your Abbey OS CMS is ready to use!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()

