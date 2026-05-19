"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "./auth/session";
import {
  joinMatch,
  leaveMatch,
  MatchMutationError,
  reserveMatchSlots,
} from "./match-service";

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

async function requireCurrentUser() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return currentUser;
}

export async function joinMatchAction(formData: FormData) {
  const matchId = readMatchId(formData);
  const currentUser = await requireCurrentUser();

  await joinMatch(currentUser.userId, matchId);
  revalidateMatchViews(matchId);
}

export async function leaveMatchAction(formData: FormData) {
  const matchId = readMatchId(formData);
  const currentUser = await requireCurrentUser();

  await leaveMatch(currentUser.userId, matchId);
  revalidateMatchViews(matchId);
}

export async function updateExtraSlotsAction(
  _previousState: MatchActionState,
  formData: FormData,
): Promise<MatchActionState> {
  const matchId = readMatchId(formData);
  const extraSlotsValue = formData.get("extraSlots");
  const extraSlots = typeof extraSlotsValue === "string" ? Number(extraSlotsValue) : 0;
  const currentUser = await requireCurrentUser();

  try {
    await reserveMatchSlots(currentUser.userId, matchId, extraSlots);
  } catch (error) {
    if (error instanceof MatchMutationError) {
      return { error: error.message };
    }

    throw error;
  }

  revalidateMatchViews(matchId);

  return {};
}
