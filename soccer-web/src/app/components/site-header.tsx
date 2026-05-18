import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
];

export function SiteHeader() {
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
          <ul className="flex flex-wrap gap-2 text-sm font-medium sm:justify-end">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-10 items-center rounded-lg px-3 text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
