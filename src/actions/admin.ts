"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import {
  checkPasscode,
  clearAdminCookie,
  isAdmin,
  setAdminCookie,
} from "@/lib/admin-session";
import { isNameKey } from "@/lib/names";
import { removePlayer } from "@/lib/players";

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

// Frees the username for someone else to claim. The argument comes straight
// from the request, so it's validated like any other input.
export async function deletePlayer(nameKey: string): Promise<void> {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  if (typeof nameKey !== "string" || !isNameKey(nameKey)) {
    throw new Error("Invalid player");
  }

  await removePlayer(nameKey);
  refresh();
}
