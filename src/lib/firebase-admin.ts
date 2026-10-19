import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getEnv } from "@/lib/env";

// Server-only: the browser never talks to Firestore (firestore.rules denies all).
// Initialized once, on first use, and kept at module scope so warm Vercel
// Functions reuse the app; the getApps() guard stops dev hot reloads from
// initializing it twice.

function createApp() {
  const { FIREBASE_PROJECT_ID: projectId, FIREBASE_CLIENT_EMAIL: clientEmail, FIREBASE_PRIVATE_KEY: privateKey } = getEnv();
  return initializeApp({
    projectId,
    // Absent only when pointed at the emulator (enforced in env.ts). The key must
    // be left out entirely then: initializeApp() rejects `credential: undefined`.
    ...(clientEmail && privateKey && { credential: cert({ projectId, clientEmail, privateKey }) }),
  });
}

let db: Firestore | undefined;

export function getDb(): Firestore {
  db ??= getFirestore(getApps()[0] ?? createApp());
  return db;
}
