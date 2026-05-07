import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadBase64Image, deleteImage } from "@/lib/cloudinary/upload";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { base64, mimeType, folder } = body as {
      base64: string;
      mimeType?: string;
      folder?: string;
    };

    if (!base64) {
      return NextResponse.json({ error: "No image data" }, { status: 400 });
    }

    const result = await uploadBase64Image(
      base64,
      mimeType ?? "image/jpeg",
      folder ?? "snapland/products",
    );

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let imageUrl = searchParams.get("url");

    if (!imageUrl) {
      try {
        const body = await request.json();
        imageUrl = body.imageUrl;
      } catch {
        // Body kosong atau bukan JSON, lanjut aja
      }
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    const success = await deleteImage(imageUrl);

    if (success) {
      return NextResponse.json({ success: true, message: "Image deleted successfully" });
    } else {
      return NextResponse.json(
        { error: "Failed to delete image" },
        { status: 500 }
      );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
