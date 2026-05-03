import type { Metadata } from "next";
import { getCurrentProfile } from "@/actions/users";
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

export const metadata: Metadata = {
  title: "AI Landing Page Builder: Create High-Converting Pages in Seconds",
};

export default async function Home() {
  const profileResult = await getCurrentProfile();
  const profile = profileResult.data;
  return (
    <div
      className="max-w-7xl mx-auto px-6 lg:px-12 bg-background"
      style={{ boxSizing: "border-box" }}
    >
      <Navbar profile={profile} />
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
