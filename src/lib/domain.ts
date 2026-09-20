export type Stage =
  | 'problem'
  | 'understand'
  | 'brief'
  | 'commons'
  | 'smallest'
  | 'adapt'
  | 'blueprint'
  | 'build'
  | 'preview'
  | 'refine'
  | 'resolved';

export type ProjectStatus =
  | 'draft'
  | 'discovery'
  | 'commons_search'
  | 'solutions_ready'
  | 'adapting'
  | 'blueprint_generating'
  | 'blueprint_ready'
  | 'building'
  | 'preview_ready'
  | 'refining'
  | 'share_ready'
  | 'using_existing'
  | 'non_software';

export type SolutionKind =
  | 'existing'
  | 'adapt'
  | 'tiny_app'
  | 'automation'
  | 'shared_tracker'
  | 'reminder'
  | 'calculator'
  | 'ai_assistant'
  | 'no_software';

export interface ProblemBrief {
  summary: string;
  affectedUsers: string[];
  currentWorkaround: string;
  friction: string;
  desiredOutcome: string;
  privacySensitivity: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface SolutionProposal {
  id: string;
  title: string;
  plainLanguageSummary: string;
  howItWorks: string;
  whyItFits: string;
  primaryUsers: string[];
  mvpFeatures: string[];
  nonGoals: string[];
  complexity: 'simple' | 'moderate' | 'collaborative';
  privacyNotes: string;
  selected: boolean;
  kind: SolutionKind;
  requiresSoftware: boolean;
  sourceProblemSlug?: string;
}

export interface DiscoveryQuestion {
  id: string;
  question: string;
  reason?: string;
  answerType: 'choice' | 'multi' | 'text' | 'boolean';
  choices?: string[];
  allowYouDecide?: boolean;
}

export type ArtifactType =
  | 'problem_brief'
  | 'solution_brief'
  | 'jobs_to_be_done'
  | 'mvp_scope'
  | 'non_goals'
  | 'user_flows'
  | 'feature_spec'
  | 'data_model'
  | 'system_architecture'
  | 'architecture_decision'
  | 'integrations'
  | 'privacy_security'
  | 'failure_modes'
  | 'acceptance_criteria'
  | 'test_plan'
  | 'implementation_plan'
  | 'build_task_graph';

export const ARTIFACT_DEPENDENCY_ORDER: ArtifactType[] = [
  'problem_brief',
  'solution_brief',
  'jobs_to_be_done',
  'mvp_scope',
  'non_goals',
  'user_flows',
  'feature_spec',
  'data_model',
  'system_architecture',
  'architecture_decision',
  'integrations',
  'privacy_security',
  'failure_modes',
  'acceptance_criteria',
  'test_plan',
  'implementation_plan',
  'build_task_graph',
];

export interface BlueprintArtifact {
  id: string;
  type: ArtifactType;
  title: string;
  plainLanguageSummary: string;
  technicalDetail: string;
  status: 'ready' | 'stale';
  dependsOn: ArtifactType[];
}

export interface BuildTask {
  id: string;
  title: string;
  plainLanguageTitle: string;
  description: string;
  dependsOn: string[];
  category: 'foundation' | 'data' | 'ui' | 'workflow' | 'integration' | 'validation' | 'polish';
  acceptanceCriteria: string[];
}

export interface GeneratedFile {
  path: string;
  language: string;
  contents: string;
}

export interface GeneratedApp {
  name: string;
  description: string;
  entryFile: string;
  files: GeneratedFile[];
  capabilities: string[];
  previewHtml: string;
}

export type ChangeClass = 'copy' | 'layout' | 'data' | 'new_capability' | 'rebuild_preview_only' | 'blueprint_touching';

export interface ChangeClassification {
  changeClass: ChangeClass;
  label: string;
  reason: string;
  affectsBlueprint: boolean;
  affectedArtifactTypes: ArtifactType[];
}

export interface ChangeRequest extends ChangeClassification {
  id: string;
  text: string;
  createdAt: string;
}

export interface ProjectVersion {
  id: string;
  versionNumber: number;
  label: string;
  createdAt: string;
  changeRequest: ChangeRequest | null;
  changeRequests: ChangeRequest[];
  artifacts: BlueprintArtifact[];
  app: GeneratedApp;
  solution: SolutionProposal;
}

export interface CommonsProblem {
  id: string;
  slug: string;
  statement: string;
  summary: string;
  details: string;
  tags: string[];
  peopleWithThisProblem: number;
  relatedSolutionIds: string[];
  communitiesHelped: string[];
  seeded?: boolean;
}

export interface CommonsSolution {
  id: string;
  problemId: string;
  title: string;
  kind: SolutionKind;
  summary: string;
  howItHelps: string;
  peopleUsing: number;
  adaptationCount: number;
  authorName: string;
}

export interface CommonsMatch {
  problem: CommonsProblem;
  solutions: CommonsSolution[];
  score: number;
}

export interface CommonsSearchResult {
  query: string;
  matches: CommonsMatch[];
  similarProblemCount: number;
  peopleWithSimilarProblems: number;
}

export interface NetworkStats {
  problemsSubmitted: number;
  solutionsCreated: number;
  peopleUsingAdaptations: number;
  adaptations: number;
  communitiesHelped: number;
}

export interface AdaptationRecord {
  id: string;
  problemSlug: string;
  sourceSolutionId: string;
  whatsDifferent: string;
  createdAt: string;
}

export type YouStats = NetworkStats;
