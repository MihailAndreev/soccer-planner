import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api/responses";
import { SESSION_MAX_AGE_SECONDS } from "@/lib/auth/jwt";
import { authenticateUser } from "@/lib/auth/service";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError("Request body must be valid JSON.", 400);
  }

  const email = typeof body === "object" && body && "email" in body ? body.email : "";
  const password = typeof body === "object" && body && "password" in body ? body.password : "";

  if (typeof email !== "string" || typeof password !== "string") {
    return apiError("Email and password are required.", 400);
  }

  const login = await authenticateUser(email, password);

  if (!login) {
    return apiError("Invalid email or password.", 401);
  }

  return NextResponse.json({
    token: login.token,
    tokenType: "Bearer",
    expiresIn: SESSION_MAX_AGE_SECONDS,
    user: login.user,
  });
}
