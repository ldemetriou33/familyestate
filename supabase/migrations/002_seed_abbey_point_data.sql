-- ============================================
-- ABBEY OS - Seed Data
-- Replicates current Abbey Point Hotel website
-- ============================================

-- Set admin email (replace with your actual email)
-- This should be set via Supabase Dashboard > Settings > API > Config
-- ALTER DATABASE postgres SET app.admin_email = 'your-email@example.com';

-- ============================================
-- GLOBAL AMENITIES
-- ============================================

INSERT INTO amenities_global (name, icon, category, description, sort_order) VALUES
('WiFi', 'wifi', 'Connectivity', 'Free high-speed WiFi', 1),
('EV Charging', 'charging-station', 'Parking', 'Electric vehicle charging points', 2),
('24/7 Kiosk', 'clock', 'Services', 'Round-the-clock check-in kiosk', 3),
('Air Conditioning', 'wind', 'Comfort', 'Climate control in all rooms', 4),
('TV', 'tv', 'Entertainment', 'Smart TV with streaming', 5),
('Mini Bar', 'coffee', 'Amenities', 'Stocked mini bar', 6),
('Balcony', 'home', 'Features', 'Private balcony access', 7),
('Kitchenette', 'utensils', 'Features', 'Fully equipped kitchenette', 8),
('Parking', 'car', 'Parking', 'On-site parking available', 9),
('Gym Access', 'dumbbell', 'Fitness', 'Fitness center access', 10)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- PROPERTIES
-- ============================================

-- Abbey Point Hotel (Main Property)
INSERT INTO properties (
    name, type, slug, location_lat, location_long, status,
    description, hero_image_url, address, city, postcode, country,
    meta_title, meta_description, is_featured, is_published, published_at,
    amenities, highlights
) VALUES (
    'Abbey Point Hotel',
    'Hotel',
    'abbey-point-hotel',
    51.5564,  -- Wembley, London approximate
    -0.2965,
    'Active',
    'Boutique hotel in the heart of Wembley, offering stunning views of Wembley Arch. Perfect for event-goers, business travelers, and families. 24 beautifully appointed rooms with modern amenities.',
    NULL, -- Will be uploaded via Media Vault
    'Olympic Way',
    'Wembley',
    'HA9 0WS',
    'UK',
    'Abbey Point Hotel | Best Value Wembley Accommodation',
    'Experience luxury at Abbey Point Hotel. Best value accommodation near Wembley Stadium with stunning arch views. Book direct for exclusive rates.',
    true,
    true,
    NOW(),
    ARRAY['WiFi', 'EV Charging', '24/7 Kiosk', 'Parking', 'Gym Access'],
    ARRAY['Wembley Arch Views', 'Event Day Packages', 'Best Value', 'Direct Booking Discounts']
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Cyprus Land (Future Development)
INSERT INTO properties (
    name, type, slug, location_lat, location_long, status,
    description, address, city, postcode, country,
    is_featured, is_published, published_at
) VALUES (
    'Cyprus Land Development',
    'Land',
    'cyprus-land',
    34.6759,  -- Limassol, Cyprus approximate
    33.0443,
    'Development',
    'Prime development land in Cyprus. Planning approved for luxury villa development.',
    'TBA',
    'Limassol',
    'TBA',
    'CY',
    false,
    false,
    NULL
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- UNITS (Hotel Rooms)
-- ============================================

-- Get the property ID for Abbey Point Hotel
DO $$
DECLARE
    hotel_id UUID;
BEGIN
    SELECT id INTO hotel_id FROM properties WHERE slug = 'abbey-point-hotel';

    -- Standard Rooms (18 rooms)
    INSERT INTO units (
        property_id, name, category, base_price, surge_price, is_event_mode_active,
        room_number, floor, capacity, bed_type, square_meters,
        amenities, description, is_available, is_published, sort_order
    ) VALUES
    -- Wembley Arch View Rooms (Premium - Event Mode Enabled)
    (hotel_id, 'Superking Arch View', 'Room', 120.00, 180.00, true, '101', 1, 2, 'Super King', 25.0,
     ARRAY['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Wembley Arch View'],
     'Stunning views of Wembley Arch. Perfect for event days. Premium room with super king bed.',
     true, true, 1),
    
    (hotel_id, 'Superking Arch View', 'Room', 120.00, 180.00, true, '102', 1, 2, 'Super King', 25.0,
     ARRAY['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Wembley Arch View'],
     'Stunning views of Wembley Arch. Perfect for event days. Premium room with super king bed.',
     true, true, 2),
    
    (hotel_id, 'Superking Arch View', 'Room', 120.00, 180.00, true, '103', 1, 2, 'Super King', 25.0,
     ARRAY['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Wembley Arch View'],
     'Stunning views of Wembley Arch. Perfect for event days. Premium room with super king bed.',
     true, true, 3),
    
    -- Standard Rooms (No Event Mode)
    (hotel_id, 'Standard Double', 'Room', 85.00, NULL, false, '201', 2, 2, 'Double', 20.0,
     ARRAY['WiFi', 'TV', 'Air Conditioning'],
     'Comfortable double room with modern amenities. Great value for money.',
     true, true, 4),
    
    (hotel_id, 'Standard Double', 'Room', 85.00, NULL, false, '202', 2, 2, 'Double', 20.0,
     ARRAY['WiFi', 'TV', 'Air Conditioning'],
     'Comfortable double room with modern amenities. Great value for money.',
     true, true, 5),
    
    (hotel_id, 'Standard Twin', 'Room', 85.00, NULL, false, '203', 2, 2, 'Twin', 20.0,
     ARRAY['WiFi', 'TV', 'Air Conditioning'],
     'Twin room perfect for friends or colleagues traveling together.',
     true, true, 6),
    
    (hotel_id, 'Standard Twin', 'Room', 85.00, NULL, false, '204', 2, 2, 'Twin', 20.0,
     ARRAY['WiFi', 'TV', 'Air Conditioning'],
     'Twin room perfect for friends or colleagues traveling together.',
     true, true, 7),
    
    (hotel_id, 'Standard Double', 'Room', 85.00, NULL, false, '205', 2, 2, 'Double', 20.0,
     ARRAY['WiFi', 'TV', 'Air Conditioning'],
     'Comfortable double room with modern amenities. Great value for money.',
     true, true, 8),
    
    (hotel_id, 'Standard Double', 'Room', 85.00, NULL, false, '206', 2, 2, 'Double', 20.0,
     ARRAY['WiFi', 'TV', 'Air Conditioning'],
     'Comfortable double room with modern amenities. Great value for money.',
     true, true, 9),
    
    -- Suites (Premium)
    (hotel_id, 'Deluxe Suite', 'Suite', 180.00, 270.00, true, '301', 3, 4, 'Super King', 45.0,
     ARRAY['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Kitchenette', 'Wembley Arch View'],
     'Spacious suite with separate living area, kitchenette, and private balcony. Ideal for families or extended stays.',
     true, true, 10),
    
    (hotel_id, 'Deluxe Suite', 'Suite', 180.00, 270.00, true, '302', 3, 4, 'Super King', 45.0,
     ARRAY['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Kitchenette', 'Wembley Arch View'],
     'Spacious suite with separate living area, kitchenette, and private balcony. Ideal for families or extended stays.',
     true, true, 11),
    
    (hotel_id, 'Deluxe Suite', 'Suite', 180.00, 270.00, true, '303', 3, 4, 'Super King', 45.0,
     ARRAY['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Kitchenette', 'Wembley Arch View'],
     'Spacious suite with separate living area, kitchenette, and private balcony. Ideal for families or extended stays.',
     true, true, 12),
    
    -- Additional Standard Rooms
    (hotel_id, 'Standard Double', 'Room', 85.00, NULL, false, '207', 2, 2, 'Double', 20.0,
     ARRAY['WiFi', 'TV', 'Air Conditioning'],
     'Comfortable double room with modern amenities. Great value for money.',
     true, true, 13),
    
    (hotel_id, 'Standard Twin', 'Room', 85.00, NULL, false, '208', 2, 2, 'Twin', 20.0,
     ARRAY['WiFi', 'TV', 'Air Conditioning'],
     'Twin room perfect for friends or colleagues traveling together.',
     true, true, 14),
    
    (hotel_id, 'Standard Double', 'Room', 85.00, NULL, false, '209', 2, 2, 'Double', 20.0,
     ARRAY['WiFi', 'TV', 'Air Conditioning'],
     'Comfortable double room with modern amenities. Great value for money.',
     true, true, 15),
    
    (hotel_id, 'Standard Double', 'Room', 85.00, NULL, false, '210', 2, 2, 'Double', 20.0,
     ARRAY['WiFi', 'TV', 'Air Conditioning'],
     'Comfortable double room with modern amenities. Great value for money.',
     true, true, 16),
    
    (hotel_id, 'Standard Twin', 'Room', 85.00, NULL, false, '211', 2, 2, 'Twin', 20.0,
     ARRAY['WiFi', 'TV', 'Air Conditioning'],
     'Twin room perfect for friends or colleagues traveling together.',
     true, true, 17),
    
    (hotel_id, 'Standard Double', 'Room', 85.00, NULL, false, '212', 2, 2, 'Double', 20.0,
     ARRAY['WiFi', 'TV', 'Air Conditioning'],
     'Comfortable double room with modern amenities. Great value for money.',
     true, true, 18)
    ON CONFLICT (property_id, room_number) DO UPDATE SET
        name = EXCLUDED.name,
        base_price = EXCLUDED.base_price,
        updated_at = NOW();
END $$;

-- ============================================
-- CONTENT BLOCKS
-- ============================================

INSERT INTO content_blocks (section_key, content, is_active) VALUES
-- Homepage Hero
('home_hero', '{
    "title": "Your Mixed Portfolio. One Command Center.",
    "subtitle": "Manage your hotel, cafe, and residential properties from a single dashboard. AI-powered insights. Automated actions. Complete control.",
    "cta_text": "Access Dashboard",
    "cta_link": "/sign-in",
    "secondary_cta_text": "Create Account",
    "secondary_cta_link": "/sign-up"
}'::jsonb, true),

-- Homepage About
('home_about', '{
    "title": "One System. Three Businesses.",
    "description": "Abbey OS unifies your entire property portfolio into a single, intelligent operating system.",
    "features": [
        "Real-time occupancy tracking",
        "Automated revenue management",
        "Predictive maintenance alerts"
    ]
}'::jsonb, true),

-- Homepage Value Proposition
('home_value', '{
    "title": "Best Value Wembley Accommodation",
    "description": "Experience luxury at Abbey Point Hotel. Stunning views of Wembley Arch. Perfect for event-goers and business travelers.",
    "highlights": [
        "Direct booking discounts",
        "Event day packages",
        "24/7 check-in kiosk",
        "EV charging available"
    ]
}'::jsonb, true),

-- FAQ Section
('home_faq', '{
    "title": "Frequently Asked Questions",
    "items": [
        {
            "question": "Do you offer event day packages?",
            "answer": "Yes! We offer special packages for Wembley Stadium events. Book early for best rates."
        },
        {
            "question": "Is parking available?",
            "answer": "Yes, we have on-site parking and EV charging points available."
        },
        {
            "question": "What time is check-in?",
            "answer": "Check-in is from 3 PM. We also have a 24/7 self-service kiosk for late arrivals."
        }
    ]
}'::jsonb, true),

-- Footer
('footer', '{
    "copyright": "© 2026 Abbey OS. All rights reserved.",
    "tagline": "Family Estate Autopilot"
}'::jsonb, true)
ON CONFLICT (section_key) DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = NOW();

-- ============================================
-- CAFE MENU
-- ============================================

INSERT INTO cafe_menu (name, description, price, category, is_available, sort_order) VALUES
-- Breakfast
('Full English Breakfast', 'Two eggs, bacon, sausage, black pudding, baked beans, grilled tomato, toast', 12.50, 'Breakfast', true, 1),
('Continental Breakfast', 'Pastries, fresh fruit, yogurt, cereal, coffee or tea', 8.50, 'Breakfast', true, 2),
('Avocado Toast', 'Sourdough toast, smashed avocado, poached eggs, feta, chilli flakes', 9.50, 'Breakfast', true, 3),
('Pancakes & Maple Syrup', 'Stack of fluffy pancakes with butter and maple syrup', 7.50, 'Breakfast', true, 4),

-- Lunch
('Caesar Salad', 'Romaine lettuce, grilled chicken, parmesan, croutons, caesar dressing', 11.50, 'Lunch', true, 5),
('Fish & Chips', 'Beer-battered cod, hand-cut chips, mushy peas, tartar sauce', 14.50, 'Lunch', true, 6),
('Club Sandwich', 'Triple-decker with chicken, bacon, lettuce, tomato, mayo', 10.50, 'Lunch', true, 7),
('Margherita Pizza', 'Classic margherita with fresh mozzarella and basil', 9.50, 'Lunch', true, 8),

-- Dinner
('Grilled Salmon', 'Pan-seared salmon, seasonal vegetables, lemon butter sauce', 18.50, 'Dinner', true, 9),
('Beef Burger', '8oz prime beef, brioche bun, cheddar, bacon, chips', 15.50, 'Dinner', true, 10),
('Vegetable Risotto', 'Creamy arborio rice, seasonal vegetables, parmesan', 12.50, 'Dinner', true, 11),

-- Alcohol
('House Wine (Glass)', 'Red or white house wine', 6.50, 'Alcohol', true, 12),
('Craft Beer', 'Selection of local craft beers', 5.50, 'Alcohol', true, 13),
('Cocktail of the Day', 'Ask your server for today''s special', 9.50, 'Alcohol', true, 14),

-- Event Specials
('Event Day Package', 'Pre-event meal deal: main + drink + dessert', 22.00, 'Event_Special', true, 15),
('Stadium Snack Box', 'Perfect for taking to events: sandwich, crisps, drink', 8.50, 'Event_Special', true, 16),

-- Beverages
('Espresso', 'Single shot espresso', 2.50, 'Beverage', true, 17),
('Cappuccino', 'Espresso with steamed milk and foam', 3.50, 'Beverage', true, 18),
('Fresh Orange Juice', 'Freshly squeezed orange juice', 4.50, 'Beverage', true, 19),
('Soft Drinks', 'Coca-Cola, Fanta, Sprite', 3.00, 'Beverage', true, 20),

-- Desserts
('Chocolate Brownie', 'Warm chocolate brownie with vanilla ice cream', 6.50, 'Dessert', true, 21),
('Sticky Toffee Pudding', 'Classic British dessert with toffee sauce', 7.50, 'Dessert', true, 22),
('Cheesecake', 'New York style cheesecake, seasonal fruit', 6.50, 'Dessert', true, 23)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify data was inserted
SELECT 'Properties' as table_name, COUNT(*) as count FROM properties
UNION ALL
SELECT 'Units', COUNT(*) FROM units
UNION ALL
SELECT 'Content Blocks', COUNT(*) FROM content_blocks
UNION ALL
SELECT 'Amenities', COUNT(*) FROM amenities_global
UNION ALL
SELECT 'Cafe Menu Items', COUNT(*) FROM cafe_menu;

