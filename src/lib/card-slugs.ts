import "server-only";

// Server-only: the slugs are the secret part of each NFC tag URL (/f/<slug>).
// Never import this from client code.
// Placeholder slugs; regenerate for the real tags in milestone 9 with:
//   node -e "console.log(require('crypto').randomBytes(8).toString('base64url').slice(0, 10))"

const SLUG_TO_CARD: Record<string, string> = {
  PAX8bTHp01: "626_stitch",
  BLqVWix1TA: "624_angel",
  "WRW8dHC-Le": "625_reuben",
  jpqZ2if8Xb: "221_sparky",
  GsM4qD0Eyn: "601_kixx",
  cTwN6G1eYO: "505_ploot",
  r9KyhbKc_u: "540_phoon",
  yNmSKoU26Y: "151_babyfier",
  xmzZ4eyuTw: "360_drowsy",
  J1DJdOA5jD: "520_cannonball",
};

export function cardIdForSlug(slug: string): string | undefined {
  return Object.hasOwn(SLUG_TO_CARD, slug) ? SLUG_TO_CARD[slug] : undefined;
}

export function slugForCard(cardId: string): string | undefined {
  return Object.keys(SLUG_TO_CARD).find(
    (slug) => SLUG_TO_CARD[slug] === cardId,
  );
}
