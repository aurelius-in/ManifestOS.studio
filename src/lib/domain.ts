export type Stage = 'problem' | 'understand' | 'envision' | 'blueprint' | 'build' | 'refine' | 'share';
export type ProjectStatus = 'draft' | 'discovery' | 'solutions_ready' | 'blueprint_generating' | 'blueprint_ready' | 'building' | 'preview_ready' | 'refining' | 'share_ready';

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
}

export interface DiscoveryQuestion {
  id: string;
  question: string;
  reason?: string;
  answerType: 'choice' | 'multi' | 'text' | 'boolean';
  choices?: string[];
  allowYouDecide?: boolean;
}

export type ArtifactType = 'problem_brief' | 'solution_brief' | 'jobs_to_be_done' | 'mvp_scope' | 'non_goals' | 'user_flows' | 'feature_spec' | 'data_model' | 'system_architecture' | 'architecture_decision' | 'integrations' | 'privacy_security' | 'failure_modes' | 'acceptance_criteria' | 'test_plan' | 'implementation_plan' | 'build_task_graph';

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
