import type { Metadata } from "next";
import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Access Denied" };

export default function UnauthorizedPage() {
  return (
    <div className="@container/main flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10">
        <ShieldX className="size-10 text-destructive" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          You don&apos;t have permission to view this page. This area is
          restricted to admin users only.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard/products">My Products</Link>
        </Button>
      </div>
    </div>
  );
}
