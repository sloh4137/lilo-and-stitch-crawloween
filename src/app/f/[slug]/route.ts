import { redirect } from "next/navigation";
import { cardIdForSlug } from "@/lib/card-slugs";
import { clearPlayerCookie, getPlayerKey } from "@/lib/player-session";
import { claimCardForPlayer } from "@/lib/players";

// NFC tags open /f/<slug>. Claiming happens here, in a GET, so it works before
// any JavaScript loads. Link-preview bots carry no cookie, so they can't claim.
export async function GET(_request: Request, ctx: RouteContext<"/f/[slug]">) {
  const { slug } = await ctx.params;
  const cardId = cardIdForSlug(slug);
  if (!cardId) return new Response("Not found", { status: 404 });

  const joinUrl = `/join?next=${encodeURIComponent(`/f/${slug}`)}`;
  const nameKey = await getPlayerKey();
  if (!nameKey) redirect(joinUrl);

  const result = await claimCardForPlayer(nameKey, cardId);
  if (result === "no-player") {
    // Stale cookie, e.g. the admin deleted this player: join again, then come back.
    await clearPlayerCookie();
    redirect(joinUrl);
  }

  redirect(`/found/${cardId}?r=${result}`);
}
