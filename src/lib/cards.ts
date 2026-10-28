// Public card config: safe to import from client code. Slugs live in card-slugs.ts.
// Images are transparent-background PNGs in public/stitch/ so unfound cards can
// render as silhouettes with CSS brightness(0).

export type Card = {
  id: string;
  name: string;
  image: string;
  hint?: string;
  home: string;
  power: string;
};

export const CARDS: Card[] = [
  {
    id: "626_stitch",
    name: "Experiment 626 Stitch",
    image: "/stitch/626_Stitch.png",
    power: "Indestructible, super-intelligent, and incredibly strong",
    home: "With Lilo and her 'ohana",
  },
  {
    id: "624_angel",
    name: "Experiment 624 Angel",
    image: "/stitch/624_Angel.webp",
    power: "Sings a siren song that turns good experiments bad",
    home: "Intergalactic singing sensation",
  },
  {
    id: "625_reuben",
    name: "Experiment 625 Reuben",
    image: "/stitch/625_Reuben.webp",
    power: "All the same powers as Stitch",
    home: "Making sandwiches as Gantu's galley officer",
  },
  {
    id: "221_sparky",
    name: "Experiment 221 Sparky",
    image: "/stitch/221_Sparky.webp",
    power: "Mischievous and supercharged with electricity",
    home: "Powering the Kilauea Lighthouse",
  },
  {
    id: "601_kixx",
    name: "Experiment 601 Kixx",
    image: "/stitch/601_Kixx.webp",
    power: "Kickboxing and wrestling",
    home: "Starring in Kickboxing with Kixx workout videos",
  },
  {
    id: "505_ploot",
    name: "Experiment 505 Ploot",
    image: "/stitch/505_Ploot.webp",
    power: "Eats trash and turns it into toxic sludge",
    home: "Cleaning up the beach",
  },
  {
    id: "540_phoon",
    name: "Experiment 540 Phoon",
    image: "/stitch/540_Phoon.webp",
    power: "Creates typhoon-like winds",
    home: "Making wind for windsurfers at the beach",
  },
  {
    id: "151_babyfier",
    name: "Experiment 151 Babyfier",
    image: "/stitch/151_Babyfier.webp",
    power: "Turns people back into babies",
    home: "At the dog shelter helping old dogs get adopted as puppies",
  },
  {
    id: "360_drowsy",
    name: "Experiment 360 Drowsy",
    image: "/stitch/360_Drowsy.webp",
    power: "Puts people to sleep",
    home: "Helping insomniacs get to sleep",
  },
  {
    id: "520_cannonball",
    name: "Experiment 520 Cannonball",
    image: "/stitch/520_Cannonball.webp",
    power: "Creates giant waves by doing cannonballs",
    home: "Making waves for surfers at the beach",
  },
];

export const TOTAL_CARDS = CARDS.length;

export function getCard(id: string): Card | undefined {
  return CARDS.find((card) => card.id === id);
}
