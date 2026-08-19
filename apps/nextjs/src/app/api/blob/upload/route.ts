import { NextResponse } from "next/server";

import { getCurrentUserId, requireAdmin } from "@disco/auth";
import { handleImageUpload, type HandleUploadBody } from "@disco/storage";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleImageUpload({
      body,
      request,
      authorize: async () => {
        await requireAdmin(await getCurrentUserId());
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
