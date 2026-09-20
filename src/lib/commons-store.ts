import { AdaptationRecord, CommonsProblem, NetworkStats } from './domain';
import { SEED_PROBLEMS, SEED_SOLUTIONS, getSeedProblemBySlug, makeProblemRecord, seedNetworkStats } from './commons';

const STORAGE_KEY = 'manifestos.network.v1';

export interface NetworkState {
  meToo: Record<string, true>;
  extraAffinity: Record<string, number>;
  submittedProblems: CommonsProblem[];
  adaptations: AdaptationRecord[];
  solutionsCreated: number;
}

const emptyState = (): NetworkState => ({
  meToo: {},
  extraAffinity: {},
  submittedProblems: [],
  adaptations: [],
  solutionsCreated: 0,
});

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadNetworkState(): NetworkState {
  if (!canUseStorage()) return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<NetworkState>;
    return {
      ...emptyState(),
      ...parsed,
      meToo: parsed.meToo || {},
      extraAffinity: parsed.extraAffinity || {},
      submittedProblems: parsed.submittedProblems || [],
      adaptations: parsed.adaptations || [],
      solutionsCreated: parsed.solutionsCreated || 0,
    };
  } catch {
    return emptyState();
  }
}

export function saveNetworkState(state: NetworkState): NetworkState {
  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  return state;
}

export function listProblems(state: NetworkState = loadNetworkState()): CommonsProblem[] {
  const extras = state.submittedProblems.filter((problem) => !SEED_PROBLEMS.some((seed) => seed.slug === problem.slug));
  return [...SEED_PROBLEMS, ...extras].map((problem) => ({
    ...problem,
    peopleWithThisProblem: problem.peopleWithThisProblem + (state.extraAffinity[problem.slug] || 0),
    seeded: !problem.id.startsWith('local-'),
  }));
}

export function getProblemBySlug(slug: string, state: NetworkState = loadNetworkState()): CommonsProblem | undefined {
  return listProblems(state).find((problem) => problem.slug === slug) || getSeedProblemBySlug(slug);
}

export function hasMarkedProblem(slug: string, state: NetworkState = loadNetworkState()): boolean {
  return Boolean(state.meToo[slug]);
}

export function markHaveThisProblem(slug: string): NetworkState {
  const state = loadNetworkState();
  if (state.meToo[slug]) return state;
  state.meToo[slug] = true;
  state.extraAffinity[slug] = (state.extraAffinity[slug] || 0) + 1;
  return saveNetworkState(state);
}

export function rememberSubmittedProblem(statement: string): CommonsProblem {
  const state = loadNetworkState();
  const record = makeProblemRecord(statement);
  const existing = listProblems(state).find((problem) => problem.slug === record.slug || problem.statement === record.statement);
  if (existing) return existing;
  if (SEED_PROBLEMS.some((problem) => problem.slug === record.slug)) return record;
  state.submittedProblems = [record, ...state.submittedProblems];
  saveNetworkState(state);
  return record;
}

export function recordAdaptation(problemSlug: string, sourceSolutionId: string, whatsDifferent: string): AdaptationRecord {
  const state = loadNetworkState();
  const record: AdaptationRecord = {
    id: `adapt-${Date.now()}`,
    problemSlug,
    sourceSolutionId,
    whatsDifferent: whatsDifferent.trim(),
    createdAt: new Date().toISOString(),
  };
  state.adaptations = [record, ...state.adaptations];
  state.solutionsCreated += 1;
  saveNetworkState(state);
  return record;
}

export function recordSolutionCreated(): NetworkState {
  const state = loadNetworkState();
  state.solutionsCreated += 1;
  return saveNetworkState(state);
}

export function getNetworkStats(state: NetworkState = loadNetworkState()): NetworkStats {
  const seed = seedNetworkStats();
  const localCommunities = new Set(state.submittedProblems.flatMap((problem) => problem.communitiesHelped));
  return {
    problemsSubmitted: seed.problemsSubmitted + state.submittedProblems.length,
    solutionsCreated: seed.solutionsCreated + state.solutionsCreated,
    peopleUsingAdaptations: seed.peopleUsingAdaptations + state.adaptations.length,
    adaptations: seed.adaptations + state.adaptations.length,
    communitiesHelped: seed.communitiesHelped + localCommunities.size,
  };
}

export function getLocalContribution(state: NetworkState = loadNetworkState()) {
  return {
    problemsSubmitted: state.submittedProblems.length,
    solutionsCreated: state.solutionsCreated,
    adaptations: state.adaptations.length,
    problemsJoined: Object.keys(state.meToo).length,
  };
}

export { SEED_SOLUTIONS };
