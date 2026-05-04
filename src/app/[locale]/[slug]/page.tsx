import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLandingPageBySlug } from "@/actions/landing-pages";
import { LandingPageRenderer } from "@/components/landing-page/landing-page-renderer";
import { THEME_GLOBAL_CSS } from "@/components/landing-page/theme-utils";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

const RESERVED_SLUGS = [
  "dashboard",
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "unauthorized",
  "api",
  "_next",
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED_SLUGS.includes(slug)) return {};

  const result = await getLandingPageBySlug(slug);
  if (!result.success || !result.data) return {};

  const page = result.data;
  const title = page.seo?.title ?? page.title;
  const description = page.seo?.description ?? page.description ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: page.seo?.og_image ? [page.seo.og_image] : undefined,
    },
  };
}

export default async function LandingPagePage({ params }: Props) {
  const { slug } = await params;
  if (RESERVED_SLUGS.includes(slug)) notFound();

  const result = await getLandingPageBySlug(slug);
  if (!result.success || !result.data) notFound();

  return (
    <>
      {/* Inject mobile-safe CSS reset for all themes */}
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: controlled CSS reset */}
      <style dangerouslySetInnerHTML={{ __html: THEME_GLOBAL_CSS }} />
      <LandingPageRenderer landingPage={result.data} />
    </>
  );
}
