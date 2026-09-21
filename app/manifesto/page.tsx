import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter, SiteHeader, ProblemCapture } from '@/components/site-chrome';
import { CTA_LABEL } from '@/lib/copy';
import { MANIFESTO_BLOCKS } from '@/lib/manifesto';

export const metadata: Metadata = {
  title: 'Manifesto',
  description: 'Everyone sees problems. Everyone should be able to solve them.',
};

export default function ManifestoPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-5 py-6 md:px-8 md:py-10">
        <SiteHeader compact />
        <article className="space-y-6 pb-8">
          {MANIFESTO_BLOCKS.map((block, index) => {
            if (block.type === 'h1') {
              return (
                <h1 key={index} className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-pearl sm:text-5xl">
                  {block.text}
                </h1>
              );
            }
            if (block.type === 'h2') {
              return (
                <h2 key={index} className="pt-6 text-2xl font-semibold leading-snug text-pearl sm:text-3xl">
                  {block.text}
                </h2>
              );
            }
            if (block.type === 'h3') {
              return (
                <h3 key={index} className="text-xl font-semibold text-gold-bright">
                  {block.text}
                </h3>
              );
            }
            if (block.type === 'quote') {
              return (
                <blockquote key={index} className="border-l-2 border-[rgba(255,213,106,0.45)] pl-5 text-lg text-champagne">
                  {block.text}
                </blockquote>
              );
            }
            if (block.type === 'strong') {
              return (
                <p key={index} className="text-lg font-semibold text-pearl">
                  {block.text}
                </p>
              );
            }
            if (block.type === 'rule') {
              return <hr key={index} className="border-[rgba(232,176,32,0.16)]" />;
            }
            return (
              <p key={index} className="text-lg leading-relaxed text-champagne">
                {block.text}
              </p>
            );
          })}
        </article>
        <p className="pb-8 text-lg text-champagne">
          The commons is a family of solutions, not a catalog of apps.{' '}
          <Link href="/essay" className="text-gold-bright hover:text-pearl">
            One problem. A family of solutions.
          </Link>
        </p>
        <div className="panel p-6">
          <p className="gold-label mb-3">Invitation</p>
          <h2 className="text-2xl font-semibold text-pearl">{CTA_LABEL}</h2>
          <ProblemCapture />
          <Link href="/commons" className="mt-4 inline-block text-sm text-gold-bright">
            Or browse the Problem Commons
          </Link>
        </div>
        <SiteFooter />
      </div>
    </main>
  );
}
