import { sanitizeActivity, type ActivityEvent } from "@/lib/activity-stats";
import { getMany, listKeys, putJson, stamp } from "@/lib/blob-store";

const MAX_EVENTS = 4000;

export async function appendActivity(input: unknown): Promise<boolean> {
  const event = sanitizeActivity(input);
  if (!event) return false;
  const { day, id } = stamp(Date.parse(event.ts) || Date.now());
  return putJson(`activity/${day}/${id}.json`, event);
}

/** Only fetches days on or after `sinceMs`, so short ranges stay fast. */
export async function loadActivity(sinceMs: number | null = null): Promise<ActivityEvent[]> {
  const keys = await listKeys("activity/", MAX_EVENTS);
  if (sinceMs === null) return getMany<ActivityEvent>(keys);
  const firstDay = new Date(sinceMs - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return getMany<ActivityEvent>(keys.filter((key) => key.slice("activity/".length, "activity/".length + 10) >= firstDay));
}
