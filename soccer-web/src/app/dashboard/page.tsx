import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardMatches } from "@/lib/matches";
import { MatchCard } from "./match-card";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const { activeMatches, archiveMatches } = await getDashboardMatches(currentUser.userId);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          User Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Your matches
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Browse the matches from your groups, split between active fixtures and archived results.
        </p>
      </div>

      <section aria-labelledby="active-matches">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="active-matches" className="text-2xl font-semibold text-slate-950">
              Active Matches
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Upcoming or current matches that are open and not canceled.
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
            {activeMatches.length}
          </span>
        </div>

        {activeMatches.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            No active matches in your groups yet.
          </div>
        )}
      </section>

      <section aria-labelledby="archive-matches" className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="archive-matches" className="text-xl font-semibold text-slate-950">
              Archive Matches
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Past or canceled matches from your groups.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            {archiveMatches.length}
          </span>
        </div>

        {archiveMatches.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {archiveMatches.map((match) => (
              <MatchCard key={match.id} match={match} subdued />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            No archived matches yet.
          </div>
        )}
      </section>
    </div>
  );
}
