"use client";

import { useMemo, useState } from 'react';
import { buildProblemBrief, buildDiscoveryStatusText, generateSampleDiscoveryAnswers } from '@/lib/demo-data';
import { demoSolutions, generateDiscoveryQuestions } from '@/lib/demo-data';
import { ProblemBrief, DiscoveryQuestion } from '@/lib/domain';

const defaultProblem = 'My dad sometimes forgets whether he already fed the dog, and multiple family members may visit during the day.';

export default function StudioPage({ searchParams }: { searchParams?: { problem?: string } }) {
  const initialProblem = searchParams?.problem?.trim() || defaultProblem;
  const [problem, setProblem] = useState(initialProblem);
  const [questions, setQuestions] = useState<DiscoveryQuestion[]>(() => generateDiscoveryQuestions(initialProblem));
  const [answers, setAnswers] = useState<Record<string, string>>(() => generateSampleDiscoveryAnswers(initialProblem));
  const [brief, setBrief] = useState<ProblemBrief | null>(null);
  const [stage, setStage] = useState<'problem' | 'discovery' | 'brief'>('problem');

  const onStartDiscovery = () => {
    const nextQuestions = generateDiscoveryQuestions(problem);
    setQuestions(nextQuestions);
    setAnswers(generateSampleDiscoveryAnswers(problem));
    setStage('discovery');
  };

  const onSelectAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const onGenerateBrief = () => {
    setBrief(buildProblemBrief(problem, answers));
    setStage('brief');
  };

  const statusText = useMemo(() => buildDiscoveryStatusText(problem, answers), [problem, answers]);

  return (
    <main className="min-h-screen bg-[#080706] text-[#FFF8E7]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="w-full rounded-[1.75rem] border border-[#D89B22]/20 bg-[#12100C] p-4 lg:max-w-[260px]">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D89B22]/30 bg-[#0D0C09] text-sm font-semibold text-[#FFD66B]">
              M
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#BEB6A3]">ManifestOS</div>
              <div className="text-sm font-medium">Manifest Studio</div>
            </div>
          </div>

          <nav className="space-y-2">
            {['Problem', 'Understand', 'Envision', 'Blueprint', 'Build', 'Refine', 'Share'].map((stageName, index) => (
              <div
                key={stageName}
                className={`flex items-center gap-3 rounded-2xl border px-3 py-3 ${
                  index === 0 || (stage === 'discovery' && index === 1) || (stage === 'brief' && index <= 2)
                    ? 'border-[#D89B22]/35 bg-[#D89B22]/5 text-[#FFD66B]'
                    : 'border-transparent bg-transparent text-[#FFF8E7]/85'
                }`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-current text-xs">
                  {index + 1}
                </span>
                <span>{stageName}</span>
              </div>
            ))}
          </nav>
        </aside>

        <section className="flex-1 rounded-[1.75rem] border border-[#D89B22]/20 bg-[#0D0C09] p-5 md:p-8">
          <div className="mb-8 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#D89B22]">Current stage</p>
              <h1 className="mt-2 text-3xl font-semibold">{stage === 'problem' ? 'Problem' : stage === 'discovery' ? 'Understand' : 'Envision'}</h1>
            </div>
            <button className="rounded-full border border-[#D89B22]/20 px-4 py-2 text-sm text-[#FFF8E7]">
              Save draft
            </button>
          </div>

          {stage === 'problem' && (
            <>
              <div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5">
                <label htmlFor="problem" className="mb-3 block text-sm text-[#BEB6A3]">
                  What problem do you wish software could solve?
                </label>
                <textarea
                  id="problem"
                  value={problem}
                  onChange={(event) => setProblem(event.target.value)}
                  className="h-40 w-full resize-none rounded-2xl border border-[#D89B22]/15 bg-[#080706] p-4 text-base text-[#FFF8E7] outline-none placeholder:text-[#BEB6A3]"
                  placeholder="Describe something annoying, repetitive, confusing, difficult, or unnecessarily complicated."
                />
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {[
                  'We keep losing track of which customer approved what.',
                  'My students need a simpler way to remember what goes back to which teacher.',
                  'I want to know whether conditions are good for crabbing before I load the car.',
                  'The clinic keeps re-checking the same follow-up tasks.',
                ].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setProblem(example)}
                    className="rounded-2xl border border-[#D89B22]/15 bg-[#12100C] p-4 text-left text-sm text-[#BEB6A3] transition hover:border-[#D89B22]/35 hover:text-[#FFF8E7]"
                  >
                    {example}
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={onStartDiscovery}
                  className="inline-flex items-center justify-center rounded-full border border-[#D89B22]/30 bg-[#D89B22] px-6 py-3 font-medium text-[#080706]"
                >
                  Start discovery
                </button>
              </div>
            </>
          )}

          {stage === 'discovery' && (
            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5">
                <p className="text-sm text-[#BEB6A3]">Current problem</p>
                <p className="mt-2 text-lg text-[#FFF8E7]">{problem}</p>
              </div>

              {questions.map((question) => (
                <div key={question.id} className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5">
                  <p className="text-lg font-medium text-[#FFF8E7]">{question.question}</p>
                  {question.reason ? <p className="mt-1 text-sm text-[#BEB6A3]">{question.reason}</p> : null}

                  {question.answerType === 'choice' && question.choices ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {question.choices.map((choice) => (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => onSelectAnswer(question.id, choice)}
                          className={`rounded-full border px-4 py-2 text-sm ${
                            answers[question.id] === choice
                              ? 'border-[#D89B22]/35 bg-[#D89B22]/10 text-[#FFD66B]'
                              : 'border-[#D89B22]/15 bg-[#080706] text-[#FFF8E7]'
                          }`}
                        >
                          {choice}
                        </button>
                      ))}
                      {question.allowYouDecide ? (
                        <button
                          type="button"
                          onClick={() => onSelectAnswer(question.id, 'You decide')}
                          className="rounded-full border border-[#D89B22]/15 bg-transparent px-4 py-2 text-sm text-[#BEB6A3]"
                        >
                          You decide
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <textarea
                      value={answers[question.id] ?? ''}
                      onChange={(event) => onSelectAnswer(question.id, event.target.value)}
                      className="mt-4 h-28 w-full resize-none rounded-2xl border border-[#D89B22]/15 bg-[#080706] p-4 text-base text-[#FFF8E7] outline-none placeholder:text-[#BEB6A3]"
                      placeholder="Tell us more in plain language."
                    />
                  )}
                </div>
              ))}

              <div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5">
                <p className="text-sm text-[#BEB6A3]">What we understand so far</p>
                <p className="mt-2 text-[#FFF8E7]">{statusText}</p>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={onGenerateBrief}
                  className="inline-flex items-center justify-center rounded-full border border-[#D89B22]/30 bg-[#D89B22] px-6 py-3 font-medium text-[#080706]"
                >
                  Confirm Problem Brief
                </button>
              </div>
            </div>
          )}

          {stage === 'brief' && brief && (
            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[#D89B22]">Problem Brief</p>
                <h2 className="mt-3 text-2xl font-semibold text-[#FFF8E7]">{brief.summary}</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5">
                  <h3 className="text-sm uppercase tracking-[0.18em] text-[#BEB6A3]">Affected users</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-[#FFF8E7]">
                    {brief.affectedUsers.map((user) => (
                      <li key={user}>{user}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5">
                  <h3 className="text-sm uppercase tracking-[0.18em] text-[#BEB6A3]">Current workaround</h3>
                  <p className="mt-3 text-[#FFF8E7]">{brief.currentWorkaround}</p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5">
                <h3 className="text-sm uppercase tracking-[0.18em] text-[#BEB6A3]">What a fix should feel like</h3>
                <p className="mt-3 text-[#FFF8E7]">{brief.desiredOutcome}</p>
              </div>

              <div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5">
                <h3 className="text-sm uppercase tracking-[0.18em] text-[#BEB6A3]">Suggested solutions</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {demoSolutions.map((solution) => (
                    <article key={solution.id} className="rounded-2xl border border-[#D89B22]/15 bg-[#080706] p-4">
                      <div className="mb-2 text-xs uppercase tracking-[0.2em] text-[#D89B22]">{solution.complexity}</div>
                      <h4 className="text-xl font-semibold text-[#FFF8E7]">{solution.title}</h4>
                      <p className="mt-3 text-sm text-[#BEB6A3]">{solution.plainLanguageSummary}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStage('discovery')}
                  className="rounded-full border border-[#D89B22]/20 px-5 py-3 text-[#FFF8E7]"
                >
                  Edit discovery
                </button>
                <button
                  type="button"
                  onClick={() => setStage('problem')}
                  className="inline-flex items-center justify-center rounded-full border border-[#D89B22]/30 bg-[#D89B22] px-6 py-3 font-medium text-[#080706]"
                >
                  Move to solution ideas
                </button>
              </div>
            </div>
          )}
        </section>

        <aside className="w-full rounded-[1.75rem] border border-[#D89B22]/20 bg-[#12100C] p-4 lg:max-w-[280px]">
          <div className="mb-4 flex items-center justify-between text-sm text-[#BEB6A3]">
            <span>Summary</span>
            <span className="rounded-full border border-[#D89B22]/20 px-2 py-1 text-xs uppercase tracking-[0.18em] text-[#FFD66B]">
              {stage === 'problem' ? 'Draft' : stage === 'discovery' ? 'Discovery' : 'Brief ready'}
            </span>
          </div>

          <div className="space-y-4 text-sm text-[#FFF8E7]/80">
            <div className="rounded-2xl border border-[#D89B22]/15 bg-[#080706] p-4">
              <div className="mb-2 text-[#BEB6A3]">Problem</div>
              <p>{problem}</p>
            </div>
            <div className="rounded-2xl border border-[#D89B22]/15 bg-[#080706] p-4">
              <div className="mb-2 text-[#BEB6A3]">Likely solution</div>
              <p>{brief ? brief.desiredOutcome : 'Simple mobile-first shared tracker with status history and reminders.'}</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
