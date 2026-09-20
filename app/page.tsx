export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#080706] text-[#FFF8E7]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D89B22]/40 bg-[#12100C] text-xl text-[#FFD66B] shadow-glow">
              M
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-[#BEB6A3]">ManifestOS</div>
              <div className="text-lg font-semibold">Manifest Studio</div>
            </div>
          </div>
          <nav className="hidden gap-6 text-sm text-[#FFF8E7]/75 md:flex">
            <a href="#how-it-works">How it works</a>
            <a href="#library">Library</a>
            <a href="#pricing">Pricing</a>
          </nav>
        </header>

        <section className="grid items-center gap-8 py-12 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.32em] text-[#D89B22]">Problem-first software studio</p>
            <h1 className="max-w-xl text-5xl font-bold leading-tight tracking-tight text-[#FFF8E7] md:text-7xl">
              What problem do you wish software could solve?
            </h1>
            <p className="mt-6 max-w-xl text-lg text-[#BEB6A3]">
              You do not need an app idea. Tell us what should be easier. ManifestOS will help imagine the solution, plan it properly, and build it.
            </p>

            <div className="mt-8 rounded-3xl border border-[#D89B22]/20 bg-[#12100C]/80 p-4 shadow-glow">
              <textarea
                aria-label="Problem description"
                className="h-36 w-full resize-none bg-transparent text-base text-[#FFF8E7] outline-none placeholder:text-[#BEB6A3]"
                placeholder="My dad sometimes forgets whether he already fed the dog, and multiple family members may visit during the day."
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="/studio"
                className="inline-flex items-center justify-center rounded-full border border-[#D89B22]/30 bg-[#D89B22] px-6 py-3 font-medium text-[#080706] transition hover:bg-[#F2C14E]"
              >
                Manifest a solution
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-full border border-[#D89B22]/20 px-6 py-3 font-medium text-[#FFF8E7] transition hover:border-[#D89B22]/40"
              >
                Show me how it works
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#D89B22]/20 bg-gradient-to-br from-[#12100C] to-[#0D0C09] p-6">
            <div className="mb-5 flex items-center justify-between text-sm text-[#BEB6A3]">
              <span>Studio snapshot</span>
              <span className="rounded-full border border-[#D89B22]/20 px-2 py-1 text-xs uppercase tracking-[0.2em] text-[#FFD66B]">
                Demo mode
              </span>
            </div>

            <div className="space-y-4">
              {[
                ['Problem', 'A recurring household frustration'],
                ['Understand', 'Ask 1-3 clarifying questions'],
                ['Envision', 'Choose the right solution path'],
                ['Blueprint', 'Create the plan before code'],
                ['Build', 'Generate the app and preview it'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border border-[#D89B22]/10 bg-[#080706]/70 p-3">
                  <span className="text-[#FFF8E7]">{label}</span>
                  <span className="text-sm text-[#BEB6A3]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="grid gap-6 py-16 md:grid-cols-3">
          {[
            ['1. Describe the problem', 'Just explain something that should be easier, clearer, or less frustrating.'],
            ['2. Understand the real need', 'ManifestOS asks only the questions that materially change the solution.'],
            ['3. Build the working app', 'Blueprint first, then preview, then refinements with coherent planning.'],
          ].map(([title, copy]) => (
            <article key={title} className="rounded-3xl border border-[#D89B22]/15 bg-[#0D0C09] p-6">
              <div className="mb-4 h-10 w-10 rounded-full border border-[#F2C14E]/25 bg-[#12100C] text-center leading-10 text-[#FFD66B]">
                •
              </div>
              <h2 className="mb-3 text-xl font-semibold text-[#FFF8E7]">{title}</h2>
              <p className="text-[#BEB6A3]">{copy}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
