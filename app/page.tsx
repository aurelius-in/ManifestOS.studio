import Link from 'next/link';
import { BrandMark } from '@/components/brand-mark';

const defaultProblem = 'My dad sometimes forgets whether he already fed the dog, and multiple family members may visit during the day.';

const journey = [
  ['Problem', 'Say what should be easier'],
  ['Understand', 'Answer a few useful questions'],
  ['Problem Brief', 'Confirm we heard it right'],
  ['Envision', 'Pick a solution path'],
  ['Blueprint', 'Plan before code'],
  ['Build', 'Generate the app'],
  ['Preview', 'Try the working result'],
  ['Refine', 'Change what still feels off'],
];

const library = [
  'My dad sometimes forgets whether he already fed the dog, and multiple family members may visit during the day.',
  'We keep losing track of which customer approved what.',
  'My students need a simpler way to remember what goes back to which teacher.',
  'I want to know whether conditions are good for crabbing before I load the car.',
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-5 py-6 md:px-8 md:py-10">
        <header className="mb-10 flex items-center justify-between gap-3">
          <BrandMark size="nav" priority />
          <nav className="hidden items-center gap-6 text-sm text-pearl/75 md:flex">
            <a href="#how-it-works">How it works</a>
            <a href="#library">Library</a>
            <a href="#pricing">Pricing</a>
            <Link href="/studio" className="btn-gold !px-5 !py-2 text-sm">
              Open studio
            </Link>
          </nav>
          <Link href="/studio" className="btn-gold shrink-0 !px-4 !py-2 text-sm md:hidden">
            Studio
          </Link>
        </header>

        <section className="grid items-center gap-10 py-6 md:grid-cols-[1.15fr_0.85fr] md:py-10">
          <div>
            <p className="gold-label mb-4">Problem-first software studio</p>
            <h1 className="max-w-xl text-[2rem] font-semibold leading-[1.12] tracking-tight text-pearl sm:text-5xl md:text-6xl">
              What problem do you wish software could solve?
            </h1>
            <p className="mt-6 max-w-xl text-lg text-champagne">
              You do not need an app idea. Tell us what should be easier. ManifestOS will help imagine the solution, plan it properly, and build it.
            </p>

            <form action="/studio" method="get" className="mt-8">
              <div className="panel p-4 shadow-glow-strong">
                <textarea
                  name="problem"
                  aria-label="Problem description"
                  defaultValue={defaultProblem}
                  className="h-36 w-full resize-none bg-transparent text-base text-pearl outline-none placeholder:text-champagne"
                  placeholder="Describe something annoying, repetitive, confusing, difficult, or unnecessarily complicated."
                />
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button type="submit" className="btn-gold">
                  Manifest a solution
                </button>
                <a href="#how-it-works" className="btn-ghost">
                  Show me how it works
                </a>
              </div>
            </form>
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
            <div className="panel relative -mt-6 p-5">
              <div className="mb-4 flex items-center justify-between text-sm text-champagne">
                <span>Studio snapshot</span>
                <span className="chip">Demo mode</span>
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

        <section id="how-it-works" className="py-16">
          <p className="gold-label mb-3">How it works</p>
          <h2 className="mb-8 text-3xl font-semibold text-pearl">A guided path from a messy problem to a working preview.</h2>
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

        <section id="library" className="py-10">
          <p className="gold-label mb-3">Library</p>
          <h2 className="mb-8 text-3xl font-semibold text-pearl">Start from a problem people already recognize.</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {library.map((problem) => (
              <a
                key={problem}
                href={`/studio?problem=${encodeURIComponent(problem)}`}
                className="panel-quiet p-5 text-left text-champagne hover:border-[rgba(255,213,106,0.35)] hover:text-pearl"
              >
                {problem}
              </a>
            ))}
          </div>
        </section>

        <section id="pricing" className="py-16">
          <div className="panel p-8 md:p-10">
            <p className="gold-label mb-3">Pricing</p>
            <h2 className="max-w-xl text-3xl font-semibold text-pearl">The studio is in an open demo.</h2>
            <p className="mt-4 max-w-2xl text-champagne">
              Walk the full path, preview a working app, and refine it. Paid workspaces come later. For now, bring a real problem and see what ManifestOS makes of it.
            </p>
            <Link href="/studio" className="btn-gold mt-8 inline-flex">
              Open the studio
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
