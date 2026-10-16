// Public card config: safe to import from client code. Slugs live in card-slugs.ts.
// Images are transparent-background PNGs in public/stitch/ so unfound cards can
// render as silhouettes with CSS brightness(0).

export type Card = {
  id: string;
  name: string;
  image: string;
  hint?: string;
};

// Placeholder content; final images, names and hints land in milestone 9.
export const CARDS: Card[] = [
  { id: "classic", name: "Experiment 626", image: "/stitch/classic.png", hint: "Where the snacks live" },
  { id: "surfer", name: "Surfer Stitch", image: "/stitch/surfer.png", hint: "Catching a wave near the tub" },
  { id: "hula", name: "Hula Stitch", image: "/stitch/hula.png" },
  { id: "elvis", name: "Elvis Stitch", image: "/stitch/elvis.png", hint: "Near something that plays music" },
  { id: "pumpkin", name: "Pumpkin Stitch", image: "/stitch/pumpkin.png" },
  { id: "vampire", name: "Vampire Stitch", image: "/stitch/vampire.png", hint: "Hates daylight" },
  { id: "ghost", name: "Ghost Stitch", image: "/stitch/ghost.png" },
  { id: "mummy", name: "Mummy Stitch", image: "/stitch/mummy.png", hint: "All wrapped up" },
  { id: "witch", name: "Witch Stitch", image: "/stitch/witch.png" },
  { id: "ukulele", name: "Ukulele Stitch", image: "/stitch/ukulele.png" },
  { id: "sleepy", name: "Sleepy Stitch", image: "/stitch/sleepy.png", hint: "Somewhere cozy" },
  { id: "angel", name: "Angel", image: "/stitch/angel.png" },
];

export const TOTAL_CARDS = CARDS.length;

export function getCard(id: string): Card | undefined {
  return CARDS.find((card) => card.id === id);
}
