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

export async function deleteImage(publicId: string): Promise<boolean> {
  try {
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
