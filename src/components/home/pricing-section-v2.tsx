"use client";

import Link from "next/link";
import { Check, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: 0,
    priceYearly: 0,
    badge: null,
    desc: "Perfect for testing ideas.",
    cta: "Get started free",
    ctaHref: "/register",
    highlight: false,
    features: [
      "3 landing pages",
      "5 products",
      "20 basic blocks",
      "5 AI uses / month",
      "Tracking pixels",
      "SnapLand subdomain",
    ],
  },
  {
    key: "starter",
    name: "Starter",
    price: 99000,
    priceYearly: 899000,
    desc: "For creators and sellers starting out.",
    cta: "Start Starter",
    ctaHref: "/register?plan=starter",
    highlight: false,
    badge: null,
    features: [
      "10 landing pages",
      "30 products",
      "All 42 blocks",
      "50 AI uses / month",
      "Order management system",
      "WhatsApp Rotator",
      "Payment methods",
      "All tracking pixels",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: 299000,
    priceYearly: 2499000,
    desc: "For power users and growing businesses.",
    cta: "Go Pro",
    ctaHref: "/register?plan=pro",
    highlight: true,
    badge: "⚡ Most Popular",
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
  {
    key: "enterprise",
    name: "Enterprise",
    price: null,
    priceYearly: null,
    desc: "For agencies and large teams.",
    cta: "Contact Sales",
    ctaHref: "/contact",
    highlight: false,
    badge: null,
    features: [
      "Everything in Pro",
      "Unlimited custom domains",
      "White-label option",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "Onboarding session",
    ],
  },
] as const;

interface Props {
  showTitle?: boolean;
  compact?: boolean;
}

export function PricingSectionV2({ showTitle = true, compact = false }: Props) {
  return (
    <section id="pricing" className={compact ? "py-12" : "py-24"}>
      {showTitle && (
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Start free, scale when ready
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            No credit card required. All plans include a 14-day free trial of
            Pro features.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            className={cn(
              "relative rounded-2xl border p-6 flex flex-col transition-all duration-200 hover:-translate-y-1",
              plan.highlight
                ? "border-primary ring-2 ring-primary shadow-xl shadow-primary/10"
                : "border-border hover:border-primary/30",
            )}
          >
            {plan.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-bold px-4 py-1 rounded-full whitespace-nowrap">
                {plan.badge}
              </div>
            )}

            <div className="mb-4">
              <p
                className={cn(
                  "font-bold text-lg mb-1",
                  plan.highlight ? "text-primary" : "",
                )}
              >
                {plan.name}
              </p>
              {plan.price !== null ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold">
                    {plan.price === 0
                      ? "Gratis"
                      : formatCurrency(plan.price, {
                          currency: "IDR",
                          noDecimals: true,
                        })}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground text-sm">/mo</span>
                  )}
                </div>
              ) : (
                <p className="text-3xl font-extrabold">Custom</p>
              )}
              {plan.priceYearly && plan.priceYearly > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatCurrency(plan.priceYearly, {
                    currency: "IDR",
                    noDecimals: true,
                  })}{" "}
                  / year (save{" "}
                  {Math.round(
                    ((plan.price! * 12 - plan.priceYearly) /
                      (plan.price! * 12)) *
                      100,
                  )}
                  %)
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">{plan.desc}</p>
            </div>

            <ul className="space-y-2.5 flex-1 mb-6">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="size-4 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={plan.highlight ? "default" : "outline"}
              className="w-full gap-2"
              asChild
            >
              <Link href={plan.ctaHref}>
                {plan.key === "pro" && <Zap className="size-3.5" />}
                {plan.key === "enterprise" && <Crown className="size-3.5" />}
                {plan.cta}
              </Link>
            </Button>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        All prices in IDR. VAT not included. Prices may vary. Cancel anytime.
      </p>
    </section>
  );
}
