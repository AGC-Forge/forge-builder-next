import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingPageForm } from "@/components/dashboard/landing-pages/landing-page-form";

export const metadata: Metadata = { title: "New Landing Page" };

export default function NewLandingPagePage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/landing-page">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">New Landing Page</h1>
          <p className="text-muted-foreground text-sm">
            Set up your page, then open the builder to design it.
          </p>
        </div>
      </div>
      <LandingPageForm mode="create" />
    </div>
  );
}
