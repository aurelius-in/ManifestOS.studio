import {
  BlueprintArtifact,
  ChangeRequest,
  CommonsMatch,
  CommonsProblem,
  CommonsSolution,
  GeneratedApp,
  ProblemBrief,
  ProjectVersion,
  SolutionProposal,
} from '@/lib/domain';
import { COMMONS_HONESTY } from '@/lib/copy';
import { ApproachOption } from '@/lib/smallest';
import { buildPreviewSrcDoc } from '@/lib/generated-app';

export function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel-quiet p-5">
      <h3 className="text-sm uppercase tracking-[0.18em] text-champagne">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function CommonsSearchView({
  problem,
  matches,
  onUse,
  onAdapt,
  onCreateDifferent,
}: {
  problem: CommonsProblem;
  matches: CommonsMatch[];
  onUse: (solution: CommonsSolution) => void;
  onAdapt: (solution: CommonsSolution) => void;
  onCreateDifferent: () => void;
}) {
  const hasHits = matches.some((match) => match.solutions.length > 0);
  return (
    <div className="space-y-6">
      <div className="panel-quiet p-5">
        <p className="gold-label">Existing solutions</p>
        <h2 className="mt-3 text-2xl font-semibold">Has anyone already solved a version of this?</h2>
        <p className="mt-2 text-champagne">{COMMONS_HONESTY}</p>
      </div>
      {!hasHits ? (
        <div className="panel-quiet p-5">
          <p className="text-lg text-pearl">No close match in this small commons yet.</p>
          <p className="mt-2 text-champagne">
            That is expected. We will not invent a crowd. You can still look for the smallest useful solution, including not building software.
          </p>
        </div>
      ) : (
        matches.map((match) => (
          <div key={match.problem.slug} className="space-y-3">
            <p className="text-sm text-champagne">
              Similar problem: {match.problem.statement}
              {match.problem.seeded ? ' (seeded)' : ''}
            </p>
            {match.solutions.map((solution) => (
              <article key={solution.id} className="panel-quiet p-5">
                <p className="gold-label">{solution.kind === 'no_software' ? 'Not software' : 'Existing solution'}</p>
                <h3 className="mt-2 text-xl font-semibold">{solution.title}</h3>
                <p className="mt-2 text-champagne">{solution.summary}</p>
                <p className="mt-2 text-sm">{solution.howItHelps}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-gold-primary">
                  {solution.peopleUsing} using this seeded example
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" className="btn-ghost !px-4 !py-2 text-sm" onClick={() => onUse(solution)}>
                    Use one
                  </button>
                  <button type="button" className="btn-gold !px-4 !py-2 text-sm" onClick={() => onAdapt(solution)}>
                    Make this solve my version
                  </button>
                </div>
              </article>
            ))}
          </div>
        ))
      )}
      <div className="flex justify-end">
        <button type="button" className="btn-gold" onClick={onCreateDifferent}>
          Create something different
        </button>
      </div>
      <p className="hidden text-xs text-champagne">{problem.statement}</p>
    </div>
  );
}

export function SmallestView({
  approaches,
  selectedId,
  onSelect,
  onContinue,
}: {
  approaches: ApproachOption[];
  selectedId: string | null;
  onSelect: (id: ApproachOption['id']) => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="gold-label">Possible solutions</p>
        <h2 className="mt-2 text-2xl font-semibold">What is the smallest useful solution?</h2>
        <p className="mt-2 text-champagne">
          Other builders are rewarded when you build more software. ManifestOS is rewarded when the problem gets solved.
        </p>
      </div>
      <div className="grid gap-3">
        {approaches.map((approach) => (
          <button
            key={approach.id}
            type="button"
            onClick={() => onSelect(approach.id)}
            className={`rounded-[1.5rem] border p-5 text-left ${
              selectedId === approach.id
                ? 'border-[rgba(255,213,106,0.5)] bg-[rgba(232,176,32,0.12)] shadow-glow'
                : 'border-[rgba(232,176,32,0.15)] bg-panel'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold">{approach.title}</h3>
              <span className="chip">{approach.software ? 'Might be software' : 'May skip software'}</span>
            </div>
            <p className="mt-2 text-champagne">{approach.summary}</p>
          </button>
        ))}
      </div>
      <div className="flex justify-end">
        <button type="button" className="btn-gold" disabled={!selectedId} onClick={onContinue}>
          Continue with this path
        </button>
      </div>
    </div>
  );
}

export function PlanInviteView({
  onShow,
  onSkip,
}: {
  onShow: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="panel-quiet p-6">
        <p className="gold-label">A plan exists</p>
        <h2 className="mt-3 text-3xl font-semibold">I figured out how your solution should work. Want to see the plan?</h2>
        <p className="mt-3 text-champagne">
          The professional pieces stay underneath. You do not need to become a software professional to continue.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button type="button" className="btn-ghost" onClick={onSkip}>
          Skip ahead and make it
        </button>
        <button type="button" className="btn-gold" onClick={onShow}>
          Yes, show me
        </button>
      </div>
    </div>
  );
}

export function BlueprintView({
  artifacts,
  solution,
  onBuild,
}: {
  artifacts: BlueprintArtifact[];
  solution: SolutionProposal;
  onBuild: () => void;
}) {
  const humane = artifacts.filter((artifact) =>
    ['problem_brief', 'solution_brief', 'mvp_scope', 'user_flows', 'non_goals'].includes(artifact.type),
  );
  const hidden = artifacts.filter((artifact) => !humane.includes(artifact));
  return (
    <div className="space-y-6">
      <div className="panel-quiet p-5">
        <p className="gold-label">The plan, in ordinary language</p>
        <h2 className="mt-3 text-2xl font-semibold">{solution.title}</h2>
        <p className="mt-2 text-champagne">{solution.plainLanguageSummary}</p>
      </div>
      <div className="grid gap-3">
        {humane.map((artifact) => (
          <div key={artifact.id} className="rounded-2xl border border-[rgba(232,176,32,0.15)] bg-panel p-4">
            <p className="font-medium">{artifact.title}</p>
            <p className="mt-2 text-sm text-champagne">{artifact.plainLanguageSummary}</p>
          </div>
        ))}
      </div>
      <details className="rounded-2xl border border-[rgba(232,176,32,0.15)] bg-void p-4">
        <summary className="cursor-pointer text-sm text-gold-bright">How it is built underneath</summary>
        <div className="mt-4 space-y-3">
          {hidden.map((artifact) => (
            <div key={artifact.id} className="text-sm">
              <p className="text-pearl">{artifact.title}</p>
              <p className="text-champagne">{artifact.plainLanguageSummary}</p>
              <p className="mt-1 text-xs text-pearl/60">{artifact.technicalDetail}</p>
            </div>
          ))}
        </div>
      </details>
      <div className="flex justify-end">
        <button type="button" className="btn-gold" onClick={onBuild}>
          Make it from this plan
        </button>
      </div>
    </div>
  );
}

export function BuildView({
  isGenerating,
  buildStep,
  app,
  versionLabel,
  onRefine,
  onShare,
}: {
  isGenerating: boolean;
  buildStep: number;
  app: GeneratedApp | null;
  versionLabel?: string;
  onRefine: () => void;
  onShare: () => void;
}) {
  const steps = [
    'Setting up the foundation',
    'Creating the information this solution needs to remember',
    'Building the main workflow',
    'Checking for mistakes',
    'Getting your preview ready',
  ];
  return (
    <div className="space-y-6">
      <div className="panel-quiet p-5">
        <p className="gold-label">{isGenerating ? 'Making it real' : 'It exists.'}</p>
        <h2 className="mt-3 text-3xl font-semibold">
          {isGenerating ? steps[buildStep] : 'A working preview is ready.'}
        </h2>
        <p className="mt-2 text-champagne">
          {isGenerating
            ? 'The build is following the hidden plan.'
            : `This preview follows the current plan${versionLabel ? `. ${versionLabel}.` : '.'}`}
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
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" className="btn-ghost" onClick={onShare}>
              Make this useful to somebody else
            </button>
            <button type="button" className="btn-gold" onClick={onRefine}>
              Change something
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function RefineView({
  refinement,
  onRefinementChange,
  isApplying,
  lastRequest,
  artifacts,
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
  versions: ProjectVersion[];
  currentVersionIndex: number;
  onApply: () => void;
  onUndo: () => void;
  onRestore: (index: number) => void;
  onBackToPreview: () => void;
}) {
  const examples = [
    'Make the main button even larger.',
    'Call it CareLog.',
    'Remember who fed the dog.',
  ];
  return (
    <div className="space-y-6">
      <div>
        <p className="gold-label">Refine</p>
        <h2 className="mt-2 text-2xl font-semibold">What would you like to change?</h2>
        <p className="mt-2 text-champagne">
          ManifestOS will classify the request, update the hidden plan only when it is affected, rebuild the preview, and keep a version you can undo.
        </p>
      </div>
      <textarea
        value={refinement}
        onChange={(event) => onRefinementChange(event.target.value)}
        className="h-32 w-full rounded-2xl border border-[rgba(232,176,32,0.15)] bg-panel p-4 outline-none"
        placeholder="For example: make the main button even larger."
      />
      <div className="flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => onRefinementChange(example)}
            className="rounded-full border border-[rgba(232,176,32,0.2)] px-3 py-2 text-sm text-champagne hover:text-pearl"
          >
            {example}
          </button>
        ))}
      </div>
      {lastRequest && (
        <div className="panel-quiet p-4 text-sm">
          <p className="text-gold-bright">{lastRequest.label}</p>
          <p className="mt-1 text-champagne">{lastRequest.reason}</p>
        </div>
      )}
      <div className="flex flex-wrap justify-between gap-3">
        <button type="button" className="btn-ghost" onClick={onBackToPreview}>
          Back to preview
        </button>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost" onClick={onUndo} disabled={currentVersionIndex <= 0 || isApplying}>
            Undo
          </button>
          <button type="button" className="btn-gold" onClick={onApply} disabled={!refinement.trim() || isApplying}>
            {isApplying ? 'Applying change…' : 'Apply change'}
          </button>
        </div>
      </div>
      <div className="panel-quiet p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-[0.18em] text-champagne">Version history</h3>
          <span className="text-sm text-gold-bright">v{versions[currentVersionIndex]?.versionNumber || 1}</span>
        </div>
        <div className="space-y-2">
          {versions.map((version, index) => (
            <button
              key={version.id}
              type="button"
              onClick={() => onRestore(index)}
              className={`w-full rounded-2xl border px-4 py-3 text-left ${
                index === currentVersionIndex
                  ? 'border-[rgba(255,213,106,0.45)] bg-[rgba(232,176,32,0.12)]'
                  : 'border-[rgba(232,176,32,0.1)] bg-void'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span>v{version.versionNumber}: {version.label}</span>
                {index === currentVersionIndex && <span className="text-xs text-gold-bright">Current</span>}
              </div>
              {version.changeRequest && <p className="mt-1 text-sm text-champagne">{version.changeRequest.text}</p>}
            </button>
          ))}
        </div>
      </div>
      <details className="rounded-2xl border border-[rgba(232,176,32,0.15)] p-4 text-sm">
        <summary className="cursor-pointer text-gold-bright">Updated plan notes</summary>
        <ul className="mt-3 space-y-2 text-champagne">
          {artifacts.slice(0, 6).map((artifact) => (
            <li key={artifact.id}>
              {artifact.title}: {artifact.status}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

export function ResolvedView({
  problem,
  brief,
  solution,
  steps,
  software,
}: {
  problem: string;
  brief: ProblemBrief | null;
  solution: SolutionProposal | null;
  steps?: string[];
  software: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="panel-quiet p-5">
        <p className="gold-label">{software ? 'Ready to travel' : 'Solved without an app'}</p>
        <h2 className="mt-3 text-3xl font-semibold">
          {software ? 'Make this solve someone else\'s version.' : 'The smallest useful fix may not be software.'}
        </h2>
        <p className="mt-3 text-champagne">{problem}</p>
      </div>
      {solution && (
        <div className="panel-quiet p-5">
          <h3 className="text-xl font-semibold">{solution.title}</h3>
          <p className="mt-2 text-champagne">{solution.plainLanguageSummary}</p>
        </div>
      )}
      {steps && (
        <ol className="list-decimal space-y-2 pl-6 text-champagne">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      )}
      {brief && <p className="text-sm text-champagne">Understood as: {brief.desiredOutcome}</p>}
      <div className="flex flex-col gap-3 sm:flex-row">
        <a href="/commons" className="btn-ghost">
          Back to the commons
        </a>
        <a href="/#tell-us" className="btn-gold">
          Tell us something that should work better.
        </a>
      </div>
    </div>
  );
}
