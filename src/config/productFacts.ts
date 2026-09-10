export const EMOS_FACTS = {
  founderExperience: '15+',
  governedApplications: '5,000+',
  evidenceAttributes: 18,
  evidenceDimensions: 6,
  readinessThreshold: 70,
  walkthroughCount: 19,
  introductionCount: 1,
  learningLibraryLabel: '19 Walkthroughs + Introduction',
} as const;
export const MODERNIZATION_LIFECYCLE = [
  'Align',
  'Discover',
  'Understand',
  'Assess',
  'Decide',
  'Govern',
  'Prioritize',
  'Plan',
  'Define Target State',
  'Execute',
  'Validate',
  'Transition',
  'Measure Benefits',
  'Learn',
  'Reassess',
] as const;

export const LANDING_NAVIGATION = {
  emos: [
    { id: 'home', label: 'What Is EMOS' },
    { id: 'why-emos', label: 'Why EMOS' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'scenario', label: 'Scenario' },
  ],
  about: [
    { id: 'vision', label: 'Vision' },
    { id: 'founder', label: 'Founder' },
  ],
} as const;
