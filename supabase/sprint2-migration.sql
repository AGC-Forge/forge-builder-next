-- ============================================================
-- SPRINT A: V2 Database Migration
-- Run in Supabase SQL Editor (in order)
-- ============================================================

-- ── 1. Applications Table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.applications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  app_type    TEXT NOT NULL
                CHECK (app_type IN (
                  'wa_rotator','tracking','payment_method',
                  'wa_template','email_template','email_notification',
                  'logistic_kurir','pricing_item','custom_script','openrouter_ai'
                )),
  name        TEXT NOT NULL,
  config      JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apps_user_id   ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_apps_type      ON public.applications(app_type);
CREATE INDEX IF NOT EXISTS idx_apps_active    ON public.applications(is_active);

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_crud_own_apps"
  ON public.applications
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin_all_apps"
  ON public.applications
  USING (public.is_admin());

-- ── 2. Orders Table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  landing_page_id   UUID REFERENCES public.landing_pages(id) ON DELETE SET NULL,
  order_number      TEXT NOT NULL UNIQUE,
  customer_name     TEXT NOT NULL,
  customer_phone    TEXT NOT NULL,
  customer_email    TEXT,
  shipping_address  JSONB NOT NULL DEFAULT '{}'::jsonb,
  items             JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal          NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_cost     NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method    TEXT,
  payment_proof_url TEXT,
  payment_status    TEXT NOT NULL DEFAULT 'unpaid'
                      CHECK (payment_status IN ('unpaid','paid','refunded')),
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','processing','shipped','completed','cancelled')),
  notes             TEXT,
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-generate order_number: ORD-YYYYMMDD-XXXX
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT;
  seq    INTEGER;
  result TEXT;
BEGIN
  prefix := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-';
  SELECT COUNT(*) + 1 INTO seq
    FROM public.orders
   WHERE order_number LIKE prefix || '%';
  result := prefix || LPAD(seq::TEXT, 4, '0');
  RETURN result;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE public.orders
  ALTER COLUMN order_number SET DEFAULT generate_order_number();

CREATE INDEX IF NOT EXISTS idx_orders_user_id   ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_lp_id     ON public.orders(landing_page_id);
CREATE INDEX IF NOT EXISTS idx_orders_status    ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created   ON public.orders(created_at DESC);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_crud_own_orders"
  ON public.orders
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin_all_orders"
  ON public.orders
  USING (public.is_admin());

-- Allow public to insert (for LP checkout form)
CREATE POLICY "public_insert_order"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- ── 3. Memberships Table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.memberships (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_type     TEXT NOT NULL DEFAULT 'free'
                  CHECK (plan_type IN ('free','starter','pro','enterprise')),
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  payment_ref   TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_memberships_user_active
  ON public.memberships(user_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_memberships_expires ON public.memberships(expires_at);

CREATE TRIGGER memberships_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_read_own_membership"
  ON public.memberships FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "admin_all_memberships"
  ON public.memberships
  USING (public.is_admin());

-- Auto-insert free membership on new user
CREATE OR REPLACE FUNCTION create_free_membership()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.memberships (user_id, plan_type, is_active)
  VALUES (NEW.id, 'free', true)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_membership
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION create_free_membership();

-- ── 4. Templates Table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  thumbnail_url TEXT,
  lp_type       TEXT NOT NULL DEFAULT 'general'
                  CHECK (lp_type IN ('linkbio','ecommerce','sales','general')),
  blocks        JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_public     BOOLEAN NOT NULL DEFAULT true,
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_lp_type ON public.templates(lp_type);
CREATE INDEX IF NOT EXISTS idx_templates_public  ON public.templates(is_public);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_templates"
  ON public.templates FOR SELECT
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "admin_crud_templates"
  ON public.templates
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── 5. Profile updates ───────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_type       TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS custom_domain   TEXT;

-- ── 6. Landing pages: add lp_type ───────────────────────────
ALTER TABLE public.landing_pages
  ADD COLUMN IF NOT EXISTS lp_type TEXT DEFAULT 'general'
    CHECK (lp_type IN ('linkbio','ecommerce','sales','general'));

-- ── 7. Products: add stock_count ────────────────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock_count INTEGER DEFAULT NULL;

-- ── 8. Migrate existing builder route references ─────────────
-- (Run after updating navigation links)
-- No data migration needed for blocks yet — V1 blocks still work in
-- the old themes. V2 builder reads both V1 and V2 block formats
-- via the migrateBlocksToV2() function.

-- ── Done ─────────────────────────────────────────────────────
SELECT 'Sprint A migration complete ✓' AS status;
