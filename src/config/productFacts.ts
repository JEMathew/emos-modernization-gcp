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
  betaScope: 'The MVP connects evidence, governed decisions, prioritization, planning, mobilization and target-state definition today.',
  lifecycleLabel: '15 lifecycle stages + Mobilize handoff',
  capabilityHeading: 'One Lifecycle. Three Honest Delivery States.',
  afterDecision: 'The MVP applies human governance and transparent prioritization, then prepares waves, mobilization controls and a target-state baseline. Execute onward remains Planned.',
  executionBoundary: 'No. The current MVP does not execute migrations. It produces governed decisions and implementation-ready target-state plans; execution, transition to live operations and outcome measurement remain Planned.',
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

export type LifecycleDeliveryState = 'available' | 'next' | 'vision';

// Available stages expose existing workflows; these deeper controls are not shipped yet.
export const BUILDING_SUB_STAGES = new Set([
  'Ownership capture', 'Initial dependency mapping', 'Policies and constraints',
  'Capacity and resources',
]);

export interface LifecycleStageDefinition {
  number: string;
  name: string;
  delivery: LifecycleDeliveryState;
  handoff?: boolean;
  subStages: readonly string[];
}

export interface LifecyclePhaseDefinition {
  number: number;
  name: string;
  promise: string;
  stages: readonly LifecycleStageDefinition[];
}

export const MODERNIZATION_PHASES: readonly LifecyclePhaseDefinition[] = [
  {
    number: 1,
    name: 'Strategy & Evidence',
    promise: 'Establish context and truth',
    stages: [
      { number: '1', name: 'Align', delivery: 'available', subStages: ['Business outcomes', 'Executive sponsorship', 'Policies and constraints', 'Success measures'] },
      { number: '2', name: 'Discover', delivery: 'available', subStages: ['Estate inventory', 'Application and data discovery', 'Ownership capture', 'Initial dependency mapping'] },
      { number: '3', name: 'Understand', delivery: 'available', subStages: ['Enterprise DNA', 'Business criticality', 'Architecture and dependencies', 'Economics, risk and evidence quality'] },
    ],
  },
  {
    number: 2,
    name: 'Decision & Governance',
    promise: 'Choose and control',
    stages: [
      { number: '4', name: 'Assess', delivery: 'available', subStages: ['Modernization readiness', 'Complexity and risk', 'TCO and value analysis', 'Option feasibility'] },
      { number: '5', name: 'Decide', delivery: 'available', subStages: ['Compare canonical 6R options', 'Explain recommendation', 'Apply evidence gate', 'Human approval'] },
      { number: '6', name: 'Govern', delivery: 'available', subStages: ['Architecture review', 'Security and compliance gates', 'Exceptions and decision rights', 'Audit trail'] },
      { number: '7', name: 'Prioritize', delivery: 'available', subStages: ['Value versus effort', 'Risk-based sequencing', 'Dependency optimization', 'Funding priority'] },
    ],
  },
  {
    number: 3,
    name: 'Planning & Target State',
    promise: 'Prepare delivery',
    stages: [
      { number: '8', name: 'Plan', delivery: 'available', subStages: ['Roadmap and waves', 'Capacity and resources', 'Milestones and controls', 'Cost-benefit baseline'] },
      { number: 'H', name: 'Mobilize', delivery: 'available', handoff: true, subStages: ['Assign owners and workstreams', 'Confirm delivery charter', 'Close readiness gaps', 'Approve delivery baseline'] },
      { number: '9', name: 'Define Target State', delivery: 'available', subStages: ['Target architecture', 'Platform and landing-zone patterns', 'Non-functional requirements', 'Migration and cutover design'] },
    ],
  },
  {
    number: 4,
    name: 'Delivery & Transition',
    promise: 'Change safely',
    stages: [
      { number: '10', name: 'Execute', delivery: 'vision', subStages: ['Build and remediation', 'Data migration', 'Integration changes', 'Deployment preparation'] },
      { number: '11', name: 'Validate', delivery: 'vision', subStages: ['Functional testing', 'Performance and resilience', 'Security and compliance', 'Data reconciliation and rollback rehearsal'] },
      { number: '12', name: 'Transition', delivery: 'vision', subStages: ['Production cutover', 'Hypercare', 'Operations handover', 'Legacy decommissioning'] },
    ],
  },
  {
    number: 5,
    name: 'Value & Continuous Learning',
    promise: 'Prove and improve',
    stages: [
      { number: '13', name: 'Measure Benefits', delivery: 'vision', subStages: ['Business KPIs and SLOs', 'Cost realization', 'Adoption and risk', 'Variance from business case'] },
      { number: '14', name: 'Learn', delivery: 'vision', subStages: ['Delivery retrospective', 'Lessons and reusable patterns', 'Update standards', 'Feed operational knowledge back'] },
      { number: '15', name: 'Reassess', delivery: 'vision', subStages: ['Continuous telemetry', 'Change-trigger detection', 'Portfolio re-scoring', 'Select the next action'] },
    ],
  },
] as const;

export const CAPABILITY_HORIZON = [
  {
    label: 'Available in MVP',
    status: 'SHIPPED',
    stages: ['Align', 'Discover', 'Understand', 'Assess', 'Decide', 'Govern', 'Prioritize', 'Plan', 'Mobilize', 'Define Target State'],
    detail: 'Connect business intent to portfolio evidence, calculate completeness, recommend a governed 6R disposition and prepare the journey.',
  },
  {
    label: 'Building Next',
    status: 'NEXT',
    stages: ['Capacity modelling', 'Enterprise operating model', 'Connector catalog'],
    detail: 'Capacity modelling and enterprise operating-model depth continue to mature without changing lifecycle truth.',
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
    { id: 'founder', label: 'Product Builder' },
  ],
} as const;
