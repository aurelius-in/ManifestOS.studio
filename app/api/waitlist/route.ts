import { NextResponse } from "next/server";
import { putJson, stamp } from "@/lib/blob-store";
import { clientIp, limited } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const KINDS = new Set(["blueprint", "keep", "problem"]);

export async function POST(req: Request) {
  if (limited(`waitlist:${clientIp(req)}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many tries. Try again later." }, { status: 429 });
  }
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    /* handled below */
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
  const kind = typeof body.kind === "string" && KINDS.has(body.kind) ? body.kind : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !kind) {
    return NextResponse.json({ error: "Enter a real email." }, { status: 400 });
  }
  const context = typeof body.context === "string" ? body.context.trim().slice(0, 600) : "";
  const { day, id } = stamp();
  const saved = await putJson(`waitlist/${kind}/${day}/${id}.json`, {
    email,
    kind,
    context,
    at: new Date().toISOString(),
  }).catch(() => false);
  if (!saved) return NextResponse.json({ error: "Could not save that. Try again." }, { status: 503 });
  return NextResponse.json({ ok: true });
}
