/**
 * The paid Build-Ready Blueprint: a portable spec for "what should exist"
 * that any AI builder can follow.
 */

export type BlueprintDraft = {
  id: string;
  createdAt: string;
  problem: string;
  answers: { question: string; answer: string }[];
  brief: {
    summary: string;
    affectedUsers: string[];
    currentWorkaround: string;
    friction: string;
    desiredOutcome: string;
  };
  solution: {
    title: string;
    summary: string;
    howItWorks: string;
    mvpFeatures: string[];
    nonGoals: string[];
    privacyNotes: string;
  };
};

export type BlueprintPack = {
  title: string;
  shouldExist: { outcome: string; forWhom: string; worksWhen: string[] };
  shouldNotExist: string[];
  smallestVersion: { feature: string; doneWhen: string }[];
  screens: { name: string; purpose: string; steps: string[] }[];
  remembers: { item: string; details: string; whoSees: string }[];
  boundaries: { askBefore: string[]; never: string[]; privacy: string[] };
  edgeCases: string[];
  strangerChecks: string[];
  prompts: { builder: string; prompt: string }[];
  firstWeek: { signal: string; stopIf: string; next: string };
};

export type StoredBlueprint = {
  sessionId: string;
  draftId: string;
  email: string | null;
  createdAt: string;
  pack: BlueprintPack;
  markdown: string;
};

const MAX = { problem: 1200, text: 600, list: 12 };

function text(value: unknown, max = MAX.text): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function list(value: unknown, max = MAX.list): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => text(item)).filter(Boolean).slice(0, max);
}

/** Validates what the studio sends before checkout. Returns null if unusable. */
export function parseDraftInput(input: unknown, id: string, now = new Date()): BlueprintDraft | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const problem = text(raw.problem, MAX.problem);
  if (problem.length < 12) return null;
  const brief = (raw.brief && typeof raw.brief === "object" ? raw.brief : {}) as Record<string, unknown>;
  const solution = (raw.solution && typeof raw.solution === "object" ? raw.solution : {}) as Record<string, unknown>;
  const answers = Array.isArray(raw.answers)
    ? raw.answers
        .map((a) => (a && typeof a === "object" ? (a as Record<string, unknown>) : {}))
        .map((a) => ({ question: text(a.question, 200), answer: text(a.answer) }))
        .filter((a) => a.question && a.answer)
        .slice(0, 10)
    : [];
  return {
    id,
    createdAt: now.toISOString(),
    problem,
    answers,
    brief: {
      summary: text(brief.summary) || problem,
      affectedUsers: list(brief.affectedUsers, 6),
      currentWorkaround: text(brief.currentWorkaround),
      friction: text(brief.friction),
      desiredOutcome: text(brief.desiredOutcome),
    },
    solution: {
      title: text(solution.title, 80) || "Your solution",
      summary: text(solution.summary),
      howItWorks: text(solution.howItWorks),
      mvpFeatures: list(solution.mvpFeatures, 8),
      nonGoals: list(solution.nonGoals, 8),
      privacyNotes: text(solution.privacyNotes),
    },
  };
}

export const BLUEPRINT_SYSTEM = `You write build-ready blueprints for ManifestOS.studio.
A person described a real problem in plain language. Your job is to define what should exist to solve it, small enough to build this week, specific enough that an AI app builder (Lovable, Replit, Cursor, Claude Code, Microsoft Copilot) builds the right thing the first time.

Rules:
- Stay specific to THIS person's problem, their words, their people, their situation. Never write generic filler.
- Keep it small. The smallest useful version, not a platform. Cut anything that is not needed on day one and list it under shouldNotExist.
- Plain language a non-developer can read. No jargon unless a builder prompt needs it.
- If the honest answer is that part of this should not be software, say so inside shouldNotExist or firstWeek.next.
- No em dashes. Use commas, periods, or parentheses.
- Builder prompts must be complete and paste-ready: include the outcome, users, screens, data, boundaries, and acceptance checks. Each prompt 150 to 350 words.

Return ONLY a JSON object with exactly these keys:
{
 "title": string,
 "shouldExist": { "outcome": string, "forWhom": string, "worksWhen": string[3-5] },
 "shouldNotExist": string[3-6],
 "smallestVersion": [{ "feature": string, "doneWhen": string }] (3-6 items),
 "screens": [{ "name": string, "purpose": string, "steps": string[] }] (2-5 items),
 "remembers": [{ "item": string, "details": string, "whoSees": string }] (2-6 items),
 "boundaries": { "askBefore": string[], "never": string[], "privacy": string[] },
 "edgeCases": string[4-8],
 "strangerChecks": string[5-8] (things a first-time user with no setup must be able to do, written as checks),
 "prompts": [{ "builder": "Lovable" | "Replit" | "Cursor or Claude Code" | "Microsoft Copilot or any AI builder", "prompt": string }] (exactly 4, one per builder),
 "firstWeek": { "signal": string, "stopIf": string, "next": string }
}`;

export function blueprintUserPrompt(draft: BlueprintDraft): string {
  const answers = draft.answers.map((a) => `- ${a.question} ${a.answer}`).join("\n") || "- (none given)";
  return `Problem, in their words:
${draft.problem}

What they told us:
${answers}

Shared understanding so far:
- Summary: ${draft.brief.summary}
- Who it affects: ${draft.brief.affectedUsers.join(", ") || "not stated"}
- What happens today: ${draft.brief.currentWorkaround || "not stated"}
- Friction: ${draft.brief.friction || "not stated"}
- A useful fix looks like: ${draft.brief.desiredOutcome || "not stated"}

Direction they chose:
- ${draft.solution.title}: ${draft.solution.summary}
- How it might work: ${draft.solution.howItWorks || "not stated"}
- First features considered: ${draft.solution.mvpFeatures.join("; ") || "not stated"}
- Already out of scope: ${draft.solution.nonGoals.join("; ") || "not stated"}
- Privacy notes: ${draft.solution.privacyNotes || "not stated"}

Write the blueprint. Improve on the direction if the problem calls for something smaller or different, and say why in shouldExist.outcome.`;
}

function obj(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function objList(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(obj) : [];
}

const LONG = 2400;

/** Coerces model output into a complete pack, or throws if the core is missing. */
export function normalizePack(raw: unknown, draft: BlueprintDraft): BlueprintPack {
  const r = obj(raw);
  const exist = obj(r.shouldExist);
  const bounds = obj(r.boundaries);
  const week = obj(r.firstWeek);
  const pack: BlueprintPack = {
    title: text(r.title, 120) || draft.solution.title,
    shouldExist: {
      outcome: text(exist.outcome, 900),
      forWhom: text(exist.forWhom),
      worksWhen: list(exist.worksWhen, 6),
    },
    shouldNotExist: list(r.shouldNotExist, 8),
    smallestVersion: objList(r.smallestVersion)
      .map((f) => ({ feature: text(f.feature, 200), doneWhen: text(f.doneWhen) }))
      .filter((f) => f.feature)
      .slice(0, 8),
    screens: objList(r.screens)
      .map((s) => ({ name: text(s.name, 120), purpose: text(s.purpose), steps: list(s.steps, 10) }))
      .filter((s) => s.name)
      .slice(0, 6),
    remembers: objList(r.remembers)
      .map((m) => ({ item: text(m.item, 120), details: text(m.details), whoSees: text(m.whoSees, 200) }))
      .filter((m) => m.item)
      .slice(0, 8),
    boundaries: {
      askBefore: list(bounds.askBefore, 8),
      never: list(bounds.never, 8),
      privacy: list(bounds.privacy, 8),
    },
    edgeCases: list(r.edgeCases, 10),
    strangerChecks: list(r.strangerChecks, 10),
    prompts: objList(r.prompts)
      .map((p) => ({ builder: text(p.builder, 60), prompt: text(p.prompt, LONG) }))
      .filter((p) => p.builder && p.prompt)
      .slice(0, 4),
    firstWeek: {
      signal: text(week.signal),
      stopIf: text(week.stopIf),
      next: text(week.next),
    },
  };
  if (!pack.shouldExist.outcome || pack.smallestVersion.length < 2 || pack.prompts.length < 2 || pack.screens.length < 1) {
    throw new Error("Blueprint came back incomplete.");
  }
  return pack;
}

function bullets(items: string[]): string {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- (none)";
}

export function packToMarkdown(pack: BlueprintPack, problem: string): string {
  const parts = [
    `# ${pack.title}`,
    `_Build-Ready Blueprint from ManifestOS.studio_`,
    `**The problem, in your words:** ${problem}`,
    `## 1. What should exist`,
    pack.shouldExist.outcome,
    `**For:** ${pack.shouldExist.forWhom}`,
    `**It works when:**\n${bullets(pack.shouldExist.worksWhen)}`,
    `## 2. What should not exist yet`,
    bullets(pack.shouldNotExist),
    `## 3. The smallest useful version`,
    pack.smallestVersion.map((f) => `- **${f.feature}.** Done when: ${f.doneWhen}`).join("\n"),
    `## 4. Screens and steps`,
    pack.screens.map((s) => `### ${s.name}\n${s.purpose}\n\n${s.steps.map((step, i) => `${i + 1}. ${step}`).join("\n")}`).join("\n\n"),
    `## 5. What it remembers`,
    pack.remembers.map((m) => `- **${m.item}:** ${m.details} (Seen by: ${m.whoSees})`).join("\n"),
    `## 6. Boundaries`,
    `**Ask before:**\n${bullets(pack.boundaries.askBefore)}`,
    `**Never:**\n${bullets(pack.boundaries.never)}`,
    `**Privacy:**\n${bullets(pack.boundaries.privacy)}`,
    `## 7. Edge cases`,
    bullets(pack.edgeCases),
    `## 8. Stranger checks`,
    `A first-time person with no setup must be able to:`,
    pack.strangerChecks.map((c) => `- [ ] ${c}`).join("\n"),
    `## 9. Paste-ready build prompts`,
    pack.prompts.map((p) => `### ${p.builder}\n\n\`\`\`\n${p.prompt}\n\`\`\``).join("\n\n"),
    `## 10. First week`,
    `**Signal it is working:** ${pack.firstWeek.signal}`,
    `**Stop if:** ${pack.firstWeek.stopIf}`,
    `**Then:** ${pack.firstWeek.next}`,
    `---\nWhen it is built, check it the way a stranger meets it: https://apphole.pro`,
  ];
  return parts.join("\n\n");
}
