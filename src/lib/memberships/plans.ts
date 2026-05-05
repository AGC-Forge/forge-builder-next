export type PlanType = "free" | "starter" | "pro" | "enterprise";
export type BillingPeriod = "monthly" | "yearly" | "lifetime";

export interface Membership {
  id: string;
  user_id: string;
  plan_type: PlanType;
  started_at: string;
  expires_at: string | null;
  is_active: boolean;
  payment_ref: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const PLAN_CONFIG: Record<PlanType, {
  label: string;
  price_monthly: number;
  price_yearly: number;
  max_pages: number;
  max_products: number;
  features: string[];
  color: string;
}> = {
  free: {
    label: "Free",
    price_monthly: 0,
    price_yearly: 0,
    max_pages: 3,
    max_products: 5,
    color: "text-muted-foreground",
    features: [
      "3 landing pages",
      "5 products",
      "Basic blocks (20)",
      "5 AI uses/month",
      "Tracking pixels",
      "SnapLand subdomain",
    ],
  },
  starter: {
    label: "Starter",
    price_monthly: 99000,
    price_yearly: 899000,
    max_pages: 10,
    max_products: 30,
    color: "text-blue-600",
    features: [
      "10 landing pages",
      "30 products",
      "All 42 blocks",
      "50 AI uses/month",
      "Order system",
      "WA Rotator + Payments",
      "All tracking pixels",
    ],
  },
  pro: {
    label: "Pro",
    price_monthly: 299000,
    price_yearly: 2499000,
    max_pages: 999,
    max_products: 999,
    color: "text-purple-600",
    features: [
      "Unlimited landing pages",
      "Unlimited products",
      "All blocks + applications",
      "Unlimited AI usage",
      "Custom domain (1)",
      "Remove SnapLand branding",
      "Priority support",
    ],
  },
  enterprise: {
    label: "Enterprise",
    price_monthly: 0,
    price_yearly: 0,
    max_pages: 9999,
    max_products: 9999,
    color: "text-amber-600",
    features: [
      "Everything in Pro",
      "Unlimited custom domains",
      "White-label option",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
    ],
  },
};
