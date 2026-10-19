import "server-only";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase-admin";

// Server-only data access for players/{nameKey}. Callers get plain objects
// (no Firestore Timestamps), so results can be passed to Client Components.

type PlayerDoc = {
  username: string;
  fullName: string;
  createdAt: Timestamp;
  found: Record<string, Timestamp>;
  foundCount: number;
  lastFoundAt: Timestamp | null;
};

export type Player = {
  nameKey: string;
  username: string;
  // Admin-only: never render this on player-facing pages.
  fullName: string;
  foundCardIds: string[];
  foundCount: number;
  lastFoundAt: number | null;
};

const players = () => getDb().collection("players");

function toPlayer(nameKey: string, data: PlayerDoc): Player {
  return {
    nameKey,
    username: data.username,
    fullName: data.fullName,
    foundCardIds: Object.keys(data.found ?? {}),
    foundCount: data.foundCount ?? 0,
    lastFoundAt: data.lastFoundAt?.toMillis() ?? null,
  };
}

export async function getPlayer(nameKey: string): Promise<Player | null> {
  const snap = await players().doc(nameKey).get();
  return snap.exists ? toPlayer(nameKey, snap.data() as PlayerDoc) : null;
}

export async function listPlayers(): Promise<Player[]> {
  const snap = await players().get();
  return snap.docs.map((doc) => toPlayer(doc.id, doc.data() as PlayerDoc));
}

// gRPC status ALREADY_EXISTS, thrown by create() when the doc is already there.
const ALREADY_EXISTS = 6;

// create() fails if the doc exists, so two people can't take the same name
// even if they submit at the same moment.
export async function insertPlayer(
  nameKey: string,
  username: string,
  fullName: string,
): Promise<"created" | "taken"> {
  try {
    await players().doc(nameKey).create({
      username,
      fullName,
      createdAt: FieldValue.serverTimestamp(),
      found: {},
      foundCount: 0,
      lastFoundAt: null,
    });
    return "created";
  } catch (error) {
    if ((error as { code?: unknown }).code === ALREADY_EXISTS) return "taken";
    throw error;
  }
}
