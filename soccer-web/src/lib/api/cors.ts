import { NextRequest, NextResponse } from "next/server";

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:8081",
  "http://127.0.0.1:8081",
  "http://localhost:19006",
  "http://127.0.0.1:19006",
];

const ALLOWED_METHODS = "GET, POST, OPTIONS";
const ALLOWED_HEADERS = "Authorization, Content-Type";
const MAX_AGE_SECONDS = "86400";

function getAllowedOrigins() {
  const configuredOrigins = process.env.API_CORS_ALLOWED_ORIGINS;

  if (!configuredOrigins) {
    return DEFAULT_ALLOWED_ORIGINS;
  }

  return configuredOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isAllowedOrigin(origin: string | null, request: NextRequest) {
  if (!origin) {
    return false;
  }

  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
    return true;
  }

  return origin === request.nextUrl.origin;
}

function getCorsOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");

  return isAllowedOrigin(origin, request) ? origin : null;
}

export function applyCorsHeaders(response: NextResponse, request: NextRequest) {
  const corsOrigin = getCorsOrigin(request);

  if (corsOrigin) {
    response.headers.set("Access-Control-Allow-Origin", corsOrigin);
    response.headers.set("Vary", "Origin");
  }

  response.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
  response.headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS);
  response.headers.set("Access-Control-Max-Age", MAX_AGE_SECONDS);

  return response;
}

export function corsPreflightResponse(request: NextRequest) {
  return applyCorsHeaders(new NextResponse(null, { status: 204 }), request);
}
