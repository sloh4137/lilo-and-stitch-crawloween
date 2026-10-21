import "server-only";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { connection } from "next/server";
import { getDb } from "@/lib/firebase-admin";

// Server-only data access for players/{nameKey}. Callers get plain objects
// (no Firestore Timestamps), so results can be passed to Client Components.
// Reads await connection() first: player data is per request, and the Firestore
// client calls crypto.randomBytes, which Cache Components rejects while
// prerendering.

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
  await connection();
  const snap = await players().doc(nameKey).get();
  return snap.exists ? toPlayer(nameKey, snap.data() as PlayerDoc) : null;
}

export async function listPlayers(): Promise<Player[]> {
  await connection();
  const snap = await players().get();
  return snap.docs.map((doc) => toPlayer(doc.id, doc.data() as PlayerDoc));
}

// Most finds first; ties go to whoever reached that count earliest. Players
// with no finds come last, alphabetically.
export async function listStandings(): Promise<Player[]> {
  const all = await listPlayers();
  return all.sort(
    (a, b) =>
      b.foundCount - a.foundCount ||
      (a.lastFoundAt ?? Infinity) - (b.lastFoundAt ?? Infinity) ||
      a.nameKey.localeCompare(b.nameKey),
  );
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

export type ClaimResult = "new" | "already" | "no-player";

// Records a find once. The transaction re-reads the doc if another write lands
// first, so double taps and retries can't count the same card twice.
export async function claimCardForPlayer(nameKey: string, cardId: string): Promise<ClaimResult> {
  const db = getDb();
  const ref = players().doc(nameKey);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return "no-player";
    if ((snap.data() as PlayerDoc).found?.[cardId]) return "already";
    tx.update(ref, {
      [`found.${cardId}`]: FieldValue.serverTimestamp(),
      foundCount: FieldValue.increment(1),
      lastFoundAt: FieldValue.serverTimestamp(),
    });
    return "new";
  });
}

// Deleting a missing doc is a no-op, so a repeated delete is harmless. The
// player's cookie goes stale, and their next request sends them to /join.
export async function removePlayer(nameKey: string): Promise<void> {
  await players().doc(nameKey).delete();
}
