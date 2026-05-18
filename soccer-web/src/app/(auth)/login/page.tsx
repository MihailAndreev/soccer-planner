import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-153px)] w-full max-w-md flex-col justify-center px-5 py-12">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Login
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Access your groups and upcoming matches.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
        <p className="mt-6 text-sm text-slate-600">
          New to Soccer Planner?{" "}
          <Link
            href="/register"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}
