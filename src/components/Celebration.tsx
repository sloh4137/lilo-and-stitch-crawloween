"use client";

import { useEffect } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import CardFacts from "@/components/CardFacts";
import type { Card } from "@/lib/cards";

// Theme colors from globals.css: stitch, pumpkin, hibiscus, moon, mist.
const COLORS = ["#3fc4d6", "#ff8a2b", "#ff5c9a", "#fff4d6", "#c9bfe8"];

// Land the first burst just after Stitch pops in.
const BURST_DELAY_MS = 250;
const FINALE_DURATION_MS = 3000;

export default function Celebration({
  card,
  foundCount,
  total,
}: {
  card: Card;
  foundCount: number;
  total: number;
}) {
  const isFinale = foundCount === total;

  useEffect(() => {
    let frame = 0;
    const timeout = window.setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 80,
        startVelocity: 45,
        origin: { y: 0.6 },
        colors: COLORS,
        disableForReducedMotion: true,
      });

      if (!isFinale) return;

      // Hibiscus cannons from both sides for the last Stitch.
      const hibiscus = confetti.shapeFromText({ text: "🌺", scalar: 2 });
      const end = Date.now() + FINALE_DURATION_MS;
      const fire = () => {
        for (const x of [0, 1]) {
          confetti({
            particleCount: 3,
            angle: x === 0 ? 60 : 120,
            spread: 55,
            origin: { x, y: 0.7 },
            colors: COLORS,
            shapes: ["square", "circle", hibiscus],
            scalar: 1.4,
            disableForReducedMotion: true,
          });
        }
        if (Date.now() < end) frame = requestAnimationFrame(fire);
      };
      fire();
    }, BURST_DELAY_MS);

    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(frame);
      confetti.reset();
    };
  }, [isFinale]);

  return (
    <>
      <p className="font-display text-lg tracking-wide text-stitch motion-safe:animate-rise">
        {isFinale ? "Ohana!" : "Found!"}
      </p>
      <Image
        src={card.image}
        alt={card.name}
        width={320}
        height={320}
        sizes="16rem"
        priority
        className="aspect-square w-64 drop-shadow-[0_0_24px_rgb(63_196_214/0.45)] motion-safe:animate-pop-wiggle"
      />
      <h1
        className="font-display text-3xl leading-tight text-moon motion-safe:animate-rise"
        style={{ animationDelay: "300ms" }}
      >
        {isFinale ? "You found every Stitch!" : `You found ${card.name}!`}
      </h1>
      <CardFacts card={card} className="motion-safe:animate-rise" style={{ animationDelay: "400ms" }} />
      {isFinale && (
        <p
          className="max-w-xs text-mist italic motion-safe:animate-rise"
          style={{ animationDelay: "450ms" }}
        >
          Ohana means family. Family means nobody gets left behind.
        </p>
      )}
      <p
        className="rounded-full border border-stitch/40 bg-dusk/60 px-5 py-1.5 font-display text-xl text-stitch motion-safe:animate-pop"
        style={{ animationDelay: "550ms" }}
      >
        {foundCount} / {total}
      </p>
    </>
  );
}
