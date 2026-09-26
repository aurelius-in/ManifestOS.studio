import { NextResponse } from "next/server";
import { parseDraftInput } from "@/lib/blueprint-pack";
import { putJson, stamp } from "@/lib/blob-store";
import { BLUEPRINT_NAME, BLUEPRINT_PRICE_CENTS, blueprintSaleReady, siteUrl } from "@/lib/paid-config";
import { clientIp, limited } from "@/lib/rate-limit";
import { createBlueprintCheckout } from "@/lib/stripe-rest";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!blueprintSaleReady()) {
    return NextResponse.json({ error: "The Blueprint is not open yet.", waitlist: true }, { status: 503 });
  }
  if (limited(`checkout:${clientIp(req)}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many checkout attempts. Try again in a bit." }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Send the problem and plan." }, { status: 400 });
  }
  const { id } = stamp();
  const draft = parseDraftInput(body, id);
  if (!draft) {
    return NextResponse.json({ error: "Describe the problem in a sentence or two first." }, { status: 400 });
  }
  try {
    await putJson(`blueprint-drafts/${draft.id}.json`, draft);
    const site = siteUrl(req);
    const session = await createBlueprintCheckout({
      draftId: draft.id,
      productName: `${BLUEPRINT_NAME}: ${draft.solution.title}`,
      description: draft.problem,
      amountCents: BLUEPRINT_PRICE_CENTS,
      successUrl: `${site}/blueprint/{CHECKOUT_SESSION_ID}`,
      cancelUrl: `${site}/studio?problem=${encodeURIComponent(draft.problem)}&blueprint=canceled`,
    });
    if (!session.url) throw new Error("Checkout did not return a link.");
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[blueprint] checkout failed", error);
    return NextResponse.json({ error: "Checkout could not start. Try again in a minute." }, { status: 502 });
  }
}
