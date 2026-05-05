"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { saveApiKey, deleteApiKey } from "@/actions/settings";
import { getModelOptions, getDefaultModelId } from "@/lib/constants";
import type { UserApiKey } from "@/types/database";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  existing: UserApiKey | null;
}

export function ApiKeyForm({ existing }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showKey, setShowKey] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [apiKey, setApiKey] = useState(existing?.api_key ?? "");
  const [modelId, setModelId] = useState(
    existing?.model_id ?? getDefaultModelId("OTHER"),
  );
  const [label, setLabel] = useState(existing?.label ?? "");
  const [testStatus, setTestStatus] = useState<"idle" | "ok" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");

  const allModels = [
    ...getModelOptions("CLAUDE"),
    ...getModelOptions("OPENAI"),
    ...getModelOptions("GEMINI"),
    ...getModelOptions("DEEPSEEK"),
    ...getModelOptions("X-AI"),
    ...getModelOptions("OTHER"),
  ];

  async function handleTest() {
    if (!apiKey.trim()) {
      toast.error("Enter your API key first.");
      return;
    }
    setTestStatus("idle");
    setTestMessage("");
    try {
      // Simple test: fetch models list from OpenRouter
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (res.ok) {
        setTestStatus("ok");
        setTestMessage("Connection successful!");
      } else {
        const json = await res.json().catch(() => ({}));
        setTestStatus("error");
        setTestMessage(json.error?.message ?? `HTTP ${res.status}`);
      }
    } catch {
      setTestStatus("error");
      setTestMessage("Network error.");
    }
  }

  function handleSave() {
    if (!apiKey.trim()) {
      toast.error("Enter your OpenRouter API key.");
      return;
    }
    startTransition(async () => {
      const result = await saveApiKey(
        "openrouter",
        apiKey.trim(),
        modelId,
        label || undefined,
      );
      if (result.success) toast.success("API key saved.");
      else toast.error(result.error ?? "Failed to save.");
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteApiKey("openrouter");
      if (result.success) {
        setApiKey("");
        setModelId(getDefaultModelId("OTHER"));
        setLabel("");
        setTestStatus("idle");
        toast.success("API key deleted.");
      } else {
        toast.error(result.error ?? "Failed.");
      }
      setShowDelete(false);
    });
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>OpenRouter API Key</CardTitle>
          <CardDescription>
            Get your API key from{" "}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              openrouter.ai/keys
            </a>
            . This key is used to power the AI product analyzer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="api-key">API Key</Label>
            <div className="mt-1 flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="api-key"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-or-v1-…"
                  className="pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <Button variant="outline" onClick={handleTest} type="button">
                Test
              </Button>
            </div>
          </div>

          {testStatus !== "idle" && (
            <Alert variant={testStatus === "ok" ? "default" : "destructive"}>
              {testStatus === "ok" && <CheckCircle className="size-4" />}
              <AlertDescription>{testMessage}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label>Default AI Model</Label>
            <Select value={modelId} onValueChange={setModelId}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-full">
                {allModels.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-muted-foreground text-xs">
              Model used for AI product analysis. Models with vision support
              work best when using product images.
            </p>
          </div>

          <div>
            <Label>Label (optional)</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. My OpenRouter Key"
              className="mt-1"
            />
          </div>

          {existing && (
            <p className="text-muted-foreground text-xs">
              Last used:{" "}
              {existing.last_used_at
                ? new Date(existing.last_used_at).toLocaleString()
                : "Never"}
            </p>
          )}

          <div className="flex justify-between">
            {existing && (
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setShowDelete(true)}
                type="button"
              >
                <Trash2 className="size-4" />
                Delete Key
              </Button>
            )}
            <Button
              className="ml-auto"
              onClick={handleSave}
              disabled={isPending}
              type="button"
            >
              {isPending ? "Saving…" : existing ? "Update Key" : "Save Key"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API key?</AlertDialogTitle>
            <AlertDialogDescription>
              AI features will be disabled until you add a new key.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={handleDelete}
              disabled={isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
