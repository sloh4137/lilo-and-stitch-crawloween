"use server";

import { redirect } from "next/navigation";
import { checkPasscode, clearAdminCookie, setAdminCookie } from "@/lib/admin-session";

// Server actions are public POST endpoints. Any action here that reads or
// changes data must check isAdmin() itself, not rely on the page that shows it.

export type AdminLoginState = { error?: string };

export async function adminLogin(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const passcode = formData.get("passcode");
  if (typeof passcode !== "string" || !checkPasscode(passcode)) {
    // Slows down guessing a little; there's no lockout.
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { error: "That's not the passcode." };
  }

  await setAdminCookie();
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  await clearAdminCookie();
  redirect("/admin/login");
}
