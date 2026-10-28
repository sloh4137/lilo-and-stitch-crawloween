# Lilo & Stitch Crawl-o-ween — Stitch scavenger hunt

## Context

A Halloween party game. Printed Stitch pictures are hidden around the house, each with an NFC tag on the back. Tapping a tag opens a unique URL. The app records the find for that player in Firestore and plays a confetti celebration. A hunt page shows every Stitch, with unfound ones as silhouettes and found ones revealed. A passcode-protected admin page shows the standings.

The repo is a fresh Create Next App scaffold under `src/app` (Next 16.4.2, React 19.3, Tailwind 4, yarn). Next 16 differences that matter here: `cookies()` and `params` are async, middleware is now `proxy.ts` (not needed here), and server functions can call `refresh()` from `next/cache`. Read the relevant docs in `node_modules/next/dist/docs/01-app/` before writing each piece: getting-started 07-mutating-data and 15-route-handlers, plus the authentication and data-security guides.

## Decisions

- **Identity: cookie `crawloween_player=<nameKey>`.** It's set by server actions (`createPlayer` / `selectPlayer`), lasts 30 days, uses `sameSite=lax`, and is not httpOnly. There's no auth. The join page has two paths: **New player** (username + full name; shows an error if the username is taken) and **I'm already playing** (type your username; the app never lists players, so usernames have to be guessed rather than browsed). Pages read the cookie on the server, so most of the UI is server-rendered and there's no browser-side identity code.
- **Claims go through a GET route handler,** not a page render: `/f/[slug]` claims the card and redirects to `/found/[cardId]?r=new|already`. The claim doesn't depend on JavaScript loading. It's idempotent, and link-preview bots can't claim because they have no cookie.
- **Firestore is accessed from the server only,** using `firebase-admin`. Rules deny every browser read and write, and there's no Firebase client SDK.
- **Card slugs are unguessable** (10 random chars) and live only in a `server-only` module.
- **Admin:** a shared passcode in `ADMIN_PASSCODE`. Logging in sets an httpOnly cookie `crawloween_admin` holding an HMAC signed with `ADMIN_COOKIE_SECRET`.
- **Unfound cards** are dark silhouettes using CSS `brightness(0)`, with an optional hint. This needs transparent-background PNGs.
- **Cards** are defined in a static config file. Images go in `public/stitch/`.
- **Hosting:** Vercel, with server code running as Vercel Functions on the Node.js runtime. Firebase is used only for Firestore. See "Runtime & hosting" below.

## Data model (Firestore)

`players/{nameKey}`, where `nameKey` is the username lowercased, trimmed, and with spaces collapsed. `username` is shown in the game (as typed); `fullName` appears only on the admin dashboard:

```
{ username, fullName, createdAt, found: { [cardId]: Timestamp }, foundCount, lastFoundAt }
```

- Username uniqueness comes from `docRef.create()`, which fails if the doc exists, giving "That username is taken".
- The claim transaction: if `found[cardId]` is missing, set it, increment `foundCount` and set `lastFoundAt`. It returns `new`, `already` or `no-player`.
- Standings: read all players and sort by `foundCount` descending, then `lastFoundAt` ascending.

## Files

```
src/lib/firebase-admin.ts        // 'server-only'; init the admin app once (getApps() guard) from FIREBASE_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY
src/lib/cards.ts                 // public: [{ id, name, image, hint? }]
src/lib/card-slugs.ts            // 'server-only'; { [slug]: cardId }, cardIdForSlug(), slugForCard()
src/lib/names.ts                 // normalizeUsername(), validateUsername() (1–20 chars), validateFullName() (1–50 chars)
src/lib/player-session.ts        // 'server-only'; getPlayerKey() reads cookie; setPlayerCookie()/clearPlayerCookie()
src/lib/admin-session.ts         // 'server-only'; sign/verify admin cookie, isAdmin()
src/lib/players.ts               // 'server-only'; getPlayer(), listPlayers(), claim transaction (claimCardForPlayer)
src/actions/players.ts           // 'use server': createPlayer(formData), selectPlayer(formData), switchPlayer()
src/actions/admin.ts             // 'use server': adminLogin(formData), adminLogout(), deletePlayer(nameKey) — each re-checks isAdmin()
src/components/Celebration.tsx   // client: canvas-confetti + Stitch pop/wiggle animation
src/app/layout.tsx               // theme: night-sky purple/teal, Hawaiian-spooky fonts, metadata
src/app/page.tsx                 // server: no cookie/no player → redirect /join; hunt grid + "7 / 10"; "Not you?" switch
src/app/join/page.tsx            // server page + client form (useActionState) for the two tabs; honors ?next=
src/app/f/[slug]/route.ts        // GET: validate slug (404 if bad) → no player → /join?next=/f/slug → claim → redirect /found/[cardId]?r=…
src/app/found/[cardId]/page.tsx  // server: verify player has found it (else redirect /); renders <Celebration> (r=new) or "Already found"; "Ohana!" finale at total
src/app/admin/page.tsx           // server: isAdmin() or redirect /admin/login; standings + card NFC URL list with copy buttons
src/app/admin/DeletePlayerButton.tsx // client: confirm("Delete Lilo and their 5 finds?") → deletePlayer action → refresh()
src/app/admin/RefreshButton.tsx  // client: router.refresh() on click; shows the last refreshed time
src/app/admin/StandingsList.tsx  // client: standings rows; react-spring FLIP animation when the order changes
src/app/admin/CopyButton.tsx     // client: copies an NFC tag URL to the clipboard
src/app/admin/login/LoginForm.tsx // client: passcode form (useActionState) → adminLogin
src/app/admin/login/page.tsx     // server: already admin → redirect /admin; renders LoginForm
firestore.rules                  // deny all
.env.example
```

Dependencies to add: `firebase-admin`, `canvas-confetti` (+ `@types/canvas-confetti`), `server-only`.

## Claim flow (tap → confetti)

1. **Tap.** The phone reads the tag's NDEF URL, `https://<app>/f/k7Qx9mP2aB`, and opens it in the default browser, which sends the `crawloween_player` cookie.
2. **Route handler** (`src/app/f/[slug]/route.ts`, Vercel Function):
   - `cardIdForSlug(slug)` from the server-only `card-slugs.ts`. Unknown slug → 404.
   - `getPlayerKey()` reads the cookie. If there's none → 307 to `/join?next=/f/k7Qx9mP2aB`.
   - `claimCardForPlayer(nameKey, cardId)` (`src/lib/players.ts`) runs the Firestore transaction:
     ```ts
     db.runTransaction(async (tx) => {
       const snap = await tx.get(ref);
       if (!snap.exists) return { status: "no-player" };
       if (snap.data()!.found?.[cardId]) return { status: "already" };
       tx.update(ref, {
         [`found.${cardId}`]: FieldValue.serverTimestamp(),
         foundCount: FieldValue.increment(1),
         lastFoundAt: FieldValue.serverTimestamp(),
       });
       return { status: "new" };
     });
     ```
     The transaction keeps double taps and retries from counting twice.
   - `no-player` (stale cookie, e.g. the admin deleted this player) → clear the cookie and 307 to `/join?next=…`.
   - Otherwise → 307 to `/found/<cardId>?r=new|already`.
3. **Celebration page** (`src/app/found/[cardId]/page.tsx`, server): it checks that the player actually has this card. Without that check, someone could type `/found/3` and get confetti. Then it renders:
   - `r=new`: `<Celebration>` with confetti and "You found Experiment 626! 5 / 10", or the "Ohana!" finale when `foundCount === total`.
   - `r=already`: a quieter "Already found".
   - Both link to the hunt page.
4. **First tap with no name:** the visit to `/join?next=…` happens first. `createPlayer` / `selectPlayer` sets the cookie and redirects back to `/f/<slug>`, then continues from step 2, so the first tap still counts.
5. **Known weakness (accepted):** the cookie is unauthenticated, so someone could claim a card under another name. They would still need to know the card's secret URL, which means finding the tag.

## Other flows

- **Hunt page:** server-rendered from `getPlayer(cookie)`, with no loading state. A missing or stale player redirects to `/join`.
- **Delete player (admin):** each standings row has a Delete button. The `deletePlayer` server action **re-checks `isAdmin()` itself**, because server actions are public POST endpoints. It deletes `players/{nameKey}` and calls `refresh()`. The deleted player's phone hits the stale-cookie path on their next request and is sent to `/join`. The name becomes free to claim again.

## Runtime & hosting

- **Production:** Vercel. Server components, server actions and the route handler each run as Vercel Functions on the Node.js runtime. That's the default, and `firebase-admin` needs it. Don't set `runtime = 'edge'`. `public/` images and static assets are served from Vercel's CDN.
- **Region:** put the Vercel function region in the same region as the Firestore database, for example Firestore `us-east1` with Vercel `iad1`, set in Project Settings → Functions. Each tap makes about 2 Firestore round-trips, so a mismatch adds visible delay.
- **Cold starts:** `firebase-admin` adds roughly 300–800ms to the first request on a cold instance. Initialize it once at module scope. Fluid compute reuses warm instances, so under party traffic most taps should be warm.
- **Secrets:** in Vercel env vars (Production + Preview), never in `NEXT_PUBLIC_*`. Locally they go in `.env.local`.
- **Cost:** the Vercel Hobby plan and Firestore's free Spark plan (50k reads and 20k writes per day) cover this. The admin page reads every player doc on each refresh, about 30 reads per refresh at 30 players, so it refreshes only when a host presses Refresh rather than polling. That stays well under quota.
- **Local:** `yarn dev` runs the same server code in local Node, pointed at the real project or the Firestore emulator (`FIRESTORE_EMULATOR_HOST`). Use `next dev -H 0.0.0.0` to test from a phone on the LAN.

## Setup notes (README)

- Create a Firebase project, enable Firestore (pick its region), and create a service account key. Copy its values into Vercel env vars (`FIREBASE_PRIVATE_KEY`: replace `\\n` with `\n` in code). Deploy `firestore.rules`.
- Generate slugs with `node -e "console.log(require('crypto').randomBytes(8).toString('base64url'))"`.
- Write tags as NDEF URL records (NTAG213/215, using the NFC Tools app), copying URLs from the admin page.
- Tell guests not to "Add to Home Screen" on iOS. Home-screen apps have separate cookies from Safari, where tag taps open.

## Milestones (one commit each, on a feature branch)

Each commit builds (`yarn lint && yarn build`) and can be reviewed on its own. Commits 2–8 are each small enough to review in one sitting.

1. **Scaffold cleanup + theme.** Commit the `app/` → `src/app/` move and the `AGENTS.md` block. Then add the Lilo & Stitch theme to `layout.tsx` and `globals.css` (colors, fonts, metadata), plus a placeholder home page. _Review: visuals only._
2. **Card config + static hunt grid.** Add `cards.ts` and `card-slugs.ts` with placeholder images in `public/stitch/`. The hunt grid renders every card as a silhouette from hard-coded data, with no Firebase yet. _Review: layout and silhouette look on mobile._
3. **Firebase Admin foundation.** Add the `firebase-admin` and `server-only` deps, `firebase-admin.ts`, `firestore.rules` (deny all), `.env.example`, and README setup steps. _Review: credentials handling, nothing exposed to the browser._
4. **Players + join flow.** Add `names.ts`, `player-session.ts`, the read side of `players.ts`, the `createPlayer`/`selectPlayer`/`switchPlayer` actions, and the `/join` page. The hunt page reads the cookie and real player data. _Review: name uniqueness via `create()`, cookie options, the `?next=` redirect only allowing same-site paths._
5. **Claim flow.** Add the `claimCardForPlayer` transaction, the `/f/[slug]` route handler, and the `/found/[cardId]` page with plain "Found!" / "Already found" text, no animation yet. _Review: transaction logic, slug validation, stale-cookie handling, curl tests from Verification._
6. **Celebration.** Add `canvas-confetti`, `Celebration.tsx`, the Stitch animation and the "Ohana!" finale. _Review: feel on a real phone, reduced-motion fallback._
7. **Admin auth + standings.** Add `admin-session.ts`, the login/logout actions, `/admin/login`, and `/admin` with sorted standings, a Refresh button with the last refreshed time, an animated reorder of the standings, and the card NFC URL list. _Review: HMAC cookie, every admin entry point checks `isAdmin()`._
8. **Admin delete player.** Add the `deletePlayer` action and `DeletePlayerButton` with a confirm step. _Review: the auth check is inside the action, and the deleted player's phone recovers cleanly._
9. **Real content + deploy notes.** Add the final Stitch images, real slugs and hints, the Vercel region note, and the NFC writing guide in the README.

## Verification

- `yarn lint`, then `yarn build`. The build output should show `/f/[slug]`, `/`, `/found/*` and `/admin` as dynamic.
- Run `yarn dev` with the emulator or a test project, then:
  - Join as "Lilo", then try "lilo " as a new player: it shows the taken error. "I'm already playing" → Lilo sets the cookie.
  - `curl -i /f/<slug>` without a cookie gets a 307 to `/join?next=…`. With the cookie it gets a 307 to `/found/<id>?r=new`, and the second time `?r=already`. `foundCount` only increments once.
  - A fresh private window going through the full tap flow records the find. A bogus `/f/xyz` returns 404.
  - `/admin` redirects to login. A wrong passcode shows an error. The right one shows standings in the correct order. After another find, Refresh updates the time and animates any rows that change places.
  - Delete a player from the admin page: they disappear from standings, and their next tap or hunt-page visit sends them to `/join`, where the name can be claimed again. A `curl` POST to the delete action without the admin cookie does nothing.
  - grep `.next/static` for one of the slugs: no matches.
- Deploy a Vercel preview with env vars and tap a real NFC tag on iPhone and Android.
