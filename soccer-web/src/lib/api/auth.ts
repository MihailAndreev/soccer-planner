import { type NextRequest } from "next/server";

import { verifySessionToken, type SessionPayload } from "@/lib/auth/jwt";

export async function getApiUser(request: NextRequest): Promise<SessionPayload | null> {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return verifySessionToken(token);
}
