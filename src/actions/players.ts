"use server";

import { redirect } from "next/navigation";
import {
  cleanName,
  isNameKey,
  normalizeUsername,
  validateFullName,
  validateUsername,
} from "@/lib/names";
import { clearPlayerCookie, setPlayerCookie } from "@/lib/player-session";
import { getPlayer, insertPlayer } from "@/lib/players";

// Echoes the submitted values back so a failed submit keeps what was typed.
export type JoinState = { error?: string; username?: string; fullName?: string };

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? cleanName(value) : "";
}

// Only same-site paths, so /join?next=https://evil.example can't bounce a
// player off-site. Rejects protocol-relative "//host" and "/\host" too.
function safeNext(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || !value.startsWith("/")) return "/";
  if (value.startsWith("//") || value.startsWith("/\\")) return "/";
  try {
    const url = new URL(value, "http://same.site");
    return url.origin === "http://same.site" ? url.pathname + url.search : "/";
  } catch {
    return "/";
  }
}

export async function createPlayer(
  _prev: JoinState,
  formData: FormData,
): Promise<JoinState> {
  const username = field(formData, "username");
  const fullName = field(formData, "fullName");
  const error = validateUsername(username) ?? validateFullName(fullName);
  if (error) return { error, username, fullName };

  const nameKey = normalizeUsername(username);
  if ((await insertPlayer(nameKey, username, fullName)) === "taken") {
    return {
      error: "That username is taken. Pick another, or choose “I'm already playing”.",
      username,
      fullName,
    };
  }

  await setPlayerCookie(nameKey);
  redirect(safeNext(formData.get("next")));
}

// Looks the username up rather than listing players, so the join page never
// reveals who's playing. Guessing a username is an accepted risk (see the plan).
export async function selectPlayer(
  _prev: JoinState,
  formData: FormData,
): Promise<JoinState> {
  const username = field(formData, "username");
  const nameKey = normalizeUsername(username);
  if (!isNameKey(nameKey) || !(await getPlayer(nameKey))) {
    return {
      error: "We couldn't find that username. Check the spelling, or join as a new player.",
      username,
    };
  }

  await setPlayerCookie(nameKey);
  redirect(safeNext(formData.get("next")));
}

export async function switchPlayer(): Promise<void> {
  await clearPlayerCookie();
  redirect("/join");
}
