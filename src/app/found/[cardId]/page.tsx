import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCard, TOTAL_CARDS } from "@/lib/cards";
import { getPlayerKey } from "@/lib/player-session";
import { getPlayer } from "@/lib/players";

export const metadata: Metadata = {
  title: "Found! · Lilo & Stitch Crawl-o-ween",
};

// Reads the player cookie and Firestore, so it renders per request.
export const instant = false;

export default async function FoundPage({ params, searchParams }: PageProps<"/found/[cardId]">) {
  const [{ cardId }, { r }] = await Promise.all([params, searchParams]);
  const card = getCard(cardId);
  if (!card) notFound();

  const nameKey = await getPlayerKey();
  const player = nameKey ? await getPlayer(nameKey) : null;
  if (!player) redirect("/join");
  // Only celebrate real finds, so typing /found/<id> doesn't reveal a Stitch.
  if (!player.foundCardIds.includes(card.id)) redirect("/");

  const isNew = r === "new";

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-8 text-center">
      <p className="font-display text-lg tracking-wide text-stitch">
        {isNew ? "Found!" : "Already found"}
      </p>
      <Image
        src={card.image}
        alt={card.name}
        width={320}
        height={320}
        sizes="16rem"
        priority
        className="aspect-square w-64"
      />
      <h1 className="font-display text-3xl leading-tight text-moon">
        {isNew ? `You found ${card.name}!` : `You already found ${card.name}`}
      </h1>
      <p className="rounded-full border border-stitch/40 bg-dusk/60 px-5 py-1.5 font-display text-xl text-stitch">
        {player.foundCount} / {TOTAL_CARDS}
      </p>
      <Link
        href="/"
        className="rounded-full bg-pumpkin px-6 py-3 font-display text-lg text-night"
      >
        Back to the hunt
      </Link>
    </main>
  );
}
