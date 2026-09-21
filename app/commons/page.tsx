import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { COMMONS_HONESTY } from '@/lib/copy';
import { SEEDED_PROBLEMS, SEEDED_SOLUTIONS } from '@/lib/commons';

export const metadata: Metadata = {
  title: 'The Problem Commons',
  description: 'A shared map of problems and the solutions people made for them.',
};

export default function CommonsPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-5 py-6 md:px-8 md:py-10">
        <SiteHeader />
        <p className="gold-label mb-3">The Problem Commons</p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-pearl">
          A shared map of problems, not an app store.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-champagne">{COMMONS_HONESTY}</p>
        <Link href="/essay" className="mt-5 inline-block text-sm text-gold-bright hover:text-pearl">
          One problem. A family of solutions.
        </Link>

        <div className="mt-10 grid gap-4">
          {SEEDED_PROBLEMS.map((problem) => {
            const solutions = SEEDED_SOLUTIONS.filter((solution) => solution.problemId === problem.id);
            return (
              <a
                key={problem.slug}
                href={`/problems/${problem.slug}`}
                className="panel p-6 hover:border-[rgba(255,213,106,0.35)]"
              >
                <p className="text-xl font-medium text-pearl">{problem.statement}</p>
                <p className="mt-3 text-sm text-champagne">
                  {problem.peopleWithThisProblem} people in this seeded commons have this problem too.
                  {solutions.length > 0 ? ` ${solutions.length} solution${solutions.length === 1 ? '' : 's'} nearby.` : ' No solution yet.'}
                </p>
              </a>
            );
          })}
        </div>
        <SiteFooter />
      </div>
    </main>
  );
}
