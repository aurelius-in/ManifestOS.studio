"use client";

import { useState } from "react";
import Link from "next/link";
import { CTA_LABEL } from "@/lib/copy";
import { trackActivity } from "@/lib/activity-client";

export function TrackedProblemForm({
  defaultProblem,
  action = "/problems/new",
}: {
  defaultProblem?: string;
  action?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <form
      id="tell-us"
      action={action}
      method="get"
      className="mt-8"
      onSubmit={() => trackActivity("problem_submitted")}
    >
      <div className="panel p-4 shadow-glow-strong">
        <textarea
          name="problem"
          aria-label={CTA_LABEL}
          defaultValue={defaultProblem}
          className="h-36 w-full resize-none bg-transparent text-base text-pearl outline-none placeholder:text-champagne"
          placeholder="Describe something that should work better."
          onFocus={() => {
            if (focused) return;
            setFocused(true);
            trackActivity("problem_focused");
          }}
        />
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="submit" className="btn-gold">
          {CTA_LABEL}
        </button>
        <Link href="/manifesto" className="btn-ghost">
          Read the manifesto
        </Link>
      </div>
    </form>
  );
}
