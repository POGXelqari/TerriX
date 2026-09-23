-- ==============================================================================
-- Clan Bank Manager (CBM) - Supabase PostgreSQL Database Schema
-- ==============================================================================
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- to initialize the complete CBM treasury, ledger, loan, and transaction tables.
-- ==============================================================================

-- 1. Registered Clan Member Accounts
CREATE TABLE IF NOT EXISTS public.cbm_accounts (
    account_name TEXT PRIMARY KEY,
    display_name TEXT,
    password_hash TEXT, -- Salted PBKDF2-HMAC-SHA256 website login password
    password_salt TEXT, -- Cryptographic salt for CBM password
    primary_territorial_account TEXT, -- Primary Territorial.io account (e.g. B8bbq)
    avatar_url TEXT DEFAULT 'https://api.dicebear.com/7.x/identicon/svg?seed=cbm-guest', -- Profile picture URL or Base64
    clan_tag TEXT DEFAULT 'ANTI-OG',
    role TEXT DEFAULT 'member', -- 'member', 'officer', 'leader', 'system'
    deposited_cents BIGINT DEFAULT 0, -- Current available balance in cents (1 Gold = 100 cents)
    total_deposited_cents BIGINT DEFAULT 0,
    total_withdrawn_cents BIGINT DEFAULT 0,
    pin_hash TEXT, -- Salted SHA-256 hash of 4-8 digit CBM Access PIN
    salt TEXT, -- Cryptographic random salt for PIN hashing
    is_verified BOOLEAN DEFAULT FALSE, -- Ownership verified via in-game deposit/credentials
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cbm_accounts ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.cbm_accounts ADD COLUMN IF NOT EXISTS password_salt TEXT;
ALTER TABLE public.cbm_accounts ADD COLUMN IF NOT EXISTS primary_territorial_account TEXT;
ALTER TABLE public.cbm_accounts ALTER COLUMN avatar_url SET DEFAULT 'https://api.dicebear.com/7.x/identicon/svg?seed=cbm-guest';

-- 2. Double-Entry Accounting Ledger
CREATE TABLE IF NOT EXISTS public.cbm_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_name TEXT REFERENCES public.cbm_accounts(account_name) ON DELETE CASCADE,
    entry_type TEXT NOT NULL, -- 'DEPOSIT', 'WITHDRAWAL', 'LOAN_DISBURSEMENT', 'LOAN_REPAYMENT', 'TREASURY_INJECTION', 'FEE'
    amount_cents BIGINT NOT NULL,
    balance_after_cents BIGINT NOT NULL,
    tx_hash TEXT, -- Territorial.io transaction identifier / timestamp
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Central Treasury & Reserve Accounting
CREATE TABLE IF NOT EXISTS public.cbm_treasury (
    id INT PRIMARY KEY DEFAULT 1,
    vault_account_name TEXT DEFAULT 'DdcBC',
    vault_total_gold_cents BIGINT DEFAULT 0, -- Total physical gold in vault account
    member_liabilities_cents BIGINT DEFAULT 0, -- Total gold deposited by registered members
    bank_reserves_cents BIGINT DEFAULT 0, -- Unencumbered reserves = vault_total - member_liabilities
    last_sync_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_treasury_row CHECK (id = 1)
);

-- Initialize Treasury Singleton row (Values audited dynamically against live API)
INSERT INTO public.cbm_treasury (id, vault_account_name, vault_total_gold_cents, member_liabilities_cents, bank_reserves_cents)
VALUES (1, 'DdcBC', 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.cbm_treasury ADD COLUMN IF NOT EXISTS audit_status TEXT DEFAULT 'VERIFIED_LIVE';
ALTER TABLE public.cbm_treasury ADD COLUMN IF NOT EXISTS unencumbered_capital_cents BIGINT DEFAULT 0;
ALTER TABLE public.cbm_treasury ADD COLUMN IF NOT EXISTS loan_penalties_cents BIGINT DEFAULT 0;

-- 4. Reconciled External Transaction Ledger (Replay Protection)
CREATE TABLE IF NOT EXISTS public.cbm_processed_txs (
    tx_id TEXT PRIMARY KEY, -- SHA-256 (timestamp_ms + sender + receiver + amount)
    timestamp_ms BIGINT NOT NULL,
    sender TEXT NOT NULL,
    receiver TEXT NOT NULL,
    amount_gold NUMERIC NOT NULL,
    fee_gold NUMERIC NOT NULL,
    credited_account TEXT,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Withdrawal Requests & Queue
CREATE TABLE IF NOT EXISTS public.cbm_withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_name TEXT REFERENCES public.cbm_accounts(account_name) ON DELETE CASCADE,
    target_account TEXT NOT NULL,
    amount_gold INT NOT NULL,
    fee_cents BIGINT DEFAULT 0, -- 0 fee charged to member (game fee covered by Bank)
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'EXECUTED', 'REJECTED'
    approved_by TEXT,
    tx_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    executed_at TIMESTAMPTZ
);

-- 6. Member Loan Facilities
CREATE TABLE IF NOT EXISTS public.cbm_loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_name TEXT REFERENCES public.cbm_accounts(account_name) ON DELETE CASCADE,
    principal_gold INT NOT NULL,
    interest_rate_percent NUMERIC DEFAULT 0.0,
    penalty_interest_rate NUMERIC DEFAULT 50.0, -- 50% forced interest rate after exceeding 14 days
    term_days INT DEFAULT 14,
    due_at TIMESTAMPTZ,
    repaid_cents BIGINT DEFAULT 0,
    penalty_cents BIGINT DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'OVERDUE', 'REPAID', 'DEFAULTED'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Linked Territorial.io Payment Methods (In-Game Accounts & Credentials)
CREATE TABLE IF NOT EXISTS public.cbm_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cbm_username TEXT NOT NULL REFERENCES public.cbm_accounts(account_name) ON DELETE CASCADE,
    territorial_account_name TEXT NOT NULL UNIQUE,
    territorial_password TEXT, -- For automated 1-click payouts
    display_name TEXT,
    verification_type TEXT NOT NULL DEFAULT 'INPUT_CREDENTIALS', -- 'INPUT_CREDENTIALS' or 'TRANSACTION_VERIFIED'
    status TEXT NOT NULL DEFAULT 'VERIFIED', -- 'VERIFIED', 'PENDING'
    is_primary BOOLEAN DEFAULT FALSE,
    total_transacted_gold NUMERIC DEFAULT 0,
    linked_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schema Migration Safety (Ensures existing tables receive new columns without conflict)
ALTER TABLE public.cbm_accounts ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.cbm_accounts ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.cbm_accounts ADD COLUMN IF NOT EXISTS clan_tag TEXT DEFAULT 'ANTI-OG';
ALTER TABLE public.cbm_accounts ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';
ALTER TABLE public.cbm_accounts ADD COLUMN IF NOT EXISTS deposited_cents BIGINT DEFAULT 0;
ALTER TABLE public.cbm_accounts ADD COLUMN IF NOT EXISTS total_deposited_cents BIGINT DEFAULT 0;
ALTER TABLE public.cbm_accounts ADD COLUMN IF NOT EXISTS total_withdrawn_cents BIGINT DEFAULT 0;
ALTER TABLE public.cbm_accounts ADD COLUMN IF NOT EXISTS pin_hash TEXT;
ALTER TABLE public.cbm_accounts ADD COLUMN IF NOT EXISTS salt TEXT;
ALTER TABLE public.cbm_accounts ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.cbm_accounts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.cbm_accounts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.cbm_payment_methods ADD COLUMN IF NOT EXISTS territorial_password TEXT;
ALTER TABLE public.cbm_payment_methods ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.cbm_payment_methods ADD COLUMN IF NOT EXISTS verification_type TEXT DEFAULT 'INPUT_CREDENTIALS';
ALTER TABLE public.cbm_payment_methods ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'VERIFIED';
ALTER TABLE public.cbm_payment_methods ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;
ALTER TABLE public.cbm_payment_methods ADD COLUMN IF NOT EXISTS total_transacted_gold NUMERIC DEFAULT 0;

ALTER TABLE public.cbm_loans ADD COLUMN IF NOT EXISTS penalty_interest_rate NUMERIC DEFAULT 50.0;
ALTER TABLE public.cbm_loans ADD COLUMN IF NOT EXISTS penalty_cents BIGINT DEFAULT 0;
ALTER TABLE public.cbm_loans ADD COLUMN IF NOT EXISTS borrower_territorial_account TEXT;
ALTER TABLE public.cbm_loans ADD COLUMN IF NOT EXISTS territorial_password TEXT;
ALTER TABLE public.cbm_loans ADD COLUMN IF NOT EXISTS credential_status TEXT DEFAULT 'VALID';
ALTER TABLE public.cbm_loans ADD COLUMN IF NOT EXISTS last_credential_check_at TIMESTAMPTZ;
ALTER TABLE public.cbm_loans ADD COLUMN IF NOT EXISTS seizure_attempts INT DEFAULT 0;
ALTER TABLE public.cbm_loans ADD COLUMN IF NOT EXISTS last_seizure_attempt_at TIMESTAMPTZ;
ALTER TABLE public.cbm_loans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable Row Level Security (RLS)
ALTER TABLE public.cbm_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbm_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbm_treasury ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbm_processed_txs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbm_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbm_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbm_payment_methods ENABLE ROW LEVEL SECURITY;

-- Allow public read of non-sensitive treasury stats, accounts, & verified transactions (Idempotent DROP + CREATE)
DROP POLICY IF EXISTS "Public read cbm_treasury" ON public.cbm_treasury;
CREATE POLICY "Public read cbm_treasury" ON public.cbm_treasury FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public read cbm_processed_txs" ON public.cbm_processed_txs;
CREATE POLICY "Public read cbm_processed_txs" ON public.cbm_processed_txs FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public read cbm_accounts" ON public.cbm_accounts;
CREATE POLICY "Public read cbm_accounts" ON public.cbm_accounts FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public read cbm_ledger" ON public.cbm_ledger;
CREATE POLICY "Public read cbm_ledger" ON public.cbm_ledger FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public read verified payment methods" ON public.cbm_payment_methods;
CREATE POLICY "Public read verified payment methods" ON public.cbm_payment_methods FOR SELECT USING (status = 'VERIFIED');

-- Service role policies (Backend Wispbyte & Vercel API access - Idempotent DROP + CREATE)
DROP POLICY IF EXISTS "Service role full cbm_accounts" ON public.cbm_accounts;
CREATE POLICY "Service role full cbm_accounts" ON public.cbm_accounts FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role full cbm_ledger" ON public.cbm_ledger;
CREATE POLICY "Service role full cbm_ledger" ON public.cbm_ledger FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role full cbm_treasury" ON public.cbm_treasury;
CREATE POLICY "Service role full cbm_treasury" ON public.cbm_treasury FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role full cbm_processed_txs" ON public.cbm_processed_txs;
CREATE POLICY "Service role full cbm_processed_txs" ON public.cbm_processed_txs FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role full cbm_withdrawals" ON public.cbm_withdrawals;
CREATE POLICY "Service role full cbm_withdrawals" ON public.cbm_withdrawals FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role full cbm_loans" ON public.cbm_loans;
CREATE POLICY "Service role full cbm_loans" ON public.cbm_loans FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role full cbm_payment_methods" ON public.cbm_payment_methods;
CREATE POLICY "Service role full cbm_payment_methods" ON public.cbm_payment_methods FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_cbm_ledger_account ON public.cbm_ledger (account_name);
CREATE INDEX IF NOT EXISTS idx_cbm_processed_txs_sender ON public.cbm_processed_txs (sender);
CREATE INDEX IF NOT EXISTS idx_cbm_processed_txs_receiver ON public.cbm_processed_txs (receiver);
CREATE INDEX IF NOT EXISTS idx_cbm_withdrawals_status ON public.cbm_withdrawals (status);
CREATE INDEX IF NOT EXISTS idx_cbm_pm_username ON public.cbm_payment_methods (cbm_username);
CREATE INDEX IF NOT EXISTS idx_cbm_pm_terri_acc ON public.cbm_payment_methods (territorial_account_name);

-- -----------------------------------------------------------------------------
-- 7. CLAN WAR CHEST & TREASURY DONATIONS
-- Irrevocable unencumbered capital injections directly expanding Bank Reserves.
-- Capital Covenant: Donations create ZERO member liabilities and CANNOT be withdrawn or refunded.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cbm_donations (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    donor_name TEXT NOT NULL,
    territorial_account TEXT,
    amount_gold NUMERIC(12, 2) NOT NULL,
    amount_cents BIGINT NOT NULL,
    message TEXT,
    source TEXT DEFAULT 'BALANCE',
    tx_hash TEXT,
    is_refundable BOOLEAN DEFAULT FALSE NOT NULL,
    status TEXT DEFAULT 'IRREVOCABLE' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT cbm_donations_irrevocable_check CHECK (is_refundable = FALSE AND status = 'IRREVOCABLE')
);

-- Schema Migration: Ensure covenant columns exist if table was previously created
ALTER TABLE public.cbm_donations ADD COLUMN IF NOT EXISTS is_refundable BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE public.cbm_donations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'IRREVOCABLE' NOT NULL;
ALTER TABLE public.cbm_donations DROP CONSTRAINT IF EXISTS cbm_donations_irrevocable_check;
ALTER TABLE public.cbm_donations ADD CONSTRAINT cbm_donations_irrevocable_check CHECK (is_refundable = FALSE AND status = 'IRREVOCABLE');

COMMENT ON TABLE public.cbm_donations IS 'Irrevocable unencumbered war chest capital injections. Zero liabilities created. Cannot be withdrawn or refunded.';

ALTER TABLE public.cbm_donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read-only cbm_donations" ON public.cbm_donations;
CREATE POLICY "Allow public read-only cbm_donations" ON public.cbm_donations FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS "Service role insert cbm_donations" ON public.cbm_donations;
CREATE POLICY "Service role insert cbm_donations" ON public.cbm_donations FOR INSERT TO service_role WITH CHECK (is_refundable = FALSE AND status = 'IRREVOCABLE');

CREATE INDEX IF NOT EXISTS idx_cbm_donations_donor ON public.cbm_donations (donor_name);
CREATE INDEX IF NOT EXISTS idx_cbm_donations_created ON public.cbm_donations (created_at DESC);

-- -----------------------------------------------------------------------------
-- 8. MODEL 3: WEB-DECLARED IN-GAME DONATION SLIPS (15-Minute Expiry)
-- Matches in-game transfers to Clan War Chest donations with custom messages.
-- Pure in-game transfers without an active slip default to personal deposits.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cbm_pending_donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_name TEXT NOT NULL,
    amount_cents BIGINT NOT NULL,
    amount_gold NUMERIC(12, 2) NOT NULL,
    message TEXT DEFAULT '',
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'FULFILLED', 'EXPIRED', 'CANCELLED'
    tx_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cbm_pending_donations_lookup 
ON public.cbm_pending_donations (account_name, amount_cents, status);

ALTER TABLE public.cbm_pending_donations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-only cbm_pending_donations" ON public.cbm_pending_donations;
CREATE POLICY "Allow public read-only cbm_pending_donations" ON public.cbm_pending_donations FOR SELECT TO anon, authenticated USING (TRUE);
DROP POLICY IF EXISTS "Service role manage cbm_pending_donations" ON public.cbm_pending_donations;
CREATE POLICY "Service role manage cbm_pending_donations" ON public.cbm_pending_donations FOR ALL TO service_role USING (TRUE);

-- -----------------------------------------------------------------------------
-- 9. VAULT BALANCE & LIQUIDITY SNAPSHOTS (Periodic Historical Telemetry)
-- Tracks 7-day vault trajectory, liquidity reserves, and net cash flow dynamics.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cbm_vault_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp_epoch NUMERIC(16, 4) NOT NULL,
    vault_total_gold NUMERIC(14, 2) NOT NULL,
    unencumbered_reserves_gold NUMERIC(14, 2) NOT NULL,
    member_liabilities_gold NUMERIC(14, 2) NOT NULL,
    inflow_period_gold NUMERIC(14, 2) DEFAULT 0.0,
    outflow_period_gold NUMERIC(14, 2) DEFAULT 0.0,
    net_flow_gold NUMERIC(14, 2) DEFAULT 0.0,
    tx_count_period INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cbm_vault_snapshots_ts ON public.cbm_vault_snapshots (timestamp_epoch DESC);

ALTER TABLE public.cbm_vault_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-only cbm_vault_snapshots" ON public.cbm_vault_snapshots;
CREATE POLICY "Allow public read-only cbm_vault_snapshots" ON public.cbm_vault_snapshots FOR SELECT TO anon, authenticated USING (TRUE);
DROP POLICY IF EXISTS "Service role manage cbm_vault_snapshots" ON public.cbm_vault_snapshots;
CREATE POLICY "Service role manage cbm_vault_snapshots" ON public.cbm_vault_snapshots FOR ALL TO service_role USING (TRUE);

-- -----------------------------------------------------------------------------
-- 10. ADMIN ELECTION CAMPAIGN & VOTE REWARDS
-- Subsidizes member purchases of Admin votes for the vault account (DdcBC)
-- Funded 1:1 from Unencumbered Bank Reserves with a strict 15% reserve budget cap.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cbm_admin_votes (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    claim_id TEXT UNIQUE NOT NULL,
    cbm_username TEXT NOT NULL,
    voter_account TEXT NOT NULL,
    target_account TEXT NOT NULL DEFAULT 'DdcBC',
    votes_count INTEGER NOT NULL,
    gold_spent NUMERIC(12, 2) NOT NULL,
    reward_gold NUMERIC(12, 2) NOT NULL,
    reward_cents BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    quarantine_until TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    baseline_admin_points INTEGER DEFAULT 0,
    rejection_reason TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cbm_admin_votes_voter ON public.cbm_admin_votes (voter_account);
CREATE INDEX IF NOT EXISTS idx_cbm_admin_votes_user ON public.cbm_admin_votes (cbm_username);
CREATE INDEX IF NOT EXISTS idx_cbm_admin_votes_status ON public.cbm_admin_votes (status);

ALTER TABLE public.cbm_admin_votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-only cbm_admin_votes" ON public.cbm_admin_votes;
CREATE POLICY "Allow public read-only cbm_admin_votes" ON public.cbm_admin_votes FOR SELECT TO anon, authenticated USING (TRUE);
DROP POLICY IF EXISTS "Service role manage cbm_admin_votes" ON public.cbm_admin_votes;
CREATE POLICY "Service role manage cbm_admin_votes" ON public.cbm_admin_votes FOR ALL TO service_role USING (TRUE);

-- -----------------------------------------------------------------------------
-- 11. PRODUCT MARKETPLACE & PAYMENT GATEWAY
-- Lets developers and merchants create products (min 100 Gold) with embeddable widgets.
-- Revenue split: 50% to product owner, 50% to Central Bank reserve cushion.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cbm_products (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    product_id TEXT UNIQUE NOT NULL,
    owner_account TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price_gold NUMERIC(12, 2) NOT NULL,
    price_cents BIGINT NOT NULL,
    callback_url TEXT NOT NULL,
    webhook_url TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    sales_count INTEGER DEFAULT 0,
    total_revenue_gold NUMERIC(12, 2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cbm_products_owner ON public.cbm_products (owner_account);
CREATE INDEX IF NOT EXISTS idx_cbm_products_status ON public.cbm_products (status);

ALTER TABLE public.cbm_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-only cbm_products" ON public.cbm_products;
CREATE POLICY "Allow public read-only cbm_products" ON public.cbm_products FOR SELECT TO anon, authenticated USING (TRUE);
DROP POLICY IF EXISTS "Service role manage cbm_products" ON public.cbm_products;
CREATE POLICY "Service role manage cbm_products" ON public.cbm_products FOR ALL TO service_role USING (TRUE);

CREATE TABLE IF NOT EXISTS public.cbm_product_orders (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    order_id TEXT UNIQUE NOT NULL,
    product_id TEXT NOT NULL,
    buyer_cbm_username TEXT,
    buyer_territorial_account TEXT,
    price_gold NUMERIC(12, 2) NOT NULL,
    price_cents BIGINT NOT NULL,
    owner_share_cents BIGINT NOT NULL,
    cushion_share_cents BIGINT NOT NULL,
    payment_method TEXT NOT NULL,
    tx_hash TEXT,
    verification_token TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    expires_at TIMESTAMPTZ NOT NULL,
    fulfilled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cbm_product_orders_prod ON public.cbm_product_orders (product_id);
CREATE INDEX IF NOT EXISTS idx_cbm_product_orders_status ON public.cbm_product_orders (status);
CREATE INDEX IF NOT EXISTS idx_cbm_product_orders_token ON public.cbm_product_orders (verification_token);

ALTER TABLE public.cbm_product_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-only cbm_product_orders" ON public.cbm_product_orders;
CREATE POLICY "Allow public read-only cbm_product_orders" ON public.cbm_product_orders FOR SELECT TO anon, authenticated USING (TRUE);
DROP POLICY IF EXISTS "Service role manage cbm_product_orders" ON public.cbm_product_orders;
CREATE POLICY "Service role manage cbm_product_orders" ON public.cbm_product_orders FOR ALL TO service_role USING (TRUE);




-- -----------------------------------------------------------------------------
-- 8. REFERRAL PROGRAM
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cbm_referrals (
    id BIGSERIAL PRIMARY KEY,
    inviter_account TEXT NOT NULL,
    invitee_account TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    invitee_donated_gold NUMERIC(14, 2) DEFAULT 0.0,
    invitee_deposited_gold NUMERIC(14, 2) DEFAULT 0.0,
    reward_gold NUMERIC(14, 2) DEFAULT 0.0,
    tier1_rewarded_at TIMESTAMPTZ,
    tier2_rewarded_at TIMESTAMPTZ,
    tier3_rewarded_at TIMESTAMPTZ,
    perpetual_commission_gold NUMERIC(14, 2) DEFAULT 0.0,
    rewarded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cbm_referrals_inviter ON public.cbm_referrals (inviter_account);
CREATE INDEX IF NOT EXISTS idx_cbm_referrals_invitee ON public.cbm_referrals (invitee_account);

ALTER TABLE public.cbm_referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read cbm_referrals" ON public.cbm_referrals;
CREATE POLICY "Allow public read cbm_referrals" ON public.cbm_referrals FOR SELECT TO anon, authenticated USING (TRUE);
DROP POLICY IF EXISTS "Service role manage cbm_referrals" ON public.cbm_referrals;
CREATE POLICY "Service role manage cbm_referrals" ON public.cbm_referrals FOR ALL TO service_role USING (TRUE);
