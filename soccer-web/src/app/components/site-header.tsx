import Link from "next/link";

import { logoutAction } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";

export async function SiteHeader() {
  const currentUser = await getCurrentUser();

  return (
    <header className="border-b border-slate-200 bg-white/95">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <Link
          href="/"
          className="flex w-fit items-center gap-3 text-lg font-semibold text-slate-950"
        >
          <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
            SP
          </span>
          <span>Soccer Planner</span>
        </Link>

        <nav aria-label="Main navigation">
          <ul className="flex flex-wrap items-center gap-2 text-sm font-medium sm:justify-end">
            <li>
              <Link
                href="/"
                className="inline-flex min-h-10 items-center rounded-lg px-3 text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                Home
              </Link>
            </li>

            {currentUser ? (
              <>
                <li>
                  <Link
                    href="/dashboard"
                    className="inline-flex min-h-10 items-center rounded-lg px-3 text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="flex min-h-10 items-center rounded-lg bg-slate-100 px-3 text-slate-700">
                  <span className="max-w-48 truncate">
                    {currentUser.name}
                  </span>
                </li>
                <li>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="inline-flex min-h-10 items-center rounded-lg px-3 text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
                    >
                      Logout
                    </button>
                  </form>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    className="inline-flex min-h-10 items-center rounded-lg px-3 text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="inline-flex min-h-10 items-center rounded-lg px-3 text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
