"use client";

import { useActionState, useState } from "react";

import { updateExtraSlotsAction } from "@/lib/match-actions";

export function FriendSlotsForm({
  initialExtraSlots,
  matchId,
}: {
  initialExtraSlots: number;
  matchId: number;
}) {
  const [extraSlots, setExtraSlots] = useState(initialExtraSlots);
  const [state, formAction, isPending] = useActionState(updateExtraSlotsAction, {});

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="matchId" value={matchId} />
      <input type="hidden" name="extraSlots" value={extraSlots} />
      <span className="text-sm font-medium text-slate-700">Friend slots</span>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setExtraSlots((value) => Math.max(0, value - 1))}
          className="flex size-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-lg font-semibold text-slate-800 hover:border-emerald-600 hover:text-emerald-700"
        >
          -
        </button>
        <label htmlFor="extraSlotsDisplay" className="sr-only">
          Friend slots
        </label>
        <input
          id="extraSlotsDisplay"
          type="number"
          min={0}
          value={extraSlots}
          onChange={(event) => setExtraSlots(Math.max(0, Number(event.target.value)))}
          className="h-10 w-20 rounded-lg border border-slate-300 px-3 text-center text-sm font-semibold text-slate-950"
        />
        <button
          type="button"
          onClick={() => setExtraSlots((value) => value + 1)}
          className="flex size-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-lg font-semibold text-slate-800 hover:border-emerald-600 hover:text-emerald-700"
        >
          +
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
      {state.error ? (
        <p className="max-w-64 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
