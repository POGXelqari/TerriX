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
    clan_tag TEXT DEFAULT 'ANTI-OG',
    role TEXT DEFAULT 'member', -- 'member', 'officer', 'leader', 'system'
    deposited_cents BIGINT DEFAULT 0, -- Current available balance in cents (1 Gold = 100 cents)
    total_deposited_cents BIGINT DEFAULT 0,
    total_withdrawn_cents BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Initialize Treasury Singleton row
INSERT INTO public.cbm_treasury (id, vault_account_name, vault_total_gold_cents, member_liabilities_cents, bank_reserves_cents)
VALUES (1, 'DdcBC', 5646, 0, 5646)
ON CONFLICT (id) DO NOTHING;

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
    fee_cents BIGINT DEFAULT 1, -- 1 cent API fee
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
    term_days INT DEFAULT 14,
    due_at TIMESTAMPTZ,
    repaid_cents BIGINT DEFAULT 0,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'ACTIVE', 'REPAID', 'DEFAULTED'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.cbm_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbm_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbm_treasury ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbm_processed_txs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbm_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbm_loans ENABLE ROW LEVEL SECURITY;

-- Allow public read of non-sensitive treasury stats & verified transactions
CREATE POLICY "Public read cbm_treasury" ON public.cbm_treasury FOR SELECT USING (TRUE);
CREATE POLICY "Public read cbm_processed_txs" ON public.cbm_processed_txs FOR SELECT USING (TRUE);

-- Service role policies (Backend Wispbyte & Vercel API access)
CREATE POLICY "Service role full cbm_accounts" ON public.cbm_accounts FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Service role full cbm_ledger" ON public.cbm_ledger FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Service role full cbm_treasury" ON public.cbm_treasury FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Service role full cbm_processed_txs" ON public.cbm_processed_txs FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Service role full cbm_withdrawals" ON public.cbm_withdrawals FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Service role full cbm_loans" ON public.cbm_loans FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_cbm_ledger_account ON public.cbm_ledger (account_name);
CREATE INDEX IF NOT EXISTS idx_cbm_processed_txs_sender ON public.cbm_processed_txs (sender);
CREATE INDEX IF NOT EXISTS idx_cbm_processed_txs_receiver ON public.cbm_processed_txs (receiver);
CREATE INDEX IF NOT EXISTS idx_cbm_withdrawals_status ON public.cbm_withdrawals (status);
