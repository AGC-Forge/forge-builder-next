"use client";

import { useRef, useState } from "react";
import { ExternalLink, Eye, EyeOff, Globe, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  previewUrl: string;
  previewDevice: "mobile" | "desktop";
  isPublished: boolean;
  isDirty: boolean;
  onPublish: () => void;
  isSaving: boolean;
}

export function BuilderPreviewPanel({
  previewUrl,
  previewDevice,
  isPublished,
  isDirty,
  onPublish,
  isSaving,
}: Props) {
  const [key, setKey] = useState(0);
  const refresh = () => setKey((k) => k + 1);

  const FRAME_WIDTH = {
    mobile: "390px",
    desktop: "100%",
  };
  const FRAME_HEIGHT = {
    mobile: "740px",
    desktop: "560px",
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2 shrink-0">
        <p className="text-xs font-medium">Live Preview</p>
        <div className="flex items-center gap-1">
          {isDirty && (
            <span className="text-[10px] text-amber-500">Save to refresh</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={refresh}
          >
            <RefreshCw className="size-3" />
          </Button>
          <Button variant="ghost" size="icon" className="size-6" asChild>
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3" />
            </a>
          </Button>
        </div>
      </div>

      {/* Frame */}
      <div className="flex flex-1 flex-col items-center justify-start overflow-auto p-3 bg-muted/30">
        {isPublished ? (
          <div
            className={cn(
              "overflow-hidden rounded-xl border-2 border-border shadow-lg bg-white w-full",
              previewDevice === "mobile" && "mx-auto",
            )}
            style={{
              maxWidth: FRAME_WIDTH[previewDevice],
              height: FRAME_HEIGHT[previewDevice],
            }}
          >
            <iframe
              key={key}
              src={previewUrl}
              className="w-full h-full border-0"
              title="Page preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
            <div className="size-14 rounded-2xl bg-muted flex items-center justify-center">
              <EyeOff className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">Page not published</p>
              <p className="text-xs text-muted-foreground mt-1">
                Publish your page to see a live preview here.
              </p>
            </div>
            <Button
              size="sm"
              onClick={onPublish}
              disabled={isSaving}
              className="gap-1.5"
            >
              <Globe className="size-3.5" />
              Publish & Preview
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      {isPublished && (
        <div className="border-t px-3 py-2 shrink-0">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-primary hover:underline truncate block font-mono"
          >
            {previewUrl}
          </a>
        </div>
      )}
    </div>
  );
}
