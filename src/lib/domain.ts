export type Stage = 'problem' | 'understand' | 'envision' | 'blueprint' | 'build' | 'refine' | 'share';

export type ProjectStatus = 'draft' | 'discovery' | 'blueprint_ready' | 'building' | 'preview_ready' | 'refining' | 'share_ready';

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
