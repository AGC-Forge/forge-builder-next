"use client";

import { useEffect, useRef, useState } from "react";
import { Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// ── Minimal QR encoder using qrcode-svg approach via canvas ──
// We use an API-based approach (no npm package) via Google Charts API
// as a lightweight fallback that works without any extra dependencies.

interface QrCodeGeneratorProps {
  url: string;
  title?: string;
  trigger?: React.ReactNode;
}

export function QrCodeGenerator({ url, title, trigger }: QrCodeGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState(280);
  const imgRef = useRef<HTMLImageElement>(null);

  // Google Charts QR API — free, no auth, returns PNG
  const qrSrc = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(url)}&chco=${fgColor.replace("#", "")}&chf=bg,s,${bgColor.replace("#", "")}`;

  function handleDownloadPNG() {
    const a = document.createElement("a");
    a.href = qrSrc;
    a.download = `qr-${(title ?? "page").toLowerCase().replace(/\s+/g, "-")}.png`;
    // Google Charts doesn't support CORS download directly — open in new tab as fallback
    window.open(qrSrc, "_blank");
    toast.info(
      "QR Code opened in new tab — right click → Save As to download.",
    );
  }

  function handleCopyUrl() {
    navigator.clipboard.writeText(url).then(() => toast.success("URL copied!"));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-1.5">
            <QrCode className="size-3.5" />
            QR Code
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="size-4" />
            QR Code
            {title && (
              <span className="text-muted-foreground font-normal">
                — {title}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Preview */}
          <div
            className="mx-auto overflow-hidden rounded-xl border p-4 flex items-center justify-center"
            style={{
              backgroundColor: bgColor,
              width: "200px",
              height: "200px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={qrSrc}
              alt="QR Code"
              width={168}
              height={168}
              className="block"
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          {/* URL (read-only) */}
          <div className="space-y-1">
            <Label className="text-xs">Landing Page URL</Label>
            <div className="flex gap-2">
              <Input value={url} readOnly className="h-8 text-xs font-mono" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="shrink-0"
              >
                Copy
              </Button>
            </div>
          </div>

          {/* Color customization */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">QR Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border"
                />
                <Input
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-8 flex-1 font-mono text-xs"
                  maxLength={7}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Background</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border"
                />
                <Input
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-8 flex-1 font-mono text-xs"
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          {/* Size selector */}
          <div className="space-y-1">
            <Label className="text-xs">Size</Label>
            <div className="flex gap-2">
              {[200, 280, 400, 600].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`flex-1 rounded-md border py-1.5 text-xs font-medium transition-all ${
                    size === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {s}px
                </button>
              ))}
            </div>
          </div>

          {/* Download */}
          <Button className="w-full gap-1.5" onClick={handleDownloadPNG}>
            <Download className="size-3.5" />
            Download QR Code (PNG)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
