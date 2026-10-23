import Image from "next/image";
import Link from "next/link";
import FlipCard from "@/components/FlipCard";
import type { Card } from "@/lib/cards";

const FACE = "flex h-full flex-col items-center gap-2 rounded-2xl border p-3 text-center";
// Wiggle the experiment on hover, or while a finger is pressing the card.
const WIGGLE = "motion-safe:group-hover:animate-wiggle motion-safe:group-active:animate-wiggle";

export default function HuntCard({
  card,
  found,
  flip = false,
}: {
  card: Card;
  found: boolean;
  // Just captured: start as a silhouette and flip over to reveal it.
  flip?: boolean;
}) {
  const front = found ? <FoundFace card={card} /> : <UnfoundFace card={card} />;
  return (
    <li id={`card-${card.id}`}>
      {flip && found ? (
        <FlipCard cardId={card.id} front={front} back={<UnfoundFace card={card} />} />
      ) : (
        front
      )}
    </li>
  );
}

function FoundFace({ card }: { card: Card }) {
  return (
    <Link
      href={`/found/${card.id}`}
      className={`${FACE} group border-stitch/60 bg-dusk/80 shadow-[0_0_18px_rgb(63_196_214/0.25)] transition-colors hover:border-stitch focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stitch`}
    >
      <Image
        src={card.image}
        alt={card.name}
        width={320}
        height={320}
        sizes="(min-width: 768px) 12rem, 45vw"
        loading="eager"
        className={`aspect-square w-full object-contain ${WIGGLE}`}
      />
      <p className="font-display text-base leading-tight text-moon">{card.name}</p>
    </Link>
  );
}

function UnfoundFace({ card }: { card: Card }) {
  return (
    <div className={`${FACE} group border-mist/15 bg-night/60`}>
      <Image
        src={card.image}
        // Don't leak the name of an unfound Stitch through alt text.
        alt="An unfound Stitch"
        width={320}
        height={320}
        sizes="(min-width: 768px) 12rem, 45vw"
        loading="eager"
        // The drag ghost and long-press menu show the unfiltered image, so
        // keep unfound ones from being dragged, selected or opened.
        draggable={false}
        className={`pointer-events-none aspect-square w-full object-contain brightness-0 drop-shadow-[0_0_6px_rgb(63_196_214/0.55)] select-none [-webkit-touch-callout:none] ${WIGGLE}`}
      />
      <p className="font-display text-base leading-tight text-mist/60">???</p>
      {card.hint && <p className="text-xs leading-snug text-mist/80 italic">{card.hint}</p>}
    </div>
  );
}
