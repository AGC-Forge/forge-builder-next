"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { updateSettingsBulk } from "@/actions/settings";
import type { WebSetting } from "@/types/database";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const GROUP_LABELS: Record<string, { title: string; description: string }> = {
  general: {
    title: "General",
    description: "Website name, tagline, and footer settings.",
  },
  auth: {
    title: "Authentication",
    description: "Control user registration and verification.",
  },
  limits: {
    title: "Quotas & Limits",
    description: "Default resource limits for new members.",
  },
  contact: {
    title: "Contact",
    description: "Support contact information.",
  },
  social: {
    title: "Social Media",
    description: "Social media profile links.",
  },
  tracking: {
    title: "Global Tracking",
    description: "Tracking codes injected on all landing pages.",
  },
  storage: {
    title: "Storage",
    description: "Cloudinary image hosting configuration.",
  },
};

const BOOLEAN_KEYS = ["maintenance_mode", "allow_registration", "require_email_verification"];

interface Props {
  groups: Record<string, WebSetting[]>;
}

export function WebSettingsForm({ groups }: Props) {
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, string | null>>(() => {
    const initial: Record<string, string | null> = {};
    for (const settings of Object.values(groups)) {
      for (const s of settings) {
        initial[s.key] = s.value;
      }
    }
    return initial;
  });

  function handleChange(key: string, value: string | null) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSaveGroup(groupName: string) {
    const groupSettings = groups[groupName] ?? [];
    const updates: Record<string, string | null> = {};
    for (const s of groupSettings) {
      updates[s.key] = values[s.key] ?? null;
    }

    startTransition(async () => {
      const result = await updateSettingsBulk(updates);
      if (result.success) toast.success("Settings saved.");
      else toast.error(result.error ?? "Failed to save.");
    });
  }

  const orderedGroups = ["general", "auth", "limits", "contact", "social", "tracking", "storage"];

  return (
    <div className="space-y-6">
      {orderedGroups.map((groupName) => {
        const settings = groups[groupName];
        if (!settings?.length) return null;
        const groupMeta = GROUP_LABELS[groupName] ?? { title: groupName, description: "" };

        return (
          <Card key={groupName}>
            <CardHeader>
              <CardTitle>{groupMeta.title}</CardTitle>
              {groupMeta.description && (
                <CardDescription>{groupMeta.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {settings.map((setting) => {
                  const isBoolean = BOOLEAN_KEYS.includes(setting.key);
                  const val = values[setting.key];

                  return (
                    <div key={setting.key}>
                      <Label htmlFor={setting.key} className="flex flex-col gap-0.5">
                        <span>{setting.key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                        {setting.description && (
                          <span className="font-normal text-muted-foreground text-xs">
                            {setting.description}
                          </span>
                        )}
                      </Label>
                      <div className="mt-1">
                        {isBoolean ? (
                          <div className="flex items-center gap-2">
                            <Switch
                              id={setting.key}
                              checked={val === "true"}
                              onCheckedChange={(checked) =>
                                handleChange(setting.key, checked ? "true" : "false")
                              }
                            />
                            <span className="text-sm">
                              {val === "true" ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                        ) : (
                          <Input
                            id={setting.key}
                            value={val ?? ""}
                            onChange={(e) =>
                              handleChange(setting.key, e.target.value || null)
                            }
                            placeholder="—"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  size="sm"
                  onClick={() => handleSaveGroup(groupName)}
                  disabled={isPending}
                >
                  <Save className="size-4" />
                  {isPending ? "Saving…" : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
