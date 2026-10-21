"use client";

import { useTransition } from "react";
import { deletePlayer } from "@/actions/admin";

function confirmMessage(username: string, foundCount: number): string {
  if (foundCount === 0) return `Delete ${username}?`;
  return `Delete ${username} and their ${foundCount} ${foundCount === 1 ? "find" : "finds"}?`;
}

// The action re-checks isAdmin() and refreshes the page, so the row drops out
// and the rows below it slide up.
export default function DeletePlayerButton({
  nameKey,
  username,
  foundCount,
}: {
  nameKey: string;
  username: string;
  foundCount: number;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(confirmMessage(username, foundCount))) return;
    startTransition(async () => {
      try {
        await deletePlayer(nameKey);
      } catch {
        alert(`Couldn't delete ${username}. Try refreshing, or log in again.`);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={`Delete ${username}`}
      className="shrink-0 rounded-full border border-hibiscus/50 px-3 py-1 text-sm text-hibiscus transition-opacity hover:bg-hibiscus hover:text-night disabled:opacity-60 cursor-pointer"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
