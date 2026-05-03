-- ============================================================
-- FORGE BUILDER — SUPABASE DATABASE SCHEMA
-- Run this in Supabase SQL Editor → New Query → Run All
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Utility: auto-update updated_at ────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT NOT NULL,
  full_name         TEXT,
  avatar_url        TEXT,
  role              TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  is_active         BOOLEAN NOT NULL DEFAULT true,
  max_products      INTEGER NOT NULL DEFAULT 50,
  max_landing_pages INTEGER NOT NULL DEFAULT 10,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  subtitle        TEXT,
  description     TEXT,
  price           DECIMAL(15,2),
  original_price  DECIMAL(15,2),
  currency        TEXT NOT NULL DEFAULT 'IDR',
  discount_label  TEXT,
  category        TEXT,
  subcategory     TEXT,
  images          JSONB NOT NULL DEFAULT '[]'::jsonb,
  marketplace_url TEXT,
  affiliate_url   TEXT,
  shop_name       TEXT,
  product_rating  DECIMAL(3,2) CHECK (product_rating IS NULL OR (product_rating >= 0 AND product_rating <= 5)),
  review_count    INTEGER NOT NULL DEFAULT 0,
  sold_count      INTEGER NOT NULL DEFAULT 0,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  features        JSONB NOT NULL DEFAULT '[]'::jsonb,
  specifications  JSONB NOT NULL DEFAULT '[]'::jsonb,
  badges          JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  input_mode      TEXT NOT NULL DEFAULT 'manual' CHECK (input_mode IN ('manual', 'auto')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_products_user_id   ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category  ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_created   ON public.products(created_at DESC);

-- ============================================================
-- LANDING PAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.landing_pages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug         TEXT NOT NULL UNIQUE
                 CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$'),
  title        TEXT NOT NULL,
  description  TEXT,
  theme_type   TEXT NOT NULL DEFAULT 'linktree'
                 CHECK (theme_type IN ('linktree','beacons','taplink','campsite','carrd','seedprod','lnkbio','ecommerce')),
  theme_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  blocks       JSONB NOT NULL DEFAULT '[]'::jsonb,
  tracking     JSONB NOT NULL DEFAULT '{"gtm_id":null,"fb_pixel_id":null,"histats_id":null,"ga_id":null}'::jsonb,
  seo          JSONB NOT NULL DEFAULT '{"title":null,"description":null,"og_image":null}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  view_count   INTEGER NOT NULL DEFAULT 0,
  click_count  INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER landing_pages_updated_at
  BEFORE UPDATE ON public.landing_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_lp_user_id    ON public.landing_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_lp_slug       ON public.landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_lp_published  ON public.landing_pages(is_published);
CREATE INDEX IF NOT EXISTS idx_lp_created    ON public.landing_pages(created_at DESC);

-- ============================================================
-- LANDING PAGE ↔ PRODUCTS  (junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.landing_page_products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id UUID NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(landing_page_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_lpp_lp_id      ON public.landing_page_products(landing_page_id);
CREATE INDEX IF NOT EXISTS idx_lpp_product_id ON public.landing_page_products(product_id);

-- ============================================================
-- WEB SETTINGS  (key / value / group)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.web_settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT NOT NULL UNIQUE,
  value       TEXT,
  group_name  TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  is_public   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER web_settings_updated_at
  BEFORE UPDATE ON public.web_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_ws_group  ON public.web_settings(group_name);
CREATE INDEX IF NOT EXISTS idx_ws_public ON public.web_settings(is_public);

-- ============================================================
-- USER API KEYS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_api_keys (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider     TEXT NOT NULL DEFAULT 'openrouter',
  api_key      TEXT NOT NULL,
  model_id     TEXT,
  label        TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

CREATE TRIGGER user_api_keys_updated_at
  BEFORE UPDATE ON public.user_api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON public.user_api_keys(user_id);

-- ============================================================
-- PAGE ANALYTICS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.page_analytics (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id     UUID NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  visitor_fingerprint TEXT,
  user_agent          TEXT,
  referrer            TEXT,
  country             TEXT,
  city                TEXT,
  device_type         TEXT NOT NULL DEFAULT 'unknown'
                        CHECK (device_type IN ('mobile','tablet','desktop','unknown')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pa_lp_id   ON public.page_analytics(landing_page_id);
CREATE INDEX IF NOT EXISTS idx_pa_created ON public.page_analytics(created_at DESC);

-- ============================================================
-- PRODUCT CLICKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_clicks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id          UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  landing_page_id     UUID REFERENCES public.landing_pages(id) ON DELETE SET NULL,
  click_type          TEXT NOT NULL DEFAULT 'affiliate'
                        CHECK (click_type IN ('affiliate','marketplace','detail')),
  visitor_fingerprint TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pc_product ON public.product_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_pc_lp      ON public.product_clicks(landing_page_id);
CREATE INDEX IF NOT EXISTS idx_pc_created ON public.product_clicks(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_settings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_api_keys         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_analytics        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_clicks        ENABLE ROW LEVEL SECURITY;

-- ── Helper: is current user admin? ──────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ── profiles ─────────────────────────────────────────────────
CREATE POLICY "profiles_own_select"   ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_own_update"   ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR public.is_admin()) WITH CHECK (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_admin_delete" ON public.profiles FOR DELETE TO authenticated USING (public.is_admin());

-- ── products ─────────────────────────────────────────────────
CREATE POLICY "products_own_all"     ON public.products FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ── landing_pages ─────────────────────────────────────────────
CREATE POLICY "lp_own_all"           ON public.landing_pages FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "lp_published_public"  ON public.landing_pages FOR SELECT USING (is_published = true);

-- ── landing_page_products ─────────────────────────────────────
CREATE POLICY "lpp_own_all" ON public.landing_page_products FOR ALL TO authenticated USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.landing_pages WHERE id = landing_page_id AND user_id = auth.uid()
  )
);

-- ── web_settings ─────────────────────────────────────────────
CREATE POLICY "ws_public_select"  ON public.web_settings FOR SELECT USING (is_public = true);
CREATE POLICY "ws_auth_select"    ON public.web_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "ws_admin_manage"   ON public.web_settings FOR ALL TO authenticated USING (public.is_admin());

-- ── user_api_keys ─────────────────────────────────────────────
CREATE POLICY "api_keys_own_all" ON public.user_api_keys FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── page_analytics ────────────────────────────────────────────
CREATE POLICY "pa_insert_public"  ON public.page_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "pa_own_select"     ON public.page_analytics FOR SELECT TO authenticated USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.landing_pages WHERE id = landing_page_id AND user_id = auth.uid()
  )
);

-- ── product_clicks ────────────────────────────────────────────
CREATE POLICY "pc_insert_public"  ON public.product_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "pc_own_select"     ON public.product_clicks FOR SELECT TO authenticated USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.products WHERE id = product_id AND user_id = auth.uid()
  )
);

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO public.web_settings (key, value, group_name, description, is_public) VALUES
  ('site_name',                  'ForgeBuilder',                                         'general',  'Website / app name',                                true),
  ('site_tagline',               'Build stunning landing pages for your products',        'general',  'Short tagline shown in header',                     true),
  ('site_description',           'Create, publish, and track affiliate landing pages',    'general',  'Meta description used for SEO',                     true),
  ('site_logo',                  NULL,                                                    'general',  'Logo image URL',                                    true),
  ('site_favicon',               NULL,                                                    'general',  'Favicon URL',                                       true),
  ('maintenance_mode',           'false',                                                 'general',  'Enable maintenance mode (true/false)',               false),
  ('footer_text',                NULL,                                                    'general',  'Footer copyright text',                             true),
  ('terms_url',                  NULL,                                                    'general',  'Terms of service page URL',                         true),
  ('privacy_url',                NULL,                                                    'general',  'Privacy policy page URL',                           true),
  ('default_currency',           'IDR',                                                   'general',  'Default currency code for products',                true),
  ('allow_registration',         'true',                                                  'auth',     'Allow new user self-registration',                  false),
  ('require_email_verification', 'true',                                                  'auth',     'Require email verification after sign-up',          false),
  ('max_products_default',       '50',                                                    'limits',   'Default product quota per member',                  false),
  ('max_landing_pages_default',  '10',                                                    'limits',   'Default landing page quota per member',             false),
  ('contact_email',              NULL,                                                    'contact',  'Support e-mail address',                            true),
  ('support_whatsapp',           NULL,                                                    'contact',  'Support WhatsApp number (international format)',    true),
  ('social_instagram',           NULL,                                                    'social',   'Instagram profile URL',                             true),
  ('social_facebook',            NULL,                                                    'social',   'Facebook page URL',                                 true),
  ('social_twitter',             NULL,                                                    'social',   'Twitter / X profile URL',                           true),
  ('social_tiktok',              NULL,                                                    'social',   'TikTok profile URL',                                true),
  ('social_youtube',             NULL,                                                    'social',   'YouTube channel URL',                               true),
  ('global_gtm_id',              NULL,                                                    'tracking', 'Global Google Tag Manager container ID (GTM-XXXX)', false),
  ('global_ga_id',               NULL,                                                    'tracking', 'Global Google Analytics 4 Measurement ID (G-XXXX)',false),
  ('global_fb_pixel_id',         NULL,                                                    'tracking', 'Global Facebook / Meta Pixel ID',                  false),
  ('global_histats_id',          NULL,                                                    'tracking', 'Global Histats account ID',                         false),
  ('cloudinary_cloud_name',      NULL,                                                    'storage',  'Cloudinary cloud name',                             false),
  ('cloudinary_upload_preset',   NULL,                                                    'storage',  'Cloudinary unsigned upload preset name',            false)
ON CONFLICT (key) DO NOTHING;
