-- ============================================
-- ABBEY OS - Seed Sovereign Entities
-- Initial entities for multi-jurisdiction estate
-- ============================================

-- Insert default entities
INSERT INTO entities (id, name, type, jurisdiction, registration_number, is_active, created_at, updated_at) VALUES
(
    gen_random_uuid(),
    'Personal Estate',
    'PERSONAL',
    'UK',
    NULL,
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'UK Property Ltd',
    'UK_LTD',
    'UK',
    '12345678', -- Replace with actual company number
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Cyprus Development Co',
    'CYPRUS_COMPANY',
    'Cyprus',
    NULL,
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Dubai IFZA Entity',
    'DUBAI_IFZA',
    'Dubai',
    NULL,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (name, jurisdiction) DO NOTHING;

-- Example: Link Abbey Point Hotel mortgage to UK Property Ltd
-- (This assumes you have a property with slug 'abbey-point-hotel')
DO $$
DECLARE
    hotel_property_id UUID;
    uk_entity_id UUID;
BEGIN
    -- Get property ID
    SELECT id INTO hotel_property_id FROM properties WHERE slug = 'abbey-point-hotel' LIMIT 1;
    
    -- Get UK entity ID
    SELECT id INTO uk_entity_id FROM entities WHERE name = 'UK Property Ltd' AND jurisdiction = 'UK' LIMIT 1;
    
    -- If both exist, update the mortgage_details to reference the entity
    IF hotel_property_id IS NOT NULL AND uk_entity_id IS NOT NULL THEN
        UPDATE properties
        SET mortgage_details = jsonb_set(
            COALESCE(mortgage_details, '{}'::jsonb),
            '{entity_id}',
            to_jsonb(uk_entity_id::text)
        )
        WHERE id = hotel_property_id;
    END IF;
END $$;

