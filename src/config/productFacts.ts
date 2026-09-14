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

export const EMOS_POSITIONING = {
  hero: 'AI-Native Modernization, Governed by Evidence—From First Signal to Proven Outcome.',
  visionLabel: 'Product Vision',
  productVision: 'EMOS is designed to govern the full enterprise modernization lifecycle—from business alignment and estate discovery through evidence-based decisions and planning, into governed execution, validation, transition to live operations, measured benefits, learning and reassessment.',
  betaScope: 'Beta v1.0 delivers the evidence, decision and planning foundation today.',
  lifecycleLabel: '15 lifecycle stages + Mobilize handoff',
  capabilityHeading: 'One Lifecycle. Three Honest Delivery States.',
  afterDecision: 'Beta v1.0 supports planning and mobilization. EMOS is being built toward governed execution, validation, transition to live operations, benefits measurement and continuous reassessment.',
  executionBoundary: 'No. The current beta does not execute migrations. It produces governed decisions and implementation-ready plans; governed execution, transition to live operations and outcome measurement remain the product vision.',
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

export const CAPABILITY_HORIZON = [
  {
    label: 'Available in Beta',
    status: 'SHIPPED',
    stages: ['Align', 'Discover', 'Understand', 'Assess', 'Decide', 'Plan', 'Mobilize'],
    detail: 'Connect business intent to portfolio evidence, calculate completeness, recommend a governed 6R disposition and prepare the journey.',
  },
  {
    label: 'Building Next',
    status: 'NEXT',
    stages: ['Govern', 'Prioritize', 'Define Target State'],
    detail: 'Deepen approvals, auditability, portfolio prioritization and target-state controls.',
  },
  {
    label: 'Product Vision',
    status: 'VISION',
    stages: ['Execute', 'Validate', 'Transition', 'Measure Benefits', 'Learn', 'Reassess'],
    detail: 'Govern execution, validate readiness, transition the modernized service into live operations, measure realized benefits, learn and reassess.',
  },
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
