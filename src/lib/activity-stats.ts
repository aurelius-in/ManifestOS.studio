/**
 * Founder activity rollup for ManifestOS.
 * There is no account. The commitment is naming a problem and walking the studio.
 */

export type ActivityRange = "today" | "7d" | "month" | "all";

export const ACTIVITY_RANGES: { id: ActivityRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Past week" },
  { id: "month", label: "This month" },
  { id: "all", label: "All time" },
];

export type ActivityEvent = {
  id: string;
  name: string;
  ts: string;
  visitorId: string;
  sessionId: string;
  path: string;
  referrer: string;
  source: string;
  medium: string;
  campaign: string;
  dwellMs: number;
  props: Record<string, string | number | boolean>;
};

export type DailyKpi = { label: string; value: string };

export function dailyKpis(stats: ActivityStats): DailyKpi[] {
  return [
    { label: "Sessions", value: String(stats.sessions) },
    { label: "Problems submitted", value: String(stats.commitment.problemSubmitted) },
    { label: "Opened the studio", value: String(stats.commitment.studioOpened) },
  ];
}

export type FunnelStep = {
  key: string;
  label: string;
  hint: string;
  sessions: number;
  continuePct: number | null;
};

export type ActivityStats = {
  checkedAt: string;
  range: ActivityRange;
  rangeLabel: string;
  headline: string;
  visitors: number;
  sessions: number;
  pageViews: number;
  medianSessionLabel: string;
  funnel: FunnelStep[];
  stops: { key: string; label: string; sessions: number; sharePct: number | null }[];
  pages: { path: string; views: number; sessions: number; medianDwellLabel: string }[];
  sections: { name: string; sessions: number }[];
  sources: { source: string; sessions: number }[];
  stages: { stage: string; sessions: number; medianDwellLabel: string }[];
  commitment: {
    problemFocused: number;
    problemSubmitted: number;
    saidToo: number;
    studioOpened: number;
    reachedPlan: number;
    reachedSoftware: number;
    boostViews: number;
  };
  signups: { seen: number; started: number; completed: number };
  recent: {
    id: string;
    when: string;
    source: string;
    durationLabel: string;
    trail: string;
    stopped: string;
  }[];
  insights: { severity: "critical" | "warn" | "info"; title: string; detail: string }[];
};

const FUNNEL: { key: string; label: string; hint: string; test: (names: Set<string>, paths: Set<string>) => boolean }[] = [
  { key: "landed", label: "Landed", hint: "Any page", test: () => true },
  { key: "home", label: "Home", hint: "Opened the homepage", test: (_n, paths) => paths.has("/") },
  {
    key: "read",
    label: "Read around",
    hint: "Manifesto, commons, essay, boost, you, or a section below the hero",
    test: (names, paths) =>
      [...names].some((name) => name.startsWith("section:") && name !== "section:hero") ||
      ["/manifesto", "/commons", "/essay", "/boost", "/you"].some((path) => paths.has(path)),
  },
  {
    key: "problem",
    label: "Touched a problem",
    hint: "Focused the problem box or opened a problem page",
    test: (names, paths) => names.has("problem_focused") || [...paths].some((path) => path.startsWith("/problems/")),
  },
  {
    key: "submitted",
    label: "Submitted a problem",
    hint: "Sent the problem form",
    test: (names) => names.has("problem_submitted"),
  },
  {
    key: "said",
    label: "I have this too",
    hint: "Marked a problem as theirs",
    test: (names) => names.has("problem_joined"),
  },
  {
    key: "studio",
    label: "Opened the studio",
    hint: "Entered the guided path",
    test: (names, paths) => names.has("studio_stage") || paths.has("/studio"),
  },
  {
    key: "understand",
    label: "Understand",
    hint: "Discovery or the shared brief",
    test: (names) => names.has("stage:discovery") || names.has("stage:brief"),
  },
  {
    key: "existing",
    label: "Existing solutions",
    hint: "Looked at the commons inside the studio",
    test: (names) => names.has("stage:commons"),
  },
  {
    key: "smallest",
    label: "Smallest useful",
    hint: "Chose an approach or started an adaptation",
    test: (names) => names.has("stage:smallest") || names.has("stage:adapt"),
  },
  {
    key: "plan",
    label: "Plan",
    hint: "Reached the plan or blueprint",
    test: (names) => names.has("stage:plan-invite") || names.has("stage:blueprint"),
  },
  {
    key: "software",
    label: "Software",
    hint: "Build, preview, or refine",
    test: (names) => names.has("stage:build") || names.has("stage:preview") || names.has("stage:refine"),
  },
  {
    key: "adapt",
    label: "Adapt / share",
    hint: "Marked the path resolved",
    test: (names) => names.has("stage:resolved"),
  },
];

export function parseActivityRange(raw: string | undefined | null): ActivityRange {
  if (raw === "today" || raw === "7d" || raw === "month" || raw === "all") return raw;
  return "7d";
}

export function rangeStartMs(range: ActivityRange, now = Date.now()): number | null {
  if (range === "all") return null;
  if (range === "today") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  if (range === "7d") return now - 7 * 24 * 60 * 60 * 1000;
  const d = new Date(now);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
}

export function normalizePath(path: string): string {
  const base = (path.split("?")[0] || "/").replace(/\/$/, "") || "/";
  if (base.startsWith("/problems/")) return "/problems/:slug";
  return base;
}

function hostOf(value: string): string {
  if (!value) return "";
  try {
    return new URL(value).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

const BLOCKED_PROP = /email|password|token|secret|authorization|cookie/i;

export function sanitizeActivity(input: unknown, now = Date.now()): ActivityEvent | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const name = clip(raw.name, 64);
  if (!/^[a-z0-9_:-]+$/i.test(name)) return null;
  const visitorId = clip(raw.visitorId, 80);
  const sessionId = clip(raw.sessionId, 80);
  if (!visitorId || !sessionId) return null;
  const propsIn = raw.props && typeof raw.props === "object" ? (raw.props as Record<string, unknown>) : {};
  const props: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(propsIn).slice(0, 12)) {
    if (BLOCKED_PROP.test(key)) continue;
    if (typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) props[clip(key, 40)] = value;
    else if (typeof value === "string") props[clip(key, 40)] = clip(value, 160);
  }
  const dwell = typeof raw.dwellMs === "number" && raw.dwellMs > 0 ? Math.min(raw.dwellMs, 30 * 60 * 1000) : 0;
  return {
    id: clip(raw.id, 40) || `e_${now.toString(36)}`,
    name,
    ts: typeof raw.ts === "string" && !Number.isNaN(Date.parse(raw.ts)) ? raw.ts : new Date(now).toISOString(),
    visitorId,
    sessionId,
    path: normalizePath(clip(raw.path, 180) || "/"),
    referrer: hostOf(typeof raw.referrer === "string" ? raw.referrer : ""),
    source: clip(raw.source, 80),
    medium: clip(raw.medium, 80),
    campaign: clip(raw.campaign, 80),
    dwellMs: dwell,
    props,
  };
}

function clip(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export function formatDuration(ms: number | null): string {
  if (ms === null || ms <= 0) return "n/a";
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  if (min < 60) return rem ? `${min}m ${rem}s` : `${min}m`;
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

function pct(part: number, whole: number): number | null {
  if (!whole) return null;
  return Math.round((part / whole) * 100);
}

type SessionBag = {
  id: string;
  visitorId: string;
  events: ActivityEvent[];
  names: Set<string>;
  paths: Set<string>;
  start: number;
  end: number;
  source: string;
};

function bags(events: ActivityEvent[]): SessionBag[] {
  const map = new Map<string, SessionBag>();
  for (const event of events) {
    let bag = map.get(event.sessionId);
    const t = Date.parse(event.ts);
    if (!bag) {
      bag = {
        id: event.sessionId,
        visitorId: event.visitorId,
        events: [],
        names: new Set(),
        paths: new Set(),
        start: t,
        end: t,
        source: event.source || event.referrer || "direct",
      };
      map.set(event.sessionId, bag);
    }
    bag.events.push(event);
    bag.names.add(event.name);
    if (event.path) bag.paths.add(event.path);
    if (event.name === "section_seen" && typeof event.props.section === "string") bag.names.add(`section:${event.props.section}`);
    if (event.name === "studio_stage" && typeof event.props.stage === "string") bag.names.add(`stage:${event.props.stage}`);
    if (t < bag.start) bag.start = t;
    if (t > bag.end) bag.end = t;
  }
  return [...map.values()];
}

function furthest(bag: SessionBag): number {
  let index = 0;
  for (let i = 1; i < FUNNEL.length; i++) {
    if (FUNNEL[i].test(bag.names, bag.paths)) index = i;
  }
  return index;
}

export function buildActivityStats(events: ActivityEvent[], range: ActivityRange, now = Date.now()): ActivityStats {
  const start = rangeStartMs(range, now);
  const windowed = events.filter((event) => {
    const t = Date.parse(event.ts);
    return !Number.isNaN(t) && (start === null || t >= start);
  });
  const sessions = bags(windowed);
  const funnel: FunnelStep[] = FUNNEL.map((step, index) => {
    const reached = index === 0 ? sessions.length : sessions.filter((bag) => step.test(bag.names, bag.paths)).length;
    return { key: step.key, label: step.label, hint: step.hint, sessions: reached, continuePct: null as number | null };
  });
  for (let i = 1; i < funnel.length; i++) {
    funnel[i].continuePct = pct(funnel[i].sessions, funnel[i - 1].sessions);
  }
  const stopCounts = FUNNEL.map(() => 0);
  for (const bag of sessions) stopCounts[furthest(bag)] += 1;
  const stops = FUNNEL.map((step, i) => ({
    key: step.key,
    label: step.label,
    sessions: stopCounts[i],
    sharePct: pct(stopCounts[i], sessions.length),
  })).filter((row) => row.sessions > 0);

  const pageMap = new Map<string, { views: number; sessions: Set<string>; dwells: number[] }>();
  for (const event of windowed) {
    if (event.name !== "page_view" && event.name !== "page_dwell") continue;
    const row = pageMap.get(event.path) ?? { views: 0, sessions: new Set<string>(), dwells: [] };
    if (event.name === "page_view") {
      row.views += 1;
      row.sessions.add(event.sessionId);
    }
    if (event.name === "page_dwell" && event.dwellMs > 0) row.dwells.push(event.dwellMs);
    pageMap.set(event.path, row);
  }
  const pages = [...pageMap.entries()]
    .map(([path, row]) => ({
      path,
      views: row.views,
      sessions: row.sessions.size,
      medianDwellLabel: formatDuration(median(row.dwells)),
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 12);

  const sectionMap = new Map<string, Set<string>>();
  for (const event of windowed) {
    if (event.name !== "section_seen" || typeof event.props.section !== "string") continue;
    const set = sectionMap.get(event.props.section) ?? new Set<string>();
    set.add(event.sessionId);
    sectionMap.set(event.props.section, set);
  }
  const sections = [...sectionMap.entries()]
    .map(([name, set]) => ({ name, sessions: set.size }))
    .sort((a, b) => b.sessions - a.sessions);

  const stageMap = new Map<string, { sessions: Set<string>; dwells: number[] }>();
  for (const event of windowed) {
    if (event.name !== "studio_stage" && event.name !== "studio_stage_leave") continue;
    const stage = String(event.props.stage || "");
    if (!stage) continue;
    const row = stageMap.get(stage) ?? { sessions: new Set<string>(), dwells: [] };
    row.sessions.add(event.sessionId);
    if (event.name === "studio_stage_leave" && event.dwellMs > 0) row.dwells.push(event.dwellMs);
    stageMap.set(stage, row);
  }
  const stageOrder = ["problem", "discovery", "brief", "commons", "smallest", "adapt", "plan-invite", "blueprint", "build", "preview", "refine", "resolved"];
  const stages = [...stageMap.entries()]
    .map(([stage, row]) => ({
      stage,
      sessions: row.sessions.size,
      medianDwellLabel: formatDuration(median(row.dwells)),
    }))
    .sort((a, b) => stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage));

  const sourceMap = new Map<string, number>();
  for (const bag of sessions) {
    const source = bag.source || "direct";
    sourceMap.set(source, (sourceMap.get(source) ?? 0) + 1);
  }
  const sources = [...sourceMap.entries()]
    .map(([source, count]) => ({ source, sessions: count }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 8);

  const has = (name: string) => sessions.filter((bag) => bag.names.has(name)).length;
  const commitment = {
    problemFocused: has("problem_focused"),
    problemSubmitted: has("problem_submitted"),
    saidToo: has("problem_joined"),
    studioOpened: sessions.filter((bag) => bag.paths.has("/studio") || bag.names.has("studio_stage")).length,
    reachedPlan: sessions.filter((bag) => bag.names.has("stage:plan-invite") || bag.names.has("stage:blueprint")).length,
    reachedSoftware: sessions.filter((bag) => bag.names.has("stage:build") || bag.names.has("stage:preview") || bag.names.has("stage:refine")).length,
    boostViews: sessions.filter((bag) => bag.paths.has("/boost")).length,
  };
  const signups = {
    seen: sessions.filter((bag) => bag.names.has("signup_view")).length,
    started: sessions.filter((bag) => bag.names.has("signup_started") || bag.names.has("signup_submitted")).length,
    completed: sessions.filter((bag) => bag.names.has("signup_completed")).length,
  };

  const durations = sessions.map((bag) => Math.max(0, bag.end - bag.start)).filter((n) => n > 0);
  const recent = [...sessions]
    .sort((a, b) => b.start - a.start)
    .slice(0, 14)
    .map((bag) => ({
      id: bag.id.slice(0, 8),
      when: new Date(bag.start).toLocaleString(),
      source: bag.source || "direct",
      durationLabel: formatDuration(Math.max(bag.end - bag.start, 0)),
      trail: [...new Set(bag.events.filter((event) => event.name === "page_view").map((event) => event.path))].slice(0, 6).join(" → ") || "/",
      stopped: FUNNEL[furthest(bag)]?.label ?? "Landed",
    }));

  const insights = insightsFor(sessions, funnel, commitment);
  const rangeLabel = ACTIVITY_RANGES.find((item) => item.id === range)?.label ?? "Past week";
  const visitors = new Set(sessions.map((bag) => bag.visitorId)).size;
  const homeStops = stopCounts[1] ?? 0;
  const headline =
    sessions.length === 0
      ? "No activity in this window yet. Page time, problem submits, and studio stages will show up here."
      : `${visitors} visitor${visitors === 1 ? "" : "s"}, ${sessions.length} session${sessions.length === 1 ? "" : "s"}. ${commitment.problemSubmitted} submitted a problem. ${commitment.studioOpened} opened the studio. ${homeStops} stopped on the homepage. ManifestOS does not ask for an account.`;

  return {
    checkedAt: new Date(now).toISOString(),
    range,
    rangeLabel,
    headline,
    visitors,
    sessions: sessions.length,
    pageViews: windowed.filter((event) => event.name === "page_view").length,
    medianSessionLabel: formatDuration(median(durations)),
    funnel,
    stops,
    pages,
    sections,
    sources,
    stages,
    commitment,
    signups,
    recent,
    insights,
  };
}

function insightsFor(
  sessions: SessionBag[],
  funnel: FunnelStep[],
  commitment: ActivityStats["commitment"],
): ActivityStats["insights"] {
  if (!sessions.length) return [];
  const tips: ActivityStats["insights"] = [];
  const home = funnel.find((step) => step.key === "home");
  const problem = funnel.find((step) => step.key === "problem");
  const studio = funnel.find((step) => step.key === "studio");
  const plan = funnel.find((step) => step.key === "plan");
  if (home && problem && home.sessions >= 5 && problem.sessions === 0) {
    tips.push({
      severity: "critical",
      title: "People are reading and not naming a problem",
      detail: `${home.sessions} homepage sessions and none focused the problem box or opened a problem page.`,
    });
  }
  if (commitment.problemSubmitted >= 3 && studio && (studio.continuePct ?? 100) < 40) {
    tips.push({
      severity: "warn",
      title: "Problems are submitted, then the studio is skipped",
      detail: `${commitment.problemSubmitted} submitted a problem. ${commitment.studioOpened} opened the studio.`,
    });
  }
  if (studio && plan && studio.sessions >= 3 && plan.sessions === 0) {
    tips.push({
      severity: "warn",
      title: "Studio sessions stop before a plan",
      detail: `${studio.sessions} opened the studio and none reached the plan. The stall is in understand, existing solutions, or smallest useful.`,
    });
  }
  if (commitment.saidToo > 0 && commitment.problemSubmitted === 0) {
    tips.push({
      severity: "info",
      title: "People are joining problems they did not write",
      detail: `${commitment.saidToo} said they have a problem too, without submitting a new one.`,
    });
  }
  if (!tips.length) {
    tips.push({
      severity: "info",
      title: "No single stall stands out yet",
      detail: "Watch the furthest studio stage. That is the drop-off, because there is no signup wall.",
    });
  }
  return tips;
}
