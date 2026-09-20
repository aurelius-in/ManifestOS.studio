import {
  CommonsMatch,
  CommonsProblem,
  CommonsSearchResult,
  CommonsSolution,
  NetworkStats,
  SolutionKind,
  SolutionProposal,
} from './domain';

export const SEED_PROBLEMS: CommonsProblem[] = [
  {
    id: 'problem-dad-dog-feeding',
    slug: 'dad-dog-feeding',
    statement: "My elderly dad can't reliably remember whether the dog has already been fed.",
    summary: 'A family keeps guessing whether the dog was fed, especially when more than one person might stop by.',
    details:
      'Dad lives with some independence, relatives visit at irregular times, and a missed meal or a double feeding is easy. The painful part is the uncertainty, not the feeding itself.',
    tags: ['family', 'caregiving', 'memory', 'dog', 'home', 'dad', 'feeding', 'household'],
    peopleWithThisProblem: 4,
    relatedSolutionIds: ['sol-fedyet', 'sol-feed-reminder', 'sol-fridge-checklist'],
    communitiesHelped: ['Families', 'Caregivers'],
  },
  {
    id: 'problem-mom-evening-pills',
    slug: 'mom-evening-pills',
    statement: 'My mom lives alone and we never know if she remembered her evening pills.',
    summary: 'Adult children want a kind, low-pressure way to know whether a nightly medication happened.',
    details:
      'Phone check-ins feel like surveillance. A shared, obvious status would let her keep dignity while the family stops guessing.',
    tags: ['family', 'caregiving', 'memory', 'medication', 'mom', 'home', 'reminder'],
    peopleWithThisProblem: 3,
    relatedSolutionIds: ['sol-pill-checkin', 'sol-fedyet'],
    communitiesHelped: ['Families', 'Caregivers'],
  },
  {
    id: 'problem-customer-approvals',
    slug: 'customer-approvals',
    statement: 'We keep losing track of which customer approved what.',
    summary: 'A small shop has approvals living in email threads, texts, and memory.',
    details: 'Work starts, then someone asks whether the customer actually signed off. Nobody wants a CRM. They want a clear yes.',
    tags: ['small-business', 'customers', 'approvals', 'shop', 'email', 'status'],
    peopleWithThisProblem: 2,
    relatedSolutionIds: ['sol-approval-log'],
    communitiesHelped: ['Small businesses'],
  },
  {
    id: 'problem-classroom-returns',
    slug: 'classroom-returns',
    statement: 'My students need a simpler way to remember what goes back to which teacher.',
    summary: 'Shared supplies and take-home folders keep landing on the wrong desk.',
    details: 'Three teachers, one classroom aide, and a pile of folders. The mix-up happens every Friday.',
    tags: ['school', 'students', 'teachers', 'classroom', 'folders', 'children'],
    peopleWithThisProblem: 2,
    relatedSolutionIds: ['sol-folder-tray'],
    communitiesHelped: ['Classrooms'],
  },
  {
    id: 'problem-crabbing-conditions',
    slug: 'crabbing-conditions',
    statement: 'I want to know whether conditions are good for crabbing before I load the car.',
    summary: 'A regular crabber wants a yes-or-wait answer from tide, wind, and a familiar boat ramp.',
    details: 'The knowledge is already in one person\'s head. Friends keep texting for the same judgment before they drive out.',
    tags: ['outdoors', 'weather', 'tides', 'crabbing', 'boat', 'conditions', 'calculator'],
    peopleWithThisProblem: 1,
    relatedSolutionIds: ['sol-crab-window'],
    communitiesHelped: ['Fishing families'],
  },
  {
    id: 'problem-clinic-followups',
    slug: 'clinic-followups',
    statement: 'The clinic keeps re-checking the same follow-up tasks.',
    summary: 'A tiny clinic repeats the same "did anyone call them back?" loop.',
    details: 'The work is not complicated. The handoff is. People need a shared, boring list that tells the truth.',
    tags: ['clinic', 'healthcare', 'follow-up', 'tasks', 'team', 'handoff'],
    peopleWithThisProblem: 1,
    relatedSolutionIds: ['sol-followup-board'],
    communitiesHelped: ['Clinics'],
  },
  {
    id: 'problem-plant-watering',
    slug: 'plant-watering',
    statement: 'When we travel, nobody is sure which plants were already watered.',
    summary: 'House-sitters and siblings double-water or skip plants because the last visit is invisible.',
    details: 'It is the same coordination problem as feeding a pet, with a slower rhythm and a few more objects to track.',
    tags: ['home', 'travel', 'plants', 'household', 'watering', 'family'],
    peopleWithThisProblem: 1,
    relatedSolutionIds: ['sol-fedyet', 'sol-plant-round'],
    communitiesHelped: ['Households'],
  },
  {
    id: 'problem-shift-handover',
    slug: 'shift-handover',
    statement: 'The night crew and morning crew keep missing the same notes during handover.',
    summary: 'A shop floor loses context between shifts because notes live on scrap paper and in someone\'s pocket.',
    details: 'They do not need a factory system. They need the last five true things to be obvious to the next person.',
    tags: ['shift', 'work', 'handover', 'notes', 'team', 'shop'],
    peopleWithThisProblem: 1,
    relatedSolutionIds: ['sol-handover-card'],
    communitiesHelped: ['Shop crews'],
  },
  {
    id: 'problem-neighbor-ladder',
    slug: 'neighbor-ladder',
    statement: 'Our street shares tools but nobody knows who has the ladder.',
    summary: 'A block of neighbors already shares tools. The missing piece is a living "who has it" answer.',
    details: 'This is not a marketplace. It is a courtesy tracker for people who already trust each other.',
    tags: ['neighbors', 'tools', 'sharing', 'street', 'community', 'ladder'],
    peopleWithThisProblem: 1,
    relatedSolutionIds: ['sol-tool-shelf'],
    communitiesHelped: ['Neighborhoods'],
  },
  {
    id: 'problem-homework-folder',
    slug: 'homework-folder',
    statement: 'Three students in my class keep losing track of which folder goes home on which day.',
    summary: 'A teacher invented a workaround because nothing in the classroom quite fits these three kids.',
    details: 'The problem is small, local, and completely real. It never looked like a market.',
    tags: ['school', 'students', 'homework', 'folder', 'classroom', 'children'],
    peopleWithThisProblem: 1,
    relatedSolutionIds: ['sol-folder-tray', 'sol-day-reminder'],
    communitiesHelped: ['Classrooms'],
  },
];

export const SEED_SOLUTIONS: CommonsSolution[] = [
  {
    id: 'sol-fedyet',
    problemId: 'problem-dad-dog-feeding',
    title: 'FedYet',
    kind: 'shared_tracker',
    summary: 'One large button, a timestamp, and a family-visible "already fed" answer.',
    howItHelps: 'Anyone who walks in can see the truth in one glance, then mark it if they were the person who fed the dog.',
    peopleUsing: 3,
    adaptationCount: 2,
    authorName: 'Priya',
  },
  {
    id: 'sol-feed-reminder',
    problemId: 'problem-dad-dog-feeding',
    title: 'Evening feed nudge',
    kind: 'reminder',
    summary: 'A gentle reminder at the usual feeding time, with a way to say "already done".',
    howItHelps: 'Useful when the main risk is forgetting, and only one or two people are in the routine.',
    peopleUsing: 2,
    adaptationCount: 1,
    authorName: 'Marcus',
  },
  {
    id: 'sol-fridge-checklist',
    problemId: 'problem-dad-dog-feeding',
    title: 'Fridge magnet log',
    kind: 'no_software',
    summary: 'A printed AM/PM checkbox on the fridge, with initials. No app required.',
    howItHelps: 'Sometimes the smallest useful solution is the one already in the kitchen.',
    peopleUsing: 2,
    adaptationCount: 1,
    authorName: 'Helen',
  },
  {
    id: 'sol-pill-checkin',
    problemId: 'problem-mom-evening-pills',
    title: 'Evening check-in',
    kind: 'shared_tracker',
    summary: 'Mom taps "taken" once. Family sees that it happened, without a phone interrogation.',
    howItHelps: 'Keeps dignity in the loop. The status is the conversation, not a quiz.',
    peopleUsing: 2,
    adaptationCount: 1,
    authorName: 'Andre',
  },
  {
    id: 'sol-approval-log',
    problemId: 'problem-customer-approvals',
    title: 'Yes, they approved',
    kind: 'tiny_app',
    summary: 'A tiny log of customer, what they approved, who heard it, and when.',
    howItHelps: 'Replaces the scavenger hunt through email without dragging in a whole sales system.',
    peopleUsing: 1,
    adaptationCount: 1,
    authorName: 'Lina',
  },
  {
    id: 'sol-folder-tray',
    problemId: 'problem-classroom-returns',
    title: 'Whose folder is this?',
    kind: 'shared_tracker',
    summary: 'Each folder has a home, a day, and a teacher. The tray tells you the next destination.',
    howItHelps: 'Kids and aides can answer the question without interrupting the teacher.',
    peopleUsing: 1,
    adaptationCount: 1,
    authorName: 'Ms. Ortiz',
  },
  {
    id: 'sol-crab-window',
    problemId: 'problem-crabbing-conditions',
    title: 'Go or wait',
    kind: 'calculator',
    summary: 'Tide, wind, and one favorite ramp turned into a plain go / wait answer.',
    howItHelps: 'Friends stop guessing from the driveway. The local knowledge stays in the judgment, not a generic weather app.',
    peopleUsing: 1,
    adaptationCount: 1,
    authorName: 'Earl',
  },
  {
    id: 'sol-followup-board',
    problemId: 'problem-clinic-followups',
    title: 'Call-back truth board',
    kind: 'automation',
    summary: 'Open loops, owner, last attempt, next attempt. No extra workflow theater.',
    howItHelps: 'Stops two people from calling the same patient, and stops nobody from calling them.',
    peopleUsing: 1,
    adaptationCount: 0,
    authorName: 'Nia',
  },
  {
    id: 'sol-plant-round',
    problemId: 'problem-plant-watering',
    title: 'Watered round',
    kind: 'shared_tracker',
    summary: 'A room-by-room watered list for whoever is house-sitting.',
    howItHelps: 'Same idea as FedYet, stretched across plants and a travel week.',
    peopleUsing: 1,
    adaptationCount: 0,
    authorName: 'Sam',
  },
  {
    id: 'sol-handover-card',
    problemId: 'problem-shift-handover',
    title: 'Five true things',
    kind: 'tiny_app',
    summary: 'The outgoing shift leaves five facts. The incoming shift sees only those until they write their own.',
    howItHelps: 'Scrap paper had the right idea. This just keeps the last card from vanishing.',
    peopleUsing: 1,
    adaptationCount: 0,
    authorName: 'Chris',
  },
  {
    id: 'sol-tool-shelf',
    problemId: 'problem-neighbor-ladder',
    title: 'Who has it',
    kind: 'shared_tracker',
    summary: 'A living shelf list: tool, who has it, when it should wander back.',
    howItHelps: 'Keeps a generous street generous, without a rental platform.',
    peopleUsing: 1,
    adaptationCount: 0,
    authorName: 'June',
  },
  {
    id: 'sol-day-reminder',
    problemId: 'problem-homework-folder',
    title: 'Folder day reminder',
    kind: 'reminder',
    summary: 'A weekday cue for which colored folder travels home.',
    howItHelps: 'Tiny, specific, and only for the three students who needed it.',
    peopleUsing: 1,
    adaptationCount: 0,
    authorName: 'Ms. Ortiz',
  },
];

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by', 'can', 'could', 'did', 'do', 'does', 'for', 'from',
  'had', 'has', 'have', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just', 'keep', 'keeps', 'know', 'my', 'need',
  'of', 'on', 'or', 'our', 'out', 'should', 'so', 'than', 'that', 'the', 'their', 'them', 'there', 'this', 'to', 'too',
  'us', 'want', 'was', 'we', 'what', 'when', 'whether', 'which', 'who', 'with', 'would', 'you', 'your', 'already',
  'something', 'someone', 'thing', 'things',
]);

export function slugifyProblem(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
  return slug || 'problem';
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

export function solutionsForProblem(problem: CommonsProblem, solutions: CommonsSolution[] = SEED_SOLUTIONS): CommonsSolution[] {
  return solutions.filter((solution) => problem.relatedSolutionIds.includes(solution.id) || solution.problemId === problem.id);
}

export function getSeedProblemBySlug(slug: string): CommonsProblem | undefined {
  return SEED_PROBLEMS.find((problem) => problem.slug === slug);
}

export function getSeedSolutionById(id: string): CommonsSolution | undefined {
  return SEED_SOLUTIONS.find((solution) => solution.id === id);
}

function scoreProblem(tokens: string[], problem: CommonsProblem): number {
  if (!tokens.length) return 0;
  const haystack = tokenize(`${problem.statement} ${problem.summary} ${problem.details} ${problem.tags.join(' ')}`);
  const haystackSet = new Set(haystack);
  let overlap = 0;
  for (const token of tokens) {
    if (haystackSet.has(token)) overlap += 1;
    else if (problem.tags.some((tag) => tag.includes(token) || token.includes(tag))) overlap += 0.6;
  }
  return overlap / tokens.length;
}

export function searchCommons(query: string, problems: CommonsProblem[] = SEED_PROBLEMS, solutions: CommonsSolution[] = SEED_SOLUTIONS): CommonsSearchResult {
  const tokens = tokenize(query);
  const matches: CommonsMatch[] = problems
    .map((problem) => ({
      problem,
      solutions: solutionsForProblem(problem, solutions),
      score: scoreProblem(tokens, problem),
    }))
    .filter((match) => match.score >= 0.18)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const peopleWithSimilarProblems = matches.reduce((sum, match) => sum + match.problem.peopleWithThisProblem, 0);

  return {
    query,
    matches,
    similarProblemCount: matches.length,
    peopleWithSimilarProblems,
  };
}

export function kindLabel(kind: SolutionKind): string {
  const labels: Record<SolutionKind, string> = {
    existing: 'Already in the commons',
    adapt: 'Adapted for a new situation',
    tiny_app: 'A tiny app',
    automation: 'An automation',
    shared_tracker: 'A shared tracker',
    reminder: 'A reminder',
    calculator: 'A calculator',
    ai_assistant: 'An AI assistant',
    no_software: 'No software needed',
  };
  return labels[kind];
}

export function seedNetworkStats(): NetworkStats {
  const solutionsCreated = SEED_SOLUTIONS.length;
  const adaptations = SEED_SOLUTIONS.reduce((sum, solution) => sum + solution.adaptationCount, 0);
  const peopleUsingAdaptations = SEED_SOLUTIONS.reduce((sum, solution) => sum + solution.peopleUsing, 0);
  const communities = new Set(SEED_PROBLEMS.flatMap((problem) => problem.communitiesHelped));
  return {
    problemsSubmitted: SEED_PROBLEMS.length,
    solutionsCreated,
    peopleUsingAdaptations,
    adaptations,
    communitiesHelped: communities.size,
  };
}

export function similarity(a: string, b: string): number {
  const left = new Set(tokenize(a));
  const right = new Set(tokenize(b));
  if (left.size === 0 || right.size === 0) return 0;
  let overlap = 0;
  left.forEach((token) => {
    if (right.has(token)) overlap += 1;
  });
  return overlap / new Set([...left, ...right]).size;
}

export function makeProblemRecord(statement: string): CommonsProblem {
  const trimmed = statement.trim();
  const known = SEED_PROBLEMS.find((problem) => similarity(trimmed, problem.statement) > 0.55);
  if (known) return { ...known, seeded: true };
  return {
    id: `local-${slugifyProblem(trimmed)}`,
    slug: slugifyProblem(trimmed),
    statement: trimmed,
    summary: trimmed,
    details: 'Submitted from ManifestOS in this browser.',
    tags: tokenize(trimmed).slice(0, 8),
    peopleWithThisProblem: 1,
    relatedSolutionIds: [],
    communitiesHelped: [],
    seeded: false,
  };
}

export function commonsSolutionToProposal(solution: CommonsSolution, adapted = false): SolutionProposal {
  const requiresSoftware = solution.kind !== 'no_software';
  return {
    id: solution.id,
    title: adapted ? `${solution.title} for this situation` : solution.title,
    plainLanguageSummary: solution.summary,
    howItWorks: solution.howItHelps,
    whyItFits: adapted
      ? 'This starts from a solution already in the commons, then shifts around your situation.'
      : 'Someone already made a version of this for a similar problem.',
    primaryUsers: ['The people closest to this problem'],
    mvpFeatures: adapted
      ? ['Keep what already works', 'Change the parts that do not fit', 'Keep the original problem in view']
      : ['Use the existing flow', 'Share it with the people involved'],
    nonGoals: ['Rebuild from scratch unless the situation is truly different'],
    complexity: 'simple',
    privacyNotes: 'Household or small-group visibility unless you say otherwise.',
    selected: true,
    kind: adapted ? 'adapt' : solution.kind,
    requiresSoftware,
    sourceProblemSlug: solution.problemId,
  };
}

export const SEEDED_PROBLEMS = SEED_PROBLEMS;
export const SEEDED_SOLUTIONS = SEED_SOLUTIONS;

