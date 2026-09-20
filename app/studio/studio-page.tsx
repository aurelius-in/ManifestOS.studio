"use client";

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { buildDiscoveryStatusText, buildProblemBrief, demoSolutions, generateDemoBlueprint, generateDiscoveryQuestions, generateSampleDiscoveryAnswers } from '@/lib/demo-data';
import { generateDemoApp } from '@/lib/generated-app';
import { applyRefinement, createInitialPreviewVersion, restoreVersion, undoVersion } from '@/lib/refine';
import { BlueprintArtifact, ChangeRequest, DiscoveryQuestion, GeneratedApp, ProblemBrief, ProjectVersion, SolutionProposal } from '@/lib/domain';

const defaultProblem = 'My dad sometimes forgets whether he already fed the dog, and multiple family members may visit during the day.';
const stages = ['Problem', 'Understand', 'Envision', 'Blueprint', 'Build', 'Preview', 'Refine', 'Share'];
const refineExamples = [
  'Make the main button even larger.',
  'Call it CareLog.',
  'Remember who fed the dog.',
  'Add reminder nudges.',
  'Rebuild the preview.',
  'Keep this private to one caregiver.',
];
type FlowStage = 'problem' | 'discovery' | 'brief' | 'solutions' | 'blueprint' | 'build' | 'preview' | 'refine';

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
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [lastRequest, setLastRequest] = useState<ChangeRequest | null>(null);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);
  const selectedSolution = solutions.find((solution) => solution.id === selectedSolutionId) || null;
  const statusText = useMemo(() => buildDiscoveryStatusText(problem, answers), [problem, answers]);
  const activeStage = flowStage === 'problem' ? 0 : flowStage === 'discovery' || flowStage === 'brief' ? 1 : flowStage === 'solutions' ? 2 : flowStage === 'blueprint' ? 3 : flowStage === 'build' ? 4 : flowStage === 'preview' ? 5 : 6;
  const stageTitle = flowStage === 'problem' ? 'Problem' : flowStage === 'discovery' ? 'Understand' : flowStage === 'brief' ? 'Problem Brief' : flowStage === 'solutions' ? 'Envision' : flowStage === 'blueprint' ? 'Blueprint' : flowStage === 'build' ? 'Build' : flowStage === 'preview' ? 'Preview' : 'Refine';

  function startDiscovery() { setQuestions(generateDiscoveryQuestions(problem)); setAnswers(generateSampleDiscoveryAnswers(problem)); setFlowStage('discovery'); }
  function generateBrief() { setBrief(buildProblemBrief(problem, answers)); setFlowStage('brief'); }
  function showSolutions() { if (!brief) return; setSolutions(demoSolutions.map((solution, index) => ({ ...solution, selected: index === 0 }))); setSelectedSolutionId(demoSolutions[0].id); setFlowStage('solutions'); }
  function chooseSolution(id: string) { setSelectedSolutionId(id); setSolutions((current) => current.map((solution) => ({ ...solution, selected: solution.id === id }))); }
  function createBlueprint() { const solution = solutions.find((item) => item.id === (selectedSolutionId || solutions.find((item) => item.selected)?.id)) || solutions[0]; if (!brief || !solution) return; setSelectedSolutionId(solution.id); setIsGenerating(true); window.setTimeout(() => { setArtifacts(generateDemoBlueprint(solution, brief)); setIsGenerating(false); setFlowStage('blueprint'); }, 650); }

  function startBuild() {
    const solution = selectedSolution;
    const currentArtifacts = artifacts;
    if (!solution) return;
    setFlowStage('build');
    setBuildStep(0);
    setIsGenerating(true);
    let step = 0;
    const timer = window.setInterval(() => {
      if (step >= 4) {
        window.clearInterval(timer);
        const generated = generateDemoApp(solution);
        setApp(generated);
        setChangeRequests([]);
        setLastRequest(null);
        setVersions([createInitialPreviewVersion(currentArtifacts, generated, solution)]);
        setCurrentVersionIndex(0);
        setIsGenerating(false);
        setFlowStage('preview');
        return;
      }
      step += 1;
      setBuildStep(step);
    }, 500);
  }

  function applyRefine() {
    const solution = selectedSolution;
    const currentApp = app;
    if (!solution || !currentApp || !refinement.trim()) return;
    setIsGenerating(true);
    window.setTimeout(() => {
      const result = applyRefinement({
        text: refinement,
        artifacts,
        app: currentApp,
        solution,
        changeRequests,
        versions,
        currentVersionIndex,
      });
      setLastRequest(result.request);
      setArtifacts(result.artifacts);
      setApp(result.app);
      setChangeRequests(result.changeRequests);
      setVersions(result.versions);
      setCurrentVersionIndex(result.currentVersionIndex);
      setRefinement('');
      setIsGenerating(false);
    }, 450);
  }

  function restoreAt(index: number) {
    const restored = restoreVersion(versions, index);
    if (!restored) return;
    setArtifacts(restored.artifacts);
    setApp(restored.app);
    setChangeRequests(restored.changeRequests);
    setCurrentVersionIndex(restored.currentVersionIndex);
    setLastRequest(versions[index]?.changeRequest || null);
  }

  function undoRefine() {
    const restored = undoVersion(versions, currentVersionIndex);
    if (!restored) return;
    restoreAt(restored.currentVersionIndex);
  }

  return (
    <main className="min-h-screen bg-[#080706] text-[#FFF8E7]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="w-full rounded-[1.75rem] border border-[#D89B22]/20 bg-[#12100C] p-4 lg:max-w-[260px]">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D89B22]/30 bg-[#0D0C09] text-sm font-semibold text-[#FFD66B]">M</div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#BEB6A3]">ManifestOS</div>
              <div className="text-sm font-medium">Manifest Studio</div>
            </div>
          </div>
          <nav className="space-y-2" aria-label="Journey stages">
            {stages.map((stage, index) => (
              <div key={stage} className={`flex items-center gap-3 rounded-2xl border px-3 py-3 ${index <= activeStage ? 'border-[#D89B22]/35 bg-[#D89B22]/5 text-[#FFD66B]' : 'border-transparent text-[#FFF8E7]/85'}`}>
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-current text-xs">{index + 1}</span>
                <span>{stage}</span>
              </div>
            ))}
          </nav>
        </aside>

        <section className="flex-1 rounded-[1.75rem] border border-[#D89B22]/20 bg-[#0D0C09] p-5 md:p-8">
          <div className="mb-8 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#D89B22]">Current stage</p>
              <h1 className="mt-2 text-3xl font-semibold">{stageTitle}</h1>
            </div>
            <span className="rounded-full border border-[#D89B22]/20 px-4 py-2 text-sm text-[#FFD66B]">Demo mode</span>
          </div>

          {flowStage === 'problem' && (
            <>
              <div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5">
                <label htmlFor="problem" className="mb-3 block text-sm text-[#BEB6A3]">What problem do you wish software could solve?</label>
                <textarea id="problem" value={problem} onChange={(event) => setProblem(event.target.value)} className="h-40 w-full resize-none rounded-2xl border border-[#D89B22]/15 bg-[#080706] p-4 text-base text-[#FFF8E7] outline-none placeholder:text-[#BEB6A3]" placeholder="Describe something annoying, repetitive, confusing, difficult, or unnecessarily complicated." />
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {['We keep losing track of which customer approved what.','My students need a simpler way to remember what goes back to which teacher.','I want to know whether conditions are good for crabbing before I load the car.','The clinic keeps re-checking the same follow-up tasks.'].map((example) => (
                  <button key={example} type="button" onClick={() => setProblem(example)} className="rounded-2xl border border-[#D89B22]/15 bg-[#12100C] p-4 text-left text-sm text-[#BEB6A3] hover:border-[#D89B22]/35 hover:text-[#FFF8E7]">{example}</button>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <button type="button" onClick={startDiscovery} disabled={!problem.trim()} className="rounded-full border border-[#D89B22]/30 bg-[#D89B22] px-6 py-3 font-medium text-[#080706] disabled:opacity-50">Start discovery</button>
              </div>
            </>
          )}

          {flowStage === 'discovery' && (
            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5">
                <p className="text-sm text-[#BEB6A3]">Current problem</p>
                <p className="mt-2 text-lg">{problem}</p>
              </div>
              {questions.map((question) => (
                <div key={question.id} className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5">
                  <p className="text-lg font-medium">{question.question}</p>
                  {question.reason && <p className="mt-1 text-sm text-[#BEB6A3]">{question.reason}</p>}
                  {question.answerType === 'choice' && question.choices ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {question.choices.map((choice) => (
                        <button key={choice} type="button" onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: choice }))} className={`rounded-full border px-4 py-2 text-sm ${answers[question.id] === choice ? 'border-[#D89B22]/35 bg-[#D89B22]/10 text-[#FFD66B]' : 'border-[#D89B22]/15 bg-[#080706] text-[#FFF8E7]'}`}>{choice}</button>
                      ))}
                      {question.allowYouDecide && <button type="button" onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: 'You decide' }))} className="rounded-full border border-[#D89B22]/15 px-4 py-2 text-sm text-[#BEB6A3]">You decide</button>}
                    </div>
                  ) : (
                    <textarea value={answers[question.id] ?? ''} onChange={(event) => setAnswers((previous) => ({ ...previous, [question.id]: event.target.value }))} className="mt-4 h-28 w-full resize-none rounded-2xl border border-[#D89B22]/15 bg-[#080706] p-4 text-base outline-none placeholder:text-[#BEB6A3]" placeholder="Tell us more in plain language." />
                  )}
                </div>
              ))}
              <div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5">
                <p className="text-sm text-[#BEB6A3]">What we understand so far</p>
                <p className="mt-2">{statusText}</p>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={generateBrief} className="rounded-full border border-[#D89B22]/30 bg-[#D89B22] px-6 py-3 font-medium text-[#080706]">Confirm Problem Brief</button>
              </div>
            </div>
          )}

          {flowStage === 'brief' && brief && (
            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[#D89B22]">Problem Brief</p>
                <h2 className="mt-3 text-2xl font-semibold">{brief.summary}</h2>
                <p className="mt-3 text-sm text-[#BEB6A3]">Did I understand the problem correctly?</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Info title="Affected users"><ul className="list-disc space-y-2 pl-5">{brief.affectedUsers.map((user) => <li key={user}>{user}</li>)}</ul></Info>
                <Info title="Current workaround">{brief.currentWorkaround}</Info>
                <Info title="Where it hurts">{brief.friction}</Info>
                <Info title="A useful fix feels like">{brief.desiredOutcome}</Info>
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => setFlowStage('discovery')} className="rounded-full border border-[#D89B22]/20 px-5 py-3">Edit discovery</button>
                <button type="button" onClick={showSolutions} className="rounded-full border border-[#D89B22]/30 bg-[#D89B22] px-6 py-3 font-medium text-[#080706]">Yes, show me solutions</button>
              </div>
            </div>
          )}

          {flowStage === 'solutions' && (
            <div className="space-y-6">
              <p className="text-lg">Here are a few ways to solve the problem. Start small unless you need more.</p>
              <div className="grid gap-4">
                {solutions.map((solution) => (
                  <button key={solution.id} type="button" onClick={() => chooseSolution(solution.id)} className={`rounded-[1.5rem] border p-5 text-left ${solution.selected ? 'border-[#D89B22]/50 bg-[#D89B22]/10 shadow-glow' : 'border-[#D89B22]/15 bg-[#12100C]'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs uppercase tracking-[0.2em] text-[#D89B22]">{solution.complexity}</span>
                        <h2 className="mt-2 text-2xl font-semibold">{solution.title}</h2>
                      </div>
                      <span className="rounded-full border border-[#D89B22]/20 px-3 py-1 text-sm text-[#FFD66B]">{solution.selected ? 'Selected' : 'Choose this'}</span>
                    </div>
                    <p className="mt-3 text-[#BEB6A3]">{solution.plainLanguageSummary}</p>
                    <p className="mt-3 text-sm">{solution.howItWorks}</p>
                    <div className="mt-4 flex flex-wrap gap-2">{solution.mvpFeatures.map((feature) => <span key={feature} className="rounded-full bg-[#080706] px-3 py-1 text-xs text-[#BEB6A3]">{feature}</span>)}</div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={createBlueprint} disabled={isGenerating} className="rounded-full border border-[#D89B22]/30 bg-[#D89B22] px-6 py-3 font-medium text-[#080706] disabled:opacity-60">{isGenerating ? 'Designing your solution…' : 'Create Blueprint'}</button>
              </div>
            </div>
          )}

          {flowStage === 'blueprint' && selectedSolution && (
            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[#D89B22]">Blueprint ready</p>
                <h2 className="mt-3 text-2xl font-semibold">The build now has a plan to follow.</h2>
                <p className="mt-2 text-[#BEB6A3]">{selectedSolution.title} is based on the current Problem Brief.</p>
              </div>
              <ArtifactGrid artifacts={artifacts} />
              <div className="flex justify-end">
                <button type="button" onClick={startBuild} className="rounded-full border border-[#D89B22]/30 bg-[#D89B22] px-6 py-3 font-medium text-[#080706]">Build from Blueprint</button>
              </div>
            </div>
          )}

          {flowStage === 'build' && <BuildView buildStep={buildStep} />}

          {flowStage === 'preview' && app && (
            <PreviewView app={app} versionLabel={versions[currentVersionIndex]?.label || 'Initial preview'} onRefine={() => setFlowStage('refine')} />
          )}

          {flowStage === 'refine' && app && (
            <RefineView
              refinement={refinement}
              onRefinementChange={setRefinement}
              isApplying={isGenerating}
              lastRequest={lastRequest}
              artifacts={artifacts}
              app={app}
              versions={versions}
              currentVersionIndex={currentVersionIndex}
              onApply={applyRefine}
              onUndo={undoRefine}
              onRestore={restoreAt}
              onBackToPreview={() => setFlowStage('preview')}
            />
          )}
        </section>

        <aside className="w-full rounded-[1.75rem] border border-[#D89B22]/20 bg-[#12100C] p-4 lg:max-w-[280px]">
          <div className="mb-4 flex items-center justify-between text-sm text-[#BEB6A3]">
            <span>Summary</span>
            <span className="rounded-full border border-[#D89B22]/20 px-2 py-1 text-xs uppercase tracking-[0.18em] text-[#FFD66B]">{flowStage}</span>
          </div>
          <div className="space-y-4 text-sm text-[#FFF8E7]/80">
            <div className="rounded-2xl border border-[#D89B22]/15 bg-[#080706] p-4">
              <div className="mb-2 text-[#BEB6A3]">Problem</div>
              <p>{problem}</p>
            </div>
            <div className="rounded-2xl border border-[#D89B22]/15 bg-[#080706] p-4">
              <div className="mb-2 text-[#BEB6A3]">Direction</div>
              <p>{selectedSolution?.title || brief?.desiredOutcome || 'We will find the smallest useful solution.'}</p>
            </div>
            {versions.length > 0 && (
              <div className="rounded-2xl border border-[#D89B22]/15 bg-[#080706] p-4">
                <div className="mb-2 text-[#BEB6A3]">Version</div>
                <p>v{versions[currentVersionIndex]?.versionNumber || 1}: {versions[currentVersionIndex]?.label || 'Initial preview'}</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

function BuildView({ buildStep }: { buildStep: number }) {
  const steps = ['Setting up the foundation', 'Creating the information your app needs to remember', 'Building the main workflow', 'Checking for mistakes', 'Getting your preview ready'];
  return (
    <div className="space-y-6">
      <div className="rounded-[1.5rem] border border-[#D89B22]/20 bg-[#12100C] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[#D89B22]">Making it real</p>
        <h2 className="mt-3 text-3xl font-semibold">{steps[buildStep]}</h2>
        <p className="mt-2 text-[#BEB6A3]">The build is following the Blueprint task graph.</p>
      </div>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step} className={`rounded-2xl border p-4 ${index <= buildStep ? 'border-[#D89B22]/35 bg-[#D89B22]/10 text-[#FFD66B]' : 'border-[#D89B22]/10 bg-[#12100C] text-[#BEB6A3]'}`}>
            {index < buildStep ? '✓ ' : index === buildStep ? '→ ' : '○ '}{step}
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewView({ app, versionLabel, onRefine }: { app: GeneratedApp; versionLabel: string; onRefine: () => void }) {
  return (
    <div className="space-y-6">
      <div className="rounded-[1.5rem] border border-[#D89B22]/20 bg-[#12100C] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[#D89B22]">It exists.</p>
        <h2 className="mt-3 text-3xl font-semibold">Your working preview is ready.</h2>
        <p className="mt-2 text-[#BEB6A3]">This preview was generated from the current artifact snapshot. {versionLabel}.</p>
      </div>
      <AppPreview app={app} />
      <div className="flex justify-end">
        <button type="button" onClick={onRefine} className="rounded-full border border-[#D89B22]/30 bg-[#D89B22] px-6 py-3 font-medium text-[#080706]">Change something</button>
      </div>
    </div>
  );
}

function RefineView({
  refinement,
  onRefinementChange,
  isApplying,
  lastRequest,
  artifacts,
  app,
  versions,
  currentVersionIndex,
  onApply,
  onUndo,
  onRestore,
  onBackToPreview,
}: {
  refinement: string;
  onRefinementChange: (value: string) => void;
  isApplying: boolean;
  lastRequest: ChangeRequest | null;
  artifacts: BlueprintArtifact[];
  app: GeneratedApp;
  versions: ProjectVersion[];
  currentVersionIndex: number;
  onApply: () => void;
  onUndo: () => void;
  onRestore: (index: number) => void;
  onBackToPreview: () => void;
}) {
  const updatedArtifacts = lastRequest?.affectsBlueprint
    ? artifacts.filter((artifact) => lastRequest.affectedArtifactTypes.includes(artifact.type))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-[#D89B22]">Refine</p>
        <h2 className="mt-2 text-2xl font-semibold">What would you like to change?</h2>
        <p className="mt-2 text-[#BEB6A3]">ManifestOS will classify the request, update Blueprint artifacts only when they are affected, rebuild the preview, and keep a version you can undo.</p>
      </div>

      <textarea
        value={refinement}
        onChange={(event) => onRefinementChange(event.target.value)}
        className="h-32 w-full rounded-2xl border border-[#D89B22]/15 bg-[#12100C] p-4 outline-none"
        placeholder="For example: make the main button even larger."
      />

      <div className="flex flex-wrap gap-2">
        {refineExamples.map((example) => (
          <button key={example} type="button" onClick={() => onRefinementChange(example)} className="rounded-full border border-[#D89B22]/20 px-3 py-2 text-sm text-[#BEB6A3] hover:border-[#D89B22]/40 hover:text-[#FFF8E7]">
            {example}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-between gap-3">
        <button type="button" onClick={onBackToPreview} className="rounded-full border border-[#D89B22]/20 px-5 py-3">Back to preview</button>
        <div className="flex gap-3">
          <button type="button" onClick={onUndo} disabled={currentVersionIndex <= 0 || isApplying} className="rounded-full border border-[#D89B22]/20 px-5 py-3 disabled:opacity-40">Undo</button>
          <button type="button" onClick={onApply} disabled={!refinement.trim() || isApplying} className="rounded-full border border-[#D89B22]/30 bg-[#D89B22] px-6 py-3 font-medium text-[#080706] disabled:opacity-50">
            {isApplying ? 'Applying change…' : 'Apply change'}
          </button>
        </div>
      </div>

      {lastRequest && (
        <div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-[#D89B22]">Classification</p>
          <h3 className="mt-3 text-xl font-semibold">{lastRequest.label}</h3>
          <p className="mt-2 text-[#BEB6A3]">{lastRequest.reason}</p>
          <p className="mt-3 text-sm">Request: {lastRequest.text}</p>
          <p className="mt-3 text-sm text-[#FFD66B]">
            {lastRequest.affectsBlueprint
              ? `Blueprint updated: ${lastRequest.affectedArtifactTypes.join(', ')}.`
              : 'Preview rebuilt only. Blueprint unchanged.'}
          </p>
        </div>
      )}

      {updatedArtifacts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm uppercase tracking-[0.18em] text-[#BEB6A3]">Updated artifacts</h3>
          <ArtifactGrid artifacts={updatedArtifacts} />
        </div>
      )}

      <AppPreview app={app} />

      <div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm uppercase tracking-[0.18em] text-[#BEB6A3]">Version history</h3>
          <span className="text-sm text-[#FFD66B]">v{versions[currentVersionIndex]?.versionNumber || 1}</span>
        </div>
        <div className="space-y-2">
          {versions.map((version, index) => (
            <button
              key={version.id}
              type="button"
              onClick={() => onRestore(index)}
              className={`w-full rounded-2xl border px-4 py-3 text-left ${index === currentVersionIndex ? 'border-[#D89B22]/40 bg-[#D89B22]/10' : 'border-[#D89B22]/10 bg-[#080706]'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span>v{version.versionNumber}: {version.label}</span>
                {index === currentVersionIndex && <span className="text-xs text-[#FFD66B]">Current</span>}
              </div>
              {version.changeRequest && <p className="mt-1 text-sm text-[#BEB6A3]">{version.changeRequest.text}</p>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppPreview({ app }: { app: GeneratedApp }) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[#D89B22]/25 bg-white">
      <div className="flex items-center justify-between bg-[#12100C] px-4 py-3 text-sm">
        <span className="text-[#FFF8E7]">Live preview · {app.name}</span>
        <span className="text-[#FFD66B]">Phone</span>
      </div>
      <iframe title={`${app.name} preview`} srcDoc={app.previewHtml} className="h-[520px] w-full border-0" />
    </div>
  );
}

function ArtifactGrid({ artifacts }: { artifacts: BlueprintArtifact[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {artifacts.map((artifact, index) => (
        <details key={artifact.id} open={index < 2} className="rounded-2xl border border-[#D89B22]/15 bg-[#12100C] p-4">
          <summary className="cursor-pointer list-none">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">{index + 1}. {artifact.title}</span>
              <span className={`text-xs ${artifact.status === 'stale' ? 'text-[#BEB6A3]' : 'text-[#FFD66B]'}`}>{artifact.status === 'stale' ? 'Stale' : 'Ready'}</span>
            </div>
            <p className="mt-2 text-sm text-[#BEB6A3]">{artifact.plainLanguageSummary}</p>
          </summary>
          <div className="mt-4 border-t border-[#D89B22]/10 pt-4 text-sm text-[#FFF8E7]/80">{artifact.technicalDetail}</div>
        </details>
      ))}
    </div>
  );
}

function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5">
      <h3 className="text-sm uppercase tracking-[0.18em] text-[#BEB6A3]">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}
