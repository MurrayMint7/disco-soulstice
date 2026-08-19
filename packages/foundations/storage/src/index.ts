import { del } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

/** Vercel Blob only — do not regress to UploadThing (see 0d145fe). */

export const allowedImageContentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const maximumImageSizeInBytes = 25 * 1024 * 1024;

/** Deletes a blob by pathname. Server-side only. */
export async function deleteBlob(pathname: string): Promise<void> {
  await del(pathname);
}

export interface HandleImageUploadOptions {
  body: HandleUploadBody;
  request: Request;
  /**
   * Called before a client upload token is minted; throw to refuse. Injected so
   * this package stays a pure vendor seam and never imports `@disco/auth`.
   */
  authorize: () => Promise<void> | void;
}

/**
 * The client-upload token policy behind `/api/blob/upload`: who may upload,
 * which content types, and how large.
 */
export async function handleImageUpload(options: HandleImageUploadOptions) {
  return handleUpload({
    body: options.body,
    request: options.request,
    onBeforeGenerateToken: async () => {
      await options.authorize();

      return {
        allowedContentTypes: allowedImageContentTypes,
        addRandomSuffix: true,
        maximumSizeInBytes: maximumImageSizeInBytes,
      };
    },
    onUploadCompleted: async () => {
      // No-op: the client persists the resulting URL to Postgres via a
      // tRPC mutation once `upload()` resolves. We don't rely on this
      // webhook because it requires a publicly reachable URL and won't
      // fire against localhost in development.
    },
  });
}

export type { HandleUploadBody };
