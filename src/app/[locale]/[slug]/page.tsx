import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLandingPageBySlug } from "@/actions/landing-pages";
import { LandingPageRenderer } from "@/components/landing-page/landing-page-renderer";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

const RESERVED_SLUGS = new Set([
  "dashboard",
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "unauthorized",
  "api",
  "_next",
  "builder",
  "auth",
  "static",
]);

// ── Global mobile-safe CSS reset ─────────────────────────────
const THEME_RESET_CSS = `
*, *::before, *::after { box-sizing: border-box; }
body, html {
  margin: 0; padding: 0; width: 100%;
  overflow-x: hidden; -webkit-text-size-adjust: 100%;
}
img, video, iframe { max-width: 100%; height: auto; }
a { color: inherit; }
details > summary { cursor: pointer; list-style: none; }
details > summary::-webkit-details-marker { display: none; }
`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED_SLUGS.has(slug)) return {};

  const result = await getLandingPageBySlug(slug);
  if (!result.success || !result.data) return {};

  const page = result.data;
  const title = page.seo?.title ?? page.title;
  const description = page.seo?.description ?? page.description ?? undefined;
  const ogImage =
    page.seo?.og_image ?? page.theme_config?.profileImageUrl ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function LandingPagePage({ params }: Props) {
  const { slug } = await params;
  if (RESERVED_SLUGS.has(slug)) notFound();

  const result = await getLandingPageBySlug(slug);
  if (!result.success || !result.data) notFound();

  return (
    <>
      {/* Mobile-safe CSS reset */}
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: controlled CSS */}
      <style dangerouslySetInnerHTML={{ __html: THEME_RESET_CSS }} />
      <LandingPageRenderer landingPage={result.data} />
    </>
  );
}
