"use client";

import { useEffect, useRef, useState } from "react";
import { WaitlistForm } from "@/components/waitlist-form";
import { trackActivity } from "@/lib/activity-client";
import { BLUEPRINT_CONTENTS, SUPPORT_EMAIL } from "@/lib/copy";

export type BlueprintOfferInput = {
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

type Config = { ready: boolean; name: string; price: string };

export function BlueprintOffer({ input, placement }: { input: BlueprintOfferInput; placement: string }) {
  const [config, setConfig] = useState<Config | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const seen = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/blueprint/config", { cache: "no-store" })
      .then((res) => res.json())
      .then((body: Config) => {
        if (!cancelled) setConfig(body);
      })
      .catch(() => {
        if (!cancelled) setConfig({ ready: false, name: "Build-Ready Blueprint", price: "$29" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!config || seen.current) return;
    seen.current = true;
    trackActivity("blueprint_offer_view", { placement, open: config.ready });
  }, [config, placement]);

  async function buy() {
    setBusy(true);
    setError("");
    trackActivity("blueprint_checkout_click", { placement });
    try {
      const res = await fetch("/api/blueprint/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = (await res.json()) as { url?: string; error?: string; waitlist?: boolean };
      if (body.waitlist) {
        setConfig((prev) => (prev ? { ...prev, ready: false } : prev));
        setBusy(false);
        return;
      }
      if (!res.ok || !body.url) throw new Error(body.error || "Checkout could not start.");
      window.location.assign(body.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout could not start.");
      setBusy(false);
    }
  }

  const price = config?.price || "$29";

  return (
    <section className="panel p-6" aria-labelledby={`blueprint-offer-${placement}`}>
      <p className="gold-label">Optional · {price} once</p>
      <h3 id={`blueprint-offer-${placement}`} className="mt-3 text-2xl font-semibold text-pearl">
        Take this to any AI builder. Get the right thing the first time.
      </h3>
      <p className="mt-3 text-champagne">
        Everything above is free and stays free. The Build-Ready Blueprint is written for your exact problem, so the tool you
        build with makes what should exist, and nothing it should not.
      </p>
      <ul className="mt-5 grid gap-2 text-sm text-pearl sm:grid-cols-2">
        {BLUEPRINT_CONTENTS.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden className="text-gold-bright">✦</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 space-y-3">
        {config === null ? (
          <p className="text-sm text-champagne">Checking...</p>
        ) : config.ready ? (
          <>
            <button type="button" onClick={buy} disabled={busy} className="btn-gold w-full sm:w-auto disabled:opacity-60">
              {busy ? "Opening checkout..." : `Get my Build-Ready Blueprint, ${price}`}
            </button>
            <p className="text-xs text-champagne">
              {price} once, for this problem. No subscription. Written about a minute after checkout, yours to download. If
              your builder cannot start from it, email {SUPPORT_EMAIL} within 14 days for a full refund.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-pearl">Blueprints open soon. Leave an email and we will send yours first.</p>
            <WaitlistForm
              kind="blueprint"
              context={input.problem}
              cta="Save my spot"
              done="Saved. You will hear from us when Blueprints open."
            />
          </>
        )}
        {error ? <p className="text-sm text-champagne">{error}</p> : null}
      </div>
    </section>
  );
}
