import { BrandMark } from '@/components/brand-mark';
import { SiteFooter, SiteHeader, ProblemCapture } from '@/components/site-chrome';
import { CAMPAIGN_FOLLOW, CAMPAIGN_LINE, DEFAULT_PROBLEM, FRAME, ONE_LINER } from '@/lib/copy';
import { SEEDED_PROBLEMS } from '@/lib/commons';

const journey = [
  ['Problem', 'Something that should work better becomes a public page'],
  ['Understand', 'A shared picture of who it hurts and what would help'],
  ['Existing solutions', 'Search the commons before making another tool'],
  ['Smallest useful', 'Use one, adapt one, create something different, or skip software'],
  ['Plan', 'Hidden rigor. You can look, or just continue'],
  ['Software', 'Only if software is actually useful'],
  ['Adapt', 'Make this solve someone else\'s version'],
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-5 py-6 md:px-8 md:py-10">
        <SiteHeader />

        <section data-track-section="hero" className="grid items-center gap-10 py-6 md:grid-cols-[1.15fr_0.85fr] md:py-10">
          <div>
            <p className="gold-label mb-4">A problem-solving network</p>
            <h1 className="max-w-xl text-[2rem] font-semibold leading-[1.12] tracking-tight text-pearl sm:text-5xl md:text-6xl">
              {CAMPAIGN_LINE}
            </h1>
            <p className="mt-4 text-2xl text-gold-bright">{CAMPAIGN_FOLLOW}</p>
            <p className="mt-6 max-w-xl text-lg text-champagne">{ONE_LINER}</p>
            <p className="mt-4 max-w-xl text-sm text-champagne">{FRAME}</p>
            <ProblemCapture defaultProblem={DEFAULT_PROBLEM} />
          </div>

          <div className="relative">
            <div className="orbit-frame mx-auto">
              <div className="orbit-frame__ring" aria-hidden="true">
                <div className="orbit-frame__spin" />
              </div>
              <div className="orbit-frame__ring orbit-frame__ring--slow" aria-hidden="true">
                <div className="orbit-frame__spin" />
              </div>
              <BrandMark size="hero" priority linked={false} />
            </div>
            <div className="panel relative mt-4 p-5">
              <div className="mb-4 flex items-center justify-between text-sm text-champagne">
                <span>How a problem travels</span>
                <span className="chip">Demo commons</span>
              </div>
              <div className="space-y-2">
                {journey.slice(0, 5).map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 rounded-2xl border border-[rgba(232,176,32,0.1)] bg-void/70 px-3 py-2.5">
                    <span className="text-pearl">{label}</span>
                    <span className="text-right text-xs text-champagne sm:text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" data-track-section="how-it-works" className="py-16">
          <p className="gold-label mb-3">How it works</p>
          <h2 className="mb-8 text-3xl font-semibold text-pearl">
            Problem, shared understanding, existing solutions, then maybe software.
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {journey.map(([title, copy], index) => (
              <article key={title} className="panel-quiet p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,213,106,0.28)] bg-panel text-gold-bright">
                  {index + 1}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-pearl">{title}</h3>
                <p className="text-sm text-champagne">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="commons" data-track-section="commons" className="py-10">
          <p className="gold-label mb-3">The Problem Commons</p>
          <h2 className="mb-4 text-3xl font-semibold text-pearl">Problems are first-class. Not app ideas.</h2>
          <p className="mb-8 max-w-2xl text-champagne">
            A ManifestOS page begins as a lived problem. Other people can say they have it too. These are seeded examples so you can walk the path. They are not a fake crowd.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {SEEDED_PROBLEMS.map((problem) => (
              <a
                key={problem.slug}
                href={`/problems/${problem.slug}`}
                className="panel-quiet p-5 text-left text-champagne hover:border-[rgba(255,213,106,0.35)] hover:text-pearl"
              >
                <p className="text-pearl">{problem.statement}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-gold-primary">
                  {problem.peopleWithThisProblem} in the seeded commons
                </p>
              </a>
            ))}
          </div>
        </section>

        <section id="pricing" data-track-section="boost" className="py-16">
          <div className="panel p-8 md:p-10">
            <p className="gold-label mb-3">Free to solve</p>
            <h2 className="max-w-xl text-3xl font-semibold text-pearl">
              Describe a problem, create an ordinary solution, use it, share it, adapt it. Free.
            </h2>
            <p className="mt-4 max-w-2xl text-champagne">
              We do not ask for a credit card to begin. We also do not promise unlimited compute forever. If a solution needs help traveling, that is Manifest Boost, later, and optional.
            </p>
            <a href="/boost" className="btn-ghost mt-8 inline-flex">
              How Manifest Boost might work
            </a>
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
