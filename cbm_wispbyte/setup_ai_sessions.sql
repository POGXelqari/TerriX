-- =============================================================================
-- CBM AI Chat Session Memory & Lifecycle Management Schema (Supabase PostgreSQL)
-- =============================================================================
-- Supports multi-turn contextual AI memory, sliding-window compaction,
-- automatic TTL idle expiration, and cascading turn deletion on session end.
-- =============================================================================

-- 1. AI Chat Sessions (Conversation Containers with TTL & Expiration)
CREATE TABLE IF NOT EXISTS public.cbm_ai_sessions (
    session_id TEXT PRIMARY KEY,
    owner_account TEXT NOT NULL REFERENCES public.cbm_accounts(account_name) ON DELETE CASCADE,
    key_id TEXT,
    title TEXT DEFAULT 'New Chat',
    system_prompt TEXT,
    model TEXT DEFAULT 'nvidia/nemotron-3-ultra-550b-a55b',
    max_context_turns INTEGER DEFAULT 20,
    temperature REAL DEFAULT 0.7,
    ttl_seconds INTEGER DEFAULT 3600,
    total_turns INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    is_archived INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cbm_ai_sessions_owner ON public.cbm_ai_sessions (owner_account, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_cbm_ai_sessions_expiry ON public.cbm_ai_sessions (expires_at);
CREATE INDEX IF NOT EXISTS idx_cbm_ai_sessions_key ON public.cbm_ai_sessions (key_id);

-- Backward-compatible column migration for cbm_ai_sessions
ALTER TABLE public.cbm_ai_sessions ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'New Chat';
ALTER TABLE public.cbm_ai_sessions ADD COLUMN IF NOT EXISTS system_prompt TEXT;
ALTER TABLE public.cbm_ai_sessions ADD COLUMN IF NOT EXISTS model TEXT DEFAULT 'nvidia/nemotron-3-ultra-550b-a55b';
ALTER TABLE public.cbm_ai_sessions ADD COLUMN IF NOT EXISTS max_context_turns INTEGER DEFAULT 20;
ALTER TABLE public.cbm_ai_sessions ADD COLUMN IF NOT EXISTS temperature REAL DEFAULT 0.7;
ALTER TABLE public.cbm_ai_sessions ADD COLUMN IF NOT EXISTS ttl_seconds INTEGER DEFAULT 3600;
ALTER TABLE public.cbm_ai_sessions ADD COLUMN IF NOT EXISTS total_turns INTEGER DEFAULT 0;
ALTER TABLE public.cbm_ai_sessions ADD COLUMN IF NOT EXISTS total_tokens_used INTEGER DEFAULT 0;
ALTER TABLE public.cbm_ai_sessions ADD COLUMN IF NOT EXISTS is_archived INTEGER DEFAULT 0;
ALTER TABLE public.cbm_ai_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.cbm_ai_sessions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour');

-- 2. AI Chat Session Messages (Conversation Turn History with Cascading Deletion)
CREATE TABLE IF NOT EXISTS public.cbm_ai_session_messages (
    message_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES public.cbm_ai_sessions(session_id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    reasoning_content TEXT,
    tokens INTEGER DEFAULT 0,
    turn_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cbm_ai_messages_session ON public.cbm_ai_session_messages (session_id, created_at ASC);

-- Row Level Security (RLS) Policies
ALTER TABLE public.cbm_ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbm_ai_session_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'cbm_ai_sessions' AND policyname = 'cbm_ai_sessions_service_role'
    ) THEN
        CREATE POLICY cbm_ai_sessions_service_role ON public.cbm_ai_sessions
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'cbm_ai_session_messages' AND policyname = 'cbm_ai_session_messages_service_role'
    ) THEN
        CREATE POLICY cbm_ai_session_messages_service_role ON public.cbm_ai_session_messages
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;
