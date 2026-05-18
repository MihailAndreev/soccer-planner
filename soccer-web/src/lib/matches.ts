import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { groupMembers, groups, matchJoins, matches, users } from "@/db/schema";

export type MatchTimingState = "upcoming" | "current" | "past";
export type MatchCapacityState = "under capacity" | "full capacity" | "over capacity";

export type MatchPlayer = {
  id: number;
  name: string;
  email: string;
  extraSlots: number;
};

export type UserMatch = {
  id: number;
  groupId: number;
  groupTitle: string;
  matchDate: string;
  matchTime: string;
  location: string;
  capacity: number;
  canceled: boolean;
  timingState: MatchTimingState;
  capacityState: MatchCapacityState;
  isActive: boolean;
  playerCount: number;
  occupiedSlots: number;
  players: MatchPlayer[];
  startsAt: Date;
};

type MatchRow = {
  id: number;
  groupId: number;
  groupTitle: string;
  matchDate: string;
  matchTime: string;
  location: string;
  capacity: number;
  canceled: boolean;
};

function getMatchStart(matchDate: string, matchTime: string) {
  const [year, month, day] = matchDate.split("-").map(Number);
  const [hours = 0, minutes = 0, seconds = 0] = matchTime.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes, seconds);
}

function getTimingState(startsAt: Date, now = new Date()): MatchTimingState {
  const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);

  if (now < startsAt) {
    return "upcoming";
  }

  if (now < endsAt) {
    return "current";
  }

  return "past";
}

function getCapacityState(occupiedSlots: number, capacity: number): MatchCapacityState {
  if (occupiedSlots < capacity) {
    return "under capacity";
  }

  if (occupiedSlots === capacity) {
    return "full capacity";
  }

  return "over capacity";
}

function toUserMatch(row: MatchRow, players: MatchPlayer[]): UserMatch {
  const startsAt = getMatchStart(row.matchDate, row.matchTime);
  const timingState = getTimingState(startsAt);
  const occupiedSlots = players.reduce((total, player) => total + 1 + player.extraSlots, 0);

  return {
    ...row,
    startsAt,
    timingState,
    capacityState: getCapacityState(occupiedSlots, row.capacity),
    isActive: !row.canceled && (timingState === "upcoming" || timingState === "current"),
    playerCount: players.length,
    occupiedSlots,
    players,
  };
}

async function getPlayersByMatchId(matchIds: number[]) {
  if (matchIds.length === 0) {
    return new Map<number, MatchPlayer[]>();
  }

  const joinRows = await db
    .select({
      matchId: matchJoins.matchId,
      extraSlots: matchJoins.extraSlots,
      userId: users.id,
      name: users.name,
      email: users.email,
    })
    .from(matchJoins)
    .innerJoin(users, eq(matchJoins.userId, users.id))
    .where(inArray(matchJoins.matchId, matchIds));

  return joinRows.reduce((playersByMatchId, row) => {
    const players = playersByMatchId.get(row.matchId) ?? [];

    players.push({
      id: row.userId,
      name: row.name,
      email: row.email,
      extraSlots: row.extraSlots,
    });
    playersByMatchId.set(row.matchId, players);

    return playersByMatchId;
  }, new Map<number, MatchPlayer[]>());
}

export async function getDashboardMatches(userId: number) {
  const memberships = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(eq(groupMembers.userId, userId));
  const groupIds = memberships.map((membership) => membership.groupId);

  if (groupIds.length === 0) {
    return {
      activeMatches: [],
      archiveMatches: [],
    };
  }

  const matchRows = await db
    .select({
      id: matches.id,
      groupId: matches.groupId,
      groupTitle: groups.title,
      matchDate: matches.matchDate,
      matchTime: matches.matchTime,
      location: matches.location,
      capacity: matches.capacity,
      canceled: matches.canceled,
    })
    .from(matches)
    .innerJoin(groups, eq(matches.groupId, groups.id))
    .where(inArray(matches.groupId, groupIds));
  const playersByMatchId = await getPlayersByMatchId(matchRows.map((match) => match.id));
  const userMatches = matchRows
    .map((match) => toUserMatch(match, playersByMatchId.get(match.id) ?? []))
    .sort((left, right) => left.startsAt.getTime() - right.startsAt.getTime());

  return {
    activeMatches: userMatches.filter((match) => match.isActive),
    archiveMatches: userMatches.filter((match) => !match.isActive),
  };
}

export async function getUserMatch(userId: number, matchId: number) {
  const matchRow = await db
    .select({
      id: matches.id,
      groupId: matches.groupId,
      groupTitle: groups.title,
      matchDate: matches.matchDate,
      matchTime: matches.matchTime,
      location: matches.location,
      capacity: matches.capacity,
      canceled: matches.canceled,
    })
    .from(matches)
    .innerJoin(groups, eq(matches.groupId, groups.id))
    .where(eq(matches.id, matchId))
    .limit(1);
  const match = matchRow[0];

  if (!match) {
    return null;
  }

  const membership = await db
    .select({ id: groupMembers.id })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, match.groupId), eq(groupMembers.userId, userId)))
    .limit(1);

  if (!membership[0]) {
    return null;
  }

  const playersByMatchId = await getPlayersByMatchId([match.id]);

  return toUserMatch(match, playersByMatchId.get(match.id) ?? []);
}
