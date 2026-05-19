import { NextRequest, NextResponse } from "next/server";

import { getApiUser } from "@/lib/api/auth";
import { serializeMatchSummary } from "@/lib/api/match-serializers";
import { apiError, parsePositiveInteger } from "@/lib/api/responses";
import { listActiveMatchesForUser } from "@/lib/match-service";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);

  if (!user) {
    return apiError("Missing or invalid bearer token.", 401);
  }

  const page = parsePositiveInteger(request.nextUrl.searchParams.get("page"), 1);
  const pageSize = parsePositiveInteger(request.nextUrl.searchParams.get("pageSize"), 20, 100);
  const result = await listActiveMatchesForUser(user.userId, page, pageSize);

  return NextResponse.json({
    data: result.matches.map(serializeMatchSummary),
    paging: {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: result.totalPages,
    },
  });
}
