# Lilo & Stitch Crawl-o-ween

A Halloween scavenger hunt. Printed Stitch pictures hide around the house, each with an NFC tag that opens a unique URL. Tapping a tag records the find for that player in Firestore and plays a celebration. See [`plans/implementation-plan.md`](plans/implementation-plan.md) for the full design.

Built with Next.js (App Router), Tailwind and `firebase-admin`, hosted on Vercel.

## Setup

### 1. Firebase

1. Create a Firebase project and enable **Firestore**. Pick a region close to your Vercel function region (e.g. Firestore `us-east1` with Vercel `iad1`).
2. Deploy the deny-all rules in [`firestore.rules`](firestore.rules), either by pasting them into the console (Firestore → Rules) or with `firebase deploy --only firestore:rules`. All access goes through `firebase-admin` on the server, which bypasses these rules; browsers get nothing.
3. Create a service account key: Project settings → Service accounts → **Generate new private key**. Keep the downloaded JSON out of the repo.

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill it in from the service account JSON:

| Variable                | From the JSON  |
| ----------------------- | -------------- |
| `FIREBASE_PROJECT_ID`   | `project_id`   |
| `FIREBASE_CLIENT_EMAIL` | `client_email` |
| `FIREBASE_PRIVATE_KEY`  | `private_key`  |

Paste `private_key` as-is, in double quotes, with its literal `\n` sequences; the app converts them to newlines. Never prefix any of these with `NEXT_PUBLIC_`.

The variables are validated by [`src/lib/env.ts`](src/lib/env.ts) when the server first loads Firebase. A missing or malformed value throws an error that names the variable.

To use the [Firestore emulator](https://firebase.google.com/docs/emulator-suite) instead, set `FIRESTORE_EMULATOR_HOST` (e.g. `127.0.0.1:8080`) and any `FIREBASE_PROJECT_ID`. The credentials can then be left blank.

The admin dashboard at `/admin` needs two more:

| Variable              | Value                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| `ADMIN_PASSCODE`      | A passcode for the hosts                                                                        |
| `ADMIN_COOKIE_SECRET` | 32+ random characters: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |

The secret signs the admin login cookie; changing it logs every admin out.

For Vercel, add the same variables under Project Settings → Environment Variables for **Production** and **Preview**.

### 3. Run it

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). To test from a phone on the same network, run `yarn dev -H 0.0.0.0` and open your computer's LAN IP.

## Card slugs

Each NFC tag URL is `/f/<slug>`, where the slug is a secret, unguessable string kept in the server-only [`src/lib/card-slugs.ts`](src/lib/card-slugs.ts). Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(8).toString('base64url').slice(0, 10))"
```
