import type { Metadata } from 'next';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';

export const metadata: Metadata = {
  title: 'Manifest Boost',
  description: 'Optional help for a solution that is ready to travel.',
};

export default function BoostPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-5 py-6 md:px-8 md:py-10">
        <SiteHeader />
        <p className="gold-label mb-3">Later, optional</p>
        <h1 className="text-4xl font-semibold tracking-tight text-pearl">Manifest Boost</h1>
        <p className="mt-6 text-lg text-champagne">
          Creating and using ordinary ManifestOS solutions is free. We do not charge admission to describe a problem, make a small solution, use it, share it, or adapt a public one.
        </p>
        <p className="mt-4 text-lg text-champagne">
          We also do not promise unlimited AI generation and hosting forever. Fair-use limits can exist without betraying the philosophy.
        </p>
        <div className="panel mt-10 p-6">
          <h2 className="text-2xl font-semibold text-pearl">Where money can show up</h2>
          <p className="mt-3 text-champagne">
            If you create something other people need, and you want help getting it into more hands, Manifest Boost is the paid layer. Think audience discovery, a landing page, positioning, distribution, and packaging. Not a tax on having a problem.
          </p>
          <p className="mt-4 text-pearl">
            We do not make money because you had a problem. We do not make money because you needed software. We make money if you decide you want help getting your solution into more people&apos;s hands.
          </p>
        </div>
        <p className="mt-8 text-sm text-champagne">
          Boost is a note about incentives, not a live ads engine yet.
        </p>
        <SiteFooter />
      </div>
    </main>
  );
}
