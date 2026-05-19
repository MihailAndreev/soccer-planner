import { NextResponse } from "next/server";

export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function parsePositiveInteger(value: string | null, fallback: number, max?: number) {
  const parsed = value ? Number(value) : fallback;

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return max ? Math.min(parsed, max) : parsed;
}

export function parseRouteId(value: string) {
  const id = Number(value);

  return Number.isInteger(id) && id > 0 ? id : null;
}
