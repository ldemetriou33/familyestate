-- ============================================
-- ABBEY OS - Sovereign CMS Schema
-- Supabase PostgreSQL Migration
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for location data (optional, for future use)
-- CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE property_type AS ENUM ('Hotel', 'Land', 'Villa', 'Residential', 'Commercial', 'Mixed_Use');
CREATE TYPE property_status AS ENUM ('Active', 'Maintenance', 'Sold', 'Development', 'Archived');
CREATE TYPE unit_category AS ENUM ('Room', 'Suite', 'Plot', 'Apartment', 'Villa');
CREATE TYPE cafe_category AS ENUM ('Breakfast', 'Lunch', 'Dinner', 'Alcohol', 'Event_Special', 'Dessert', 'Beverage');

-- ============================================
-- TABLES
-- ============================================

-- Properties: Parent assets
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type property_type NOT NULL DEFAULT 'Hotel',
    slug TEXT UNIQUE NOT NULL,
    location_lat DECIMAL(10, 8),
    location_long DECIMAL(11, 8),
    status property_status NOT NULL DEFAULT 'Active',
    description TEXT,
    hero_image_url TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    amenities TEXT[] DEFAULT '{}',
    highlights TEXT[] DEFAULT '{}',
    address TEXT,
    city TEXT,
    postcode TEXT,
    country TEXT DEFAULT 'UK',
    meta_title TEXT,
    meta_description TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Units: Children of properties (rooms, suites, plots)
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category unit_category NOT NULL DEFAULT 'Room',
    base_price DECIMAL(10, 2) NOT NULL,
    surge_price DECIMAL(10, 2),
    is_event_mode_active BOOLEAN DEFAULT false,
    amenities TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    capacity INTEGER DEFAULT 2,
    room_number TEXT,
    floor INTEGER,
    description TEXT,
    bed_type TEXT,
    square_meters DECIMAL(8, 2),
    is_available BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(property_id, room_number)
);

-- Content Blocks: Key-value store for no-code editing
CREATE TABLE content_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_key TEXT UNIQUE NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Global Amenities: Central list of amenities
CREATE TABLE amenities_global (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    icon TEXT,
    category TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cafe Menu: F&B items
CREATE TABLE cafe_menu (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category cafe_category NOT NULL,
    is_available BOOLEAN DEFAULT true,
    image_url TEXT,
    allergens TEXT[] DEFAULT '{}',
    dietary_info TEXT[] DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_published ON properties(is_published);
CREATE INDEX idx_properties_slug ON properties(slug);
CREATE INDEX idx_units_property ON units(property_id);
CREATE INDEX idx_units_event_mode ON units(is_event_mode_active);
CREATE INDEX idx_content_blocks_key ON content_blocks(section_key);
CREATE INDEX idx_content_blocks_active ON content_blocks(is_active);
CREATE INDEX idx_cafe_menu_category ON cafe_menu(category);
CREATE INDEX idx_cafe_menu_available ON cafe_menu(is_available);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities_global ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_menu ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if the authenticated user's email matches admin email
    -- This will be set via environment variable in Supabase
    RETURN (
        SELECT auth.jwt() ->> 'email' = current_setting('app.admin_email', true)
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Properties: Public can read, Admin can write
CREATE POLICY "Properties: Public read access"
    ON properties FOR SELECT
    USING (is_published = true AND status != 'Archived');

CREATE POLICY "Properties: Admin write access"
    ON properties FOR ALL
    USING (is_admin());

-- Units: Public can read published units, Admin can write
CREATE POLICY "Units: Public read access"
    ON units FOR SELECT
    USING (
        is_published = true 
        AND EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = units.property_id 
            AND properties.is_published = true
            AND properties.status != 'Archived'
        )
    );

CREATE POLICY "Units: Admin write access"
    ON units FOR ALL
    USING (is_admin());

-- Content Blocks: Public can read active blocks, Admin can write
CREATE POLICY "Content Blocks: Public read access"
    ON content_blocks FOR SELECT
    USING (is_active = true);

CREATE POLICY "Content Blocks: Admin write access"
    ON content_blocks FOR ALL
    USING (is_admin());

-- Amenities: Public can read active amenities, Admin can write
CREATE POLICY "Amenities: Public read access"
    ON amenities_global FOR SELECT
    USING (is_active = true);

CREATE POLICY "Amenities: Admin write access"
    ON amenities_global FOR ALL
    USING (is_admin());

-- Cafe Menu: Public can read available items, Admin can write
CREATE POLICY "Cafe Menu: Public read access"
    ON cafe_menu FOR SELECT
    USING (is_available = true);

CREATE POLICY "Cafe Menu: Admin write access"
    ON cafe_menu FOR ALL
    USING (is_admin());

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_units_updated_at
    BEFORE UPDATE ON units
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_blocks_updated_at
    BEFORE UPDATE ON content_blocks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cafe_menu_updated_at
    BEFORE UPDATE ON cafe_menu
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate surge_price when event mode is activated
CREATE OR REPLACE FUNCTION calculate_surge_price()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_event_mode_active = true AND NEW.surge_price IS NULL THEN
        -- Default surge: 1.5x base price (50% increase)
        NEW.surge_price := NEW.base_price * 1.5;
    ELSIF NEW.is_event_mode_active = false THEN
        NEW.surge_price := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_surge_price_trigger
    BEFORE INSERT OR UPDATE ON units
    FOR EACH ROW
    EXECUTE FUNCTION calculate_surge_price();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE properties IS 'Parent assets (hotels, land, villas)';
COMMENT ON TABLE units IS 'Child units (rooms, suites, plots) with dynamic pricing';
COMMENT ON TABLE content_blocks IS 'Key-value store for no-code site editing';
COMMENT ON TABLE amenities_global IS 'Central amenities catalog';
COMMENT ON TABLE cafe_menu IS 'F&B menu items';

COMMENT ON COLUMN units.is_event_mode_active IS 'When true, display surge_price and High Demand badge';
COMMENT ON COLUMN units.surge_price IS 'Calculated event pricing (auto-set when event_mode_active = true)';

