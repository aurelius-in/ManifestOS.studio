import { NextResponse } from "next/server";
import {
  BLUEPRINT_SYSTEM,
  blueprintUserPrompt,
  normalizePack,
  packToMarkdown,
  type BlueprintDraft,
  type StoredBlueprint,
} from "@/lib/blueprint-pack";
import { getJson, putJson } from "@/lib/blob-store";
import { SUPPORT_EMAIL } from "@/lib/copy";
import { completeJson } from "@/lib/llm";
import { blueprintSaleReady } from "@/lib/paid-config";
import { getCheckoutSession } from "@/lib/stripe-rest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const LOCK_MS = 75_000;

export async function POST(req: Request) {
  let sessionId = "";
  try {
    const body = (await req.json()) as { sessionId?: unknown };
    sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  } catch {
    /* handled below */
  }
  if (!/^cs_[A-Za-z0-9_]{10,200}$/.test(sessionId)) {
    return NextResponse.json({ error: "That link is not a Blueprint receipt." }, { status: 400 });
  }

  const existing = await getJson<StoredBlueprint>(`blueprints/${sessionId}.json`);
  if (existing) return NextResponse.json({ status: "ready", blueprint: existing });

  if (!blueprintSaleReady()) {
    return NextResponse.json({ error: `Blueprints are paused. Email ${SUPPORT_EMAIL}.` }, { status: 503 });
  }

  let session;
  try {
    session = await getCheckoutSession(sessionId);
  } catch {
    return NextResponse.json({ error: "We could not find that payment." }, { status: 404 });
  }
  if (session.metadata?.product !== "manifestos_blueprint" || session.payment_status !== "paid") {
    return NextResponse.json({ error: "This payment is not complete yet. Refresh in a moment." }, { status: 402 });
  }

  const lock = await getJson<{ at: number }>(`blueprint-locks/${sessionId}.json`);
  if (lock && Date.now() - lock.at < LOCK_MS) {
    return NextResponse.json({ status: "writing" }, { status: 202 });
  }
  await putJson(`blueprint-locks/${sessionId}.json`, { at: Date.now() });

  const draft = await getJson<BlueprintDraft>(`blueprint-drafts/${session.metadata.draft_id}.json`);
  if (!draft) {
    return NextResponse.json({ error: `We lost the plan for this payment. Email ${SUPPORT_EMAIL} and we will fix it.` }, { status: 500 });
  }

  let lastError: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await completeJson(BLUEPRINT_SYSTEM, blueprintUserPrompt(draft));
      const pack = normalizePack(raw, draft);
      const stored: StoredBlueprint = {
        sessionId,
        draftId: draft.id,
        email: session.customer_details?.email ?? null,
        createdAt: new Date().toISOString(),
        pack,
        markdown: packToMarkdown(pack, draft.problem),
      };
      await putJson(`blueprints/${sessionId}.json`, stored);
      return NextResponse.json({ status: "ready", blueprint: stored });
    } catch (error) {
      lastError = error;
    }
  }
  console.error("[blueprint] generation failed", lastError);
  await putJson(`blueprint-locks/${sessionId}.json`, { at: 0 });
  return NextResponse.json({ error: "Writing the Blueprint failed. Refresh to try again. You will not be charged twice." }, { status: 502 });
}
