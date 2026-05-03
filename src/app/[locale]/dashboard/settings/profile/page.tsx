import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/actions/users";
import { ProfileSettingsForm } from "@/components/dashboard/settings/profile-settings-form";

export const metadata: Metadata = { title: "Profile Settings" };

export default async function ProfileSettingsPage() {
  const result = await getCurrentProfile();
  if (!result.success || !result.data) notFound();

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile Settings</h1>
        <p className="text-muted-foreground text-sm">
          Configure your profile settings.
        </p>
      </div>
      <ProfileSettingsForm profile={result.data} />
    </div>
  );
}
