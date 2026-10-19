import "server-only";
import { cookies } from "next/headers";
import { isNameKey } from "@/lib/names";

// Server-only: identity is just the player's nameKey in a cookie. There's no
// auth (see the plan's "Known weakness"). Not httpOnly, but nothing in the
// browser reads it; pages read it on the server.

const PLAYER_COOKIE = "crawloween_player";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function getPlayerKey(): Promise<string | undefined> {
  const value = (await cookies()).get(PLAYER_COOKIE)?.value;
  return value && isNameKey(value) ? value : undefined;
}

export async function setPlayerCookie(nameKey: string): Promise<void> {
  (await cookies()).set(PLAYER_COOKIE, nameKey, {
    path: "/",
    maxAge: THIRTY_DAYS,
    // Lax still sends the cookie on top-level GETs from an NFC tag tap.
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  });
}

export async function clearPlayerCookie(): Promise<void> {
  (await cookies()).delete(PLAYER_COOKIE);
}
