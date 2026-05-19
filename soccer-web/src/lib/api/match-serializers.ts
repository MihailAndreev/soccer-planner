import { type UserMatch } from "@/lib/matches";

export function serializeMatchSummary(match: UserMatch) {
  return {
    id: match.id,
    groupId: match.groupId,
    groupTitle: match.groupTitle,
    matchDate: match.matchDate,
    matchTime: match.matchTime,
    startsAt: match.startsAt.toISOString(),
    location: match.location,
    state: match.timingState,
    capacityState: match.capacityState,
    capacity: match.capacity,
    canceled: match.canceled,
    isOpen: match.isActive,
    isJoined: Boolean(match.currentUserJoin),
    extraSlots: match.currentUserJoin?.extraSlots ?? 0,
    playerCount: match.playerCount,
    occupiedSlots: match.occupiedSlots,
  };
}

export function serializeMatchDetails(match: UserMatch) {
  return {
    ...serializeMatchSummary(match),
    players: match.players.map((player) => ({
      id: player.id,
      name: player.name,
      email: player.email,
      extraSlots: player.extraSlots,
    })),
    comments: match.comments.map((comment) => ({
      id: comment.id,
      text: comment.text,
      createdAt: comment.createdAt.toISOString(),
      authorName: comment.authorName,
    })),
  };
}
