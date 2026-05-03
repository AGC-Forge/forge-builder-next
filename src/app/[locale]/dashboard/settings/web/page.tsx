import type { Metadata } from "next";
import { getSettings } from "@/actions/settings";
import { WebSettingsForm } from "@/components/dashboard/settings/web-settings-form";

export const metadata: Metadata = { title: "Web Settings" };

export default async function WebSettingsPage() {
  const result = await getSettings();
  const settings = result.success ? (result.data ?? []) : [];

  // Group by group_name
  const groups = settings.reduce<Record<string, typeof settings>>((acc, s) => {
    if (!acc[s.group_name]) acc[s.group_name] = [];
    acc[s.group_name].push(s);
    return acc;
  }, {});

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Web Settings</h1>
        <p className="text-muted-foreground text-sm">
          Global configuration for your Snapland platform.
        </p>
      </div>
      <WebSettingsForm groups={groups} />
    </div>
  );
}
