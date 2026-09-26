"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BrandMark } from '@/components/brand-mark';
import {
  buildDiscoveryStatusText,
  buildProblemBrief,
  generateDemoBlueprint,
  generateDiscoveryQuestions,
  generateSampleDiscoveryAnswers,
} from '@/lib/demo-data';
import { generateDemoApp } from '@/lib/generated-app';
import {
  BlueprintArtifact,
  ChangeRequest,
  CommonsSolution,
  DiscoveryQuestion,
  GeneratedApp,
  ProblemBrief,
  ProjectVersion,
  SolutionProposal,
} from '@/lib/domain';
import { trackActivity } from '@/lib/activity-client';
import { BlueprintOffer, type BlueprintOfferInput } from '@/components/blueprint-offer';
import { CTA_LABEL, DEFAULT_PROBLEM } from '@/lib/copy';
import {
  SEEDED_SOLUTIONS,
  commonsSolutionToProposal,
  makeProblemRecord,
  searchCommons,
} from '@/lib/commons';
import { APPROACHES, ApproachOption, nonSoftwarePlan, proposalFromApproach } from '@/lib/smallest';
import { applyRefinement, createInitialPreviewVersion, restoreVersion, undoVersion } from '@/lib/refine';
import { recordAdaptation, recordSolutionCreated, rememberSubmittedProblem } from '@/lib/commons-store';
import {
  BlueprintView,
  BuildView,
  CommonsSearchView,
  Info,
  PlanInviteView,
  RefineView,
  ResolvedView,
  SmallestView,
} from './studio-views';

const stages = ['Problem', 'Understand', 'Existing', 'Smallest useful', 'Plan', 'Build', 'Refine', 'Adapt'];
type FlowStage =
  | 'problem'
  | 'discovery'
  | 'brief'
  | 'commons'
  | 'smallest'
  | 'adapt'
  | 'plan-invite'
  | 'blueprint'
  | 'build'
  | 'preview'
  | 'refine'
  | 'resolved';

const examples = [
  DEFAULT_PROBLEM,
  'My daughter has ADHD and keeps leaving completed homework at home.',
  'We keep losing track of which customer approved what.',
  'I want to know whether conditions are good for crabbing before I load the car.',
];

export default function StudioPage() {
  const searchParams = useSearchParams();
  const initialProblem = searchParams.get('problem')?.trim() || DEFAULT_PROBLEM;
  const fromSlug = searchParams.get('from');
  const useId = searchParams.get('use');
  const adaptId = searchParams.get('adapt');

  const [problem, setProblem] = useState(initialProblem);
  const [questions, setQuestions] = useState<DiscoveryQuestion[]>(() => generateDiscoveryQuestions(initialProblem));
  const [answers, setAnswers] = useState<Record<string, string>>(() => generateSampleDiscoveryAnswers(initialProblem));
  const [brief, setBrief] = useState<ProblemBrief | null>(null);
  const [selectedSolution, setSelectedSolution] = useState<SolutionProposal | null>(null);
  const [artifacts, setArtifacts] = useState<BlueprintArtifact[]>([]);
  const [app, setApp] = useState<GeneratedApp | null>(null);
  const [flowStage, setFlowStage] = useState<FlowStage>('problem');
  const stageStarted = useRef(Date.now());
  const stagePrev = useRef<FlowStage>('problem');

  useEffect(() => {
    const now = Date.now();
    if (stagePrev.current !== flowStage) {
      trackActivity('studio_stage_leave', { stage: stagePrev.current }, now - stageStarted.current);
      stageStarted.current = now;
      stagePrev.current = flowStage;
    }
    trackActivity('studio_stage', { stage: flowStage });
  }, [flowStage]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [buildStep, setBuildStep] = useState(0);
  const [refinement, setRefinement] = useState('');
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [lastRequest, setLastRequest] = useState<ChangeRequest | null>(null);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);
  const [approachId, setApproachId] = useState<ApproachOption['id'] | null>(null);
  const [adaptNote, setAdaptNote] = useState('');
  const [adaptTarget, setAdaptTarget] = useState<CommonsSolution | null>(
    () => SEEDED_SOLUTIONS.find((item) => item.id === adaptId) || null,
  );
  const [nonSoftwareSteps, setNonSoftwareSteps] = useState<string[] | null>(null);
  const [countedSolution, setCountedSolution] = useState(false);

  const record = useMemo(() => makeProblemRecord(problem), [problem]);
  const search = useMemo(() => searchCommons(problem), [problem]);
  const matches = search.matches;
  const hasExisting = matches.some((match) => match.solutions.length > 0);
  const statusText = useMemo(() => buildDiscoveryStatusText(problem, answers), [problem, answers]);
  const approaches = APPROACHES.filter((item) => !item.needsExisting || hasExisting);

  const offerInput = useMemo<BlueprintOfferInput | null>(() => {
    if (!brief || !selectedSolution || !selectedSolution.requiresSoftware) return null;
    return {
      problem,
      answers: questions
        .map((q) => ({ question: q.question, answer: answers[q.id] || '' }))
        .filter((a) => a.answer.trim()),
      brief: {
        summary: brief.summary,
        affectedUsers: brief.affectedUsers,
        currentWorkaround: brief.currentWorkaround,
        friction: brief.friction,
        desiredOutcome: brief.desiredOutcome,
      },
      solution: {
        title: selectedSolution.title,
        summary: selectedSolution.plainLanguageSummary,
        howItWorks: selectedSolution.howItWorks,
        mvpFeatures: selectedSolution.mvpFeatures,
        nonGoals: selectedSolution.nonGoals,
        privacyNotes: selectedSolution.privacyNotes,
      },
    };
  }, [answers, brief, problem, questions, selectedSolution]);

  const activeStage =
    flowStage === 'problem' ? 0
      : flowStage === 'discovery' || flowStage === 'brief' ? 1
        : flowStage === 'commons' ? 2
          : flowStage === 'smallest' || flowStage === 'adapt' ? 3
            : flowStage === 'plan-invite' || flowStage === 'blueprint' ? 4
              : flowStage === 'build' ? 5
                : flowStage === 'preview' || flowStage === 'refine' ? 6
                  : 7;

  const stageTitle =
    flowStage === 'problem' ? 'Problem'
      : flowStage === 'discovery' ? 'Understand'
        : flowStage === 'brief' ? 'Shared understanding'
          : flowStage === 'commons' ? 'Existing solutions'
            : flowStage === 'smallest' ? 'Smallest useful solution'
              : flowStage === 'adapt' ? 'Your version'
                : flowStage === 'plan-invite' || flowStage === 'blueprint' ? 'Plan'
                  : flowStage === 'build' ? 'Build'
                    : flowStage === 'preview' ? 'Preview'
                      : flowStage === 'refine' ? 'Refine'
                        : 'Adapt';

  function startDiscovery() {
    rememberSubmittedProblem(problem);
    setQuestions(generateDiscoveryQuestions(problem));
    setAnswers(generateSampleDiscoveryAnswers(problem));
    setFlowStage('discovery');
  }

  function generateBrief() {
    setBrief(buildProblemBrief(problem, answers));
    setFlowStage('brief');
  }

  function goCommons() {
    if (useId) {
      const found = SEEDED_SOLUTIONS.find((item) => item.id === useId);
      if (found) {
        useExisting(found);
        return;
      }
    }
    if (adaptId) {
      const found = SEEDED_SOLUTIONS.find((item) => item.id === adaptId);
      if (found) {
        beginAdapt(found);
        return;
      }
    }
    setFlowStage('commons');
  }

  function useExisting(solution: CommonsSolution) {
    const proposal = commonsSolutionToProposal(solution);
    setSelectedSolution(proposal);
    markCreated();
    if (solution.kind === 'no_software') {
      setNonSoftwareSteps(nonSoftwarePlan(problem));
      setFlowStage('resolved');
      return;
    }
    setNonSoftwareSteps(null);
    const generated = generateDemoApp(proposal);
    setApp(generated);
    setFlowStage('preview');
  }

  function beginAdapt(solution: CommonsSolution) {
    setAdaptTarget(solution);
    setFlowStage('adapt');
  }

  function applyAdapt() {
    if (!adaptTarget) return;
    const proposal = commonsSolutionToProposal(adaptTarget, true);
    const note = adaptNote.trim();
    const nextProposal = {
      ...proposal,
      plainLanguageSummary: note
        ? `${proposal.plainLanguageSummary} What is different here: ${note}`
        : proposal.plainLanguageSummary,
      howItWorks: note ? `${proposal.howItWorks} Adapted around: ${note}` : proposal.howItWorks,
    };
    setSelectedSolution(nextProposal);
    recordAdaptation(record.slug, adaptTarget.id, note || 'A slightly different situation.');
    if (adaptTarget.kind === 'no_software') {
      setNonSoftwareSteps(nonSoftwarePlan(problem));
      markCreated();
      setFlowStage('resolved');
      return;
    }
    preparePlan(nextProposal);
  }

  function chooseApproach(id: ApproachOption['id']) {
    setApproachId(id);
  }

  function continueApproach() {
    if (!approachId) return;
    if (approachId === 'use_existing') {
      const first = matches.flatMap((match) => match.solutions)[0];
      if (first) useExisting(first);
      return;
    }
    if (approachId === 'adapt_existing') {
      const first = matches.flatMap((match) => match.solutions)[0];
      if (first) beginAdapt(first);
      return;
    }
    const existingTitle = matches.flatMap((match) => match.solutions)[0]?.title;
    const proposal = proposalFromApproach(approachId, problem, existingTitle);
    setSelectedSolution(proposal);
    if (approachId === 'no_software' || !proposal.requiresSoftware) {
      setNonSoftwareSteps(nonSoftwarePlan(problem));
      markCreated();
      setFlowStage('resolved');
      return;
    }
    preparePlan(proposal);
  }

  function preparePlan(explicit?: SolutionProposal) {
    const solution = explicit || selectedSolution || proposalFromApproach(approachId || 'tiny_app', problem);
    if (!brief) return;
    setSelectedSolution(solution);
    setIsGenerating(true);
    window.setTimeout(() => {
      setArtifacts(generateDemoBlueprint(solution, brief));
      setIsGenerating(false);
      setFlowStage('plan-invite');
    }, 500);
  }

  function startBuild() {
    const solution = selectedSolution;
    if (!solution || !brief) return;
    const currentArtifacts = artifacts.length ? artifacts : generateDemoBlueprint(solution, brief);
    setArtifacts(currentArtifacts);
    setFlowStage('build');
    setBuildStep(0);
    setIsGenerating(true);
    const timer = window.setInterval(() => {
      setBuildStep((step) => {
        if (step >= 4) {
          window.clearInterval(timer);
          const generated = generateDemoApp(solution, changeRequests);
          setApp(generated);
          setVersions([createInitialPreviewVersion(currentArtifacts, generated, solution)]);
          setCurrentVersionIndex(0);
          setIsGenerating(false);
          setFlowStage('preview');
          markCreated();
          return 4;
        }
        return step + 1;
      });
    }, 450);
  }

  function markCreated() {
    if (countedSolution) return;
    recordSolutionCreated();
    setCountedSolution(true);
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
      setFlowStage('preview');
    }, 450);
  }

  function restoreAt(index: number) {
    const restored = restoreVersion(versions, index);
    if (!restored) return;
    setArtifacts(restored.artifacts);
    setApp(restored.app);
    setSelectedSolution(restored.solution);
    setChangeRequests(restored.changeRequests);
    setCurrentVersionIndex(restored.currentVersionIndex);
    setLastRequest(versions[index]?.changeRequest || null);
    setFlowStage('preview');
  }

  function undoRefine() {
    const restored = undoVersion(versions, currentVersionIndex);
    if (!restored) return;
    restoreAt(restored.currentVersionIndex);
  }

  return (
    <main className="min-h-screen text-pearl">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 lg:flex-row lg:py-6">
        <aside className="w-full bg-transparent lg:max-w-[280px]">
          <div className="mb-5 flex items-center justify-center bg-transparent lg:justify-start">
            <BrandMark size="compact" priority />
          </div>
          <nav className="mb-4 hidden gap-3 px-1 text-sm text-champagne md:flex">
            <Link href="/manifesto" className="hover:text-pearl">Manifesto</Link>
            <Link href="/commons" className="hover:text-pearl">Commons</Link>
          </nav>
          <nav className="panel flex gap-2 overflow-x-auto p-4 pb-1 lg:flex-col lg:space-y-2 lg:overflow-visible" aria-label="Journey stages">
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
              <h1 className="mt-2 text-3xl font-semibold">{stageTitle}</h1>
            </div>
            <span className="chip">Demo commons</span>
          </div>

          {flowStage === 'problem' && (
            <>
              <div className="panel-quiet p-5">
                <label htmlFor="problem" className="mb-3 block text-sm text-champagne">
                  {fromSlug ? 'This problem is already in the commons.' : CTA_LABEL}
                </label>
                <textarea
                  id="problem"
                  value={problem}
                  onChange={(event) => setProblem(event.target.value)}
                  className="h-40 w-full resize-none rounded-2xl border border-[rgba(232,176,32,0.15)] bg-void p-4 text-base text-pearl outline-none placeholder:text-champagne"
                  placeholder="Describe something that should work better."
                />
                <p className="mt-3 text-sm text-champagne">
                  Permanent page: /problems/{record.slug}
                </p>
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
                  Help understand this
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
                  Show the shared understanding
                </button>
              </div>
            </div>
          )}

          {flowStage === 'brief' && brief && (
            <div className="space-y-6">
              <div className="panel-quiet p-5">
                <p className="gold-label">Shared understanding</p>
                <h2 className="mt-3 text-2xl font-semibold">{brief.summary}</h2>
                <p className="mt-3 text-sm text-champagne">Did I understand the problem correctly?</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Info title="Affected people">
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
                  Edit understanding
                </button>
                <button type="button" onClick={goCommons} className="btn-gold">
                  Search the commons
                </button>
              </div>
            </div>
          )}

          {flowStage === 'commons' && (
            <CommonsSearchView
              problem={record}
              matches={matches}
              onUse={useExisting}
              onAdapt={beginAdapt}
              onCreateDifferent={() => setFlowStage('smallest')}
            />
          )}

          {flowStage === 'smallest' && (
            <SmallestView
              approaches={approaches}
              selectedId={approachId}
              onSelect={chooseApproach}
              onContinue={continueApproach}
            />
          )}

          {flowStage === 'adapt' && adaptTarget && (
            <div className="space-y-6">
              <div className="panel-quiet p-5">
                <p className="gold-label">Make this solve my version</p>
                <h2 className="mt-3 text-2xl font-semibold">{adaptTarget.title}</h2>
                <p className="mt-2 text-champagne">{adaptTarget.summary}</p>
              </div>
              <label className="block">
                <span className="mb-3 block text-sm text-champagne">What is different about your situation?</span>
                <textarea
                  value={adaptNote}
                  onChange={(event) => setAdaptNote(event.target.value)}
                  className="h-32 w-full rounded-2xl border border-[rgba(232,176,32,0.15)] bg-void p-4 outline-none"
                  placeholder="Dad lives alone. Mom also needs medication reminders. One family has four siblings. A caregiver needs Spanish."
                />
              </label>
              <div className="flex justify-end">
                <button type="button" className="btn-gold" onClick={applyAdapt}>
                  Adapt around that
                </button>
              </div>
            </div>
          )}

          {flowStage === 'plan-invite' && (
            <PlanInviteView
              onShow={() => setFlowStage('blueprint')}
              onSkip={startBuild}
            />
          )}

          {flowStage === 'blueprint' && selectedSolution && (
            <>
              <BlueprintView artifacts={artifacts} solution={selectedSolution} onBuild={startBuild} />
              {offerInput && <BlueprintOffer input={offerInput} placement="plan" />}
            </>
          )}

          {(flowStage === 'build' || flowStage === 'preview') && (
            <>
              <BuildView
                isGenerating={isGenerating}
                buildStep={buildStep}
                app={app}
                versionLabel={versions[currentVersionIndex]?.label}
                onRefine={() => setFlowStage('refine')}
                onShare={() => setFlowStage('resolved')}
              />
              {flowStage === 'preview' && !isGenerating && offerInput && (
                <BlueprintOffer input={offerInput} placement="preview" />
              )}
            </>
          )}

          {flowStage === 'refine' && app && (
            <RefineView
              refinement={refinement}
              onRefinementChange={setRefinement}
              isApplying={isGenerating}
              lastRequest={lastRequest}
              artifacts={artifacts}
              versions={versions}
              currentVersionIndex={currentVersionIndex}
              onApply={applyRefine}
              onUndo={undoRefine}
              onRestore={restoreAt}
              onBackToPreview={() => setFlowStage('preview')}
            />
          )}

          {flowStage === 'resolved' && (
            <ResolvedView
              problem={problem}
              brief={brief}
              solution={selectedSolution}
              steps={nonSoftwareSteps || undefined}
              software={Boolean(selectedSolution?.requiresSoftware)}
            />
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
              <a className="mt-3 inline-block text-gold-bright" href={`/problems/${record.slug}?q=${encodeURIComponent(problem)}`}>
                Open problem page
              </a>
            </div>
            <div className="panel-quiet p-4">
              <div className="mb-2 text-champagne">Direction</div>
              <p>{selectedSolution?.title || brief?.desiredOutcome || 'Find the smallest useful solution. Software is optional.'}</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
