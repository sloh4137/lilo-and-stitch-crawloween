import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { adminLogout } from "@/actions/admin";
import { requireAdmin } from "@/lib/admin-session";
import { slugForCard } from "@/lib/card-slugs";
import { CARDS, TOTAL_CARDS } from "@/lib/cards";
import { listStandings } from "@/lib/players";
import CopyButton from "./CopyButton";
import RefreshButton from "./RefreshButton";
import StandingsList from "./StandingsList";

export const metadata: Metadata = {
  title: "Standings · Lilo & Stitch Crawl-o-ween",
  robots: { index: false },
};

// Reads the admin cookie and Firestore, so it renders per request.
export const instant = false;

// The NFC tag URLs point at whichever host is serving this page, so copying them
// from a preview deploy gives preview URLs. Copy them from production.
async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// Taken with the data, not during render, so "x min ago" and "Updated" match
// the snapshot.
async function loadStandings() {
  const standings = await listStandings();
  return { standings, now: Date.now() };
}

export default async function AdminPage() {
  await requireAdmin();
  const [{ standings, now }, origin] = await Promise.all([loadStandings(), siteOrigin()]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8">
      <header className="flex flex-col items-center gap-2 text-center">
        <p className="font-display text-lg tracking-wide text-stitch">
          Crawl-o-ween admin
        </p>
        <h1 className="font-spooky text-5xl leading-none text-pumpkin">
          Standings
        </h1>
        <p className="text-sm text-mist">
          {standings.length} {standings.length === 1 ? "player" : "players"}
        </p>
        <RefreshButton refreshedAt={now} />
        <div className="flex items-center gap-2 text-sm text-mist">
          <Link
            href="/"
            className="underline underline-offset-2 hover:text-stitch"
          >
            Back to the hunt
          </Link>
          <span aria-hidden>·</span>
          <form action={adminLogout}>
            <button
              type="submit"
              className="underline underline-offset-2 hover:text-stitch cursor-pointer"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      {/* Solid bg-dusk to match the rows, which need an opaque background to
          cover each other while they reorder. */}
      <section className="rounded-3xl border border-mist/15 bg-dusk p-4">
        {standings.length === 0 ? (
          <p className="py-6 text-center text-mist">No one has joined yet.</p>
        ) : (
          <StandingsList standings={standings} total={TOTAL_CARDS} now={now} />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl text-moon">NFC tag URLs</h2>
        <p className="text-sm text-mist">
          Write each one to its tag as an NDEF URL record. Keep them secret: anyone
          with a URL can claim that Stitch.
        </p>
        <ul className="flex flex-col gap-2">
          {CARDS.map((card) => {
            const slug = slugForCard(card.id);
            const url = slug ? `${origin}/f/${slug}` : undefined;
            return (
              <li
                key={card.id}
                className="flex items-center gap-3 rounded-2xl border border-mist/15 bg-night/60 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-moon">{card.name}</p>
                  <p className="truncate font-mono text-xs text-mist">
                    {url ?? "No slug configured"}
                  </p>
                </div>
                {url && <CopyButton text={url} />}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
