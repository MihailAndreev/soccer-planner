import { NextRequest, NextResponse } from "next/server";

import { getApiUser } from "@/lib/api/auth";
import { serializeMatchDetails } from "@/lib/api/match-serializers";
import { apiError, parseRouteId } from "@/lib/api/responses";
import {
  getMatchMutationStatus,
  MatchMutationError,
  reserveMatchSlots,
} from "@/lib/match-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser(request);

  if (!user) {
    return apiError("Missing or invalid bearer token.", 401);
  }

  const { id } = await params;
  const matchId = parseRouteId(id);

  if (!matchId) {
    return apiError("Invalid match id.", 400);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError("Request body must be valid JSON.", 400);
  }

  const extraSlots = typeof body === "object" && body && "extraSlots" in body ? body.extraSlots : null;

  if (typeof extraSlots !== "number") {
    return apiError("extraSlots must be a number.", 400);
  }

  try {
    const access = await reserveMatchSlots(user.userId, matchId, extraSlots);

    if (access.status !== "ok") {
      return apiError("Could not load match after updating slots.", 500);
    }

    return NextResponse.json({ data: serializeMatchDetails(access.match) });
  } catch (error) {
    if (error instanceof MatchMutationError) {
      return apiError(error.message, getMatchMutationStatus(error));
    }

    throw error;
  }
}
