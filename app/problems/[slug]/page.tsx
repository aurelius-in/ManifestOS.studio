'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { trackActivity } from '@/lib/activity-client';
import { COMMONS_HONESTY } from '@/lib/copy';
import { commonsSolutionToProposal, getSeedProblemBySlug, makeProblemRecord, solutionsForProblem } from '@/lib/commons';
import {
  getProblemBySlug,
  hasMarkedProblem,
  markHaveThisProblem,
  rememberSubmittedProblem,
} from '@/lib/commons-store';
import { CommonsProblem } from '@/lib/domain';

export default function ProblemPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = params.slug;
  const queryStatement = searchParams.get('q')?.trim() || '';

  const [problem, setProblem] = useState<CommonsProblem | null>(() => getSeedProblemBySlug(slug) || null);
  const [saidToo, setSaidToo] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fromQuery = queryStatement ? makeProblemRecord(queryStatement) : null;
    const resolved =
      getProblemBySlug(slug) ||
      getSeedProblemBySlug(slug) ||
      fromQuery;
    if (!resolved) return;
    const record = fromQuery && !getSeedProblemBySlug(slug) ? rememberSubmittedProblem(queryStatement || resolved.statement) : resolved;
    setProblem(getProblemBySlug(record.slug) || record);
    setSaidToo(hasMarkedProblem(record.slug));
  }, [slug, queryStatement]);

  const solutions = useMemo(() => (problem ? solutionsForProblem(problem) : []), [problem]);

  if (!problem) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-3xl px-5 py-6 md:px-8 md:py-10">
          <SiteHeader compact />
          <h1 className="text-3xl font-semibold text-pearl">We could not find that problem.</h1>
          <p className="mt-4 text-champagne">Describe it again and it will get a page.</p>
          <a href="/#tell-us" className="btn-gold mt-6 inline-flex">Tell us something that should work better.</a>
          <SiteFooter />
        </div>
      </main>
    );
  }

  const studioHref = `/studio?problem=${encodeURIComponent(problem.statement)}&from=${encodeURIComponent(problem.slug)}`;

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-5 py-6 md:px-8 md:py-10">
        <SiteHeader compact />
        <p className="gold-label mb-3">The Problem Commons</p>
        <p className="text-sm text-champagne">A problem, not a project name.</p>
        <h1 className="mt-3 text-3xl font-semibold leading-snug tracking-tight text-pearl sm:text-4xl">
          {problem.statement}
        </h1>
        <p className="mt-4 text-champagne">{problem.summary}</p>
        <p className="mt-6 text-champagne">
          {problem.peopleWithThisProblem} {problem.peopleWithThisProblem === 1 ? 'person has' : 'people have'} this problem too.
          These counts are the seeded commons plus taps in this browser.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className={saidToo ? 'btn-ghost' : 'btn-gold'}
            disabled={saidToo}
            onClick={() => {
              markHaveThisProblem(problem.slug);
              trackActivity('problem_joined', { slug: problem.slug });
              const next = getProblemBySlug(problem.slug);
              if (next) setProblem(next);
              setSaidToo(true);
            }}
          >
            {saidToo ? 'You have this problem too' : 'I have this problem too'}
          </button>
          <a href={studioHref} className="btn-ghost" onClick={() => trackActivity('studio_open', { from: 'problem' })}>
            Help solve this
          </a>
          <button
            type="button"
            className="btn-ghost"
            onClick={async () => {
              await navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? 'Link copied' : 'Copy problem link'}
          </button>
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-pearl">Solutions already nearby</h2>
          {solutions.length === 0 ? (
            <p className="mt-4 text-champagne">
              Nobody in this small commons has published a solution yet. That is expected. You can still look for the smallest useful fix.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {solutions.map((solution) => {
                const proposal = commonsSolutionToProposal(solution);
                return (
                  <article key={solution.id} className="panel-quiet p-5">
                    <p className="gold-label">{proposal.requiresSoftware ? 'Software nearby' : 'Not software'}</p>
                    <h3 className="mt-2 text-xl font-semibold text-pearl">{solution.title}</h3>
                    <p className="mt-2 text-champagne">{solution.summary}</p>
                    <p className="mt-2 text-sm text-pearl/80">{solution.howItHelps}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-gold-primary">
                      {solution.peopleUsing} using this seeded example
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <a
                        href={`/studio?problem=${encodeURIComponent(problem.statement)}&from=${problem.slug}&use=${solution.id}`}
                        className="btn-ghost !px-4 !py-2 text-sm"
                      >
                        Use one
                      </a>
                      <a
                        href={`/studio?problem=${encodeURIComponent(problem.statement)}&from=${problem.slug}&adapt=${solution.id}`}
                        className="btn-gold !px-4 !py-2 text-sm"
                      >
                        Make this solve my version
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <p className="mt-10 text-sm text-champagne">{COMMONS_HONESTY}</p>
        <SiteFooter />
      </div>
    </main>
  );
}
