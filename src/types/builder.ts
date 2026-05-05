/**
 * SnapLand V2 Builder Type System
 * Replaces V1 LandingBlock (inline style) with TailwindCSS className approach
 * Path: src/types/builder.ts
 */

export type BlockCategory =
  | "layout"
  | "content"
  | "commerce"
  | "social"
  | "interactive"
  | "advanced";

export type BlockType =
  // Layout
  | "block-hero"
  | "block-header"
  | "block-footer"
  | "block-columns"
  | "block-anchor"
  | "block-sidebar"
  | "block-frame"
  // Content
  | 'block-text'
  | 'block-image'
  | 'block-gallery'
  | 'block-video'
  | 'block-carousel'
  | 'block-blog-post'
  | 'block-features'
  | 'block-changelog'
  // Commerce
  | 'block-product-card'
  | 'block-product-list'
  | 'block-pricing'
  | 'block-checkout'
  | 'block-order-confirm'
  | 'block-payment-list'
  | 'block-stock-counter'
  // Social & Trust
  | 'block-testimonial'
  | 'block-faq'
  | 'block-social-links'
  | 'block-logos'
  | 'block-fake-comment'
  | 'block-countdown-auto'
  | 'block-fake-notification'
  | 'block-contact'
  | 'block-applications'
  // Interactive
  | 'block-button'
  | 'block-button-group'
  | 'block-float-button'
  | 'block-countdown'
  | 'block-form'
  | 'block-popup'
  | 'block-chat-bot'
  | 'block-tab'
  | 'block-floating-content'
  // Advanced
  | 'block-animation'
  | 'block-custom-script'
  | 'block-custom-html'
  | 'block-google-maps'
  | 'block-auto-redirect'
  | 'block-back-redirect'
  | 'block-menu-group'
  | 'block-divider';

// ── Animation Config ─────────────────────────────────────────
export type AnimationType =
  | "none"
  | "fade-in"
  | "fade-in-up"
  | "fade-in-down"
  | "slide-in-left"
  | "slide-in-right"
  | "zoom-in"
  | "bounce-in"
  | "flip-in"
  | "pulse";

export type AnimationTrigger = "load" | "scroll" | "hover" | "click";

export interface BlockAnimation {
  type: AnimationType;
  duration?: number;       // ms, default 500
  delay?: number;          // ms, default 0
  trigger?: AnimationTrigger;
  repeat?: boolean;
}
export interface BlockClasses {
  wrapper?: string;        // outer container TW classes
  inner?: string;          // inner content TW classes
  heading?: string;        // heading text TW classes
  text?: string;           // body text TW classes
  button?: string;         // button TW classes
  image?: string;          // image TW classes
  card?: string;           // card container TW classes
  custom?: string;         // any extra custom classes
}

export type SpacingSize = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type AlignType = "left" | "center" | "right";
export type LayoutWidth = "full" | "xl" | "lg" | "md" | "sm";

export interface BlockLayout {
  paddingY?: SpacingSize;
  paddingX?: SpacingSize;
  marginTop?: string;     // e.g. "mt-0", "mt-8"
  marginBottom?: string;    // e.g. "mb-0", "mb-8"
  marginY?: SpacingSize;
  textAlign?: string;
  align?: AlignType;
  maxWidth?: LayoutWidth;
  bgColor?: string;          // hex or TW color
  bgImage?: string;          // URL
  bgOverlay?: string;        // hex with opacity e.g. "#00000066"
  textColor?: string;
  borderRadius?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  shadow?: "none" | "sm" | "md" | "lg" | "xl";
  border?: boolean;
  borderColor?: string;
  display?: string;
  gap?: string;
  bgGradient?: string;
  fontFamily?: string;
  bgImageOverlay?: string;
}

// ── V2 Block — core type ─────────────────────────────────────
export interface BlockV2 {
  id: string;
  type: BlockType;
  visible: boolean;
  label?: string;            // user-editable label e.g. "Main Hero"
  locked?: boolean;          // prevent delete/move
  // Content: all block-specific data
  props: Record<string, any>;
  // Styling
  layout: BlockLayout;
  classes: BlockClasses;
  animation: BlockAnimation;
  // App integrations
  appIds?: string[];         // FK to applications table
}

// ── Block Catalog Definition (for BlockPanel) ─────────────────
export interface BlockDefinition {
  type: BlockType;
  category: BlockCategory;
  label: string;
  description: string;
  icon: string;              // lucide icon name
  defaultProps: Record<string, unknown>;
  defaultLayout: Partial<BlockLayout>;
  defaultClasses?: Partial<BlockClasses>;
  defaultAnimation?: Partial<BlockAnimation>;
  planRequired?: "starter" | "pro" | "enterprise"; // free = undefined
}

// ── Default layout presets per category ──────────────────────
export const DEFAULT_LAYOUT: BlockLayout = {
  paddingY: "lg",
  paddingX: "md",
  align: "center",
  maxWidth: "lg",
  bgColor: "",
  bgImage: "",
  bgOverlay: "",
  textColor: "",
  borderRadius: "none",
  shadow: "none",
  border: false,
};

export const DEFAULT_ANIMATION: BlockAnimation = {
  type: "none",
  duration: 500,
  delay: 0,
  trigger: "load",
  repeat: false,
};

// ── Tailwind spacing map ──────────────────────────────────────
export const TW_PADDING_Y: Record<SpacingSize, string> = {
  none: "py-0",
  xs: "py-2",
  sm: "py-4",
  md: "py-8",
  lg: "py-12",
  xl: "py-16",
  "2xl": "py-24",
};

export const TW_PADDING_X: Record<SpacingSize, string> = {
  none: "px-0",
  xs: "px-2",
  sm: "px-4",
  md: "px-6",
  lg: "px-8",
  xl: "px-12",
  "2xl": "px-16",
};

export const TW_MAX_WIDTH: Record<LayoutWidth, string> = {
  full: "max-w-full",
  xl: "max-w-7xl",
  lg: "max-w-5xl",
  md: "max-w-3xl",
  sm: "max-w-xl",
};

// ── Animation CSS class map (uses Tailwind animate plugin or custom) ──
export const ANIMATION_CLASSES: Record<AnimationType, string> = {
  "none": "",
  "fade-in": "animate-fade-in",
  "fade-in-up": "animate-fade-in-up",
  "fade-in-down": "animate-fade-in-down",
  "slide-in-left": "animate-slide-in-left",
  "slide-in-right": "animate-slide-in-right",
  "zoom-in": "animate-zoom-in",
  "bounce-in": "animate-bounce-in",
  "flip-in": "animate-flip-in",
  "pulse": "animate-pulse",
};

// ── Helper: build wrapper className from BlockV2 ─────────────
export function buildBlockClasses(block: BlockV2): string {
  const { layout, classes, animation } = block;
  const parts: string[] = [];

  if (layout.paddingY) parts.push(TW_PADDING_Y[layout.paddingY]);
  if (layout.paddingX) parts.push(TW_PADDING_X[layout.paddingX]);
  if (layout.shadow && layout.shadow !== "none") parts.push(`shadow-${layout.shadow}`);
  if (layout.border) parts.push("border border-border");
  if (layout.borderRadius && layout.borderRadius !== "none") parts.push(`rounded-${layout.borderRadius}`);

  if (animation.type !== "none") {
    parts.push(ANIMATION_CLASSES[animation.type]);
    if (animation.duration && animation.duration !== 500) {
      // inline style needed for dynamic duration
    }
  }

  if (classes.wrapper) parts.push(classes.wrapper);

  return parts.filter(Boolean).join(" ");
}

// ── Builder history entry ─────────────────────────────────────
export interface BuilderHistoryEntry {
  blocks: BlockV2[];
  timestamp: number;
  label?: string;
}

// ── Application type (for app integration) ───────────────────
export type AppType =
  | "wa_rotator"
  | "tracking"
  | "payment_method"
  | "wa_template"
  | "email_template"
  | "email_notification"
  | "logistic_kurir"
  | "pricing_item"
  | "custom_script"
  | "openrouter_ai";

export interface Application {
  id: string;
  user_id: string;
  app_type: AppType;
  name: string;
  config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── LP Type V2 ────────────────────────────────────────────────
export type LPType = "linkbio" | "ecommerce" | "sales" | "general";

// ── Template ─────────────────────────────────────────────────
export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail_url?: string;
  lp_type: LPType;
  blocks: BlockV2[];
  is_public: boolean;
  created_by?: string;
  created_at: string;
}

// ── Builder Zustand Store State ───────────────────────────────
export interface BuilderState {
  // Core data
  landingPageId: string;
  blocks: BlockV2[];
  isDirty: boolean;
  isSaving: boolean;
  isPublished: boolean;

  // Selection
  selectedBlockId: string | null;

  // History (undo/redo)
  history: BuilderHistoryEntry[];
  historyIndex: number;

  // UI
  previewDevice: "mobile" | "desktop";
  showPreview: boolean;
  leftPanelTab: "blocks" | "templates" | "layers" | "apps";
  rightPanelTab: "content" | "style" | "layout" | "animation" | "advanced";
  isLeftPanelCollapsed: boolean;

  // Search
  blockSearch: string;

  // Actions
  setBlocks: (blocks: BlockV2[]) => void;
  addBlock: (block: BlockV2, afterId?: string) => void;
  updateBlock: (id: string, updates: Partial<BlockV2>) => void;
  updateBlockProps: (id: string, props: Record<string, unknown>) => void;
  updateBlockLayout: (id: string, layout: Partial<BlockLayout>) => void;
  updateBlockClasses: (id: string, classes: Partial<BlockClasses>) => void;
  updateBlockAnimation: (id: string, animation: Partial<BlockAnimation>) => void;
  removeBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;
  selectBlock: (id: string | null) => void;
  setIsDirty: (dirty: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  setIsPublished: (published: boolean) => void;
  markSaved: () => void;

  // History
  pushHistory: (label?: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // UI
  setPreviewDevice: (device: "mobile" | "desktop") => void;
  togglePreview: () => void;
  setLeftPanelTab: (tab: BuilderState["leftPanelTab"]) => void;
  setRightPanelTab: (tab: BuilderState["rightPanelTab"]) => void;
  toggleLeftPanel: () => void;
  setBlockSearch: (search: string) => void;
}
