import Link from "next/link";
import {
  Package,
  Link2,
  Users,
  BarChart2,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex min-h-85 flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/20 p-8 text-center ${className ?? ""}`}
    >
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
        <Icon className="size-8 text-muted-foreground/60" />
      </div>
      <div className="max-w-xs space-y-1.5">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
      {(action || secondaryAction) && (
        <div className="flex flex-wrap justify-center gap-2">
          {action &&
            (action.href ? (
              <Button asChild size="sm">
                <Link href={action.href}>
                  <Plus className="size-3.5" />
                  {action.label}
                </Link>
              </Button>
            ) : (
              <Button size="sm" onClick={action.onClick}>
                <Plus className="size-3.5" />
                {action.label}
              </Button>
            ))}
          {secondaryAction &&
            (secondaryAction.href ? (
              <Button asChild variant="outline" size="sm">
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            ))}
        </div>
      )}
    </div>
  );
}

// ── Pre-built empty states ────────────────────────────────────

export function EmptyProducts() {
  return (
    <EmptyState
      icon={Package}
      title="No products yet"
      description="Add your first product to start building landing pages and tracking affiliate links."
      action={{ label: "Add Product", href: "/dashboard/products/new" }}
    />
  );
}

export function EmptyLandingPages() {
  return (
    <EmptyState
      icon={Link2}
      title="No landing pages yet"
      description="Create your first landing page with a custom slug, choose a theme, and assign products."
      action={{
        label: "Create Landing Page",
        href: "/dashboard/landing-page/new",
      }}
    />
  );
}

export function EmptyUsers() {
  return (
    <EmptyState
      icon={Users}
      title="No other users yet"
      description="Invite team members or collaborators to join your SnapLand workspace."
    />
  );
}

export function EmptyAnalytics() {
  return (
    <EmptyState
      icon={BarChart2}
      title="No analytics data yet"
      description="Analytics will appear here once your landing pages start receiving visitors. Publish a page and share the link to get started."
      action={{ label: "View Landing Pages", href: "/dashboard/landing-page" }}
    />
  );
}
