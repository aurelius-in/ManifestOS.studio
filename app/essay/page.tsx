import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteFooter, SiteHeader, ProblemCapture } from '@/components/site-chrome';
import { CTA_LABEL } from '@/lib/copy';

export const metadata: Metadata = {
  title: 'One problem. A family of solutions.',
  description: 'The Problem Commons is a map of lived problems and the solutions that grow around them.',
};

export default function EssayPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-5 py-6 md:px-8 md:py-10">
        <SiteHeader compact />
        <p className="gold-label mb-3">Essay</p>
        <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-pearl sm:text-5xl">
          One problem. A family of solutions.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-champagne">
          A ManifestOS page starts as one lived difficulty. The commons is where that difficulty can meet a solution, then meet the next household whose life is almost the same, and not quite.
        </p>
      </div>

      <figure className="constellation-figure mx-auto max-w-5xl px-3 py-4 sm:px-5 md:px-8">
        <Image
          src="/assets/problem-commons.png"
          alt="A gold constellation: one problem, whether Dad's dog has been fed, becoming a shared feeding tracker that adapts for different households, then related classroom, team, and care problems."
          width={1167}
          height={1218}
          unoptimized
          className="constellation-figure-image mx-auto h-auto w-full bg-transparent object-contain"
          style={{ backgroundColor: 'transparent' }}
          priority
        />
        <figcaption className="mx-auto mt-4 max-w-3xl text-center text-sm text-champagne">
          Not one app for everyone. Related versions of the same problem can keep evolving.
        </figcaption>
      </figure>

      <div className="mx-auto max-w-3xl px-5 pb-8 md:px-8">
        <p className="mt-8 text-lg leading-relaxed text-champagne">
          A feeding tracker for one family can become a classroom hub, a small-team board, or a care calendar. Same dynamic. Different people. Software is only one of the ways a problem might get lighter.
        </p>
        <div className="panel mt-10 p-6">
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
