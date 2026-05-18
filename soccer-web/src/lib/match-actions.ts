"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { matchJoins } from "@/db/schema";
import { getCurrentUser } from "./auth/session";
import { getMatchForMutation } from "./matches";

export type MatchActionState = {
  error?: string;
};

function readMatchId(formData: FormData) {
  const value = formData.get("matchId");
  const matchId = typeof value === "string" ? Number(value) : NaN;

  if (!Number.isInteger(matchId)) {
    throw new Error("Invalid match id.");
  }

  return matchId;
}

function revalidateMatchViews(matchId: number) {
  revalidatePath("/dashboard");
  revalidatePath(`/matches/${matchId}`);
}

async function requireMutableMatch(matchId: number) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const match = await getMatchForMutation(currentUser.userId, matchId);

  if (!match) {
    throw new Error("You are not allowed to update this match.");
  }

  if (!match.isActive) {
    throw new Error("This match is closed.");
  }

  return { currentUser, match };
}

export async function joinMatchAction(formData: FormData) {
  const matchId = readMatchId(formData);
  const { currentUser } = await requireMutableMatch(matchId);
  const existingJoin = await db
    .select({ id: matchJoins.id })
    .from(matchJoins)
    .where(and(eq(matchJoins.matchId, matchId), eq(matchJoins.userId, currentUser.userId)))
    .limit(1);

  if (!existingJoin[0]) {
    await db.insert(matchJoins).values({
      matchId,
      userId: currentUser.userId,
      extraSlots: 0,
    });
  }

  revalidateMatchViews(matchId);
}

export async function leaveMatchAction(formData: FormData) {
  const matchId = readMatchId(formData);
  const { currentUser } = await requireMutableMatch(matchId);

  await db
    .delete(matchJoins)
    .where(and(eq(matchJoins.matchId, matchId), eq(matchJoins.userId, currentUser.userId)));

  revalidateMatchViews(matchId);
}

export async function updateExtraSlotsAction(
  _previousState: MatchActionState,
  formData: FormData,
): Promise<MatchActionState> {
  const matchId = readMatchId(formData);
  const extraSlotsValue = formData.get("extraSlots");
  const extraSlots = typeof extraSlotsValue === "string" ? Number(extraSlotsValue) : 0;
  const { currentUser, match } = await requireMutableMatch(matchId);

  if (!Number.isInteger(extraSlots) || extraSlots < 0) {
    return { error: "Additional slots must be a whole number of zero or more." };
  }

  if (!match.currentUserJoin) {
    return { error: "Join the match before reserving friend slots." };
  }

  const occupiedWithoutCurrentUser =
    match.occupiedSlots - (1 + match.currentUserJoin.extraSlots);
  const nextOccupiedSlots = occupiedWithoutCurrentUser + 1 + extraSlots;

  if (nextOccupiedSlots > match.capacity) {
    const availableFriendSlots = Math.max(0, match.capacity - occupiedWithoutCurrentUser - 1);

    return {
      error: `This match only has room for ${availableFriendSlots} friend slot${
        availableFriendSlots === 1 ? "" : "s"
      }.`,
    };
  }

  await db
    .update(matchJoins)
    .set({ extraSlots })
    .where(and(eq(matchJoins.matchId, matchId), eq(matchJoins.userId, currentUser.userId)));

  revalidateMatchViews(matchId);

  return {};
}
