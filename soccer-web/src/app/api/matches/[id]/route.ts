import { NextRequest, NextResponse } from "next/server";

import { getApiUser } from "@/lib/api/auth";
import { serializeMatchDetails } from "@/lib/api/match-serializers";
import { apiError, parseRouteId } from "@/lib/api/responses";
import { getMatchDetailsForUser } from "@/lib/match-service";

export async function GET(
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

  const access = await getMatchDetailsForUser(user.userId, matchId);

  if (access.status === "not-found") {
    return apiError("Match not found.", 404);
  }

  if (access.status === "forbidden") {
    return apiError("You are not allowed to view this match.", 403);
  }

  return NextResponse.json({ data: serializeMatchDetails(access.match) });
}
