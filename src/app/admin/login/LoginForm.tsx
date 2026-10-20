"use client";

import { useActionState } from "react";
import { adminLogin, type AdminLoginState } from "@/actions/admin";
import AnimatedButton from "@/components/AnimatedButton";

export default function LoginForm() {
  const [state, loginAction, pending] = useActionState(
    adminLogin,
    {} as AdminLoginState,
  );

  return (
    <form
      action={loginAction}
      className="flex flex-col gap-3 rounded-3xl border border-mist/15 bg-dusk/60 p-5"
    >
      <label htmlFor="passcode" className="text-mist">
        Passcode
      </label>
      <input
        id="passcode"
        name="passcode"
        type="password"
        autoComplete="current-password"
        required
        autoFocus
        className="w-full rounded-xl border border-mist/25 bg-night/70 px-4 py-3 text-lg text-moon placeholder:text-mist/50 focus:border-stitch focus:outline-none"
      />
      {state.error && (
        <p role="alert" className="text-sm text-hibiscus">
          {state.error}
        </p>
      )}
      <AnimatedButton
        type="submit"
        disabled={pending}
        className="rounded-full bg-pumpkin px-6 py-3 font-display text-lg text-night transition-opacity disabled:opacity-60 cursor-pointer"
        boopProps={{
          scale: 1.05,
        }}
      >
        {pending ? "Checking…" : "Let me in"}
      </AnimatedButton>
    </form>
  );
}
