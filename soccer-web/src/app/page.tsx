import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/session";

export default async function Home() {
  const currentUser = await getCurrentUser();

  return (
    <section className="mx-auto grid min-h-[calc(100vh-153px)] w-full max-w-6xl gap-10 px-5 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
      <div className="max-w-2xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Pickup soccer made simpler
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          Welcome to Soccer Planner
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-700">
          Create groups, schedule matches, and help every player know where to
          be, when to arrive, and whether there is still room on the squad.
        </p>
        {currentUser ? (
          <div className="mt-8 rounded-lg border border-emerald-200 bg-white px-5 py-4 text-slate-700 shadow-sm">
            <p className="font-semibold text-slate-950">
              Welcome back, {currentUser.name}.
            </p>
            <p className="mt-1 text-sm">
              You are logged in and ready to plan your next match.
            </p>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-emerald-600 px-6 text-base font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-base font-semibold text-slate-900 transition-colors hover:border-emerald-600 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Register
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-emerald-200 bg-emerald-700 p-3 shadow-sm">
        <div className="relative overflow-hidden rounded-md border-2 border-white/80 bg-emerald-600 p-5 text-white">
          <div className="absolute left-1/2 top-0 h-full w-px bg-white/50" />
          <div className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60" />
          <div className="relative grid gap-4 sm:grid-cols-2">
            <div className="rounded-md bg-white p-4 text-slate-950 shadow-sm">
              <p className="text-sm font-semibold text-emerald-700">
                Saturday Match
              </p>
              <p className="mt-2 text-2xl font-bold">10:00 AM</p>
              <p className="mt-1 text-sm text-slate-600">Riverside Pitch</p>
            </div>
            <div className="rounded-md bg-white p-4 text-slate-950 shadow-sm">
              <p className="text-sm font-semibold text-sky-700">Players</p>
              <p className="mt-2 text-2xl font-bold">14 / 18</p>
              <p className="mt-1 text-sm text-slate-600">4 spots open</p>
            </div>
            <div className="rounded-md bg-slate-950 p-4 text-white shadow-sm sm:col-span-2">
              <p className="text-sm font-semibold text-emerald-300">
                Group Manager
              </p>
              <p className="mt-2 text-base">
                Confirm the lineup and share updates with the group.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
