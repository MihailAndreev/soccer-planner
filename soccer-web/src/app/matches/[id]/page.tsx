import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { joinMatchAction, leaveMatchAction } from "@/lib/match-actions";
import { getUserMatchAccess } from "@/lib/matches";
import { FriendSlotsForm } from "./friend-slots-form";
import { ShareMatchButton } from "./share-match-button";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

function formatCommentDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function badgeClassName(value: string) {
  if (value === "current" || value === "under capacity") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (value === "upcoming" || value === "full capacity") {
    return "bg-sky-50 text-sky-700";
  }

  if (value === "over capacity") {
    return "bg-amber-50 text-amber-800";
  }

  return "bg-slate-100 text-slate-700";
}

function HiddenMatchId({ matchId }: { matchId: number }) {
  return <input type="hidden" name="matchId" value={matchId} />;
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const { id } = await params;
  const matchId = Number(id);

  if (!Number.isInteger(matchId)) {
    notFound();
  }

  const access = await getUserMatchAccess(currentUser.userId, matchId);

  if (access.status === "not-found") {
    notFound();
  }

  if (access.status === "forbidden") {
    return (
      <div className="mx-auto w-full max-w-2xl px-5 py-16 lg:px-8">
        <div className="rounded-lg border border-rose-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-700">
            Access denied
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            This match belongs to another group
          </h1>
          <p className="mt-3 text-slate-600">
            You need to be a member of the group that owns this match before you can view it.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex h-10 items-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const match = access.match;
  const extraSlots = match.currentUserJoin?.extraSlots ?? 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
          Back to dashboard
        </Link>
        <ShareMatchButton />
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClassName(match.timingState)}`}>
            {match.timingState}
          </span>
          {match.canceled ? (
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
              canceled
            </span>
          ) : null}
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClassName(match.capacityState)}`}>
            {match.capacityState}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${match.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
            {match.isActive ? "open to join" : "closed"}
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              {match.location}
            </h1>
            <p className="mt-2 text-slate-600">{match.groupTitle}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            {match.isActive ? (
              match.currentUserJoin ? (
                <div className="grid gap-3">
                  <form action={leaveMatchAction}>
                    <HiddenMatchId matchId={match.id} />
                    <button
                      type="submit"
                      className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
                    >
                      Leave
                    </button>
                  </form>
                  <FriendSlotsForm
                    key={`${match.id}-${extraSlots}`}
                    initialExtraSlots={extraSlots}
                    matchId={match.id}
                  />
                </div>
              ) : (
                <form action={joinMatchAction}>
                  <HiddenMatchId matchId={match.id} />
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  >
                    Join
                  </button>
                </form>
              )
            ) : (
              <p className="text-sm font-medium text-slate-600">
                This match is not open for join changes.
              </p>
            )}
          </div>
        </div>

        <dl className="mt-8 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm text-slate-500">Date</dt>
            <dd className="mt-1 font-semibold text-slate-950">{formatDate(match.startsAt)}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Capacity</dt>
            <dd className="mt-1 font-semibold text-slate-950">
              {match.occupiedSlots} / {match.capacity}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Players joined</dt>
            <dd className="mt-1 font-semibold text-slate-950">{match.playerCount}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Your status</dt>
            <dd className="mt-1 font-semibold text-slate-950">
              {match.currentUserJoin ? `Joined +${extraSlots}` : "Not joined"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <section aria-labelledby="players">
          <h2 id="players" className="text-2xl font-semibold text-slate-950">
            Players
          </h2>
          {match.players.length > 0 ? (
            <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
              {match.players.map((player) => (
                <li key={player.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">{player.name}</p>
                      {player.id === currentUser.userId ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          you
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-slate-600">{player.email}</p>
                  </div>
                  {player.extraSlots > 0 ? (
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                      +{player.extraSlots}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
              No players have joined this match yet.
            </div>
          )}
        </section>

        <section aria-labelledby="comments">
          <h2 id="comments" className="text-2xl font-semibold text-slate-950">
            Comments
          </h2>
          {match.comments.length > 0 ? (
            <ul className="mt-4 grid gap-3">
              {match.comments.map((comment) => (
                <li key={comment.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-950">{comment.authorName}</p>
                    <time className="text-xs text-slate-500" dateTime={comment.createdAt.toISOString()}>
                      {formatCommentDate(comment.createdAt)}
                    </time>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{comment.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
              No comments for this match yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
