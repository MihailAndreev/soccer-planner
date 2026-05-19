import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { matchJoins } from "@/db/schema";
import { getDashboardMatches, getUserMatchAccess } from "./matches";

type MatchMutationCode = "not-found" | "forbidden" | "closed" | "not-joined" | "invalid";

export class MatchMutationError extends Error {
  constructor(
    public readonly code: MatchMutationCode,
    message: string,
  ) {
    super(message);
  }
}

export function getMatchMutationStatus(error: MatchMutationError) {
  if (error.code === "not-found") {
    return 404;
  }

  if (error.code === "forbidden") {
    return 403;
  }

  if (error.code === "invalid") {
    return 400;
  }

  return 409;
}

export async function listActiveMatchesForUser(userId: number, page: number, pageSize: number) {
  const { activeMatches } = await getDashboardMatches(userId);
  const offset = (page - 1) * pageSize;

  return {
    matches: activeMatches.slice(offset, offset + pageSize),
    page,
    pageSize,
    total: activeMatches.length,
    totalPages: Math.ceil(activeMatches.length / pageSize),
  };
}

export async function getMatchDetailsForUser(userId: number, matchId: number) {
  return getUserMatchAccess(userId, matchId);
}

async function requireMutableMatch(userId: number, matchId: number) {
  const access = await getUserMatchAccess(userId, matchId);

  if (access.status === "not-found") {
    throw new MatchMutationError("not-found", "Match not found.");
  }

  if (access.status === "forbidden") {
    throw new MatchMutationError("forbidden", "You are not allowed to update this match.");
  }

  if (!access.match.isActive) {
    throw new MatchMutationError("closed", "This match is closed.");
  }

  return access.match;
}

export async function joinMatch(userId: number, matchId: number) {
  const match = await requireMutableMatch(userId, matchId);
  const existingJoin = await db
    .select({ id: matchJoins.id })
    .from(matchJoins)
    .where(and(eq(matchJoins.matchId, matchId), eq(matchJoins.userId, userId)))
    .limit(1);

  if (!existingJoin[0]) {
    await db.insert(matchJoins).values({
      matchId,
      userId,
      extraSlots: 0,
    });
  }

  return getMatchDetailsForUser(userId, match.id);
}

export async function leaveMatch(userId: number, matchId: number) {
  const match = await requireMutableMatch(userId, matchId);

  await db
    .delete(matchJoins)
    .where(and(eq(matchJoins.matchId, matchId), eq(matchJoins.userId, userId)));

  return getMatchDetailsForUser(userId, match.id);
}

export async function reserveMatchSlots(userId: number, matchId: number, extraSlots: number) {
  if (!Number.isInteger(extraSlots) || extraSlots < 0) {
    throw new MatchMutationError("invalid", "Additional slots must be a whole number of zero or more.");
  }

  const match = await requireMutableMatch(userId, matchId);

  if (!match.currentUserJoin) {
    throw new MatchMutationError("not-joined", "Join the match before reserving friend slots.");
  }

  const occupiedWithoutCurrentUser =
    match.occupiedSlots - (1 + match.currentUserJoin.extraSlots);
  const nextOccupiedSlots = occupiedWithoutCurrentUser + 1 + extraSlots;

  if (nextOccupiedSlots > match.capacity) {
    const availableFriendSlots = Math.max(0, match.capacity - occupiedWithoutCurrentUser - 1);

    throw new MatchMutationError(
      "invalid",
      `This match only has room for ${availableFriendSlots} friend slot${
        availableFriendSlots === 1 ? "" : "s"
      }.`,
    );
  }

  await db
    .update(matchJoins)
    .set({ extraSlots })
    .where(and(eq(matchJoins.matchId, matchId), eq(matchJoins.userId, userId)));

  return getMatchDetailsForUser(userId, match.id);
}
