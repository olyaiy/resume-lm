import { NextResponse } from "next/server";

import { getCanonicalModelId, getDefaultModel } from "@/lib/ai-models";
import { getModelHealth } from "@/lib/ai/reliability";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedModel = searchParams.get("model")?.trim();
  const modelId = getCanonicalModelId(requestedModel || getDefaultModel(false));
  const health = await getModelHealth(modelId);

  return NextResponse.json(health, {
    headers: {
      "Cache-Control": "private, max-age=10, stale-while-revalidate=30",
    },
  });
}
