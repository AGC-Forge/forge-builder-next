-- ============================================================
-- SPRINT 2: Activity Logs Migration
-- Run in Supabase SQL Editor
-- ============================================================

-- ── Activity Logs Table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  resource    TEXT,
  resource_id UUID,
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_user    ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_action  ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_created ON public.activity_logs(created_at DESC);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Admin: read all logs
CREATE POLICY "admin_read_all_activity"
  ON public.activity_logs FOR SELECT
  USING (public.is_admin());

-- Users: read own logs only
CREATE POLICY "user_read_own_activity"
  ON public.activity_logs FOR SELECT
  USING (user_id = auth.uid());

-- Service role / authenticated: can insert logs
CREATE POLICY "authenticated_insert_activity"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ── Profiles: add avatar column if missing ───────────────────
-- (already exists in schema, skip if column is already present)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;