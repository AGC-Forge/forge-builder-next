// Database table types — mirrors supabase/schema.sql exactly

export type UserRole = 'admin' | 'member';
export type InputMode = 'manual' | 'auto';
export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';
export type ClickType = 'affiliate' | 'marketplace' | 'detail';

export type ThemeType =
  | 'linktree'
  | 'beacons'
  | 'taplink'
  | 'campsite'
  | 'carrd'
  | 'seedprod'
  | 'lnkbio'
  | 'ecommerce';

export type BlockType =
  | 'hero'
  | 'product-single'
  | 'product-grid'
  | 'product-list'
  | 'text'
  | 'image'
  | 'video'
  | 'cta-button'
  | 'social-links'
  | 'divider'
  | 'countdown'
  | 'testimonials'
  | 'faq'
  | 'custom-html'
  | 'spacer';

// ── JSON column shapes ───────────────────────────────────────

export interface ProductImage {
  id: string;
  url: string;
  public_id?: string;
  name?: string;
  alt?: string;
  is_primary?: boolean;
  source: 'upload' | 'url';
}

export interface ProductFeature {
  title: string;
  description?: string;
}

export interface ProductSpec {
  name: string;
  value: string;
}

export interface ProductBadge {
  text: string;
  color?: string;
  bgColor?: string;
}

export interface BlockSettings {
  backgroundColor?: string;
  backgroundImage?: string;
  textColor?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  borderRadius?: string;
  maxWidth?: 'full' | 'screen-md' | 'screen-lg' | 'screen-xl';
  alignment?: 'left' | 'center' | 'right';
}

export interface LandingBlock {
  id: string;
  type: BlockType;
  visible: boolean;
  settings: BlockSettings;
  content: Record<string, any>;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor?: string;
  fontFamily: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  buttonStyle: 'filled' | 'outlined' | 'ghost';
  backgroundType: 'solid' | 'gradient' | 'image';
  backgroundGradient?: string;
  backgroundImageUrl?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
  linkStyle?: 'card' | 'button' | 'minimal';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  fontFamily: 'Inter',
  borderRadius: 'md',
  buttonStyle: 'filled',
  backgroundType: 'solid',
  linkStyle: 'card',
  shadow: 'md',
};

export interface TrackingConfig {
  gtm_id: string | null;
  fb_pixel_id: string | null;
  histats_id: string | null;
  ga_id: string | null;
}

export interface SeoConfig {
  title: string | null;
  description: string | null;
  og_image: string | null;
}

// ── Row types ────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  max_products: number;
  max_landing_pages: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  price: number | null;
  original_price: number | null;
  currency: string;
  discount_label: string | null;
  category: string | null;
  subcategory: string | null;
  images: ProductImage[];
  marketplace_url: string | null;
  affiliate_url: string | null;
  shop_name: string | null;
  product_rating: number | null;
  review_count: number;
  sold_count: number;
  tags: string[];
  features: ProductFeature[];
  specifications: ProductSpec[];
  badges: ProductBadge[];
  is_active: boolean;
  input_mode: InputMode;
  created_at: string;
  updated_at: string;
}

export interface LandingPage {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  description: string | null;
  theme_type: ThemeType;
  theme_config: ThemeConfig;
  blocks: LandingBlock[];
  tracking: TrackingConfig;
  seo: SeoConfig;
  is_published: boolean;
  view_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
}

export interface LandingPageProduct {
  id: string;
  landing_page_id: string;
  product_id: string;
  sort_order: number;
  created_at: string;
  product?: Product;
}

export interface WebSetting {
  id: string;
  key: string;
  value: string | null;
  group_name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserApiKey {
  id: string;
  user_id: string;
  provider: string;
  api_key: string;
  model_id: string | null;
  label: string | null;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PageAnalytic {
  id: string;
  landing_page_id: string;
  visitor_fingerprint: string | null;
  user_agent: string | null;
  referrer: string | null;
  country: string | null;
  city: string | null;
  device_type: DeviceType;
  created_at: string;
}

export interface ProductClick {
  id: string;
  product_id: string;
  landing_page_id: string | null;
  click_type: ClickType;
  visitor_fingerprint: string | null;
  created_at: string;
}

// ── Extended / joined types ──────────────────────────────────

export interface LandingPageWithProducts extends LandingPage {
  landing_page_products?: (LandingPageProduct & { product: Product })[];
}

export interface DashboardStats {
  total_products: number;
  active_products: number;
  total_landing_pages: number;
  published_landing_pages: number;
  total_views: number;
  total_clicks: number;
  total_users: number;
  views_last_7d: number;
  clicks_last_7d: number;
}

// ── Pagination ───────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  pageCount: number;
}
