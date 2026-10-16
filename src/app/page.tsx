import HuntCard from "@/components/HuntCard";
import { CARDS, TOTAL_CARDS } from "@/lib/cards";

// Hard-coded until milestone 4 reads the player's real finds from Firestore.
const found = new Set<string>();

export default function Home() {
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
      </header>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {CARDS.map((card) => (
          <HuntCard key={card.id} card={card} found={found.has(card.id)} />
        ))}
      </ul>
    </main>
  );
}
