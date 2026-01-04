-- ============================================
-- ABBEY OS - Force Seed Data
-- Populates database with Abbey Point Hotel and Cyprus Land
-- Run this in Supabase SQL Editor after migrations
-- ============================================

-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE units CASCADE;
-- TRUNCATE TABLE properties CASCADE;
-- TRUNCATE TABLE content_blocks CASCADE;

-- ============================================
-- PROPERTIES
-- ============================================

-- Property 1: Abbey Point Hotel (Wembley)
INSERT INTO properties (
    id,
    name,
    slug,
    type,
    status,
    description,
    city,
    country,
    address,
    location_lat,
    location_long,
    hero_image_url,
    is_featured,
    is_published,
    mortgage_details,
    created_at,
    updated_at
) VALUES (
    COALESCE((SELECT id FROM properties WHERE slug = 'abbey-point-hotel' LIMIT 1), gen_random_uuid()),
    'Abbey Point Hotel',
    'abbey-point-hotel',
    'Hotel',
    'Active',
    'Modern hotel in the heart of Wembley, offering stunning views of Wembley Arch. Perfect for business travelers and event attendees.',
    'Wembley',
    'UK',
    'Wembley Park, London',
    51.5584,
    -0.2966,
    NULL, -- Add hero image URL if available
    true,
    true,
    '{
        "lender": "Barclays",
        "rate": "4.5%",
        "balance": 450000,
        "monthly_payment": 2100,
        "loan_type": "fixed",
        "term_years": 25,
        "start_date": "2020-01-15"
    }'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    status = EXCLUDED.status,
    description = EXCLUDED.description,
    city = EXCLUDED.city,
    country = EXCLUDED.country,
    address = EXCLUDED.address,
    location_lat = EXCLUDED.location_lat,
    location_long = EXCLUDED.location_long,
    mortgage_details = EXCLUDED.mortgage_details,
    updated_at = NOW();

-- Property 2: Cyprus Mountain Land
INSERT INTO properties (
    id,
    name,
    slug,
    type,
    status,
    description,
    city,
    country,
    address,
    location_lat,
    location_long,
    hero_image_url,
    is_featured,
    is_published,
    mortgage_details,
    created_at,
    updated_at
) VALUES (
    COALESCE((SELECT id FROM properties WHERE slug = 'cyprus-mountain-land' LIMIT 1), gen_random_uuid()),
    'Cyprus Mountain Land',
    'cyprus-mountain-land',
    'Land',
    'Hold',
    'Prime development land in the mountains of Cyprus. Currently on hold pending planning approval.',
    'Troodos',
    'Cyprus',
    'Troodos Mountains',
    34.9167,
    32.8333,
    NULL,
    false,
    false,
    '{}'::jsonb, -- No mortgage
    NOW(),
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    status = EXCLUDED.status,
    description = EXCLUDED.description,
    city = EXCLUDED.city,
    country = EXCLUDED.country,
    address = EXCLUDED.address,
    location_lat = EXCLUDED.location_lat,
    location_long = EXCLUDED.location_long,
    mortgage_details = EXCLUDED.mortgage_details,
    updated_at = NOW();

-- ============================================
-- UNITS (Rooms for Abbey Point Hotel)
-- ============================================

-- Get Abbey Point Hotel ID
DO $$
DECLARE
    hotel_id UUID;
BEGIN
    SELECT id INTO hotel_id FROM properties WHERE slug = 'abbey-point-hotel' LIMIT 1;
    
    IF hotel_id IS NULL THEN
        RAISE EXCEPTION 'Abbey Point Hotel not found. Run property inserts first.';
    END IF;

    -- 5 "Arch View" rooms
    INSERT INTO units (
        id,
        property_id,
        name,
        category,
        base_price,
        surge_price,
        is_event_mode_active,
        amenities,
        images,
        capacity,
        room_number,
        description,
        is_available,
        is_published,
        created_at,
        updated_at
    ) VALUES
    (
        COALESCE((SELECT id FROM units WHERE property_id = hotel_id AND room_number = '101' LIMIT 1), gen_random_uuid()),
        hotel_id,
        'Arch View Deluxe',
        'Room',
        120.00,
        180.00,
        true, -- Event mode active
        ARRAY['WiFi', 'TV', 'Air Conditioning', 'Balcony', 'Mini Bar'],
        ARRAY[]::TEXT[],
        2,
        '101',
        'Spacious room with stunning views of Wembley Arch. Perfect for event weekends.',
        true,
        true,
        NOW(),
        NOW()
    ),
    (
        COALESCE((SELECT id FROM units WHERE property_id = hotel_id AND room_number = '102' LIMIT 1), gen_random_uuid()),
        hotel_id,
        'Arch View Deluxe',
        'Room',
        120.00,
        180.00,
        true,
        ARRAY['WiFi', 'TV', 'Air Conditioning', 'Balcony', 'Mini Bar'],
        ARRAY[]::TEXT[],
        2,
        '102',
        'Spacious room with stunning views of Wembley Arch.',
        true,
        true,
        NOW(),
        NOW()
    ),
    (
        COALESCE((SELECT id FROM units WHERE property_id = hotel_id AND room_number = '103' LIMIT 1), gen_random_uuid()),
        hotel_id,
        'Arch View Deluxe',
        'Room',
        120.00,
        180.00,
        false, -- Event mode inactive
        ARRAY['WiFi', 'TV', 'Air Conditioning', 'Balcony'],
        ARRAY[]::TEXT[],
        2,
        '103',
        'Spacious room with stunning views of Wembley Arch.',
        true,
        true,
        NOW(),
        NOW()
    ),
    (
        COALESCE((SELECT id FROM units WHERE property_id = hotel_id AND room_number = '104' LIMIT 1), gen_random_uuid()),
        hotel_id,
        'Arch View Deluxe',
        'Room',
        120.00,
        NULL,
        false,
        ARRAY['WiFi', 'TV', 'Air Conditioning', 'Balcony'],
        ARRAY[]::TEXT[],
        2,
        '104',
        'Spacious room with stunning views of Wembley Arch.',
        true,
        true,
        NOW(),
        NOW()
    ),
    (
        COALESCE((SELECT id FROM units WHERE property_id = hotel_id AND room_number = '105' LIMIT 1), gen_random_uuid()),
        hotel_id,
        'Arch View Deluxe',
        'Room',
        120.00,
        NULL,
        false,
        ARRAY['WiFi', 'TV', 'Air Conditioning', 'Balcony'],
        ARRAY[]::TEXT[],
        2,
        '105',
        'Spacious room with stunning views of Wembley Arch.',
        true,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (property_id, room_number) DO UPDATE SET
        name = EXCLUDED.name,
        base_price = EXCLUDED.base_price,
        surge_price = EXCLUDED.surge_price,
        is_event_mode_active = EXCLUDED.is_event_mode_active,
        amenities = EXCLUDED.amenities,
        updated_at = NOW();

    -- 10 "Standard" rooms
    INSERT INTO units (
        id,
        property_id,
        name,
        category,
        base_price,
        surge_price,
        is_event_mode_active,
        amenities,
        images,
        capacity,
        room_number,
        description,
        is_available,
        is_published,
        created_at,
        updated_at
    ) VALUES
    (
        COALESCE((SELECT id FROM units WHERE property_id = hotel_id AND room_number = '201' LIMIT 1), gen_random_uuid()),
        hotel_id,
        'Standard Room',
        'Room',
        80.00,
        NULL,
        false,
        ARRAY['WiFi', 'TV', 'Air Conditioning'],
        ARRAY[]::TEXT[],
        2,
        '201',
        'Comfortable standard room with all essential amenities.',
        true,
        true,
        NOW(),
        NOW()
    ),
    (
        COALESCE((SELECT id FROM units WHERE property_id = hotel_id AND room_number = '202' LIMIT 1), gen_random_uuid()),
        hotel_id,
        'Standard Room',
        'Room',
        80.00,
        NULL,
        false,
        ARRAY['WiFi', 'TV', 'Air Conditioning'],
        ARRAY[]::TEXT[],
        2,
        '202',
        'Comfortable standard room.',
        true,
        true,
        NOW(),
        NOW()
    ),
    (
        COALESCE((SELECT id FROM units WHERE property_id = hotel_id AND room_number = '203' LIMIT 1), gen_random_uuid()),
        hotel_id,
        'Standard Room',
        'Room',
        80.00,
        NULL,
        false,
        ARRAY['WiFi', 'TV', 'Air Conditioning'],
        ARRAY[]::TEXT[],
        2,
        '203',
        'Comfortable standard room.',
        true,
        true,
        NOW(),
        NOW()
    ),
    (
        COALESCE((SELECT id FROM units WHERE property_id = hotel_id AND room_number = '204' LIMIT 1), gen_random_uuid()),
        hotel_id,
        'Standard Room',
        'Room',
        80.00,
        NULL,
        false,
        ARRAY['WiFi', 'TV', 'Air Conditioning'],
        ARRAY[]::TEXT[],
        2,
        '204',
        'Comfortable standard room.',
        true,
        true,
        NOW(),
        NOW()
    ),
    (
        COALESCE((SELECT id FROM units WHERE property_id = hotel_id AND room_number = '205' LIMIT 1), gen_random_uuid()),
        hotel_id,
        'Standard Room',
        'Room',
        80.00,
        NULL,
        false,
        ARRAY['WiFi', 'TV', 'Air Conditioning'],
        ARRAY[]::TEXT[],
        2,
        '205',
        'Comfortable standard room.',
        true,
        true,
        NOW(),
        NOW()
    ),
    (
        COALESCE((SELECT id FROM units WHERE property_id = hotel_id AND room_number = '206' LIMIT 1), gen_random_uuid()),
        hotel_id,
        'Standard Room',
        'Room',
        80.00,
        NULL,
        false,
        ARRAY['WiFi', 'TV', 'Air Conditioning'],
        ARRAY[]::TEXT[],
        2,
        '206',
        'Comfortable standard room.',
        true,
        true,
        NOW(),
        NOW()
    ),
    (
        COALESCE((SELECT id FROM units WHERE property_id = hotel_id AND room_number = '207' LIMIT 1), gen_random_uuid()),
        hotel_id,
        'Standard Room',
        'Room',
        80.00,
        NULL,
        false,
        ARRAY['WiFi', 'TV', 'Air Conditioning'],
        ARRAY[]::TEXT[],
        2,
        '207',
        'Comfortable standard room.',
        true,
        true,
        NOW(),
        NOW()
    ),
    (
        COALESCE((SELECT id FROM units WHERE property_id = hotel_id AND room_number = '208' LIMIT 1), gen_random_uuid()),
        hotel_id,
        'Standard Room',
        'Room',
        80.00,
        NULL,
        false,
        ARRAY['WiFi', 'TV', 'Air Conditioning'],
        ARRAY[]::TEXT[],
        2,
        '208',
        'Comfortable standard room.',
        true,
        true,
        NOW(),
        NOW()
    ),
    (
        COALESCE((SELECT id FROM units WHERE property_id = hotel_id AND room_number = '209' LIMIT 1), gen_random_uuid()),
        hotel_id,
        'Standard Room',
        'Room',
        80.00,
        NULL,
        false,
        ARRAY['WiFi', 'TV', 'Air Conditioning'],
        ARRAY[]::TEXT[],
        2,
        '209',
        'Comfortable standard room.',
        true,
        true,
        NOW(),
        NOW()
    ),
    (
        COALESCE((SELECT id FROM units WHERE property_id = hotel_id AND room_number = '210' LIMIT 1), gen_random_uuid()),
        hotel_id,
        'Standard Room',
        'Room',
        80.00,
        NULL,
        false,
        ARRAY['WiFi', 'TV', 'Air Conditioning'],
        ARRAY[]::TEXT[],
        2,
        '210',
        'Comfortable standard room.',
        true,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (property_id, room_number) DO UPDATE SET
        name = EXCLUDED.name,
        base_price = EXCLUDED.base_price,
        surge_price = EXCLUDED.surge_price,
        is_event_mode_active = EXCLUDED.is_event_mode_active,
        amenities = EXCLUDED.amenities,
        updated_at = NOW();

END $$;

-- ============================================
-- CONTENT BLOCKS
-- ============================================

INSERT INTO content_blocks (section_key, content, is_active, created_at, updated_at) VALUES
(
    'homepage_hero',
    '{
        "title": "Welcome to Abbey OS",
        "subtitle": "Your Complete Property Management Solution",
        "cta_text": "Explore Properties",
        "cta_link": "/properties"
    }'::jsonb,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (section_key) DO UPDATE SET
    content = EXCLUDED.content,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO content_blocks (section_key, content, is_active, created_at, updated_at) VALUES
(
    'homepage_best_value',
    '{
        "heading": "Best Value in Wembley",
        "description": "Experience luxury accommodation at unbeatable prices. Our rooms offer stunning views and modern amenities.",
        "highlight": "From £80/night"
    }'::jsonb,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (section_key) DO UPDATE SET
    content = EXCLUDED.content,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO content_blocks (section_key, content, is_active, created_at, updated_at) VALUES
(
    'about_us',
    '{
        "title": "About Abbey OS",
        "content": "Abbey OS is a comprehensive property management system designed to streamline operations across hotels, residential properties, and land assets. Built with modern technology to provide real-time insights and control."
    }'::jsonb,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (section_key) DO UPDATE SET
    content = EXCLUDED.content,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ============================================
-- VERIFICATION
-- ============================================

-- Show summary
SELECT 
    'Properties' as table_name,
    COUNT(*) as count
FROM properties
UNION ALL
SELECT 
    'Units' as table_name,
    COUNT(*) as count
FROM units
UNION ALL
SELECT 
    'Content Blocks' as table_name,
    COUNT(*) as count
FROM content_blocks;

