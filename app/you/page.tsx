'use client';

import { useEffect, useState } from 'react';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { getLocalContribution, getNetworkStats } from '@/lib/commons-store';
import { NetworkStats } from '@/lib/domain';

export default function YouPage() {
  const [local, setLocal] = useState({ problemsSubmitted: 0, solutionsCreated: 0, adaptations: 0, problemsJoined: 0 });
  const [seed, setSeed] = useState<NetworkStats | null>(null);

  useEffect(() => {
    setLocal(getLocalContribution());
    setSeed(getNetworkStats());
  }, []);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-5 py-6 md:px-8 md:py-10">
        <SiteHeader />
        <p className="gold-label mb-3">Usefulness, not output</p>
        <h1 className="text-4xl font-semibold tracking-tight text-pearl">What you have made possible</h1>
        <p className="mt-4 text-lg text-champagne">
          These numbers live in this browser for the demo. They count problems and usefulness, not how many apps were generated.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Stat label="Problems submitted" value={local.problemsSubmitted} />
          <Stat label="Solutions created" value={local.solutionsCreated} />
          <Stat label="People using adaptations" value={local.adaptations} />
        </div>
        <p className="mt-4 text-sm text-champagne">
          You have also said &quot;I have this problem too&quot; on {local.problemsJoined} {local.problemsJoined === 1 ? 'page' : 'pages'}.
        </p>
        {seed && (
          <div className="panel-quiet mt-10 p-5">
            <p className="gold-label mb-3">Seeded commons (not a live network)</p>
            <p className="text-champagne">
              {seed.problemsSubmitted} seeded problems, {seed.solutionsCreated} seeded solutions, {seed.peopleUsingAdaptations} seeded uses.
              These are examples so the path can be walked. They are not thousands of real users.
            </p>
          </div>
        )}
        <SiteFooter />
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel p-5">
      <p className="text-4xl font-semibold text-gold-bright">{value}</p>
      <p className="mt-2 text-sm text-champagne">{label}</p>
    </div>
  );
}
