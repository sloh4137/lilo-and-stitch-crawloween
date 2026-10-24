import Image from "next/image";
import { redirect } from "next/navigation";
import { switchPlayer } from "@/actions/players";
import HuntCard from "@/components/HuntCard";
import ProgressMeter from "@/components/ProgressMeter";
import { CARDS, TOTAL_CARDS } from "@/lib/cards";
import { getPlayerKey } from "@/lib/player-session";
import { getPlayer } from "@/lib/players";

// Reads the player cookie and Firestore, so it renders per request.
export const instant = false;

export default async function Home({ searchParams }: PageProps<"/">) {
  const { flip } = await searchParams;
  const nameKey = await getPlayerKey();
  // A missing cookie, or a stale one for a deleted player, means join first.
  const player = nameKey ? await getPlayer(nameKey) : null;
  if (!player) redirect("/join");

  const found = new Set(player.foundCardIds);
  // Set by "Back to the hunt" after a fresh capture; ignore anything else.
  const flipId = typeof flip === "string" && found.has(flip) ? flip : undefined;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-col items-center gap-2 text-center">
        <p className="font-display text-lg tracking-wide text-stitch">
          Lilo &amp; Stitch
        </p>
        <h1 className="font-spooky text-5xl leading-none text-pumpkin sm:text-6xl">
          Crawl-o-ween
        </h1>
        <figure className="relative mt-2 w-full max-w-md overflow-hidden rounded-3xl border border-stitch/40 shadow-[0_0_28px_rgb(63_196_214/0.3)] motion-safe:animate-rise">
          <Image
            src="/jumba.webp"
            alt="Dr. Jumba Jookiba grinning in front of his experiment pods"
            width={1000}
            height={592}
            sizes="(min-width: 640px) 28rem, 100vw"
            loading="eager"
            fetchPriority="high"
            className="w-full"
          />
          <span className="absolute top-3 left-3 rounded-full bg-hibiscus px-3 py-1 font-display text-xs tracking-wider text-night uppercase shadow-lg motion-safe:animate-pulse">
            Containment breach!
          </span>
          {/* Fade the bottom of the still into the card so the caption reads. */}
          <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-night via-night/85 to-transparent px-4 pt-12 pb-3 text-left text-sm text-moon sm:text-base">
            Dr. Jumba Jookiba&apos;s experiments have escaped at the Castro
            house! Help us find each one by tapping them with your phone to
            capture them.
          </figcaption>
        </figure>
        <ProgressMeter
          found={found.size}
          total={TOTAL_CARDS}
          from={flipId ? found.size - 1 : 0}
        />
        <form action={switchPlayer} className="text-sm text-mist">
          Hunting as{" "}
          <span className="font-bold text-moon">{player.username}</span>
          {" · "}
          <button
            type="submit"
            className="underline underline-offset-2 hover:text-stitch cursor-pointer"
          >
            Not you?
          </button>
        </form>
      </header>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {CARDS.map((card) => (
          <HuntCard
            key={card.id}
            card={card}
            found={found.has(card.id)}
            flip={card.id === flipId}
          />
        ))}
      </ul>
    </main>
  );
}
