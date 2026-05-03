import type { Metadata } from "next";
import { getSettings } from "@/actions/settings";
import { AppearanceSettingsForm } from "@/components/dashboard/settings/appearance-settings-form";

export const metadata: Metadata = { title: "Appearance" };

export default async function AppearancePage() {
  const result = await getSettings("tracking");
  const trackingSettings = result.success ? result.data ?? [] : [];

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Appearance & Tracking</h1>
        <p className="text-muted-foreground text-sm">
          Configure global tracking codes injected on all landing pages.
        </p>
      </div>
      <AppearanceSettingsForm settings={trackingSettings} />
    </div>
  );
}
