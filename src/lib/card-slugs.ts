import "server-only";

// Server-only: the slugs are the secret part of each NFC tag URL (/f/<slug>).
// Never import this from client code.
// Placeholder slugs; regenerate for the real tags in milestone 9 with:
//   node -e "console.log(require('crypto').randomBytes(8).toString('base64url').slice(0, 10))"

const SLUG_TO_CARD: Record<string, string> = {
  PAX8bTHp01: "classic",
  BLqVWix1TA: "surfer",
  "WRW8dHC-Le": "hula",
  jpqZ2if8Xb: "elvis",
  GsM4qD0Eyn: "pumpkin",
  cTwN6G1eYO: "vampire",
  T7Tgd_8p_a: "ghost",
  r9KyhbKc_u: "mummy",
  yNmSKoU26Y: "witch",
  ZqEDaY6_Er: "ukulele",
  xmzZ4eyuTw: "sleepy",
  u3I6_pauoL: "angel",
};

export function cardIdForSlug(slug: string): string | undefined {
  return Object.hasOwn(SLUG_TO_CARD, slug) ? SLUG_TO_CARD[slug] : undefined;
}

export function slugForCard(cardId: string): string | undefined {
  return Object.keys(SLUG_TO_CARD).find((slug) => SLUG_TO_CARD[slug] === cardId);
}
