import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLandingPage } from "@/actions/landing-pages";
import { getActiveProducts } from "@/actions/products";
import { BuilderV2 } from "@/components/builder/builder-v2";

export const metadata: Metadata = { title: "Page Builder" };

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [lpRes, productsRes] = await Promise.all([
    getLandingPage(id),
    getActiveProducts(),
  ]);

  if (!lpRes.success || !lpRes.data) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <BuilderV2
      landingPage={lpRes.data}
      availableProducts={productsRes.data ?? []}
      appUrl={appUrl}
    />
  );
}
