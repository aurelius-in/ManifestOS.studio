import { DiscoveryQuestion, ProblemBrief, SolutionProposal } from './domain';

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
  {
    id: 'fedyet-simple',
    title: 'FedYet',
    plainLanguageSummary: 'One-tap family status tracker with timestamps and daily history.',
    howItWorks: 'A shared button marks the dog as fed with a timestamp and the responsible person.',
    whyItFits: 'This solves a simple but repeated household coordination problem with minimal complexity.',
    primaryUsers: ['Family members', 'Caregivers'],
    mvpFeatures: ['Large feed button', 'Timestamp log', 'Today’s family status', 'Optional reminders'],
    nonGoals: ['Advanced scheduling', 'Veterinary records', 'Public sharing'],
    complexity: 'simple',
    privacyNotes: 'Minimal personal data; status updates are household-oriented and low sensitivity.',
    selected: true,
  },
  {
    id: 'fedyet-automatic',
    title: 'FedYet + reminders',
    plainLanguageSummary: 'Adds reminder nudges and large family visibility so no one forgets.',
    howItWorks: 'Status updates trigger reminder logic and a lightweight daily summary.',
    whyItFits: 'It supports recurring usage without adding too much complexity.',
    primaryUsers: ['Busy families', 'Household coordinators'],
    mvpFeatures: ['Reminder nudges', 'Daily recap', 'Shared family list'],
    nonGoals: ['Multi-pet analytics', 'Paid subscriptions'],
    complexity: 'moderate',
    privacyNotes: 'Still lightweight, but includes reminder notifications and household data visibility.',
    selected: false,
  },
  {
    id: 'fedyet-collab',
    title: 'Shared care board',
    plainLanguageSummary: 'A broader household care tracker for multiple routine tasks.',
    howItWorks: 'The same workflow can expand to medications, feeding, or other shared responsibilities.',
    whyItFits: 'Useful when a household wants a single shared routine dashboard.',
    primaryUsers: ['Households', 'Shared caregivers'],
    mvpFeatures: ['Task board', 'Routine tracking', 'Shared notes'],
    nonGoals: ['Complex workflow automation', 'Multi-team approvals'],
    complexity: 'collaborative',
    privacyNotes: 'More shared household data, so visibility and access rules matter more.',
    selected: false,
  },
];

export function generateDiscoveryQuestions(problem: string): DiscoveryQuestion[] {
  const trimmed = problem.trim();
  const lower = trimmed.toLowerCase();

  const baseQuestions: DiscoveryQuestion[] = [
    {
      id: 'who-has-problem',
      question: 'Who is dealing with this problem most often?',
      reason: 'This affects who the app is built for and how it should feel.',
      answerType: 'choice',
      choices: ['One person', 'A family', 'A small team', 'Different people at different times'],
      allowYouDecide: true,
    },
    {
      id: 'how-heard',
      question: 'What happens today when this problem comes up?',
      reason: 'This reveals the current workaround and friction.',
      answerType: 'text',
      allowYouDecide: true,
    },
    {
      id: 'fix-looks-like',
      question: 'What would a useful fix look like?',
      answerType: 'choice',
      choices: ['A quick reminder', 'A single status tracker', 'A shared list', 'A more automatic workflow'],
      allowYouDecide: true,
    },
  ];

  if (lower.includes('family') || lower.includes('dad') || lower.includes('dog') || lower.includes('home')) {
    return [
      {
        ...baseQuestions[0],
        choices: ['One person', 'A family', 'A household', 'Multiple caregivers'],
      },
      {
        ...baseQuestions[1],
        question: 'How do people currently keep track of this today?',
      },
      {
        ...baseQuestions[2],
        choices: ['One tap status', 'Shared family log', 'Reminders', 'A little bit of automation'],
      },
    ];
  }

  return baseQuestions;
}
