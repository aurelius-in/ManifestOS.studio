import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Tiny JSON document store. Private Vercel Blob in production, local files in dev.
 * Keys look like "activity/2026-09-26/1790000000000-ab12.json".
 */

function namespace() {
  if (process.env.VERCEL_ENV === "production") return "prod";
  if (process.env.VERCEL_ENV === "preview") return "preview";
  return "local";
}

function token() {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || "";
}

export function storeReady(): boolean {
  return Boolean(token()) || !process.env.VERCEL;
}

function localDir() {
  return process.env.MANIFEST_DATA_DIR || path.join(process.cwd(), "data");
}

function fullKey(key: string) {
  return `manifestos/${namespace()}/${key}`;
}

export async function putJson(key: string, value: unknown): Promise<boolean> {
  const body = JSON.stringify(value);
  if (token()) {
    const { put } = await import("@vercel/blob");
    await put(fullKey(key), body, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      token: token(),
    });
    return true;
  }
  if (process.env.VERCEL) return false;
  const file = path.join(localDir(), key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body, "utf8");
  return true;
}

export async function getJson<T>(key: string): Promise<T | null> {
  if (token()) {
    const { get, BlobNotFoundError } = await import("@vercel/blob");
    try {
      const result = await get(fullKey(key), { access: "private", useCache: false, token: token() });
      if (!result || result.statusCode !== 200 || !result.stream) return null;
      return JSON.parse(await new Response(result.stream).text()) as T;
    } catch (error) {
      if (error instanceof BlobNotFoundError) return null;
      throw error;
    }
  }
  if (process.env.VERCEL) return null;
  try {
    return JSON.parse(await readFile(path.join(localDir(), key), "utf8")) as T;
  } catch {
    return null;
  }
}

/** Keys under a prefix, newest last. `prefix` has no namespace. */
export async function listKeys(prefix: string, max = 3000): Promise<string[]> {
  if (token()) {
    const { list } = await import("@vercel/blob");
    const base = fullKey("");
    const keys: string[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: fullKey(prefix), cursor, limit: 1000, token: token() });
      for (const blob of page.blobs) keys.push(blob.pathname.slice(base.length));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor && keys.length < max * 2);
    return keys.sort().slice(-max);
  }
  if (process.env.VERCEL) return [];
  const root = path.join(localDir(), prefix);
  const out: string[] = [];
  async function walk(dir: string) {
    let entries: import("node:fs").Dirent[] = [];
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else out.push(path.relative(localDir(), full).split(path.sep).join("/"));
    }
  }
  await walk(root);
  return out.sort().slice(-max);
}

export async function getMany<T>(keys: string[], batch = 25): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < keys.length; i += batch) {
    const chunk = await Promise.all(keys.slice(i, i + batch).map((key) => getJson<T>(key).catch(() => null)));
    for (const item of chunk) if (item) out.push(item);
  }
  return out;
}

export function stamp(now = Date.now()) {
  const day = new Date(now).toISOString().slice(0, 10);
  const rand = Math.random().toString(36).slice(2, 8);
  return { day, id: `${now}-${rand}` };
}
