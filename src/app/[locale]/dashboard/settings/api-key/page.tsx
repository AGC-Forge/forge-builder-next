import type { Metadata } from "next";
import { getApiKey } from "@/actions/settings";
import { ApiKeyForm } from "@/components/dashboard/settings/api-key-form";

export const metadata: Metadata = { title: "API Key" };

export default async function ApiKeyPage() {
  const result = await getApiKey("openrouter");
  const existing = result.success ? result.data : null;

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="text-2xl font-semibold">API Key</h1>
        <p className="text-muted-foreground text-sm">
          Configure your OpenRouter API key to enable AI-powered product analysis.
        </p>
      </div>
      <ApiKeyForm existing={existing} />
    </div>
  );
}
