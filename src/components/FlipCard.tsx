"use client";

import { useEffect, useState, type ReactNode } from "react";

// Cards that already flipped in this tab. Only written in effects, so the
// server copy of this module stays empty and every server render flips.
const flipped = new Set<string>();

export default function FlipCard({
  cardId,
  front,
  back,
}: {
  cardId: string;
  front: ReactNode;
  back: ReactNode;
}) {
  // Back/forward can remount the page from the router cache with the old
  // ?flip= props, so skip the flip if this tab has already played it.
  const [animate] = useState(() => !flipped.has(cardId));

  useEffect(() => {
    flipped.add(cardId);
    if (!animate) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .getElementById(`card-${cardId}`)
      ?.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
    // Drop ?flip= so a refresh doesn't replay the flip.
    window.history.replaceState(null, "", "/");
  }, [animate, cardId]);

  if (!animate) return front;

  return (
    <div className="h-full perspective-[800px]">
      <div className="relative h-full transform-3d motion-safe:animate-flip-reveal">
        <div className="h-full backface-hidden">{front}</div>
        <div aria-hidden className="absolute inset-0 overflow-hidden rotate-y-180 backface-hidden">
          {back}
        </div>
      </div>
    </div>
  );
}
