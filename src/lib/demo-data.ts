import { DiscoveryQuestion, ProblemBrief, SolutionProposal, ArtifactType, BlueprintArtifact, BuildTask } from './domain';

export const demoProblemBrief: ProblemBrief = {
  summary: 'A family needs a simple way to know whether the dog has been fed and by whom during the day.',
  affectedUsers: ['Parents', 'Family members', 'Visitors'],
  currentWorkaround: 'People text each other or rely on memory.',
  friction: 'The family does not always know whether someone already fed the dog, and routine check-ins are easy to forget.',
  desiredOutcome: 'One clear, mobile-friendly status showing whether the dog was fed and when.',
  privacySensitivity: 'low',
  confidence: 0.89,
};

export const demoSolutions: SolutionProposal[] = [
  { id: 'fedyet-simple', title: 'FedYet', plainLanguageSummary: 'One-tap family status tracker with timestamps and daily history.', howItWorks: 'A shared button marks the dog as fed with a timestamp and the responsible person.', whyItFits: 'This solves a simple but repeated household coordination problem with minimal complexity.', primaryUsers: ['Family members', 'Caregivers'], mvpFeatures: ['Large feed button', 'Timestamp log', "Today's family status", 'Optional reminders'], nonGoals: ['Advanced scheduling', 'Veterinary records', 'Public sharing'], complexity: 'simple', privacyNotes: 'Minimal personal data; status updates are household-oriented and low sensitivity.', selected: true },
  { id: 'fedyet-automatic', title: 'FedYet + reminders', plainLanguageSummary: 'Adds reminder nudges and family visibility so no one forgets.', howItWorks: 'Status updates trigger reminder logic and a lightweight daily summary.', whyItFits: 'It supports recurring usage without adding too much complexity.', primaryUsers: ['Busy families', 'Household coordinators'], mvpFeatures: ['Reminder nudges', 'Daily recap', 'Shared family list'], nonGoals: ['Multi-pet analytics', 'Paid subscriptions'], complexity: 'moderate', privacyNotes: 'Includes reminder notifications and household data visibility.', selected: false },
  { id: 'fedyet-collab', title: 'Shared care board', plainLanguageSummary: 'A broader household care tracker for multiple routine tasks.', howItWorks: 'The same workflow can expand to medications, feeding, or other shared responsibilities.', whyItFits: 'Useful when a household wants a single shared routine dashboard.', primaryUsers: ['Households', 'Shared caregivers'], mvpFeatures: ['Task board', 'Routine tracking', 'Shared notes'], nonGoals: ['Complex workflow automation', 'Multi-team approvals'], complexity: 'collaborative', privacyNotes: 'More shared household data means visibility rules matter more.', selected: false },
];

export function generateDiscoveryQuestions(problem: string): DiscoveryQuestion[] {
  const lower = problem.toLowerCase();
  const family = lower.includes('family') || lower.includes('dad') || lower.includes('dog') || lower.includes('home');
  return [
    { id: 'who-has-problem', question: 'Who is dealing with this problem most often?', reason: 'This affects who the solution is built for.', answerType: 'choice', choices: family ? ['One person', 'A family', 'A household', 'Multiple caregivers'] : ['One person', 'A small team', 'Customers or clients', 'Different people at different times'], allowYouDecide: true },
    { id: 'how-heard', question: family ? 'How do people currently keep track of this today?' : 'What happens today when this problem comes up?', reason: 'This reveals the current workaround and friction.', answerType: 'text', allowYouDecide: true },
    { id: 'fix-looks-like', question: 'What would a useful fix look like?', answerType: 'choice', choices: family ? ['One tap status', 'Shared family log', 'Reminders', 'A little bit of automation'] : ['A quick reminder', 'A single status tracker', 'A shared list', 'A more automatic workflow'], allowYouDecide: true },
  ];
}

export function generateSampleDiscoveryAnswers(problem: string): Record<string, string> {
  const lower = problem.toLowerCase();
  return lower.includes('dad') || lower.includes('dog') || lower.includes('family') || lower.includes('home')
    ? { 'who-has-problem': 'A family', 'how-heard': 'People rely on memory and sometimes text each other to check.', 'fix-looks-like': 'A shared family log' }
    : { 'who-has-problem': 'A small team', 'how-heard': 'People handle it manually and it falls through the cracks.', 'fix-looks-like': 'A single status tracker' };
}

export function buildProblemBrief(problem: string, answers: Record<string, string>): ProblemBrief {
  return { summary: problem.trim() || 'A recurring everyday problem needs a simple, helpful software solution.', affectedUsers: [answers['who-has-problem'] || 'The people closest to this routine', 'Additional people who need visibility'], currentWorkaround: answers['how-heard'] || 'People rely on memory, text messages, or manual tracking.', friction: 'The routine is easy to forget, miss, or misunderstand without a shared obvious status.', desiredOutcome: answers['fix-looks-like'] || 'A simple check-in that makes the current state obvious.', privacySensitivity: 'low', confidence: 0.88 };
}

export function buildDiscoveryStatusText(problem: string, answers: Record<string, string>): string {
  return `We heard: ${problem}. The likely solution is a simple ${answers['fix-looks-like']?.toLowerCase() || 'status tracker'} for ${answers['who-has-problem']?.toLowerCase() || 'the people involved'}.`;
}

const blueprintOrder: Array<[ArtifactType, string]> = [
  ['problem_brief', 'Problem Brief'], ['solution_brief', 'Solution Brief'], ['jobs_to_be_done', 'Users and Jobs To Be Done'], ['mvp_scope', 'MVP Scope'], ['non_goals', 'Non-Goals / Not Yet'], ['user_flows', 'Primary User Flows'], ['feature_spec', 'Feature Specification'], ['data_model', 'Data Model'], ['system_architecture', 'System Architecture'], ['architecture_decision', 'Architecture Decisions'], ['integrations', 'Integrations / External Services'], ['privacy_security', 'Privacy and Security Notes'], ['failure_modes', 'Failure Modes / Edge Cases'], ['acceptance_criteria', 'Acceptance Criteria'], ['test_plan', 'Test Plan'], ['implementation_plan', 'Implementation Plan'], ['build_task_graph', 'Build Task Graph'],
];

export function generateDemoBlueprint(solution: SolutionProposal, brief: ProblemBrief): BlueprintArtifact[] {
  return blueprintOrder.map(([type, title], index) => ({ id: `artifact-${type}`, type, title, status: 'ready', dependsOn: index === 0 ? [] : [blueprintOrder[index - 1][0]], plainLanguageSummary: artifactSummary(type, solution, brief), technicalDetail: `This ${title.toLowerCase()} is derived from the current Problem Brief and selected ${solution.title} solution. It is versioned and consumed by downstream planning and build steps.` }));
}

function artifactSummary(type: ArtifactType, solution: SolutionProposal, brief: ProblemBrief): string {
  const summaries: Partial<Record<ArtifactType, string>> = {
    problem_brief: brief.summary, solution_brief: `${solution.title}: ${solution.plainLanguageSummary}`, jobs_to_be_done: `People need to make the ${brief.desiredOutcome.toLowerCase()} with less uncertainty.`, mvp_scope: `Start with ${solution.mvpFeatures.slice(0, 3).join(', ')}.`, non_goals: `Leave out ${solution.nonGoals.slice(0, 2).join(' and ')} for now.`, user_flows: 'Open the tool, see the current status, take the main action, and review today’s history.', feature_spec: solution.mvpFeatures.join('; '), data_model: 'Remember the current status, who changed it, when it changed, and today’s history.', system_architecture: 'A mobile-friendly React app with a small persistence adapter and a constrained preview runtime.', architecture_decision: 'Choose the smallest browser-first architecture that can solve the problem clearly.', integrations: 'No external integration is required for the first useful version.', privacy_security: solution.privacyNotes, failure_modes: 'Handle duplicate actions, missing names, offline state, and accidental changes gracefully.', acceptance_criteria: 'A user can understand the current state and complete the main action in one short visit.', test_plan: 'Test the primary action, persistence, empty state, error recovery, and mobile layout.', implementation_plan: 'Build the foundation, data adapter, main workflow, history, validation, and polish in that order.', build_task_graph: 'Foundation → information storage → main workflow → checks → preview.',
  };
  return summaries[type] || 'A clear, versioned planning artifact for the selected solution.';
}

export function generateDemoBuildTasks(solution: SolutionProposal): BuildTask[] {
  return [
    { id: 'foundation', title: 'Create the app foundation', plainLanguageTitle: 'Set up the foundation', description: 'Create the constrained React app structure and visual foundation.', dependsOn: [], category: 'foundation', acceptanceCriteria: ['The app opens in the preview', 'The visual language is applied'] },
    { id: 'data', title: 'Create the remembered information', plainLanguageTitle: 'Create the information your app needs to remember', description: `Model the status and history needed for ${solution.title}.`, dependsOn: ['foundation'], category: 'data', acceptanceCriteria: ['Status can be read and updated', 'History has timestamps'] },
    { id: 'workflow', title: 'Build the main workflow', plainLanguageTitle: 'Build the main action', description: 'Build the shortest path from opening the app to completing the useful action.', dependsOn: ['data'], category: 'workflow', acceptanceCriteria: ['The primary action is obvious', 'A successful action gives clear feedback'] },
    { id: 'validation', title: 'Check the experience', plainLanguageTitle: 'Check for mistakes', description: 'Run accessibility, empty-state, and preview checks.', dependsOn: ['workflow'], category: 'validation', acceptanceCriteria: ['No blocking preview errors', 'Keyboard focus is visible'] },
    { id: 'polish', title: 'Prepare the preview', plainLanguageTitle: 'Get your preview ready', description: 'Add final copy and responsive polish.', dependsOn: ['validation'], category: 'polish', acceptanceCriteria: ['Works on a phone-sized viewport', 'The current state is understandable'] },
  ];
}
