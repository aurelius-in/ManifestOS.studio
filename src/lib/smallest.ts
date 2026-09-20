import { SolutionKind, SolutionProposal } from './domain';

export interface ApproachOption {
  id: SolutionKind | 'use_existing' | 'adapt_existing';
  title: string;
  summary: string;
  software: boolean;
  needsExisting: boolean;
}

export const APPROACHES: ApproachOption[] = [
  {
    id: 'use_existing',
    title: 'Use an existing ManifestOS solution',
    summary: 'If the commons already has something close, start there instead of making another one.',
    software: false,
    needsExisting: true,
  },
  {
    id: 'adapt_existing',
    title: 'Adapt one',
    summary: 'Keep the bones of an existing solution and change it around your situation.',
    software: true,
    needsExisting: true,
  },
  {
    id: 'tiny_app',
    title: 'A tiny app',
    summary: 'A small screen that does one job clearly.',
    software: true,
    needsExisting: false,
  },
  {
    id: 'shared_tracker',
    title: 'A shared tracker',
    summary: 'One status everyone involved can see.',
    software: true,
    needsExisting: false,
  },
  {
    id: 'reminder',
    title: 'A reminder',
    summary: 'A nudge at the moment it usually gets forgotten.',
    software: true,
    needsExisting: false,
  },
  {
    id: 'automation',
    title: 'An automation',
    summary: 'Something that happens without another person having to remember.',
    software: true,
    needsExisting: false,
  },
  {
    id: 'calculator',
    title: 'A calculator',
    summary: 'Turn a confusing decision into a few numbers and a clear answer.',
    software: true,
    needsExisting: false,
  },
  {
    id: 'ai_assistant',
    title: 'An AI assistant',
    summary: 'A helper that answers in the language of this specific problem.',
    software: true,
    needsExisting: false,
  },
  {
    id: 'no_software',
    title: "Don't build software",
    summary: 'Sometimes a card, a script, or a shared habit is the smallest useful fix.',
    software: false,
    needsExisting: false,
  },
];

export function proposalFromApproach(approachId: ApproachOption['id'], problem: string, existingTitle?: string): SolutionProposal {
  const approach = APPROACHES.find((item) => item.id === approachId) || APPROACHES[2];
  const software = approach.software && approachId !== 'use_existing';
  const title =
    approachId === 'use_existing' && existingTitle ? existingTitle
      : approachId === 'adapt_existing' && existingTitle ? `${existingTitle} for this situation`
        : approach.title;
  return {
    id: `approach-${approach.id}`,
    title,
    plainLanguageSummary: approach.summary,
    howItWorks: howItWorks(approach.id, problem),
    whyItFits: 'This is the smallest useful path we can see from the current understanding.',
    primaryUsers: ['The people living with this problem'],
    mvpFeatures: featuresFor(approach.id),
    nonGoals: ['A startup', 'A marketplace', 'Anything bigger than the problem needs'],
    complexity: approach.id === 'no_software' ? 'simple' : 'simple',
    privacyNotes: 'Keep it with the people who need it unless you later ask to help it travel.',
    selected: true,
    kind: approach.id === 'use_existing' ? 'existing' : approach.id === 'adapt_existing' ? 'adapt' : (approach.id as SolutionKind),
    requiresSoftware: software,
  };
}

function featuresFor(id: ApproachOption['id']): string[] {
  switch (id) {
    case 'reminder':
      return ['Obvious reminder', 'Quiet after it is done', 'Works for the people involved'];
    case 'calculator':
      return ['A few inputs', 'A plain-language answer', 'Save the last result'];
    case 'ai_assistant':
      return ['Ask in ordinary language', 'Stay inside this problem', 'Keep a short history'];
    case 'automation':
      return ['One trigger', 'One useful action', 'A log of what happened'];
    case 'no_software':
      return ['A physical or social step', 'Someone who owns it', 'A way to notice it worked'];
    default:
      return ['See the current state', 'Take the main action', 'Leave a timestamp'];
  }
}

function howItWorks(id: ApproachOption['id'], problem: string): string {
  if (id === 'no_software') {
    return `For "${problem}", the useful fix may be a shared habit, a note in a visible place, or a short script people can follow.`;
  }
  return `This path stays close to the problem: ${problem}`;
}

export function nonSoftwarePlan(problem: string): string[] {
  const lower = problem.toLowerCase();
  if (lower.includes('dog') || lower.includes('fed') || lower.includes('dad')) {
    return [
      'Put a dated card or small whiteboard by the food.',
      'Whoever feeds the dog writes the time and their initials.',
      'Visiting family look at the card before they pour more food.',
      'If that still fails, then a tiny shared tracker may be worth making.',
    ];
  }
  return [
    'Write the current workaround on one page everyone can see.',
    'Name one person who owns the next step.',
    'Try that for a week before creating software.',
    'If people still miss it, come back and make the smallest tool that would have helped.',
  ];
}
