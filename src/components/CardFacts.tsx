import type { CSSProperties } from "react";
import type { Card } from "@/lib/cards";

export default function CardFacts({
  card,
  className = "",
  style,
}: {
  card: Card;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <dl
      className={`flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-mist/15 bg-dusk/60 px-5 py-4 text-left ${className}`}
      style={style}
    >
      <div>
        <dt className="font-display text-sm tracking-wide text-pumpkin">Power</dt>
        <dd className="leading-snug text-moon">{card.power}</dd>
      </div>
      {card.home && (
        <div>
          <dt className="font-display text-sm tracking-wide text-hibiscus">One true place</dt>
          <dd className="leading-snug text-moon">{card.home}</dd>
        </div>
      )}
    </dl>
  );
}
