import { NextResponse } from "next/server";
import { appendActivity } from "@/lib/activity-log";

export const dynamic = "force-dynamic";

const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const prev = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  if (prev.length >= 120) {
    hits.set(ip, prev);
    return true;
  }
  prev.push(now);
  hits.set(ip, prev);
  return false;
}

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0]?.trim() || "local";
  if (limited(ip)) return NextResponse.json({ ok: false }, { status: 429 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const saved = await appendActivity(body).catch(() => false);
  return NextResponse.json({ ok: saved });
}
