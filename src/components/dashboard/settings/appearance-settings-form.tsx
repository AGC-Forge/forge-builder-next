"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { updateSettingsBulk } from "@/actions/settings";
import type { WebSetting } from "@/types/database";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  settings: WebSetting[];
}

const TRACKING_FIELDS = [
  {
    key: "global_gtm_id",
    label: "Google Tag Manager ID",
    placeholder: "GTM-XXXXXXX",
    help: "Inject GTM container on all landing pages.",
    docsUrl: "https://tagmanager.google.com/",
  },
  {
    key: "global_ga_id",
    label: "Google Analytics 4 Measurement ID",
    placeholder: "G-XXXXXXXXXX",
    help: "Track traffic via Google Analytics 4.",
    docsUrl: "https://analytics.google.com/",
  },
  {
    key: "global_fb_pixel_id",
    label: "Facebook / Meta Pixel ID",
    placeholder: "1234567890",
    help: "Track conversions and run retargeting ads.",
    docsUrl: "https://business.facebook.com/events_manager/",
  },
  {
    key: "global_histats_id",
    label: "Histats Account ID",
    placeholder: "1234567",
    help: "Enable Histats visitor counter and analytics.",
    docsUrl: "https://www.histats.com/",
  },
];

export function AppearanceSettingsForm({ settings }: Props) {
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, string | null>>(() => {
    const map: Record<string, string | null> = {};
    for (const s of settings) map[s.key] = s.value;
    return map;
  });

  function handleSave() {
    const updates: Record<string, string | null> = {};
    for (const field of TRACKING_FIELDS) {
      updates[field.key] = values[field.key] || null;
    }

    startTransition(async () => {
      const result = await updateSettingsBulk(updates);
      if (result.success) toast.success("Tracking settings saved.");
      else toast.error(result.error ?? "Failed to save.");
    });
  }

  return (
    <div className="w-full space-y-6">
      <Alert>
        <AlertDescription>
          These tracking codes will be injected globally on ALL landing pages.
          Per-page tracking can be configured in each landing page&apos;s
          settings.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Global Tracking Codes</CardTitle>
          <CardDescription>
            Leave empty to disable. Per-page codes override these if set.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {TRACKING_FIELDS.map((field) => (
            <div key={field.key}>
              <Label htmlFor={field.key}>
                {field.label}{" "}
                <a
                  href={field.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-xs underline"
                >
                  Docs
                </a>
              </Label>
              <Input
                id={field.key}
                value={values[field.key] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    [field.key]: e.target.value || null,
                  }))
                }
                placeholder={field.placeholder}
                className="mt-1 font-mono"
              />
              <p className="mt-1 text-muted-foreground text-xs">{field.help}</p>
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={isPending}>
              <Save className="size-4" />
              {isPending ? "Saving…" : "Save Tracking Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
