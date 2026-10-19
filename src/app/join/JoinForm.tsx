"use client";

import { useActionState, useState } from "react";
import { createPlayer, selectPlayer, type JoinState } from "@/actions/players";
import { MAX_FULL_NAME_LENGTH, MAX_USERNAME_LENGTH } from "@/lib/names";

type Tab = "new" | "existing";

const tabClass = (active: boolean) =>
  `flex-1 rounded-full px-4 py-2 font-display text-base transition-colors ${
    active ? "bg-stitch text-night" : "text-mist hover:text-moon"
  }`;

const inputClass =
  "w-full rounded-xl border border-mist/25 bg-night/70 px-4 py-3 text-lg text-moon placeholder:text-mist/50 focus:border-stitch focus:outline-none";

const submitClass =
  "rounded-full bg-pumpkin px-6 py-3 font-display text-lg text-night transition-opacity disabled:opacity-60";

export default function JoinForm({ next }: { next?: string }) {
  const [tab, setTab] = useState<Tab>("new");
  const [newState, createAction, creating] = useActionState(createPlayer, {} as JoinState);
  const [existingState, selectAction, selecting] = useActionState(selectPlayer, {} as JoinState);

  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-mist/15 bg-dusk/60 p-5">
      <div role="tablist" className="flex gap-1 rounded-full bg-night/60 p-1">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "new"}
          className={tabClass(tab === "new")}
          onClick={() => setTab("new")}
        >
          New player
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "existing"}
          className={tabClass(tab === "existing")}
          onClick={() => setTab("existing")}
        >
          I&apos;m already playing
        </button>
      </div>

      {tab === "new" ? (
        <form action={createAction} className="flex flex-col gap-3">
          {next && <input type="hidden" name="next" value={next} />}
          <label htmlFor="username" className="text-mist">
            Pick a username
          </label>
          <input
            id="username"
            name="username"
            defaultValue={newState.username}
            maxLength={MAX_USERNAME_LENGTH}
            autoComplete="nickname"
            autoCapitalize="words"
            required
            className={inputClass}
            placeholder="Experiment626"
          />
          <p className="-mt-1 text-xs text-mist/80">
            Everyone sees this. You&apos;ll type it again if you switch phones.
          </p>
          <label htmlFor="fullName" className="text-mist">
            Your full name
          </label>
          <input
            id="fullName"
            name="fullName"
            defaultValue={newState.fullName}
            maxLength={MAX_FULL_NAME_LENGTH}
            autoComplete="name"
            autoCapitalize="words"
            required
            className={inputClass}
            placeholder="Lilo Pelekai"
          />
          <p className="-mt-1 text-xs text-mist/80">
            Only the hosts see this, so they know who won.
          </p>
          {newState.error && (
            <p role="alert" className="text-sm text-hibiscus">
              {newState.error}
            </p>
          )}
          <button type="submit" disabled={creating} className={submitClass}>
            {creating ? "Joining…" : "Start hunting"}
          </button>
        </form>
      ) : (
        <form action={selectAction} className="flex flex-col gap-3">
          {next && <input type="hidden" name="next" value={next} />}
          <label htmlFor="existing-username" className="text-mist">
            Your username
          </label>
          <input
            id="existing-username"
            name="username"
            defaultValue={existingState.username}
            maxLength={MAX_USERNAME_LENGTH}
            autoComplete="nickname"
            autoCapitalize="words"
            required
            className={inputClass}
            placeholder="Experiment626"
          />
          {existingState.error && (
            <p role="alert" className="text-sm text-hibiscus">
              {existingState.error}
            </p>
          )}
          <button type="submit" disabled={selecting} className={submitClass}>
            {selecting ? "Joining…" : "Keep hunting"}
          </button>
        </form>
      )}
    </section>
  );
}
