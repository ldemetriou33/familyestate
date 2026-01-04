-- ============================================
-- ABBEY OS - Sovereign Mortgage & Debt Tracker
-- Comprehensive debt management for multi-entity estate
-- Supports: UK Property Ltd, Dubai IFZA, Personal, Trusts
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

DO $$ BEGIN
    CREATE TYPE debt_type AS ENUM (
        'MORTGAGE',
        'BRIDGE_LOAN',
        'DEVELOPMENT_FINANCE',
        'PERSONAL_LOAN',
        'BUSINESS_LOAN',
        'CREDIT_LINE',
        'OVERDRAFT',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE loan_structure AS ENUM (
        'FIXED',
        'VARIABLE',
        'TRACKER',
        'DISCOUNT',
        'OFFSET',
        'INTEREST_ONLY',
        'CAPITAL_REPAYMENT'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE debt_status AS ENUM (
        'ACTIVE',
        'PAID_OFF',
        'DEFAULTED',
        'RESTRUCTURED',
        'SOLD',
        'FORECLOSED'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE entity_type AS ENUM (
        'PERSONAL',
        'UK_LTD',
        'UK_LLP',
        'CYPRUS_COMPANY',
        'DUBAI_IFZA',
        'TRUST',
        'FOUNDATION',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE currency_code AS ENUM (
        'GBP',
        'EUR',
        'USD',
        'AED',
        'CHF',
        'JPY',
        'CNY'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- ENTITIES TABLE (Legal Structures)
-- ============================================

CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type entity_type NOT NULL,
    registration_number TEXT,
    jurisdiction TEXT NOT NULL, -- 'UK', 'Cyprus', 'Dubai', etc.
    tax_id TEXT,
    registered_address TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    legal_representative TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT entities_name_unique UNIQUE (name, jurisdiction)
);

-- ============================================
-- MORTGAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS mortgages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Property Link (optional - some mortgages may not be property-specific)
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    
    -- Entity/Owner
    entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
    
    -- Basic Info
    lender_name TEXT NOT NULL,
    account_number TEXT,
    reference_number TEXT,
    
    -- Financial Details
    original_loan_amount DECIMAL(15, 2) NOT NULL,
    current_balance DECIMAL(15, 2) NOT NULL,
    currency currency_code DEFAULT 'GBP',
    
    -- Interest Rate
    interest_rate DECIMAL(6, 4) NOT NULL, -- e.g., 4.5000 for 4.5%
    structure loan_structure NOT NULL DEFAULT 'FIXED',
    base_rate TEXT, -- 'SONIA', 'BOE_BASE', 'EURIBOR', etc. (for variable/tracker)
    margin DECIMAL(6, 4), -- Margin above base rate
    
    -- Term & Dates
    start_date DATE NOT NULL,
    maturity_date DATE,
    term_years INTEGER,
    remaining_years DECIMAL(5, 2), -- Calculated field
    
    -- Payment Details
    monthly_payment DECIMAL(12, 2),
    payment_frequency TEXT DEFAULT 'MONTHLY', -- MONTHLY, QUARTERLY, ANNUAL
    next_payment_date DATE,
    
    -- Early Repayment
    penalty_free_date DATE,
    early_repayment_penalty DECIMAL(10, 2),
    penalty_percentage DECIMAL(5, 2),
    
    -- LTV & Valuation
    property_valuation DECIMAL(15, 2),
    valuation_date DATE,
    ltv_ratio DECIMAL(5, 2), -- Loan-to-Value percentage (calculated)
    max_ltv_allowed DECIMAL(5, 2), -- Lender's maximum LTV
    
    -- Status
    status debt_status DEFAULT 'ACTIVE',
    
    -- Security & Guarantees
    security_type TEXT, -- 'FIRST_CHARGE', 'SECOND_CHARGE', 'UNSECURED'
    guarantor_entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
    
    -- Documents
    mortgage_deed_url TEXT,
    offer_letter_url TEXT,
    valuation_report_url TEXT,
    
    -- Notes & Strategy
    notes TEXT,
    refinance_opportunity BOOLEAN DEFAULT false,
    refinance_notes TEXT,
    
    -- Data Provenance
    data_source TEXT DEFAULT 'MANUAL', -- 'MANUAL', 'BANK_FEED', 'XERO', etc.
    last_synced_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT mortgages_positive_balance CHECK (current_balance >= 0),
    CONSTRAINT mortgages_positive_rate CHECK (interest_rate >= 0),
    CONSTRAINT mortgages_valid_ltv CHECK (ltv_ratio >= 0 AND ltv_ratio <= 100)
);

-- ============================================
-- DEBTS TABLE (Non-Mortgage Debt)
-- ============================================

CREATE TABLE IF NOT EXISTS debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Entity/Owner
    entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
    
    -- Property Link (optional)
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    
    -- Basic Info
    creditor_name TEXT NOT NULL,
    account_number TEXT,
    reference_number TEXT,
    debt_type debt_type NOT NULL,
    
    -- Financial Details
    original_amount DECIMAL(15, 2) NOT NULL,
    current_balance DECIMAL(15, 2) NOT NULL,
    currency currency_code DEFAULT 'GBP',
    
    -- Interest Rate
    interest_rate DECIMAL(6, 4),
    structure loan_structure,
    base_rate TEXT,
    margin DECIMAL(6, 4),
    
    -- Term & Dates
    start_date DATE NOT NULL,
    maturity_date DATE,
    term_years INTEGER,
    
    -- Payment Details
    monthly_payment DECIMAL(12, 2),
    payment_frequency TEXT DEFAULT 'MONTHLY',
    next_payment_date DATE,
    minimum_payment DECIMAL(12, 2),
    
    -- Status
    status debt_status DEFAULT 'ACTIVE',
    
    -- Security
    secured_against TEXT, -- Description of security
    guarantor_entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
    
    -- Documents
    agreement_url TEXT,
    
    -- Notes
    notes TEXT,
    
    -- Data Provenance
    data_source TEXT DEFAULT 'MANUAL',
    last_synced_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT debts_positive_balance CHECK (current_balance >= 0)
);

-- ============================================
-- MORTGAGE PAYMENTS HISTORY
-- ============================================

CREATE TABLE IF NOT EXISTS mortgage_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mortgage_id UUID NOT NULL REFERENCES mortgages(id) ON DELETE CASCADE,
    
    payment_date DATE NOT NULL,
    amount_paid DECIMAL(12, 2) NOT NULL,
    principal_paid DECIMAL(12, 2),
    interest_paid DECIMAL(12, 2),
    fees_paid DECIMAL(12, 2) DEFAULT 0,
    
    -- Balance after payment
    balance_after DECIMAL(15, 2),
    
    -- Payment method
    payment_method TEXT, -- 'BANK_TRANSFER', 'DIRECT_DEBIT', 'CHEQUE', etc.
    transaction_reference TEXT,
    
    -- Status
    status TEXT DEFAULT 'PAID', -- 'PAID', 'PENDING', 'MISSED', 'PARTIAL'
    
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DEBT STRESS TESTS
-- ============================================

CREATE TABLE IF NOT EXISTS debt_stress_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mortgage_id UUID REFERENCES mortgages(id) ON DELETE CASCADE,
    debt_id UUID REFERENCES debts(id) ON DELETE CASCADE,
    
    scenario_name TEXT NOT NULL, -- 'BASE_CASE', 'RATE_RISE_2%', 'VALUATION_DROP_20%', etc.
    test_date DATE NOT NULL,
    
    -- Scenario Parameters
    assumed_interest_rate DECIMAL(6, 4),
    assumed_property_value DECIMAL(15, 2),
    assumed_rental_income DECIMAL(12, 2),
    
    -- Results
    new_monthly_payment DECIMAL(12, 2),
    new_ltv DECIMAL(5, 2),
    debt_service_ratio DECIMAL(5, 2), -- DSR = (Debt Payments / Income) * 100
    can_service_debt BOOLEAN,
    months_until_default INTEGER, -- If negative, already in default
    
    -- Risk Assessment
    risk_level TEXT, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    recommendation TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_mortgages_property ON mortgages(property_id);
CREATE INDEX IF NOT EXISTS idx_mortgages_entity ON mortgages(entity_id);
CREATE INDEX IF NOT EXISTS idx_mortgages_status ON mortgages(status);
CREATE INDEX IF NOT EXISTS idx_mortgages_maturity ON mortgages(maturity_date);
CREATE INDEX IF NOT EXISTS idx_mortgages_next_payment ON mortgages(next_payment_date);
CREATE INDEX IF NOT EXISTS idx_mortgages_currency ON mortgages(currency);

CREATE INDEX IF NOT EXISTS idx_debts_entity ON debts(entity_id);
CREATE INDEX IF NOT EXISTS idx_debts_property ON debts(property_id);
CREATE INDEX IF NOT EXISTS idx_debts_type ON debts(debt_type);
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
CREATE INDEX IF NOT EXISTS idx_debts_currency ON debts(currency);

CREATE INDEX IF NOT EXISTS idx_mortgage_payments_mortgage ON mortgage_payments(mortgage_id);
CREATE INDEX IF NOT EXISTS idx_mortgage_payments_date ON mortgage_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_mortgage_payments_status ON mortgage_payments(status);

CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_jurisdiction ON entities(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_entities_active ON entities(is_active);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-calculate LTV when property_valuation or current_balance changes
CREATE OR REPLACE FUNCTION calculate_mortgage_ltv()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.property_valuation > 0 AND NEW.current_balance > 0 THEN
        NEW.ltv_ratio := (NEW.current_balance / NEW.property_valuation) * 100;
    ELSE
        NEW.ltv_ratio := NULL;
    END IF;
    
    -- Calculate remaining years
    IF NEW.maturity_date IS NOT NULL THEN
        NEW.remaining_years := EXTRACT(YEAR FROM AGE(NEW.maturity_date, CURRENT_DATE));
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_mortgage_ltv
    BEFORE INSERT OR UPDATE ON mortgages
    FOR EACH ROW
    EXECUTE FUNCTION calculate_mortgage_ltv();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mortgages_updated_at
    BEFORE UPDATE ON mortgages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debts_updated_at
    BEFORE UPDATE ON debts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entities_updated_at
    BEFORE UPDATE ON entities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE mortgages ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mortgage_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_stress_tests ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT auth.jwt() ->> 'email' = current_setting('app.admin_email', true)
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Entities: Admin can write, public can read (for portfolio view)
CREATE POLICY "Entities: Public read access"
    ON entities FOR SELECT
    USING (is_active = true);

CREATE POLICY "Entities: Admin write access"
    ON entities FOR ALL
    USING (is_admin());

-- Mortgages: Admin can write, public can read
CREATE POLICY "Mortgages: Public read access"
    ON mortgages FOR SELECT
    USING (status = 'ACTIVE');

CREATE POLICY "Mortgages: Admin write access"
    ON mortgages FOR ALL
    USING (is_admin());

-- Debts: Admin can write, public can read
CREATE POLICY "Debts: Public read access"
    ON debts FOR SELECT
    USING (status = 'ACTIVE');

CREATE POLICY "Debts: Admin write access"
    ON debts FOR ALL
    USING (is_admin());

-- Mortgage Payments: Admin can write, public can read
CREATE POLICY "Mortgage Payments: Public read access"
    ON mortgage_payments FOR SELECT
    USING (true);

CREATE POLICY "Mortgage Payments: Admin write access"
    ON mortgage_payments FOR ALL
    USING (is_admin());

-- Debt Stress Tests: Admin only
CREATE POLICY "Debt Stress Tests: Admin access"
    ON debt_stress_tests FOR ALL
    USING (is_admin());

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE entities IS 'Legal entities (companies, trusts, personal) that own assets';
COMMENT ON TABLE mortgages IS 'Property mortgages with full financial tracking';
COMMENT ON TABLE debts IS 'Non-mortgage debt (loans, credit lines, etc.)';
COMMENT ON TABLE mortgage_payments IS 'Historical payment records for mortgages';
COMMENT ON TABLE debt_stress_tests IS 'Scenario analysis for debt sustainability';

COMMENT ON COLUMN mortgages.ltv_ratio IS 'Loan-to-Value: (current_balance / property_valuation) * 100';
COMMENT ON COLUMN mortgages.structure IS 'FIXED, VARIABLE, TRACKER, etc.';
COMMENT ON COLUMN mortgages.base_rate IS 'Base rate for variable/tracker loans (SONIA, BOE_BASE, EURIBOR)';
COMMENT ON COLUMN mortgages.margin IS 'Margin above base rate (for variable/tracker)';
COMMENT ON COLUMN mortgages.remaining_years IS 'Auto-calculated: years until maturity';

