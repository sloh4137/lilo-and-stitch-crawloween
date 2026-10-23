# Lilo & Stitch Crawl-o-ween

A Halloween scavenger hunt. Dr. Jumba Jookiba's experiments have escaped: printed pictures of them hide around the house, each with an NFC tag on the back that opens a unique URL. Tapping a tag records the find for that player in Firestore and plays a celebration showing the experiment's power and its "one true place". Finding all of them triggers the finale. See [`plans/implementation-plan.md`](plans/implementation-plan.md) for the full design.

Built with Next.js (App Router), Tailwind and `firebase-admin`, hosted on Vercel.

## How it plays

| Page              | What it does                                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/join`           | Pick a new username (plus full name for the hosts) or resume as an existing one. Sets the player cookie.                                            |
| `/`               | The hunt: a progress meter and a grid of every experiment, unfound ones as silhouettes. After a new capture the card flips over to reveal itself.   |
| `/f/<slug>`       | What each NFC tag opens. Claims the card for the current player, then redirects to its found page. No cookie → `/join` first, and the tap still counts. |
| `/found/<cardId>` | Confetti and the experiment's facts for a new find, a quieter page for a repeat; the finale when the last one is found.                              |
| `/admin`          | Passcode-protected standings, player deletion, and the list of NFC tag URLs to write.                                                                |

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

| Variable              | Value                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| `ADMIN_PASSCODE`      | A passcode for the hosts                                                                                |
| `ADMIN_COOKIE_SECRET` | 32+ random characters: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |

The secret signs the admin login cookie; changing it logs every admin out.

### 3. Run it

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). To test from a phone on the same network, run `yarn dev -H 0.0.0.0` and open your computer's LAN IP.

Before committing, check that `yarn lint && yarn build` pass.

## Deploying to Vercel

1. Import the repo into Vercel. The defaults (Next.js, `yarn build`) work as-is.
2. Add every variable from step 2 under Project Settings → Environment Variables for **Production** and **Preview**.
3. Under Project Settings → Functions, set the function region to match Firestore (e.g. `iad1` for `us-east1`). Each tap makes about two Firestore round-trips, so a mismatched region adds visible delay.
4. Leave routes on the default Node.js runtime. `firebase-admin` doesn't run on the Edge runtime.

The first request to a cold instance takes an extra ~0.5s while `firebase-admin` starts. Open the site once shortly before guests arrive to warm it up.

The Hobby plan and Firestore's free Spark plan are plenty for a party. The admin page reads every player on each refresh, which is why it refreshes only when you press **Refresh**.

## Experiments (cards)

Each experiment is an entry in [`src/lib/cards.ts`](src/lib/cards.ts) with an `id`, `name`, `image`, `power` and `home` (shown as "One true place"). Images live in [`public/stitch/`](public/stitch/).

Images need a **transparent background**: unfound cards render as a silhouette with CSS `brightness(0)`, so any background would show up as a black square. Square-ish images work best; they're scaled to fit with `object-contain`.

To add an experiment, add its image, add an entry to `CARDS`, and give it a slug (below). The total count updates on its own.

## Card slugs

Each NFC tag URL is `/f/<slug>`, where the slug is a secret, unguessable string kept in the server-only [`src/lib/card-slugs.ts`](src/lib/card-slugs.ts), mapped to a card `id`. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(8).toString('base64url').slice(0, 10))"
```

Anyone who knows a slug can claim that experiment without finding it, so keep them out of anything public. If this repo is public, regenerate the slugs before the party and keep the real ones out of the public history.

Changing a slug or the production domain breaks any tag already written with the old URL, so finalize both before writing tags.

## Writing the NFC tags

### What you need

- **NFC stickers:** NTAG213, NTAG215 or NTAG216. NTAG213 (144 bytes) is plenty; a tag URL is under 60 characters.
- **[NFC Tools](https://www.wakdev.com/en/apps.html)** (free, iOS and Android) on any NFC-capable phone. iPhones need iOS 13+ to write.
- The **production** site deployed, with the final slugs.

### Get the URLs

1. Open `/admin` on the **production domain** and log in.
2. Scroll to **NFC tag URLs**. Each experiment has its full URL and a **Copy** button.

The URLs use whichever host served the admin page, so copying them from a preview deploy or `localhost` gives URLs that won't work on party day.

### Write each tag

For each experiment:

1. In NFC Tools, open **Write** → **Add a record** → **URL / URI**.
2. Paste the URL from the admin page. If the app shows a separate scheme picker, choose `https://` and paste the rest, so it isn't doubled. Tap **OK**.
3. Tap **Write**, then hold the tag against the phone's NFC antenna (the top edge of an iPhone, the middle of the back on most Android phones) until it confirms.
4. Stick the tag to the back of that experiment's printed picture and label the back with the experiment's name, so tags don't get mixed up.

Writing to a tag replaces whatever was on it, so a mistake can be fixed by writing it again.

### Test every tag

1. On a test phone, join as a throwaway player (e.g. `tester`).
2. Tap each tag. It should open the browser on that experiment's found page with confetti. Check it's the **right** experiment.
3. Check the hunt page shows every experiment as found.
4. Delete the test player from `/admin` so they don't show up in the standings.

In NFC Tools, the **Read** tab shows what's on a tag if one opens the wrong page.

### Lock the tags (optional)

Once every tag is tested, NFC Tools can lock them (**Other** → **Lock tag**) so guests can't overwrite them. **Locking is permanent**: the URL can never be changed again, so only lock after the domain and slugs are final.

### Placement tips

- Tags don't read on or near **metal** (fridges, metal shelves, foil). Put a thick piece of cardboard behind them or choose another spot.
- Phones read from about 1–4 cm away, so the picture's back needs to be reachable with a phone.
- Tags work through paper, card and thin plastic, so laminating the pictures is fine.

## Party-day notes

- **iPhone:** iPhone XS and later read tags automatically when unlocked with the screen on, and show a banner to tap. iPhone 7–X need the NFC reader from Control Center.
- **Android:** NFC must be turned on (Settings → Connected devices → NFC) and the phone unlocked.
- Tell guests **not** to "Add to Home Screen" on iOS. Home-screen apps keep separate cookies from Safari, where tag taps open, so their finds would look like a different player.
- Guests who switch phones or browsers can resume with **I'm already playing** and their username.
- If a guest's progress looks wrong, check `/admin`. Deleting a player frees their username, and their phone is sent back to `/join` on its next visit.
