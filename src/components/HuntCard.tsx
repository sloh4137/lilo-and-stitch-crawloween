import Image from "next/image";
import type { Card } from "@/lib/cards";

export default function HuntCard({ card, found }: { card: Card; found: boolean }) {
  return (
    <li
      className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-center ${
        found
          ? "border-stitch/60 bg-dusk/80 shadow-[0_0_18px_rgb(63_196_214/0.25)]"
          : "border-mist/15 bg-night/60"
      }`}
    >
      <Image
        src={card.image}
        // Don't leak the name of an unfound Stitch through alt text.
        alt={found ? card.name : "An unfound Stitch"}
        width={320}
        height={320}
        sizes="(min-width: 768px) 12rem, 45vw"
        className={`aspect-square w-full ${
          found
            ? ""
            : "brightness-0 drop-shadow-[0_0_6px_rgb(63_196_214/0.55)]"
        }`}
      />
      <p
        className={`font-display text-base leading-tight ${
          found ? "text-moon" : "text-mist/60"
        }`}
      >
        {found ? card.name : "???"}
      </p>
      {!found && card.hint && (
        <p className="text-xs leading-snug text-mist/80 italic">{card.hint}</p>
      )}
    </li>
  );
}
