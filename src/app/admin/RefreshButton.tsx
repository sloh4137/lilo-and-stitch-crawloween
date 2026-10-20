"use client";

import { useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import AnimatedButton from "@/components/AnimatedButton";

const subscribe = () => () => {};

// Formats in the viewer's time zone. The server's zone (UTC on Vercel) would be
// wrong, so the server snapshot renders nothing and the time fills in on hydrate.
function useLocalTime(ms: number): string | null {
  return useSyncExternalStore(
    subscribe,
    () => new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" }),
    () => null,
  );
}

// Re-renders the page from the server on demand. Each refresh reads every player
// doc, so it's a button rather than polling to keep Firestore reads down.
export default function RefreshButton({ refreshedAt }: { refreshedAt: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const time = useLocalTime(refreshedAt);

  return (
    <div className="flex items-center gap-3">
      <AnimatedButton
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => router.refresh())}
        className="rounded-full bg-stitch px-5 py-2 font-display text-base text-night transition-opacity disabled:opacity-60 cursor-pointer"
        boopProps={{
          rotation: 4,
          scale: 1.05,
        }}
      >
        {pending ? "Refreshing…" : "Refresh"}
      </AnimatedButton>
      <p className="text-sm text-mist" aria-live="polite">
        {time && `Updated ${time}`}
      </p>
    </div>
  );
}
