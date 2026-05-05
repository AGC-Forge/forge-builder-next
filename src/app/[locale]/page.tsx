import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/home/nav-bar";
import { Footer } from "@/components/home/footer";
import { HeroSection } from "@/components/home/hero-section";
import { StatsSection } from "@/components/home/stats-section";
import { ThemesSection } from "@/components/home/theme-section";
import { FeaturesSection } from "@/components/home/feature-section";
import { AnalyticsSection } from "@/components/home/analytics-section";
import { IntegrationsSection } from "@/components/home/integrations-section";
import { PricingSection } from "@/components/home/pricing-section";
import { CTASection } from "@/components/home/cta-section";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });
  const title = `${t("title")} - ${t("tagline")}`;
  const description = t("description");
  const ogImage = t("ogImage");

  return {
    title,
    keywords: t("keywords"),
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

export default async function Home() {
  return (
    <div
      className="max-w-7xl mx-auto px-6 lg:px-12 bg-background"
      style={{ boxSizing: "border-box" }}
    >
      <Navbar />
      <main>
        <HeroSection />
        <hr className="section-divider" />
        <StatsSection />
        <hr className="section-divider" />
        <ThemesSection />
        <hr className="section-divider" />
        <FeaturesSection />
        <hr className="section-divider" />
        <AnalyticsSection />
        <hr className="section-divider" />
        <IntegrationsSection />
        <hr className="section-divider" />
        <PricingSection />
        <hr className="section-divider" />
        <CTASection />
        <hr className="section-divider" />
      </main>
      <Footer />
    </div>
  );
}
