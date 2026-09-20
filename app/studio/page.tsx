"use client";

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BrandMark } from '@/components/brand-mark';
import {
  buildDiscoveryStatusText,
  buildProblemBrief,
  demoSolutions,
  generateDemoBlueprint,
  generateDiscoveryQuestions,
  generateSampleDiscoveryAnswers,
} from '@/lib/demo-data';
import { buildPreviewSrcDoc, generateDemoApp } from '@/lib/generated-app';
import { BlueprintArtifact, DiscoveryQuestion, GeneratedApp, ProblemBrief, SolutionProposal } from '@/lib/domain';

const defaultProblem = 'My dad sometimes forgets whether he already fed the dog, and multiple family members may visit during the day.';
const stages = ['Problem', 'Understand', 'Problem Brief', 'Envision', 'Blueprint', 'Build', 'Preview', 'Refine'];
type FlowStage = 'problem' | 'discovery' | 'brief' | 'solutions' | 'blueprint' | 'build' | 'refine';

const examples = [
  'We keep losing track of which customer approved what.',
  'My students need a simpler way to remember what goes back to which teacher.',
  'I want to know whether conditions are good for crabbing before I load the car.',
  'The clinic keeps re-checking the same follow-up tasks.',
];

export default function StudioPage() {
  const searchParams = useSearchParams();
  const initialProblem = searchParams.get('problem')?.trim() || defaultProblem;
  const [problem, setProblem] = useState(initialProblem);
  const [questions, setQuestions] = useState<DiscoveryQuestion[]>(() => generateDiscoveryQuestions(initialProblem));
  const [answers, setAnswers] = useState<Record<string, string>>(() => generateSampleDiscoveryAnswers(initialProblem));
  const [brief, setBrief] = useState<ProblemBrief | null>(null);
  const [solutions, setSolutions] = useState<SolutionProposal[]>(demoSolutions);
  const [selectedSolutionId, setSelectedSolutionId] = useState<string | null>(null);
  const [artifacts, setArtifacts] = useState<BlueprintArtifact[]>([]);
  const [app, setApp] = useState<GeneratedApp | null>(null);
  const [flowStage, setFlowStage] = useState<FlowStage>('problem');
  const [isGenerating, setIsGenerating] = useState(false);
  const [buildStep, setBuildStep] = useState(0);
  const [refinement, setRefinement] = useState('');
  const selectedSolution = solutions.find((solution) => solution.id === selectedSolutionId) || null;
  const statusText = useMemo(() => buildDiscoveryStatusText(problem, answers), [problem, answers]);
  const activeStage =
    flowStage === 'problem' ? 0
      : flowStage === 'discovery' ? 1
        : flowStage === 'brief' ? 2
          : flowStage === 'solutions' ? 3
            : flowStage === 'blueprint' ? 4
              : flowStage === 'build' ? (isGenerating || !app ? 5 : 6)
                : 7;

  function startDiscovery() {
    setQuestions(generateDiscoveryQuestions(problem));
    setAnswers(generateSampleDiscoveryAnswers(problem));
    setFlowStage('discovery');
  }
  function generateBrief() {
    setBrief(buildProblemBrief(problem, answers));
    setFlowStage('brief');
  }
  function showSolutions() {
    if (!brief) return;
    setSolutions(demoSolutions.map((solution, index) => ({ ...solution, selected: index === 0 })));
    setSelectedSolutionId(demoSolutions[0].id);
    setFlowStage('solutions');
  }
  function chooseSolution(id: string) {
    setSelectedSolutionId(id);
    setSolutions((current) => current.map((solution) => ({ ...solution, selected: solution.id === id })));
  }
  function createBlueprint() {
    const solution = solutions.find((item) => item.id === (selectedSolutionId || solutions.find((item) => item.selected)?.id)) || solutions[0];
    if (!brief || !solution) return;
    setSelectedSolutionId(solution.id);
    setIsGenerating(true);
    window.setTimeout(() => {
      setArtifacts(generateDemoBlueprint(solution, brief));
      setIsGenerating(false);
      setFlowStage('blueprint');
    }, 650);
  }
  function startBuild() {
    if (!selectedSolution) return;
    setFlowStage('build');
    setBuildStep(0);
    setIsGenerating(true);
    const timer = window.setInterval(() => {
      setBuildStep((step) => {
        if (step >= 4) {
          window.clearInterval(timer);
          setApp(generateDemoApp(selectedSolution));
          setIsGenerating(false);
          return 4;
        }
        return step + 1;
      });
    }, 500);
  }

  return (
    <main className="min-h-screen text-pearl">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 lg:flex-row lg:py-6">
        <aside className="panel w-full p-4 lg:max-w-[280px]">
          <div className="mb-5 flex items-center justify-center lg:justify-start">
            <BrandMark size="compact" priority />
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:space-y-2 lg:overflow-visible" aria-label="Journey stages">
            {stages.map((stage, index) => (
              <div
                key={stage}
                className={`flex min-w-[9.5rem] items-center gap-3 rounded-2xl border px-3 py-3 lg:min-w-0 ${
                  index === activeStage
                    ? 'border-[rgba(255,213,106,0.45)] bg-[rgba(232,176,32,0.12)] text-gold-bright shadow-glow'
                    : index < activeStage
                      ? 'border-[rgba(232,176,32,0.28)] bg-[rgba(232,176,32,0.05)] text-gold-bright'
                      : 'border-transparent text-pearl/70'
                }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-xs">
                  {index + 1}
                </span>
                <span>{stage}</span>
              </div>
            ))}
          </nav>
        </aside>

        <section className="panel flex-1 p-5 md:p-8">
          <div className="mb-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="gold-label">Current stage</p>
              <h1 className="mt-2 text-3xl font-semibold">
                {flowStage === 'problem' ? 'Problem'
                  : flowStage === 'discovery' ? 'Understand'
                    : flowStage === 'brief' ? 'Problem Brief'
                      : flowStage === 'solutions' ? 'Envision'
                        : flowStage === 'blueprint' ? 'Blueprint'
                          : flowStage === 'build' ? (isGenerating || !app ? 'Build' : 'Preview')
                            : 'Refine'}
              </h1>
            </div>
            <span className="chip">Demo mode</span>
          </div>

          {flowStage === 'problem' && (
            <>
              <div className="panel-quiet p-5">
                <label htmlFor="problem" className="mb-3 block text-sm text-champagne">
                  What problem do you wish software could solve?
                </label>
                <textarea
                  id="problem"
                  value={problem}
                  onChange={(event) => setProblem(event.target.value)}
                  className="h-40 w-full resize-none rounded-2xl border border-[rgba(232,176,32,0.15)] bg-void p-4 text-base text-pearl outline-none placeholder:text-champagne"
                  placeholder="Describe something annoying, repetitive, confusing, difficult, or unnecessarily complicated."
                />
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {examples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setProblem(example)}
                    className="panel-quiet p-4 text-left text-sm text-champagne hover:border-[rgba(255,213,106,0.35)] hover:text-pearl"
                  >
                    {example}
                  </button>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <button type="button" onClick={startDiscovery} disabled={!problem.trim()} className="btn-gold">
                  Start discovery
                </button>
              </div>
            </>
          )}

          {flowStage === 'discovery' && (
            <div className="space-y-6">
              <div className="panel-quiet p-5">
                <p className="text-sm text-champagne">Current problem</p>
                <p className="mt-2 text-lg">{problem}</p>
              </div>
              {questions.map((question) => (
                <div key={question.id} className="panel-quiet p-5">
                  <p className="text-lg font-medium">{question.question}</p>
                  {question.reason && <p className="mt-1 text-sm text-champagne">{question.reason}</p>}
                  {question.answerType === 'choice' && question.choices ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {question.choices.map((choice) => (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: choice }))}
                          className={`rounded-full border px-4 py-2 text-sm ${
                            answers[question.id] === choice
                              ? 'border-[rgba(255,213,106,0.45)] bg-[rgba(232,176,32,0.12)] text-gold-bright'
                              : 'border-[rgba(232,176,32,0.15)] bg-void text-pearl'
                          }`}
                        >
                          {choice}
                        </button>
                      ))}
                      {question.allowYouDecide && (
                        <button
                          type="button"
                          onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: 'You decide' }))}
                          className="rounded-full border border-[rgba(232,176,32,0.15)] px-4 py-2 text-sm text-champagne"
                        >
                          You decide
                        </button>
                      )}
                    </div>
                  ) : (
                    <textarea
                      value={answers[question.id] ?? ''}
                      onChange={(event) => setAnswers((previous) => ({ ...previous, [question.id]: event.target.value }))}
                      className="mt-4 h-28 w-full resize-none rounded-2xl border border-[rgba(232,176,32,0.15)] bg-void p-4 text-base outline-none placeholder:text-champagne"
                      placeholder="Tell us more in plain language."
                    />
                  )}
                </div>
              ))}
              <div className="panel-quiet p-5">
                <p className="text-sm text-champagne">What we understand so far</p>
                <p className="mt-2">{statusText}</p>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={generateBrief} className="btn-gold">
                  Confirm Problem Brief
                </button>
              </div>
            </div>
          )}

          {flowStage === 'brief' && brief && (
            <div className="space-y-6">
              <div className="panel-quiet p-5">
                <p className="gold-label">Problem Brief</p>
                <h2 className="mt-3 text-2xl font-semibold">{brief.summary}</h2>
                <p className="mt-3 text-sm text-champagne">Did I understand the problem correctly?</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Info title="Affected users">
                  <ul className="list-disc space-y-2 pl-5">
                    {brief.affectedUsers.map((user) => (
                      <li key={user}>{user}</li>
                    ))}
                  </ul>
                </Info>
                <Info title="Current workaround">{brief.currentWorkaround}</Info>
                <Info title="Where it hurts">{brief.friction}</Info>
                <Info title="A useful fix feels like">{brief.desiredOutcome}</Info>
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => setFlowStage('discovery')} className="btn-ghost">
                  Edit discovery
                </button>
                <button type="button" onClick={showSolutions} className="btn-gold">
                  Yes, show me solutions
                </button>
              </div>
            </div>
          )}

          {flowStage === 'solutions' && (
            <div className="space-y-6">
              <p className="text-lg">Here are a few ways to solve the problem. Start small unless you need more.</p>
              <div className="grid gap-4">
                {solutions.map((solution) => (
                  <button
                    key={solution.id}
                    type="button"
                    onClick={() => chooseSolution(solution.id)}
                    className={`rounded-[1.5rem] border p-5 text-left ${
                      solution.selected
                        ? 'border-[rgba(255,213,106,0.5)] bg-[rgba(232,176,32,0.12)] shadow-glow'
                        : 'border-[rgba(232,176,32,0.15)] bg-panel'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="gold-label">{solution.complexity}</span>
                        <h2 className="mt-2 text-2xl font-semibold">{solution.title}</h2>
                      </div>
                      <span className="chip">{solution.selected ? 'Selected' : 'Choose this'}</span>
                    </div>
                    <p className="mt-3 text-champagne">{solution.plainLanguageSummary}</p>
                    <p className="mt-3 text-sm">{solution.howItWorks}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {solution.mvpFeatures.map((feature) => (
                        <span key={feature} className="rounded-full bg-void px-3 py-1 text-xs text-champagne">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={createBlueprint} disabled={isGenerating} className="btn-gold">
                  {isGenerating ? 'Designing your solution…' : 'Create Blueprint'}
                </button>
              </div>
            </div>
          )}

          {flowStage === 'blueprint' && selectedSolution && (
            <div className="space-y-6">
              <div className="panel-quiet p-5">
                <p className="gold-label">Blueprint ready</p>
                <h2 className="mt-3 text-2xl font-semibold">The build now has a plan to follow.</h2>
                <p className="mt-2 text-champagne">{selectedSolution.title} is based on the current Problem Brief.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {artifacts.map((artifact, index) => (
                  <details key={artifact.id} open={index < 2} className="rounded-2xl border border-[rgba(232,176,32,0.15)] bg-panel p-4">
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium">{index + 1}. {artifact.title}</span>
                        <span className="text-xs text-gold-bright">Ready</span>
                      </div>
                      <p className="mt-2 text-sm text-champagne">{artifact.plainLanguageSummary}</p>
                    </summary>
                    <div className="mt-4 border-t border-[rgba(232,176,32,0.1)] pt-4 text-sm text-pearl/80">
                      {artifact.technicalDetail}
                    </div>
                  </details>
                ))}
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={startBuild} className="btn-gold">
                  Build from Blueprint
                </button>
              </div>
            </div>
          )}

          {flowStage === 'build' && (
            <BuildView isGenerating={isGenerating} buildStep={buildStep} app={app} onRefine={() => setFlowStage('refine')} />
          )}

          {flowStage === 'refine' && (
            <div className="space-y-6">
              <div>
                <p className="gold-label">Refine</p>
                <h2 className="mt-2 text-2xl font-semibold">What would you like to change?</h2>
                <p className="mt-2 text-champagne">ManifestOS will decide whether this changes the plan before rebuilding.</p>
              </div>
              <textarea
                value={refinement}
                onChange={(event) => setRefinement(event.target.value)}
                className="h-32 w-full rounded-2xl border border-[rgba(232,176,32,0.15)] bg-panel p-4 outline-none"
                placeholder="For example: make the main button even larger."
              />
              <div className="flex justify-between">
                <button type="button" onClick={() => setFlowStage('build')} className="btn-ghost">
                  Back to preview
                </button>
                <button type="button" onClick={() => setFlowStage('build')} disabled={!refinement.trim()} className="btn-gold">
                  Apply change
                </button>
              </div>
            </div>
          )}
        </section>

        <aside className="panel w-full p-4 lg:max-w-[280px]">
          <div className="mb-4 flex items-center justify-between text-sm text-champagne">
            <span>Summary</span>
            <span className="chip">{flowStage}</span>
          </div>
          <div className="space-y-4 text-sm text-pearl/80">
            <div className="panel-quiet p-4">
              <div className="mb-2 text-champagne">Problem</div>
              <p>{problem}</p>
            </div>
            <div className="panel-quiet p-4">
              <div className="mb-2 text-champagne">Direction</div>
              <p>{selectedSolution?.title || brief?.desiredOutcome || 'We will find the smallest useful solution.'}</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function BuildView({
  isGenerating,
  buildStep,
  app,
  onRefine,
}: {
  isGenerating: boolean;
  buildStep: number;
  app: GeneratedApp | null;
  onRefine: () => void;
}) {
  const steps = [
    'Setting up the foundation',
    'Creating the information your app needs to remember',
    'Building the main workflow',
    'Checking for mistakes',
    'Getting your preview ready',
  ];
  return (
    <div className="space-y-6">
      <div className="panel-quiet p-5">
        <p className="gold-label">{isGenerating ? 'Making it real' : 'It exists.'}</p>
        <h2 className="mt-3 text-3xl font-semibold">
          {isGenerating ? steps[buildStep] : 'Your working preview is ready.'}
        </h2>
        <p className="mt-2 text-champagne">
          {isGenerating ? 'The build is following the Blueprint task graph.' : 'This preview was generated from the current artifact snapshot.'}
        </p>
      </div>
      {isGenerating ? (
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`rounded-2xl border p-4 ${
                index <= buildStep
                  ? 'border-[rgba(255,213,106,0.35)] bg-[rgba(232,176,32,0.1)] text-gold-bright'
                  : 'border-[rgba(232,176,32,0.1)] bg-panel text-champagne'
              }`}
            >
              {index < buildStep ? '✓ ' : index === buildStep ? '→ ' : '○ '}
              {step}
            </div>
          ))}
        </div>
      ) : app ? (
        <>
          <div className="overflow-hidden rounded-[1.5rem] border border-[rgba(255,213,106,0.28)] bg-void shadow-glow">
            <div className="flex items-center justify-between bg-[rgba(20,17,12,0.95)] px-4 py-3 text-sm">
              <span className="text-pearl">Live preview · {app.name}</span>
              <span className="text-gold-bright">Phone</span>
            </div>
            <iframe
              title={`${app.name} preview`}
              srcDoc={buildPreviewSrcDoc(app)}
              className="h-[520px] w-full border-0 bg-void"
            />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onRefine} className="btn-gold">
              Change something
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel-quiet p-5">
      <h3 className="text-sm uppercase tracking-[0.18em] text-champagne">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}
