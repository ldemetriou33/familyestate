-- Multi-Tenant SaaS Schema for Abbey OS
-- Enables multiple families/estates to use the platform

-- Families/Estates Table (Top-level tenant)
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP', -- USD, GBP, EUR
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Settings
  settings JSONB DEFAULT '{}'::jsonb
);

-- Users Table (linked to families)
CREATE TABLE IF NOT EXISTS family_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References auth.users
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member, viewer
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(family_id, user_id)
);

-- Entities Table (Legal entities within a family)
CREATE TABLE IF NOT EXISTS entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'LTD', -- LTD, TRUST, PERSONAL, FOUNDATION
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(family_id, name)
);

-- Assets Table (Multi-tenant version of sovereign assets)
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  
  -- Asset Details
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  currency TEXT NOT NULL, -- GBP, EUR, USD
  valuation DECIMAL(15, 2) NOT NULL DEFAULT 0,
  
  -- Ownership
  principal_ownership DECIMAL(5, 2) NOT NULL DEFAULT 0, -- Percentage (0-100)
  minority_ownership DECIMAL(5, 2) NOT NULL DEFAULT 0, -- Percentage (0-100)
  
  -- Classification
  tier TEXT NOT NULL DEFAULT 'B', -- S, A, B, C, D
  category TEXT, -- Core, Value-Add, Opportunistic
  asset_class TEXT, -- Commercial, Land, Residential
  status TEXT NOT NULL DEFAULT 'OPERATIONAL', -- OPERATIONAL, LEASED, STRATEGIC_HOLD, RENOVATION, PRUNE
  
  -- Metadata (JSONB for flexibility)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT ownership_check CHECK (principal_ownership + minority_ownership <= 100)
);

-- Debts Table (linked to assets)
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  
  -- Debt Details
  creditor_name TEXT NOT NULL,
  principal DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  debt_type TEXT NOT NULL, -- FIXED, VARIABLE, EQUITY_RELEASE
  is_compound BOOLEAN DEFAULT false,
  currency TEXT NOT NULL,
  
  -- Maturity
  maturity_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_family_users_family_id ON family_users(family_id);
CREATE INDEX IF NOT EXISTS idx_family_users_user_id ON family_users(user_id);
CREATE INDEX IF NOT EXISTS idx_entities_family_id ON entities(family_id);
CREATE INDEX IF NOT EXISTS idx_assets_family_id ON assets(family_id);
CREATE INDEX IF NOT EXISTS idx_assets_entity_id ON assets(entity_id);
CREATE INDEX IF NOT EXISTS idx_debts_family_id ON debts(family_id);
CREATE INDEX IF NOT EXISTS idx_debts_asset_id ON debts(asset_id);

-- Row Level Security (RLS) Policies
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see families they belong to
CREATE POLICY "Users can view their families"
  ON families FOR SELECT
  USING (
    id IN (
      SELECT family_id FROM family_users 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update their families (if owner/admin)
CREATE POLICY "Owners/admins can update families"
  ON families FOR UPDATE
  USING (
    id IN (
      SELECT family_id FROM family_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policy: Users can view entities in their families
CREATE POLICY "Users can view their family entities"
  ON entities FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_users 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can manage entities (if owner/admin)
CREATE POLICY "Owners/admins can manage entities"
  ON entities FOR ALL
  USING (
    family_id IN (
      SELECT family_id FROM family_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policy: Users can view assets in their families
CREATE POLICY "Users can view their family assets"
  ON assets FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_users 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can manage assets (if owner/admin)
CREATE POLICY "Owners/admins can manage assets"
  ON assets FOR ALL
  USING (
    family_id IN (
      SELECT family_id FROM family_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policy: Users can view debts in their families
CREATE POLICY "Users can view their family debts"
  ON debts FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_users 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can manage debts (if owner/admin)
CREATE POLICY "Owners/admins can manage debts"
  ON debts FOR ALL
  USING (
    family_id IN (
      SELECT family_id FROM family_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON entities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON debts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

