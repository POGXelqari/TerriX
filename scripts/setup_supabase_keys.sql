-- =========================================================
-- TerriCenter Supabase Schema: 24-Hour Global Key Management
-- =========================================================

-- Create daily_keys table
CREATE TABLE IF NOT EXISTS public.daily_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_string TEXT NOT NULL UNIQUE,
    epoch_date DATE NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Enable Row Level Security
ALTER TABLE public.daily_keys ENABLE ROW LEVEL SECURITY;

-- Allow anonymous / public read access for active, non-expired keys
CREATE POLICY "Allow public read active keys"
ON public.daily_keys
FOR SELECT
USING (is_active = TRUE AND expires_at > NOW());

-- Allow service role full write/update access
CREATE POLICY "Allow service role manage keys"
ON public.daily_keys
FOR ALL
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Indexes for ultra-fast query performance
CREATE INDEX IF NOT EXISTS idx_daily_keys_epoch ON public.daily_keys (epoch_date);
CREATE INDEX IF NOT EXISTS idx_daily_keys_string ON public.daily_keys (key_string);
