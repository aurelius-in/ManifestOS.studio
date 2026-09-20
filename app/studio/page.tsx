"use client";

import { useMemo, useState } from 'react';
import { buildDiscoveryStatusText, buildProblemBrief, demoSolutions, generateDemoBlueprint, generateDemoBuildTasks, generateDiscoveryQuestions, generateSampleDiscoveryAnswers } from '@/lib/demo-data';
import { BlueprintArtifact, DiscoveryQuestion, ProblemBrief, SolutionProposal } from '@/lib/domain';

const defaultProblem = 'My dad sometimes forgets whether he already fed the dog, and multiple family members may visit during the day.';
const stages = ['Problem', 'Understand', 'Envision', 'Blueprint', 'Build', 'Refine', 'Share'];
type FlowStage = 'problem' | 'discovery' | 'brief' | 'solutions' | 'blueprint';

export default function StudioPage({ searchParams }: { searchParams?: { problem?: string } }) {
  const initialProblem = searchParams?.problem?.trim() || defaultProblem;
  const [problem, setProblem] = useState(initialProblem);
  const [questions, setQuestions] = useState<DiscoveryQuestion[]>(() => generateDiscoveryQuestions(initialProblem));
  const [answers, setAnswers] = useState<Record<string, string>>(() => generateSampleDiscoveryAnswers(initialProblem));
  const [brief, setBrief] = useState<ProblemBrief | null>(null);
  const [solutions, setSolutions] = useState<SolutionProposal[]>(demoSolutions);
  const [selectedSolutionId, setSelectedSolutionId] = useState<string | null>(null);
  const [artifacts, setArtifacts] = useState<BlueprintArtifact[]>([]);
  const [flowStage, setFlowStage] = useState<FlowStage>('problem');
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedSolution = solutions.find((solution) => solution.id === selectedSolutionId) || null;
  const statusText = useMemo(() => buildDiscoveryStatusText(problem, answers), [problem, answers]);
  const activeStage = flowStage === 'problem' ? 0 : flowStage === 'discovery' ? 1 : flowStage === 'brief' ? 1 : flowStage === 'solutions' ? 2 : 3;

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
    setFlowStage('solutions');
  }

  function chooseSolution(id: string) {
    setSelectedSolutionId(id);
    setSolutions((current) => current.map((solution) => ({ ...solution, selected: solution.id === id })));
  }

  function createBlueprint() {
    if (!brief || !selectedSolution) return;
    setIsGenerating(true);
    window.setTimeout(() => {
      setArtifacts(generateDemoBlueprint(selectedSolution, brief));
      setIsGenerating(false);
      setFlowStage('blueprint');
    }, 650);
  }

  return (
    <main className="min-h-screen bg-[#080706] text-[#FFF8E7]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="w-full rounded-[1.75rem] border border-[#D89B22]/20 bg-[#12100C] p-4 lg:max-w-[260px]">
          <div className="mb-6 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D89B22]/30 bg-[#0D0C09] text-sm font-semibold text-[#FFD66B]">M</div><div><div className="text-[10px] uppercase tracking-[0.25em] text-[#BEB6A3]">ManifestOS</div><div className="text-sm font-medium">Manifest Studio</div></div></div>
          <nav className="space-y-2" aria-label="Journey stages">
            {stages.map((stage, index) => <div key={stage} className={`flex items-center gap-3 rounded-2xl border px-3 py-3 ${index <= activeStage ? 'border-[#D89B22]/35 bg-[#D89B22]/5 text-[#FFD66B]' : 'border-transparent text-[#FFF8E7]/85'}`}><span className="flex h-7 w-7 items-center justify-center rounded-full border border-current text-xs">{index + 1}</span><span>{stage}</span></div>)}
          </nav>
        </aside>

        <section className="flex-1 rounded-[1.75rem] border border-[#D89B22]/20 bg-[#0D0C09] p-5 md:p-8">
          <div className="mb-8 flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.24em] text-[#D89B22]">Current stage</p><h1 className="mt-2 text-3xl font-semibold">{flowStage === 'problem' ? 'Problem' : flowStage === 'discovery' ? 'Understand' : flowStage === 'brief' ? 'Problem Brief' : flowStage === 'solutions' ? 'Envision' : 'Blueprint'}</h1></div><span className="rounded-full border border-[#D89B22]/20 px-4 py-2 text-sm text-[#FFD66B]">Demo mode</span></div>

          {flowStage === 'problem' && <><div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5"><label htmlFor="problem" className="mb-3 block text-sm text-[#BEB6A3]">What problem do you wish software could solve?</label><textarea id="problem" value={problem} onChange={(event) => setProblem(event.target.value)} className="h-40 w-full resize-none rounded-2xl border border-[#D89B22]/15 bg-[#080706] p-4 text-base text-[#FFF8E7] outline-none placeholder:text-[#BEB6A3]" placeholder="Describe something annoying, repetitive, confusing, difficult, or unnecessarily complicated." /></div><div className="mt-8 grid gap-4 md:grid-cols-2">{['We keep losing track of which customer approved what.','My students need a simpler way to remember what goes back to which teacher.','I want to know whether conditions are good for crabbing before I load the car.','The clinic keeps re-checking the same follow-up tasks.'].map((example) => <button key={example} type="button" onClick={() => setProblem(example)} className="rounded-2xl border border-[#D89B22]/15 bg-[#12100C] p-4 text-left text-sm text-[#BEB6A3] hover:border-[#D89B22]/35 hover:text-[#FFF8E7]">{example}</button>)}</div><div className="mt-8 flex justify-end"><button type="button" onClick={startDiscovery} disabled={!problem.trim()} className="rounded-full border border-[#D89B22]/30 bg-[#D89B22] px-6 py-3 font-medium text-[#080706] disabled:cursor-not-allowed disabled:opacity-50">Start discovery</button></div></>}

          {flowStage === 'discovery' && <div className="space-y-6"><div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5"><p className="text-sm text-[#BEB6A3]">Current problem</p><p className="mt-2 text-lg">{problem}</p></div>{questions.map((question) => <div key={question.id} className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5"><p className="text-lg font-medium">{question.question}</p>{question.reason && <p className="mt-1 text-sm text-[#BEB6A3]">{question.reason}</p>}{question.answerType === 'choice' && question.choices ? <div className="mt-4 flex flex-wrap gap-3">{question.choices.map((choice) => <button key={choice} type="button" onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: choice }))} className={`rounded-full border px-4 py-2 text-sm ${answers[question.id] === choice ? 'border-[#D89B22]/35 bg-[#D89B22]/10 text-[#FFD66B]' : 'border-[#D89B22]/15 bg-[#080706] text-[#FFF8E7]'}`}>{choice}</button>)}{question.allowYouDecide && <button type="button" onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: 'You decide' }))} className="rounded-full border border-[#D89B22]/15 px-4 py-2 text-sm text-[#BEB6A3]">You decide</button>}</div> : <textarea value={answers[question.id] ?? ''} onChange={(event) => setAnswers((previous) => ({ ...previous, [question.id]: event.target.value }))} className="mt-4 h-28 w-full resize-none rounded-2xl border border-[#D89B22]/15 bg-[#080706] p-4 text-base outline-none placeholder:text-[#BEB6A3]" placeholder="Tell us more in plain language." />}</div>)}<div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5"><p className="text-sm text-[#BEB6A3]">What we understand so far</p><p className="mt-2">{statusText}</p></div><div className="flex justify-end"><button type="button" onClick={generateBrief} className="rounded-full border border-[#D89B22]/30 bg-[#D89B22] px-6 py-3 font-medium text-[#080706]">Confirm Problem Brief</button></div></div>}

          {flowStage === 'brief' && brief && <div className="space-y-6"><div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5"><p className="text-xs uppercase tracking-[0.24em] text-[#D89B22]">Problem Brief</p><h2 className="mt-3 text-2xl font-semibold">{brief.summary}</h2><p className="mt-3 text-sm text-[#BEB6A3]">Did I understand the problem correctly?</p></div><div className="grid gap-4 md:grid-cols-2"><Info title="Affected users"><ul className="list-disc space-y-2 pl-5">{brief.affectedUsers.map((user) => <li key={user}>{user}</li>)}</ul></Info><Info title="Current workaround">{brief.currentWorkaround}</Info><Info title="Where it hurts">{brief.friction}</Info><Info title="A useful fix feels like">{brief.desiredOutcome}</Info></div><div className="flex justify-between"><button type="button" onClick={() => setFlowStage('discovery')} className="rounded-full border border-[#D89B22]/20 px-5 py-3">Edit discovery</button><button type="button" onClick={showSolutions} className="rounded-full border border-[#D89B22]/30 bg-[#D89B22] px-6 py-3 font-medium text-[#080706]">Yes, show me solutions</button></div></div>}

          {flowStage === 'solutions' && <div className="space-y-6"><div><p className="text-lg text-[#FFF8E7]">Here are a few ways to solve the problem. Start small unless you need more.</p><p className="mt-2 text-sm text-[#BEB6A3]">You can choose one, or let ManifestOS choose the simplest useful path.</p></div><div className="grid gap-4">{solutions.map((solution) => <button key={solution.id} type="button" onClick={() => chooseSolution(solution.id)} className={`rounded-[1.5rem] border p-5 text-left ${solution.selected ? 'border-[#D89B22]/50 bg-[#D89B22]/10 shadow-glow' : 'border-[#D89B22]/15 bg-[#12100C]'}`}><div className="flex flex-wrap items-center justify-between gap-3"><div><span className="text-xs uppercase tracking-[0.2em] text-[#D89B22]">{solution.complexity}</span><h2 className="mt-2 text-2xl font-semibold">{solution.title}</h2></div><span className="rounded-full border border-[#D89B22]/20 px-3 py-1 text-sm text-[#FFD66B]">{solution.selected ? 'Selected' : 'Choose this'}</span></div><p className="mt-3 text-[#BEB6A3]">{solution.plainLanguageSummary}</p><p className="mt-3 text-sm text-[#FFF8E7]/80">{solution.howItWorks}</p><div className="mt-4 flex flex-wrap gap-2">{solution.mvpFeatures.map((feature) => <span key={feature} className="rounded-full bg-[#080706] px-3 py-1 text-xs text-[#BEB6A3]">{feature}</span>)}</div></button>)}</div><div className="flex justify-end"><button type="button" onClick={() => { if (!selectedSolutionId) setSelectedSolutionId(solutions.find((solution) => solution.selected)?.id || solutions[0]?.id || null); createBlueprint(); }} disabled={isGenerating} className="rounded-full border border-[#D89B22]/30 bg-[#D89B22] px-6 py-3 font-medium text-[#080706] disabled:opacity-60">{isGenerating ? 'Designing your solution…' : 'Create Blueprint'}</button></div></div>}

          {flowStage === 'blueprint' && selectedSolution && <div className="space-y-6"><div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5"><p className="text-xs uppercase tracking-[0.24em] text-[#D89B22]">Blueprint ready</p><h2 className="mt-3 text-2xl font-semibold">The build now has a plan to follow.</h2><p className="mt-2 text-[#BEB6A3]">{selectedSolution.title} is based on the current Problem Brief. Each artifact is versioned and traceable.</p></div><div className="grid gap-3 md:grid-cols-2">{artifacts.map((artifact, index) => <details key={artifact.id} open={index < 2} className="rounded-2xl border border-[#D89B22]/15 bg-[#12100C] p-4"><summary className="cursor-pointer list-none"><div className="flex items-center justify-between gap-3"><span className="font-medium">{index + 1}. {artifact.title}</span><span className="text-xs text-[#FFD66B]">Ready</span></div><p className="mt-2 text-sm text-[#BEB6A3]">{artifact.plainLanguageSummary}</p></summary><div className="mt-4 border-t border-[#D89B22]/10 pt-4 text-sm text-[#FFF8E7]/80"><p>{artifact.technicalDetail}</p><p className="mt-3 text-xs text-[#BEB6A3]">Depends on: {artifact.dependsOn.length ? artifact.dependsOn.join(', ') : 'Nothing — this is the starting point.'}</p></div></details>)}</div><div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5"><h3 className="text-sm uppercase tracking-[0.18em] text-[#BEB6A3]">Build plan preview</h3><div className="mt-4 space-y-3">{generateDemoBuildTasks(selectedSolution).map((task, index) => <div key={task.id} className="flex gap-3 rounded-2xl bg-[#080706] p-3"><span className="text-[#D89B22]">{index + 1}</span><div><p className="font-medium">{task.plainLanguageTitle}</p><p className="text-sm text-[#BEB6A3]">{task.description}</p></div></div>)}</div></div><div className="flex justify-end"><button type="button" onClick={() => alert('The build engine will consume this Blueprint in the next milestone.')} className="rounded-full border border-[#D89B22]/30 bg-[#D89B22] px-6 py-3 font-medium text-[#080706]">Build from Blueprint</button></div></div>}
        </section>

        <aside className="w-full rounded-[1.75rem] border border-[#D89B22]/20 bg-[#12100C] p-4 lg:max-w-[280px]"><div className="mb-4 flex items-center justify-between text-sm text-[#BEB6A3]"><span>Summary</span><span className="rounded-full border border-[#D89B22]/20 px-2 py-1 text-xs uppercase tracking-[0.18em] text-[#FFD66B]">{flowStage === 'problem' ? 'Draft' : flowStage === 'discovery' ? 'Discovery' : flowStage === 'brief' ? 'Brief ready' : flowStage === 'solutions' ? 'Choose a path' : 'Blueprint ready'}</span></div><div className="space-y-4 text-sm text-[#FFF8E7]/80"><div className="rounded-2xl border border-[#D89B22]/15 bg-[#080706] p-4"><div className="mb-2 text-[#BEB6A3]">Problem</div><p>{problem}</p></div><div className="rounded-2xl border border-[#D89B22]/15 bg-[#080706] p-4"><div className="mb-2 text-[#BEB6A3]">Selected direction</div><p>{selectedSolution?.title || brief?.desiredOutcome || 'We will help you find the smallest useful solution.'}</p></div></div></aside>
      </div>
    </main>
  );
}

function Info({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-[1.5rem] border border-[#D89B22]/15 bg-[#12100C] p-5"><h3 className="text-sm uppercase tracking-[0.18em] text-[#BEB6A3]">{title}</h3><div className="mt-3 text-[#FFF8E7]">{children}</div></div>; }
