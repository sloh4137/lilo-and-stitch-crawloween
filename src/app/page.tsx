import { redirect } from "next/navigation";
import { switchPlayer } from "@/actions/players";
import HuntCard from "@/components/HuntCard";
import { CARDS, TOTAL_CARDS } from "@/lib/cards";
import { getPlayerKey } from "@/lib/player-session";
import { getPlayer } from "@/lib/players";

// Reads the player cookie and Firestore, so it renders per request.
export const instant = false;

export default async function Home() {
  const nameKey = await getPlayerKey();
  // A missing cookie, or a stale one for a deleted player, means join first.
  const player = nameKey ? await getPlayer(nameKey) : null;
  if (!player) redirect("/join");

  const found = new Set(player.foundCardIds);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-col items-center gap-2 text-center">
        <p className="font-display text-lg tracking-wide text-stitch">
          Lilo &amp; Stitch
        </p>
        <h1 className="font-spooky text-5xl leading-none text-pumpkin sm:text-6xl">
          Crawl-o-ween
        </h1>
        <p className="max-w-sm text-mist">
          Find every Stitch hiding around the house. Tap the tag on the back
          when you spot one!
        </p>
        <p className="mt-2 rounded-full border border-stitch/40 bg-dusk/60 px-5 py-1.5 font-display text-xl text-stitch">
          {found.size} / {TOTAL_CARDS}
        </p>
        <form action={switchPlayer} className="text-sm text-mist">
          Hunting as <span className="font-bold text-moon">{player.username}</span>
          {" · "}
          <button type="submit" className="underline underline-offset-2 hover:text-stitch">
            Not you?
          </button>
        </form>
      </header>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {CARDS.map((card) => (
          <HuntCard key={card.id} card={card} found={found.has(card.id)} />
        ))}
      </ul>
    </main>
  );
}
