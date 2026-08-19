import { upload } from "@vercel/blob/client";

export interface UploadedImage {
  url: string;
  pathname: string;
}

export async function uploadImageFile(
  file: File,
  folder: string,
): Promise<UploadedImage> {
  const blob = await upload(`${folder}/${file.name}`, file, {
    access: "public",
    handleUploadUrl: "/api/blob/upload",
  });
  return { url: blob.url, pathname: blob.pathname };
}

export type GalleryAspect = "square" | "portrait" | "landscape" | "wide";

export function detectImageAspect(file: File): Promise<GalleryAspect> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      URL.revokeObjectURL(objectUrl);
      if (ratio > 1.65) resolve("wide");
      else if (ratio > 1.15) resolve("landscape");
      else if (ratio > 0.85) resolve("square");
      else resolve("portrait");
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve("landscape");
    };
    img.src = objectUrl;
  });
}
