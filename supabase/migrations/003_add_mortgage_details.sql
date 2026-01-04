-- ============================================
-- ABBEY OS - Add Mortgage Details Column
-- Adds JSONB mortgage_details column to properties table
-- ============================================

-- Add mortgage_details column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='properties' AND column_name='mortgage_details'
    ) THEN
        ALTER TABLE properties ADD COLUMN mortgage_details JSONB DEFAULT '{}';
        
        -- Add comment
        COMMENT ON COLUMN properties.mortgage_details IS 'Stores mortgage information: { "lender": "Barclays", "rate": "4.5%", "balance": 450000, "monthly_payment": 2100 }';
    END IF;
END $$;

-- Create index for JSONB queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_properties_mortgage_details ON properties USING GIN (mortgage_details);

