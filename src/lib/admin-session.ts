import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getAdminEnv } from "@/lib/env";

// Server-only: admin access is a shared passcode (ADMIN_PASSCODE). Logging in
// sets an httpOnly cookie "<expiresAt>.<signature>", where the signature is an
// HMAC of the expiry keyed by ADMIN_COOKIE_SECRET. Only the server can mint one,
// and rotating the secret logs every admin out.

const ADMIN_COOKIE = "crawloween_admin";
const SEVEN_DAYS = 60 * 60 * 24 * 7;

function sign(expiresAt: number): string {
  return createHmac("sha256", getAdminEnv().ADMIN_COOKIE_SECRET)
    .update(`admin:${expiresAt}`)
    .digest("base64url");
}

// Constant-time comparison of any two strings. Hashing first gives both sides
// the same length, which timingSafeEqual requires.
function safeEqual(a: string, b: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
}

export function checkPasscode(passcode: string): boolean {
  return safeEqual(passcode, getAdminEnv().ADMIN_PASSCODE);
}

function verify(value: string): boolean {
  const [expiry, signature, ...rest] = value.split(".");
  if (!expiry || !signature || rest.length > 0) return false;
  const expiresAt = Number(expiry);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()) return false;
  return safeEqual(signature, sign(expiresAt));
}

// Awaits connection() first: checking the expiry reads the current time, which
// Cache Components rejects while prerendering.
export async function isAdmin(): Promise<boolean> {
  await connection();
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  return value ? verify(value) : false;
}

// For admin pages: bounce to the login page unless signed in.
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function setAdminCookie(): Promise<void> {
  const expiresAt = Date.now() + SEVEN_DAYS * 1000;
  (await cookies()).set(ADMIN_COOKIE, `${expiresAt}.${sign(expiresAt)}`, {
    path: "/",
    maxAge: SEVEN_DAYS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
}

export async function clearAdminCookie(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}
