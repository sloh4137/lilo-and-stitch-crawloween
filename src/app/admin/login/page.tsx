import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-session";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin login · Lilo & Stitch Crawl-o-ween",
  robots: { index: false },
};

// Reads the admin cookie, so it renders per request.
export const instant = false;

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-col items-center gap-2 text-center">
        <p className="font-display text-lg tracking-wide text-stitch">
          Lilo &amp; Stitch
        </p>
        <h1 className="font-spooky text-5xl leading-none text-pumpkin">
          Crawl-o-ween
        </h1>
        <p className="max-w-sm text-mist">Hosts only. Enter the passcode to see the standings.</p>
      </header>
      <LoginForm />
    </main>
  );
}
