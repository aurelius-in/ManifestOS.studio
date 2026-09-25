import Link from 'next/link';
import { BrandMark } from '@/components/brand-mark';
import { TrackedProblemForm } from '@/components/tracked-problem-form';
import { CAMPAIGN_FOLLOW, CAMPAIGN_LINE, CTA_LABEL, ONE_LINER } from '@/lib/copy';

const nav = [
  { href: '/manifesto', label: 'Manifesto' },
  { href: '/commons', label: 'Commons' },
  { href: '/boost', label: 'Boost' },
  { href: '/you', label: 'You' },
] as const;

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="relative z-20 mb-10 flex items-center justify-between gap-3">
      <BrandMark size={compact ? 'compact' : 'nav'} priority />
      <nav className="hidden items-center gap-6 text-sm text-pearl/75 md:flex">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="hover:text-pearl">
            {item.label}
          </Link>
        ))}
        <a href="/#tell-us" className="btn-gold !px-5 !py-2 text-sm">
          {CTA_LABEL}
        </a>
      </nav>
      <a href="/#tell-us" className="btn-gold shrink-0 !px-4 !py-2 text-sm md:hidden">
        Tell us
      </a>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[rgba(232,176,32,0.12)] pt-8 pb-4">
      <p className="max-w-3xl text-sm text-champagne">{ONE_LINER}</p>
      <p className="mt-4 text-pearl">{CAMPAIGN_LINE}</p>
      <p className="text-champagne">{CAMPAIGN_FOLLOW}</p>
      <div className="mt-6 flex flex-wrap gap-4 text-sm text-pearl/75">
        <Link href="/manifesto" className="hover:text-pearl">Manifesto</Link>
        <Link href="/commons" className="hover:text-pearl">The Problem Commons</Link>
        <Link href="/essay" className="hover:text-pearl">One problem, a family of solutions</Link>
        <Link href="/boost" className="hover:text-pearl">Manifest Boost</Link>
        <Link href="/you" className="hover:text-pearl">You</Link>
        <Link href="/studio" className="hover:text-pearl">Studio</Link>
      </div>
      <a href="/#tell-us" className="btn-gold mt-6 inline-flex">
        {CTA_LABEL}
      </a>
    </footer>
  );
}

export function ProblemCapture({
  defaultProblem,
  action = '/problems/new',
}: {
  defaultProblem?: string;
  action?: string;
}) {
  return <TrackedProblemForm defaultProblem={defaultProblem} action={action} />;
}
