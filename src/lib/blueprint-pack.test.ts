import { describe, expect, it } from "vitest";
import { normalizePack, packToMarkdown, parseDraftInput } from "./blueprint-pack";

const input = {
  problem: "We keep losing track of which customer approved which proof, and reprint jobs cost us money.",
  answers: [{ question: "Who deals with this?", answer: "The two people at the front counter" }],
  brief: { summary: "Approvals live in texts", affectedUsers: ["Front counter"], currentWorkaround: "Texts", friction: "Lost approvals", desiredOutcome: "One list" },
  solution: { title: "Approval log", summary: "A shared log", howItWorks: "Mark approved", mvpFeatures: ["Log", "Search"], nonGoals: ["Billing"], privacyNotes: "Customer names only" },
};

const good = {
  title: "Proof approval log",
  shouldExist: { outcome: "One shared list of proofs and who approved them.", forWhom: "Front counter staff", worksWhen: ["Anyone can find an approval in 10 seconds"] },
  shouldNotExist: ["Billing"],
  smallestVersion: [
    { feature: "Record an approval", doneWhen: "Saved with customer, proof, time" },
    { feature: "Search approvals", doneWhen: "Finds by customer name" },
  ],
  screens: [{ name: "Approvals", purpose: "See and add", steps: ["Open", "Add"] }],
  remembers: [{ item: "Approval", details: "customer, proof, time", whoSees: "Staff" }],
  boundaries: { askBefore: ["Deleting"], never: ["Emailing customers"], privacy: ["Names only"] },
  edgeCases: ["Two approvals for one proof"],
  strangerChecks: ["Add an approval with no setup"],
  prompts: [
    { builder: "Lovable", prompt: "Build an approval log..." },
    { builder: "Replit", prompt: "Build an approval log..." },
  ],
  firstWeek: { signal: "Staff stop texting", stopIf: "Nobody logs one", next: "Add reminders" },
};

describe("blueprint pack", () => {
  it("rejects a problem that is too short and keeps a real one", () => {
    expect(parseDraftInput({ problem: "help" }, "d1")).toBeNull();
    const draft = parseDraftInput(input, "d2");
    expect(draft?.solution.title).toBe("Approval log");
    expect(draft?.answers).toHaveLength(1);
  });

  it("throws on an incomplete model reply and renders a complete one", () => {
    const draft = parseDraftInput(input, "d3")!;
    expect(() => normalizePack({ title: "x" }, draft)).toThrow();
    const pack = normalizePack(good, draft);
    const md = packToMarkdown(pack, draft.problem);
    expect(md).toContain("## 1. What should exist");
    expect(md).toContain("- [ ] Add an approval with no setup");
    expect(md).toContain("### Lovable");
    expect(md).not.toContain("\u2014");
  });
});
