"use client";

import { useState } from "react";
import { Bot, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AnalyzeProductOutput } from "@/lib/ai/analyze-product";
import type { ProductImage } from "@/types/database";

interface Props {
  title: string;
  category?: string;
  images: ProductImage[];
  onResult: (result: AnalyzeProductOutput) => void;
}

export function AiAnalyzer({ title, category, images, onResult }: Props) {
  const [marketplaceUrl, setMarketplaceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!title.trim()) {
      toast.error("Enter a product title first.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Use first image if available
      const firstImage = images[0];

      const body: Record<string, unknown> = { title, category };
      if (marketplaceUrl.trim()) body.marketplaceUrl = marketplaceUrl.trim();
      if (firstImage?.source === "upload" && firstImage.url) {
        // Convert image URL to base64 for AI vision
        try {
          const res = await fetch(firstImage.url);
          const blob = await res.blob();
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onload = () => resolve((reader.result as string).split(",")[1]);
            reader.readAsDataURL(blob);
          });
          body.imageBase64 = base64;
        } catch {
          // fallback to url
          body.imageUrl = firstImage.url;
        }
      } else if (firstImage?.source === "url" && firstImage.url) {
        body.imageUrl = firstImage.url;
      }

      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!res.ok || json.error) {
        setError(json.error ?? "AI analysis failed.");
        return;
      }

      onResult(json.data as AnalyzeProductOutput);
      toast.success("AI analysis complete! Review and save.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border bg-gradient-to-br from-violet-50 to-indigo-50 p-4 dark:from-violet-950/30 dark:to-indigo-950/30">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-full bg-violet-600 text-white">
          <Bot className="size-4" />
        </div>
        <div>
          <p className="font-medium text-sm">AI Product Analyzer</p>
          <p className="text-muted-foreground text-xs">
            AI will analyze your product and auto-fill the details.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-3">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div>
          <Label className="text-xs">Marketplace URL (optional)</Label>
          <Input
            placeholder="https://shopee.co.id/... or Tokopedia URL"
            value={marketplaceUrl}
            onChange={(e) => setMarketplaceUrl(e.target.value)}
            className="mt-1 h-8 text-sm"
          />
        </div>
        <p className="text-muted-foreground text-xs">
          {images.length > 0
            ? `Using image + title${category ? " + category" : ""} for analysis.`
            : `Using title${category ? " + category" : ""} for analysis. Add an image for better results.`}
        </p>
        <Button
          type="button"
          onClick={handleAnalyze}
          disabled={loading || !title.trim()}
          size="sm"
          className="w-full bg-violet-600 hover:bg-violet-700"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {loading ? "Analyzing…" : "Analyze with AI"}
        </Button>
      </div>
    </div>
  );
}
