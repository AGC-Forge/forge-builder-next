"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProductImage } from "@/types/database";

interface Props {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  maxImages?: number;
}

export function ImageUploader({ images, onChange, maxImages = 8 }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleFileUpload(files: FileList | null) {
    if (!files?.length) return;
    if (images.length >= maxImages) {
      toast.error(`Max ${maxImages} images allowed.`);
      return;
    }

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (images.length >= maxImages) break;
        const base64 = await fileToBase64(file);
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64,
            mimeType: file.type,
            folder: "forgebuilder/products",
          }),
        });
        const json = await res.json();
        if (!res.ok || json.error) {
          toast.error(json.error ?? "Upload failed");
          continue;
        }
        const newImage: ProductImage = {
          id: json.data.public_id,
          url: json.data.url,
          public_id: json.data.public_id,
          name: file.name,
          is_primary: images.length === 0,
          source: "upload",
        };
        onChange([...images, newImage]);
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleAddUrl() {
    const url = urlInput.trim();
    if (!url) return;
    if (images.length >= maxImages) {
      toast.error(`Max ${maxImages} images allowed.`);
      return;
    }
    try {
      new URL(url);
    } catch {
      toast.error("Invalid URL.");
      return;
    }
    const newImage: ProductImage = {
      id: `url-${Date.now()}`,
      url,
      is_primary: images.length === 0,
      source: "url",
    };
    onChange([...images, newImage]);
    setUrlInput("");
  }

  function removeImage(id: string) {
    const filtered = images.filter((img) => img.id !== id);
    // Re-set primary if removed primary
    if (filtered.length > 0 && !filtered.some((i) => i.is_primary)) {
      filtered[0].is_primary = true;
    }
    onChange(filtered);
  }

  function setPrimary(id: string) {
    onChange(images.map((img) => ({ ...img, is_primary: img.id === id })));
  }

  return (
    <div className="space-y-3">
      <Label>Product Images</Label>

      {/* Upload tabs */}
      {images.length < maxImages && (
        <Tabs defaultValue="upload">
          <TabsList className="h-8">
            <TabsTrigger value="upload" className="text-xs">
              Upload File
            </TabsTrigger>
            <TabsTrigger value="url" className="text-xs">
              From URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-2">
            <div
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors",
                "hover:border-primary/50 hover:bg-muted/50",
              )}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              {uploading ? (
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              ) : (
                <ImagePlus className="size-6 text-muted-foreground" />
              )}
              <p className="text-muted-foreground text-sm">
                {uploading ? "Uploading…" : "Click to upload (JPG, PNG, WebP)"}
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </div>
          </TabsContent>

          <TabsContent value="url" className="mt-2">
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
              />
              <Button type="button" onClick={handleAddUrl} size="sm">
                <Link2 className="size-4" />
                Add
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {images.map((img) => (
            <div
              key={img.id}
              className={cn(
                "group relative overflow-hidden rounded-lg border bg-muted",
                img.is_primary && "ring-2 ring-primary",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.name ?? "product"}
                className="aspect-square w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
                }}
              />

              {/* Primary badge */}
              {img.is_primary && (
                <span className="absolute left-1 top-1 rounded-sm bg-primary px-1 py-0.5 text-[10px] text-primary-foreground leading-none">
                  Main
                </span>
              )}

              {/* Actions overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {!img.is_primary && (
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="size-6"
                    onClick={() => setPrimary(img.id)}
                    title="Set as main"
                  >
                    <ImagePlus className="size-3" />
                  </Button>
                )}
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="size-6"
                  onClick={() => removeImage(img.id)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-muted-foreground text-xs">
        {images.length}/{maxImages} images. Click an image to set as primary.
      </p>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
