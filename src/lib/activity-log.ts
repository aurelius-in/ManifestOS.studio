import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { sanitizeActivity, type ActivityEvent } from "@/lib/activity-stats";

const MAX_EVENTS = 4000;
const FILE = "activity.json";

let queue: Promise<void> = Promise.resolve();

function filePath() {
  const dir = process.env.MANIFEST_DATA_DIR || (process.env.VERCEL ? path.join("/tmp", "manifestos") : path.join(process.cwd(), "data"));
  return path.join(dir, FILE);
}

function redisEnv() {
  const url = process.env.KV_REST_API_URL?.trim() || process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.KV_REST_API_TOKEN?.trim() || process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return { url, token };
}

function redisKey() {
  const ns = process.env.VERCEL_ENV === "production" ? "prod" : process.env.VERCEL_ENV === "preview" ? "preview" : "local";
  return `manifestos:${ns}:activity:events`;
}

async function redisCommand(command: string[]): Promise<unknown> {
  const env = redisEnv();
  if (!env) return null;
  const res = await fetch(env.url.replace(/\/$/, ""), {
    method: "POST",
    headers: { Authorization: `Bearer ${env.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  const json = (await res.json()) as { result?: unknown; error?: string };
  if (!res.ok || json.error) throw new Error(json.error || "activity store failed");
  return json.result ?? null;
}

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function parse(raw: string | null): ActivityEvent[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ActivityEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendActivity(input: unknown): Promise<boolean> {
  const event = sanitizeActivity(input);
  if (!event) return false;
  return withLock(async () => {
    if (redisEnv()) {
      const existing = parse((await redisCommand(["GET", redisKey()])) as string | null);
      existing.push(event);
      await redisCommand(["SET", redisKey(), JSON.stringify(existing.slice(-MAX_EVENTS))]);
      return true;
    }
    if (process.env.VERCEL) return false;
    const file = filePath();
    let existing: ActivityEvent[] = [];
    try {
      existing = parse(await readFile(file, "utf8"));
    } catch {
      existing = [];
    }
    existing.push(event);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(existing.slice(-MAX_EVENTS)), "utf8");
    return true;
  });
}

export async function loadActivity(): Promise<ActivityEvent[]> {
  if (redisEnv()) {
    const raw = (await redisCommand(["GET", redisKey()])) as string | null;
    return parse(raw);
  }
  try {
    return parse(await readFile(filePath(), "utf8"));
  } catch {
    return [];
  }
}
