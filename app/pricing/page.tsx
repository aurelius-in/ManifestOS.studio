import type { Metadata } from 'next';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { WaitlistForm } from '@/components/waitlist-form';
import { BLUEPRINT_CONTENTS, SUPPORT_EMAIL } from '@/lib/copy';
import { BLUEPRINT_PRICE_LABEL, KEEP_PLANNED_LABEL } from '@/lib/paid-config';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Solving is free. Pay once for a Build-Ready Blueprint when you want to build it with any AI builder.',
};

const FREE = [
  'Describe a problem and give it a public page',
  'Say "I have this problem too" on anyone else\'s',
  'A shared picture of who it hurts and what would help',
  'Search the commons before making another tool',
  'Pick the smallest useful fix, including no software at all',
  'See the plan in ordinary language and make a working preview',
  'Adapt what someone else already made',
];

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-5 py-6 md:px-8 md:py-10">
        <SiteHeader />
        <p className="gold-label mb-3">Pricing</p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-pearl">
          Figuring out what should exist is free. Pay only when you are ready to build it.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-champagne">
          We do not charge admission to describe a problem, understand it, or find the smallest useful fix. Money shows up at
          one moment: when you want to hand the answer to a builder and have it built right the first time.
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <section className="panel-quiet flex flex-col p-6">
            <p className="gold-label">Free, always</p>
            <h2 className="mt-3 text-2xl font-semibold text-pearl">Solve</h2>
            <p className="mt-1 text-3xl font-semibold text-gold-bright">$0</p>
            <ul className="mt-5 space-y-2 text-sm text-pearl/90">
              {FREE.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="text-gold-bright">✦</span>
                  {item}
                </li>
              ))}
            </ul>
            <a href="/#tell-us" className="btn-ghost mt-auto pt-6 text-center">
              Tell us something that should work better
            </a>
          </section>

          <section className="panel flex flex-col p-6 shadow-glow">
            <p className="gold-label">Pay once, per problem</p>
            <h2 className="mt-3 text-2xl font-semibold text-pearl">Build-Ready Blueprint</h2>
            <p className="mt-1 text-3xl font-semibold text-gold-bright">{BLUEPRINT_PRICE_LABEL}</p>
            <p className="mt-2 text-sm text-champagne">
              A spec written for your exact problem, so Lovable, Replit, Cursor, Claude Code, or Copilot builds what should
              exist and nothing it should not.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-pearl/90">
              {BLUEPRINT_CONTENTS.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="text-gold-bright">✦</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-champagne">
              No subscription. If your builder cannot start from it, email {SUPPORT_EMAIL} within 14 days for a full refund.
            </p>
            <a href="/studio" className="btn-gold mt-auto pt-6 text-center">
              Start in the studio
            </a>
          </section>

          <section className="panel-quiet flex flex-col p-6">
            <p className="gold-label">Not charging yet</p>
            <h2 className="mt-3 text-2xl font-semibold text-pearl">Manifest Keep</h2>
            <p className="mt-1 text-3xl font-semibold text-gold-bright">
              {KEEP_PLANNED_LABEL}
              <span className="ml-2 align-middle text-xs font-normal text-champagne">planned</span>
            </p>
            <p className="mt-2 text-sm text-champagne">
              For a solution you use every day: keep it running privately, remember its history, and update the Blueprint
              when your situation changes.
            </p>
            <p className="mt-4 text-sm text-pearl/90">
              We are building this only if enough people want it. Join the list and you will be first, at the first-list price.
            </p>
            <div className="mt-auto pt-6">
              <WaitlistForm kind="keep" cta="I want this" done="You are on the list. Thank you, this is how we decide what to build." />
            </div>
          </section>
        </div>

        <section className="mt-12 panel-quiet p-6">
          <h2 className="text-xl font-semibold text-pearl">Need people to find it, too?</h2>
          <p className="mt-2 text-champagne">
            ManifestOS helps you figure out what should exist. When the thing works and you need to know who will pay for it,
            that is a different job. <a href="https://makeitrainapp.com" className="text-gold-bright hover:underline">Make it RAIN</a>{' '}
            does that part.
          </p>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
