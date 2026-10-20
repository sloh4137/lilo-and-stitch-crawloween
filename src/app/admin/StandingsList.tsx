"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { animated, useReducedMotion, useSpring } from "@react-spring/web";
import type { Player } from "@/lib/players";

function timeAgo(ms: number, now: number): string {
  const minutes = Math.floor((now - ms) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${minutes % 60} min ago`;
}

export default function StandingsList({
  standings,
  total,
  now,
}: {
  standings: Player[];
  total: number;
  now: number;
}) {
  // Rows that mount after the first render are new players, so they fade in.
  // Child layout effects run before this effect, so the initial rows see false.
  const listMounted = useRef(false);
  useEffect(() => {
    listMounted.current = true;
  }, []);

  return (
    <ol className="flex flex-col divide-y divide-mist/10">
      {standings.map((player, index) => (
        <StandingRow
          key={player.nameKey}
          player={player}
          rank={index + 1}
          total={total}
          now={now}
          listMounted={listMounted}
        />
      ))}
    </ol>
  );
}

// FLIP: after a refresh reorders the list, each row measures how far its layout
// position moved and springs from the old spot to the new one. offsetTop ignores
// transforms, so a row interrupted mid-animation picks up from where it's drawn.
function StandingRow({
  player,
  rank,
  total,
  now,
  listMounted,
}: {
  player: Player;
  rank: number;
  total: number;
  now: number;
  listMounted: RefObject<boolean>;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const lastTop = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();
  const [style, api] = useSpring(() => ({ y: 0, scale: 1, opacity: 1 }));

  useLayoutEffect(() => {
    const top = ref.current!.offsetTop;
    const previous = lastTop.current;
    lastTop.current = top;
    if (reducedMotion) return;

    if (previous === null) {
      if (listMounted.current) api.start({ from: { opacity: 0 }, to: { opacity: 1 } });
      return;
    }
    const delta = previous - top;
    if (delta === 0) return;
    api.start({
      from: { y: delta + style.y.get(), scale: delta > 0 ? 1.03 : 1 },
      to: { y: 0, scale: 1 },
      config: { tension: 210, friction: 24 },
    });
  });

  return (
    <animated.li
      ref={ref}
      style={{
        y: style.y,
        scale: style.scale,
        opacity: style.opacity,
        // A row climbing the standings passes over the ones it overtakes.
        zIndex: style.scale.to((s) => (s > 1 ? 1 : 0)),
      }}
      className="relative flex items-center gap-3 bg-dusk py-3"
    >
      <span className="w-8 shrink-0 text-center font-display text-xl text-stitch">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-moon">{player.username}</p>
        <p className="truncate text-sm text-mist">{player.fullName}</p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={`font-display text-xl ${
            player.foundCount === total ? "text-pumpkin" : "text-moon"
          }`}
        >
          {player.foundCount} / {total}
        </p>
        {player.lastFoundAt !== null && (
          <p className="text-xs text-mist/80">{timeAgo(player.lastFoundAt, now)}</p>
        )}
      </div>
    </animated.li>
  );
}
