import Link from "next/link";

import type { UserMatch } from "@/lib/matches";

function formatMatchDate(match: UserMatch) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(match.startsAt);
}

function statusClassName(value: string) {
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

export function MatchCard({ match, subdued = false }: { match: UserMatch; subdued?: boolean }) {
  return (
    <Link
      href={`/matches/${match.id}`}
      className={`block rounded-lg border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
        subdued ? "border-slate-200 opacity-90" : "border-emerald-200"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClassName(match.timingState)}`}>
          {match.timingState}
        </span>
        {match.canceled ? (
          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
            canceled
          </span>
        ) : null}
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClassName(match.capacityState)}`}>
          {match.capacityState}
        </span>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold text-slate-950">{match.location}</h3>
        <p className="mt-1 text-sm text-slate-600">{match.groupTitle}</p>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500">Date</dt>
          <dd className="mt-1 font-medium text-slate-900">{formatMatchDate(match)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Players</dt>
          <dd className="mt-1 font-medium text-slate-900">
            {match.occupiedSlots} / {match.capacity}
          </dd>
        </div>
      </dl>
    </Link>
  );
}
