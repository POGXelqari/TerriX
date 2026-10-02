-- =============================================================================
-- CBM SSO Identity Provider & Virtual Credit Metering Schema
-- =============================================================================
-- Compliant with OpenID Connect Core 1.0, RFC 6749 (OAuth 2.0),
-- RFC 7636 (PKCE with S256), and fail-closed append-only credit ledger architecture.
-- =============================================================================

-- 1. Third-Party OAuth 2.0 / OIDC Client Applications
CREATE TABLE IF NOT EXISTS public.cbm_oauth_clients (
    client_id TEXT PRIMARY KEY,
    client_secret_hash TEXT,                  -- NULL for public clients (SPAs/mobile)
    client_name TEXT NOT NULL,
    owner_account TEXT NOT NULL REFERENCES public.cbm_accounts(account_name) ON DELETE CASCADE,
    redirect_uris JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of allowed callback URLs
    allowed_scopes TEXT NOT NULL DEFAULT 'openid profile',
    client_type TEXT NOT NULL DEFAULT 'confidential', -- 'confidential' or 'public'
    logo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cbm_oauth_clients_owner ON public.cbm_oauth_clients (owner_account);

-- Backward-compatible column migration for cbm_oauth_clients
ALTER TABLE public.cbm_oauth_clients ADD COLUMN IF NOT EXISTS client_secret_hash TEXT;
ALTER TABLE public.cbm_oauth_clients ADD COLUMN IF NOT EXISTS client_name TEXT NOT NULL DEFAULT 'Third-Party App';
ALTER TABLE public.cbm_oauth_clients ADD COLUMN IF NOT EXISTS redirect_uris JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.cbm_oauth_clients ADD COLUMN IF NOT EXISTS allowed_scopes TEXT NOT NULL DEFAULT 'openid profile';
ALTER TABLE public.cbm_oauth_clients ADD COLUMN IF NOT EXISTS client_type TEXT NOT NULL DEFAULT 'confidential';
ALTER TABLE public.cbm_oauth_clients ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.cbm_oauth_clients ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.cbm_oauth_clients ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.cbm_oauth_clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Authorization Codes (Single-Use, 5-Minute Expiry, PKCE Bound)
CREATE TABLE IF NOT EXISTS public.cbm_oauth_codes (
    code_hash TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES public.cbm_oauth_clients(client_id) ON DELETE CASCADE,
    account_name TEXT NOT NULL REFERENCES public.cbm_accounts(account_name) ON DELETE CASCADE,
    redirect_uri TEXT NOT NULL,
    scope TEXT NOT NULL,
    code_challenge TEXT NOT NULL,
    code_challenge_method TEXT NOT NULL DEFAULT 'S256',
    nonce TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cbm_oauth_codes_lookup ON public.cbm_oauth_codes (client_id, expires_at);

-- Backward-compatible column migration for cbm_oauth_codes
ALTER TABLE public.cbm_oauth_codes ADD COLUMN IF NOT EXISTS redirect_uri TEXT;
ALTER TABLE public.cbm_oauth_codes ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'openid profile';
ALTER TABLE public.cbm_oauth_codes ADD COLUMN IF NOT EXISTS code_challenge TEXT NOT NULL DEFAULT '';
ALTER TABLE public.cbm_oauth_codes ADD COLUMN IF NOT EXISTS code_challenge_method TEXT NOT NULL DEFAULT 'S256';
ALTER TABLE public.cbm_oauth_codes ADD COLUMN IF NOT EXISTS nonce TEXT;
ALTER TABLE public.cbm_oauth_codes ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.cbm_oauth_codes ADD COLUMN IF NOT EXISTS used_at TIMESTAMPTZ;

-- 3. Issued OAuth 2.0 Tokens (Access Tokens & Rotating Refresh Tokens)
CREATE TABLE IF NOT EXISTS public.cbm_oauth_tokens (
    token_hash TEXT PRIMARY KEY,
    token_type TEXT NOT NULL,                -- 'access' or 'refresh'
    client_id TEXT NOT NULL REFERENCES public.cbm_oauth_clients(client_id) ON DELETE CASCADE,
    account_name TEXT NOT NULL REFERENCES public.cbm_accounts(account_name) ON DELETE CASCADE,
    scope TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cbm_oauth_tokens_acc ON public.cbm_oauth_tokens (account_name, client_id);
CREATE INDEX IF NOT EXISTS idx_cbm_oauth_tokens_lookup ON public.cbm_oauth_tokens (token_hash, is_revoked);

-- Backward-compatible column migration for cbm_oauth_tokens
ALTER TABLE public.cbm_oauth_tokens ADD COLUMN IF NOT EXISTS token_type TEXT NOT NULL DEFAULT 'access';
ALTER TABLE public.cbm_oauth_tokens ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'openid profile';
ALTER TABLE public.cbm_oauth_tokens ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.cbm_oauth_tokens ADD COLUMN IF NOT EXISTS is_revoked BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.cbm_oauth_tokens ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.cbm_oauth_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbm_oauth_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbm_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Deny all direct public access; access allowed exclusively through backend service_role
DROP POLICY IF EXISTS "Service role access oauth_clients" ON public.cbm_oauth_clients;
CREATE POLICY "Service role access oauth_clients" ON public.cbm_oauth_clients FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role access oauth_codes" ON public.cbm_oauth_codes;
CREATE POLICY "Service role access oauth_codes" ON public.cbm_oauth_codes FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role access oauth_tokens" ON public.cbm_oauth_tokens;
CREATE POLICY "Service role access oauth_tokens" ON public.cbm_oauth_tokens FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

