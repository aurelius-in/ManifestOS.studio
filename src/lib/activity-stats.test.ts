import { describe, expect, it } from "vitest";
import { buildActivityStats, sanitizeActivity, type ActivityEvent } from "./activity-stats";

function event(partial: Partial<ActivityEvent> & Pick<ActivityEvent, "name" | "sessionId">): ActivityEvent {
  return {
    id: partial.name + partial.sessionId,
    ts: "2026-09-25T18:00:00.000Z",
    visitorId: partial.sessionId,
    path: partial.path || "/",
    referrer: "",
    source: "direct",
    medium: "",
    campaign: "",
    dwellMs: partial.dwellMs || 0,
    props: partial.props || {},
    name: partial.name,
    sessionId: partial.sessionId,
  };
}

describe("manifest activity", () => {
  it("stops a reader before the studio and ignores signup fields", () => {
    const clean = sanitizeActivity({
      name: "problem_submitted",
      visitorId: "v",
      sessionId: "s",
      path: "/problems/dad-dog?q=secret",
      props: { email: "nope", stage: "problem" },
    });
    expect(clean?.path).toBe("/problems/:slug");
    expect(clean?.props.email).toBeUndefined();

    const stats = buildActivityStats(
      [
        event({ name: "page_view", sessionId: "s1", path: "/" }),
        event({ name: "section_seen", sessionId: "s1", props: { section: "how-it-works" } }),
        event({ name: "page_dwell", sessionId: "s1", path: "/", dwellMs: 40000 }),
        event({ name: "page_view", sessionId: "s2", path: "/studio" }),
        event({ name: "studio_stage", sessionId: "s2", path: "/studio", props: { stage: "problem" } }),
        event({ name: "studio_stage", sessionId: "s2", path: "/studio", props: { stage: "discovery" } }),
        event({ name: "studio_stage_leave", sessionId: "s2", path: "/studio", props: { stage: "discovery" }, dwellMs: 15000 }),
      ],
      "all",
      Date.parse("2026-09-25T20:00:00.000Z"),
    );
    expect(stats.sessions).toBe(2);
    expect(stats.commitment.studioOpened).toBe(1);
    expect(stats.commitment.problemSubmitted).toBe(0);
    expect(stats.signups.started).toBe(0);
    expect(stats.stages.find((row) => row.stage === "discovery")?.medianDwellLabel).toBe("15s");
    expect(stats.pages.find((row) => row.path === "/")?.medianDwellLabel).toBe("40s");
  });
});
