import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export function extractPublicIdFromUrl(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);

    if (!url.hostname.includes("cloudinary.com")) {
      console.warn("No Cloudinary URL:", imageUrl);
      return null;
    }

    const pathParts = url.pathname.split("/");

    const uploadIndex = pathParts.indexOf("upload");
    if (uploadIndex === -1) return null;

    let relevantParts = pathParts.slice(uploadIndex + 1);

    if (relevantParts[0]?.match(/^v\d+$/)) {
      relevantParts = relevantParts.slice(1);
    }

    const fullPath = relevantParts.join("/");
    const publicId = fullPath.substring(0, fullPath.lastIndexOf(".")) || fullPath;

    return publicId || null;
  } catch (error) {
    console.error("Gagal extract public_id:", error);
    return null;
  }
}

export async function uploadImage(
  source: string | Buffer,
  folder = "snapland/products",
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(
    typeof source === "string" ? source : `data:image/jpeg;base64,${source.toString("base64")}`,
    {
      folder,
      resource_type: "image",
      transformation: [
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    },
  );

  return {
    url: result.secure_url,
    public_id: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    const publicId = extractPublicIdFromUrl(imageUrl);

    if (!publicId) {
      console.error("Tidak bisa extract public_id dari URL:", imageUrl);
      return false;
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch {
    return false;
  }
}

export async function uploadBase64Image(
  base64: string,
  mimeType = "image/jpeg",
  folder = "snapland/products",
): Promise<UploadResult> {
  const dataUrl = base64.startsWith("data:")
    ? base64
    : `data:${mimeType};base64,${base64}`;
  return uploadImage(dataUrl, folder);
}
