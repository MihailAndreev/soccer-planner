import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { getUserMatch } from "@/lib/matches";

function formatMatchDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "full",
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

  const match = await getUserMatch(currentUser.userId, matchId);

  if (!match) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10 lg:px-8">
      <Link href="/dashboard" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
        Back to dashboard
      </Link>

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
          {match.isActive ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              open to join
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              closed
            </span>
          )}
        </div>

        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
          {match.location}
        </h1>
        <p className="mt-2 text-slate-600">{match.groupTitle}</p>

        <dl className="mt-8 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-slate-500">Date</dt>
            <dd className="mt-1 font-semibold text-slate-950">{formatMatchDate(match.startsAt)}</dd>
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
        </dl>
      </div>

      <section className="mt-8" aria-labelledby="players">
        <h2 id="players" className="text-2xl font-semibold text-slate-950">
          Players
        </h2>
        {match.players.length > 0 ? (
          <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {match.players.map((player) => (
              <li key={player.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-semibold text-slate-950">{player.name}</p>
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
    </div>
  );
}
