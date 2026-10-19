import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { env } from "@/lib/env";

// Server-only: the browser never talks to Firestore (firestore.rules denies all).
// Initialized once at module scope so warm Vercel Functions reuse the app; the
// getApps() guard stops dev hot reloads from initializing it twice.

function createApp() {
  const { FIREBASE_PROJECT_ID: projectId, FIREBASE_CLIENT_EMAIL: clientEmail, FIREBASE_PRIVATE_KEY: privateKey } = env;
  return initializeApp({
    projectId,
    // Absent only when pointed at the emulator (enforced in env.ts).
    credential: clientEmail && privateKey ? cert({ projectId, clientEmail, privateKey }) : undefined,
  });
}

const app = getApps()[0] ?? createApp();

export const db = getFirestore(app);
