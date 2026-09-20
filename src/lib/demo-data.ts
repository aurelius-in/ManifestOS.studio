export type Stage = 'problem' | 'understand' | 'envision' | 'blueprint' | 'build' | 'refine' | 'share';

export type ProjectStatus = 'draft' | 'discovery' | 'blueprint_ready' | 'building' | 'preview_ready' | 'refining' | 'share_ready';

export interface ProblemBrief {
  summary: string;
  affectedUsers: string[];
  currentWorkaround: string;
  desiredOutcome: string;
  privacySensitivity: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface SolutionProposal {
  id: string;
  title: string;
  summary: string;
  howItWorks: string;
  whyItFits: string;
  complexity: 'simple' | 'moderate' | 'collaborative';
  selected: boolean;
}
