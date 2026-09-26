"use client";

import { FormEvent, useState } from "react";
import { trackActivity } from "@/lib/activity-client";

export function WaitlistForm({
  kind,
  context = "",
  cta,
  done,
}: {
  kind: "blueprint" | "keep" | "problem";
  context?: string;
  cta: string;
  done: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setState("saving");
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, kind, context }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error || "Could not save that.");
      trackActivity("waitlist_join", { kind });
      setState("saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that.");
      setState("error");
    }
  }

  if (state === "saved") {
    return <p className="text-sm text-gold-bright">{done}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
      <label className="sr-only" htmlFor={`waitlist-${kind}`}>
        Email
      </label>
      <input
        id={`waitlist-${kind}`}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-full border border-[rgba(232,176,32,0.25)] bg-void px-4 py-2.5 text-sm text-pearl outline-none placeholder:text-champagne/60 focus:border-gold-primary"
      />
      <button type="submit" disabled={state === "saving"} className="btn-gold shrink-0 !px-5 !py-2.5 text-sm disabled:opacity-60">
        {state === "saving" ? "Saving..." : cta}
      </button>
      {error ? <p className="text-sm text-champagne sm:self-center">{error}</p> : null}
    </form>
  );
}
