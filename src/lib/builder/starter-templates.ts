/**
 * Starter Templates — 3 initial templates for SnapLand V2
 * Path: src/lib/builder/starter-templates.ts
 *
 * These are loaded when user clicks a template in the builder left panel.
 * Structure matches BlockV2 from src/types/builder.ts
 */

import { nanoid } from "nanoid";
import type { BlockV2 } from "@/types/builder";
import { DEFAULT_LAYOUT, DEFAULT_ANIMATION } from "@/types/builder";

// ── Helper: create block quickly ─────────────────────────────
function blk(
  type: BlockV2["type"],
  props: Record<string, unknown>,
  layout: Partial<BlockV2["layout"]> = {},
  classes: Partial<BlockV2["classes"]> = {},
): BlockV2 {
  return {
    id: nanoid(10),
    type,
    visible: true,
    locked: false,
    props,
    layout: { ...DEFAULT_LAYOUT, ...layout },
    classes,
    animation: { ...DEFAULT_ANIMATION },
  };
}

// ════════════════════════════════════════════════════════════
// TEMPLATE 1: Link Bio (Linktree Style)
// ════════════════════════════════════════════════════════════
export const TEMPLATE_LINKBIO: BlockV2[] = [
  blk("block-hero", {
    headline: "Your Name",
    subheadline: "Creator · Seller · Dreamer 🚀",
    backgroundImageUrl: "",
    minHeight: "280px",
    textAlign: "center",
    ctaText: "",
    ctaUrl: "",
  }, { paddingY: "xl", paddingX: "md", align: "center", bgColor: "#6366f1" }),

  blk("block-social-links", {
    layout: "list",
    buttonStyle: "filled",
    showIcon: true,
    showLabel: true,
    links: [
      { platform: "instagram", label: "Instagram", url: "https://instagram.com/yourhandle" },
      { platform: "tiktok", label: "TikTok", url: "https://tiktok.com/@yourhandle" },
      { platform: "youtube", label: "YouTube", url: "https://youtube.com/@yourchannel" },
      { platform: "shopee", label: "Shopee", url: "https://shopee.co.id/yourshop" },
      { platform: "tokopedia", label: "Tokopedia", url: "https://tokopedia.com/yourshop" },
    ],
  }, { paddingY: "lg", paddingX: "md", maxWidth: "sm", align: "center" }),

  blk("block-product-list", {
    productIds: [],
    layout: "grid",
    columns: 2,
    showRating: true,
    showBadges: true,
    ctaText: "Beli Sekarang",
  }, { paddingY: "lg", paddingX: "md", maxWidth: "lg" }),

  blk("block-button", {
    text: "Chat WhatsApp",
    url: "https://wa.me/628xxx",
    style: "filled",
    size: "lg",
    fullWidth: true,
  }, { paddingY: "md", paddingX: "md", maxWidth: "sm", align: "center" }),

  blk("block-footer", {
    logoText: "Your Brand",
    copyright: `© ${new Date().getFullYear()} Your Brand`,
    columns: [],
    socialLinks: [],
    showPoweredBy: true,
  }, { paddingY: "lg", paddingX: "md", bgColor: "#f8fafc" }),
];

// ════════════════════════════════════════════════════════════
// TEMPLATE 2: E-Commerce (Shopify Style)
// ════════════════════════════════════════════════════════════
export const TEMPLATE_ECOMMERCE: BlockV2[] = [
  blk("block-header", {
    logoText: "MyShop",
    navLinks: [
      { label: "Products", href: "#products" },
      { label: "Testimonials", href: "#reviews" },
      { label: "Contact", href: "#contact" },
    ],
    ctaText: "Order Now",
    ctaUrl: "#order",
    sticky: true,
    transparent: false,
  }, { paddingY: "sm", paddingX: "md", maxWidth: "xl" }),

  blk("block-hero", {
    headline: "The Product That Changes Everything",
    subheadline: "Trusted by 10,000+ happy customers. Free shipping for orders over Rp 200K.",
    ctaText: "Shop Now",
    ctaUrl: "#products",
    ctaSecondaryText: "Learn More",
    ctaSecondaryUrl: "#features",
    backgroundImageUrl: "",
    minHeight: "500px",
    textAlign: "center",
  }, { paddingY: "xl", paddingX: "md", align: "center" },
    { wrapper: "bg-gradient-to-br from-orange-500 to-red-600" }),

  blk("block-features", {
    style: "grid",
    columns: 3,
    numbered: false,
    items: [
      { icon: "Truck", title: "Free Shipping", description: "Free shipping for all orders above Rp 200K across Indonesia." },
      { icon: "Shield", title: "100% Guaranteed", description: "30-day money back guarantee. No questions asked." },
      { icon: "Zap", title: "Fast Processing", description: "Orders processed within 24 hours on business days." },
    ],
  }, { paddingY: "xl", paddingX: "md", maxWidth: "xl" }),

  blk("block-product-list", {
    productIds: [],
    layout: "grid",
    columns: 3,
    showRating: true,
    showBadges: true,
    ctaText: "Buy Now",
  }, { paddingY: "xl", paddingX: "md", maxWidth: "xl" }),

  blk("block-countdown", {
    targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    label: "🔥 Flash Sale ends in:",
    style: "boxes",
    showDays: true,
    expiredText: "Sale has ended",
  }, { paddingY: "lg", paddingX: "md", align: "center" }),

  blk("block-testimonial", {
    style: "grid",
    columns: 3,
    showRating: true,
    showAvatar: true,
    items: [
      { name: "Budi Santoso", role: "Jakarta", text: "Produknya luar biasa! Sudah pesan 3x dan tidak pernah kecewa.", rating: 5 },
      { name: "Siti Rahayu", role: "Surabaya", text: "Kualitas premium dengan harga yang sangat terjangkau. Highly recommended!", rating: 5 },
      { name: "Ahmad Fauzi", role: "Bandung", text: "Pengiriman cepat, packaging aman, dan produk sesuai deskripsi. Top!", rating: 5 },
    ],
  }, { paddingY: "xl", paddingX: "md", maxWidth: "xl" }),

  blk("block-faq", {
    showSearch: false,
    openFirst: true,
    items: [
      { question: "Berapa lama pengiriman?", answer: "Pengiriman biasanya 2-5 hari kerja tergantung lokasi Anda." },
      { question: "Apakah ada garansi?", answer: "Ya, semua produk kami bergaransi 30 hari uang kembali." },
      { question: "Bagaimana cara melakukan order?", answer: "Isi form pembelian di bawah, kami akan menghubungi Anda via WhatsApp." },
      { question: "Metode pembayaran apa saja?", answer: "Kami menerima transfer bank, GoPay, OVO, Dana, dan COD untuk wilayah tertentu." },
    ],
  }, { paddingY: "xl", paddingX: "md", maxWidth: "lg" }),

  blk("block-fake-notification", {
    position: "bottom-left",
    interval: 6000,
    duration: 4000,
    messages: [
      { name: "Dewi R.", location: "Jakarta", action: "baru saja membeli produk ini" },
      { name: "Reza M.", location: "Surabaya", action: "sedang melihat halaman ini" },
      { name: "Linda K.", location: "Bandung", action: "baru saja checkout" },
    ],
  }, { paddingY: "none", paddingX: "none" }),

  blk("block-checkout", {
    fields: { name: true, phone: true, email: false, address: true, city: true, notes: true },
    paymentMethodIds: [],
    logisticId: null,
    showOrderSummary: true,
    submitLabel: "Pesan Sekarang →",
  }, { paddingY: "xl", paddingX: "md", maxWidth: "lg" }),

  blk("block-float-button", {
    type: "whatsapp",
    position: "bottom-right",
    waRotatorId: null,
    label: "Chat CS",
    showLabel: true,
    pulseAnimation: true,
    primaryColor: "#25D366",
  }, { paddingY: "none", paddingX: "none" }),

  blk("block-footer", {
    logoText: "MyShop",
    copyright: `© ${new Date().getFullYear()} MyShop. All rights reserved.`,
    columns: [],
    socialLinks: [],
    showPoweredBy: true,
  }, { paddingY: "lg", paddingX: "md", bgColor: "#111827" },
    { wrapper: "text-gray-300" }),
];

// ════════════════════════════════════════════════════════════
// TEMPLATE 3: Sales Page / Landing Page General
// ════════════════════════════════════════════════════════════
export const TEMPLATE_SALESPAGE: BlockV2[] = [
  blk("block-header", {
    logoText: "ProductName",
    navLinks: [],
    ctaText: "Get Started Now",
    ctaUrl: "#cta",
    sticky: true,
    transparent: false,
  }, { paddingY: "sm", paddingX: "md", maxWidth: "xl" }),

  blk("block-hero", {
    headline: "The Headline That Converts Visitors Into Customers",
    subheadline: "Discover how thousands of people are already transforming their results with our proven system. Start today — no experience needed.",
    ctaText: "Yes! I Want This →",
    ctaUrl: "#pricing",
    ctaSecondaryText: "Watch Demo",
    ctaSecondaryUrl: "#demo",
    backgroundImageUrl: "",
    minHeight: "560px",
    textAlign: "center",
  }, { paddingY: "xl", paddingX: "md", align: "center" },
    { wrapper: "bg-gradient-to-br from-slate-900 to-indigo-900" }),

  blk("block-logos", {
    title: "As featured in:",
    logos: [],
    marquee: false,
    grayscale: true,
  }, { paddingY: "lg", paddingX: "md", maxWidth: "xl" }),

  blk("block-features", {
    style: "grid",
    columns: 3,
    numbered: false,
    items: [
      { icon: "Target", title: "Proven Results", description: "Our method has helped 10,000+ customers achieve their goals." },
      { icon: "Clock", title: "Save Time", description: "Get results 10x faster with our streamlined system." },
      { icon: "BarChart2", title: "Track Progress", description: "Detailed analytics and reporting built right in." },
      { icon: "Users", title: "Community", description: "Join our thriving community of like-minded achievers." },
      { icon: "Headphones", "title": "24/7 Support", description: "Our team is always here when you need help." },
      { icon: "Lock", title: "100% Secure", description: "Your data and privacy are always protected." },
    ],
  }, { paddingY: "xl", paddingX: "md", maxWidth: "xl" }),

  blk("block-video", {
    platform: "youtube",
    url: "",
    videoId: "",
    caption: "Watch how it works in 3 minutes →",
    autoplay: false,
    showControls: true,
    aspectRatio: "16/9",
  }, { paddingY: "xl", paddingX: "md", maxWidth: "lg" }),

  blk("block-testimonial", {
    style: "grid",
    columns: 3,
    showRating: true,
    showAvatar: false,
    items: [
      { name: "James K.", role: "Entrepreneur", text: "This completely changed how I run my business. ROI was 10x in the first month.", rating: 5 },
      { name: "Sarah M.", role: "Marketing Manager", text: "I was skeptical at first, but the results speak for themselves. Incredible!", rating: 5 },
      { name: "David L.", role: "Freelancer", text: "Best investment I've made this year. Simple, powerful, and delivers results.", rating: 5 },
      { name: "Emma R.", role: "Coach", text: "My clients are seeing amazing results. I recommend this to everyone in my program.", rating: 5 },
    ],
  }, { paddingY: "xl", paddingX: "md", maxWidth: "xl" }),

  blk("block-pricing", {
    style: "cards",
    columns: 3,
    plans: [
      { name: "Basic", price: 197000, period: "month", features: ["Core features", "Email support", "1 user"], ctaText: "Get Basic", ctaUrl: "#cta", highlight: false },
      { name: "Pro", price: 497000, period: "month", features: ["Everything in Basic", "Priority support", "5 users", "Advanced analytics"], ctaText: "Get Pro →", ctaUrl: "#cta", highlight: true },
      { name: "Business", price: 997000, period: "month", features: ["Everything in Pro", "Dedicated manager", "Unlimited users"], ctaText: "Contact Sales", ctaUrl: "/contact", highlight: false },
    ],
    showMonthlyToggle: false,
    highlightIndex: 1,
  }, { paddingY: "xl", paddingX: "md", maxWidth: "xl" }),

  blk("block-countdown", {
    targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    label: "⚠️ Special price expires in:",
    style: "boxes",
    showDays: true,
    expiredText: "Special pricing has ended",
  }, { paddingY: "lg", paddingX: "md", align: "center" }),

  blk("block-faq", {
    showSearch: false,
    openFirst: true,
    items: [
      { question: "Is there a free trial?", answer: "Yes! We offer a 14-day free trial with no credit card required." },
      { question: "Can I cancel anytime?", answer: "Absolutely. Cancel anytime from your dashboard — no questions asked." },
      { question: "What results can I expect?", answer: "Most customers see results within the first 30 days. Your results depend on your effort and application." },
      { question: "Do I need technical experience?", answer: "No! Our platform is designed for beginners. We have step-by-step guides for everything." },
      { question: "Is my payment information secure?", answer: "Yes. We use bank-grade encryption and never store your payment details on our servers." },
      { question: "What if it doesn't work for me?", answer: "We have a 30-day money-back guarantee. If you're not satisfied, we'll refund you in full." },
      { question: "How do I get started?", answer: "Click the button below, complete your registration, and you'll have instant access." },
      { question: "Is there a contract?", answer: "No long-term contracts. You're on a month-to-month subscription you can cancel anytime." },
    ],
  }, { paddingY: "xl", paddingX: "md", maxWidth: "lg" }),

  blk("block-contact", {
    title: "Still have questions?",
    subtitle: "Our team is happy to help you find the right plan.",
    fields: { name: true, email: true, phone: false, message: true },
    submitLabel: "Send Message",
  }, { paddingY: "xl", paddingX: "md", maxWidth: "md" }),

  blk("block-footer", {
    logoText: "ProductName",
    copyright: `© ${new Date().getFullYear()} ProductName. All rights reserved.`,
    columns: [
      { title: "Legal", links: [{ label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Service", href: "/terms" }] },
    ],
    socialLinks: [],
    showPoweredBy: false,
  }, { paddingY: "xl", paddingX: "md", maxWidth: "xl" }),
];

// ── Template metadata for the builder panel ───────────────────
export interface TemplateItem {
  id: string;
  name: string;
  description: string;
  emoji: string;
  lp_type: "linkbio" | "ecommerce" | "sales";
  blocks: BlockV2[];
}

export const STARTER_TEMPLATES: TemplateItem[] = [
  {
    id: "linkbio",
    name: "Link Bio",
    description: "Linktree-style page with social links and products",
    emoji: "🔗",
    lp_type: "linkbio",
    blocks: TEMPLATE_LINKBIO,
  },
  {
    id: "ecommerce",
    name: "E-Commerce",
    description: "Complete product sales page with checkout",
    emoji: "🛒",
    lp_type: "ecommerce",
    blocks: TEMPLATE_ECOMMERCE,
  },
  {
    id: "salespage",
    name: "Sales Page",
    description: "High-converting long-form landing page",
    emoji: "🚀",
    lp_type: "sales",
    blocks: TEMPLATE_SALESPAGE,
  },
];

// ── Load template into builder ────────────────────────────────
export function loadTemplate(templateId: string): BlockV2[] {
  const template = STARTER_TEMPLATES.find(t => t.id === templateId);
  if (!template) return [];

  // Regenerate all IDs to avoid collisions
  return template.blocks.map(block => ({
    ...block,
    id: nanoid(10),
  }));
}
