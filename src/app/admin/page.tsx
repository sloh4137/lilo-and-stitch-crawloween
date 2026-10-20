import type { Metadata } from "next";
import { headers } from "next/headers";
import { adminLogout } from "@/actions/admin";
import { requireAdmin } from "@/lib/admin-session";
import { slugForCard } from "@/lib/card-slugs";
import { CARDS, TOTAL_CARDS } from "@/lib/cards";
import { listStandings } from "@/lib/players";
import AutoRefresh from "./AutoRefresh";
import CopyButton from "./CopyButton";

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

// Taken with the data, not during render, so "x min ago" matches the snapshot.
async function loadStandings() {
  const standings = await listStandings();
  return { standings, now: Date.now() };
}

function timeAgo(ms: number, now: number): string {
  const minutes = Math.floor((now - ms) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${minutes % 60} min ago`;
}

export default async function AdminPage() {
  await requireAdmin();
  const [{ standings, now }, origin] = await Promise.all([loadStandings(), siteOrigin()]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8">
      <AutoRefresh />
      <header className="flex flex-col items-center gap-2 text-center">
        <p className="font-display text-lg tracking-wide text-stitch">
          Crawl-o-ween admin
        </p>
        <h1 className="font-spooky text-5xl leading-none text-pumpkin">
          Standings
        </h1>
        <p className="text-sm text-mist">
          {standings.length} {standings.length === 1 ? "player" : "players"} · updates
          every 30 seconds
        </p>
        <form action={adminLogout}>
          <button
            type="submit"
            className="text-sm text-mist underline underline-offset-2 hover:text-stitch cursor-pointer"
          >
            Log out
          </button>
        </form>
      </header>

      <section className="rounded-3xl border border-mist/15 bg-dusk/60 p-4">
        {standings.length === 0 ? (
          <p className="py-6 text-center text-mist">No one has joined yet.</p>
        ) : (
          <ol className="flex flex-col divide-y divide-mist/10">
            {standings.map((player, index) => (
              <li key={player.nameKey} className="flex items-center gap-3 py-3">
                <span className="w-8 shrink-0 text-center font-display text-xl text-stitch">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-moon">{player.username}</p>
                  <p className="truncate text-sm text-mist">{player.fullName}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={`font-display text-xl ${
                      player.foundCount === TOTAL_CARDS ? "text-pumpkin" : "text-moon"
                    }`}
                  >
                    {player.foundCount} / {TOTAL_CARDS}
                  </p>
                  {player.lastFoundAt !== null && (
                    <p className="text-xs text-mist/80">
                      {timeAgo(player.lastFoundAt, now)}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
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
