import type { Disposition6R } from '../types';

export interface CapabilityCueDefinition {
  id: string;
  title: string;
  plainEnglish?: string;
  whatIsIt: string;
  problemSolved: string;
  whatHappens: string;
  summary: string;
  learnMoreVideoSequence?: string;
}

export const PLAIN_ENGLISH_6R: Record<Disposition6R, {
  plainEnglish: string;
  shortAction: string;
  disposition: Disposition6R;
  tagline: string;
  summary: string;
  stages: string[];
}> = {
  Retain: {
    plainEnglish: 'Keep it as-is',
    shortAction: 'KEEP IT AS-IS',
    disposition: 'Retain',
    tagline: 'Keep and govern the existing system where it runs today.',
    summary: 'Keep this system because changing it currently provides insufficient business benefit.',
    stages: ['Keep', 'Optimize', 'Monitor', 'Review Outcome', 'Learn'],
  },
  Retire: {
    plainEnglish: 'Safely shut it down',
    shortAction: 'SAFELY SHUT IT DOWN',
    disposition: 'Retire',
    tagline: 'Decommission redundant or low-value systems and archive required data.',
    summary: 'Safely remove a system that no longer provides enough value to justify keeping it.',
    stages: ['Approve', 'Consumer Transition', 'Archive', 'Decommission', 'Validate Closure', 'Measure Savings/Risk', 'Learn'],
  },
  Rehost: {
    plainEnglish: 'Move it largely unchanged',
    shortAction: 'MOVE IT LARGELY UNCHANGED',
    disposition: 'Rehost',
    tagline: 'Lift and shift to modern infrastructure with minimal code change.',
    summary: 'Move the system to a new environment while changing as little as possible.',
    stages: ['Approve', 'Prepare Destination', 'Move', 'Validate', 'Cutover', 'Stabilize', 'Measure', 'Learn'],
  },
  Replatform: {
    plainEnglish: 'Move it to a better platform',
    shortAction: 'MOVE IT TO A BETTER PLATFORM',
    disposition: 'Replatform',
    tagline: 'Adopt managed cloud platforms while preserving core application logic.',
    summary: 'Move the system to a better technology platform while largely preserving what it does.',
    stages: ['Approve', 'Prepare Target Platform', 'Transform/Migrate', 'Validate', 'Cutover', 'Optimize', 'Measure', 'Learn'],
  },
  Refactor: {
    plainEnglish: 'Redesign parts of it',
    shortAction: 'REDESIGN PARTS OF IT',
    disposition: 'Refactor',
    tagline: 'Re-architect bottlenecked components for cloud-native scale and agility.',
    summary: 'Redesign parts of the system when deeper change creates meaningful long-term value.',
    stages: ['Approve', 'Redesign/Decompose', 'Implement', 'Test', 'Transition', 'Stabilize', 'Measure', 'Learn'],
  },
  Repurchase: {
    plainEnglish: 'Replace it with another product',
    shortAction: 'REPLACE IT WITH ANOTHER PRODUCT',
    disposition: 'Repurchase',
    tagline: 'Transition from custom software to a commercial or SaaS platform.',
    summary: 'Replace the existing system with another product when rebuilding makes less business sense.',
    stages: ['Approve', 'Select Replacement', 'Configure', 'Migrate Data/Users', 'Transition', 'Retire Previous Product', 'Measure', 'Learn'],
  },
};

export const CAPABILITY_CUES: Record<string, CapabilityCueDefinition> = {
  'enterprise-dna': {
    id: 'enterprise-dna',
    title: 'Enterprise DNA',
    whatIsIt: '18 structured evidence attributes across 6 architectural dimensions.',
    problemSolved: 'Eliminates scattered tribal knowledge and exposes hidden dependencies.',
    whatHappens: 'Calculates deterministic completeness and highlights critical evidence gaps.',
    summary: 'Understand what this system does, what it depends on, what it costs and what risks affect changing it.',
    learnMoreVideoSequence: 'F11',
  },
  'modernization-agent': {
    id: 'modernization-agent',
    title: 'Modernization Agent',
    whatIsIt: 'One governed AI advisor operating inside deterministic EMOS guardrails.',
    problemSolved: 'Replaces ungrounded AI guesswork with evidence-backed 6R reasoning.',
    whatHappens: 'Investigates evidence, identifies gaps and recommends what should happen to this system.',
    summary: 'Investigates evidence, identifies gaps and recommends what should happen to this system.',
    learnMoreVideoSequence: 'F03',
  },
  'evidence-readiness': {
    id: 'evidence-readiness',
    title: 'Evidence Readiness',
    whatIsIt: 'A deterministic 70% completeness plus zero-critical-gap decision gate.',
    problemSolved: 'Prevents fluent AI output from turning weak evidence into false confidence.',
    whatHappens: 'Blocks premature approval until critical dependency, TCO and target-state facts are verified.',
    summary: 'Shows whether EMOS has enough trustworthy information to make a confident recommendation.',
    learnMoreVideoSequence: 'F18',
  },
  retain: {
    id: 'retain',
    title: 'Retain',
    plainEnglish: 'Keep it as-is',
    whatIsIt: 'Canonical disposition to preserve and monitor the workload in place.',
    problemSolved: 'Prevents unnecessary migration spend on stable or hardware-bound systems.',
    whatHappens: 'Routes the workload to lifecycle monitoring and risk remediation.',
    summary: 'Keep this system because changing it currently provides insufficient business benefit.',
    learnMoreVideoSequence: 'F03',
  },
  retire: {
    id: 'retire',
    title: 'Retire',
    plainEnglish: 'Safely shut it down',
    whatIsIt: 'Canonical disposition to decommission redundant or obsolete systems.',
    problemSolved: 'Eliminates wasted licensing, infrastructure and maintenance overhead.',
    whatHappens: 'Guides consumer transition, compliance archival, shutdown and cost-removal verification.',
    summary: 'Safely remove a system that no longer provides enough value to justify keeping it.',
    learnMoreVideoSequence: 'F04',
  },
  rehost: {
    id: 'rehost',
    title: 'Rehost',
    plainEnglish: 'Move it largely unchanged',
    whatIsIt: 'Lift-and-shift migration to modern infrastructure without code redesign.',
    problemSolved: 'Meets urgent data-center exit or hardware refresh deadlines with low risk.',
    whatHappens: 'Plans landing-zone preparation, VM/workload migration, validation and cutover.',
    summary: 'Move the system to a new environment while changing as little as possible.',
    learnMoreVideoSequence: 'F03',
  },
  replatform: {
    id: 'replatform',
    title: 'Replatform',
    plainEnglish: 'Move it to a better platform',
    whatIsIt: 'Migration to managed cloud databases, containers or analytics platforms.',
    problemSolved: 'Reduces operational toil and unlocks elastic scale without a full rewrite.',
    whatHappens: 'Prepares target platform architecture, data/schema migration, cutover and optimization.',
    summary: 'Move the system to a better technology platform while largely preserving what it does.',
    learnMoreVideoSequence: 'F04',
  },
  refactor: {
    id: 'refactor',
    title: 'Refactor',
    plainEnglish: 'Redesign parts of it',
    whatIsIt: 'Architectural decomposition into cloud-native or event-driven services.',
    problemSolved: 'Removes monolithic release bottlenecks and severe scalability limits.',
    whatHappens: 'Defines target service boundaries, phased decomposition, testing and transition.',
    summary: 'Redesign parts of the system when deeper change creates meaningful long-term value.',
    learnMoreVideoSequence: 'F04',
  },
  repurchase: {
    id: 'repurchase',
    title: 'Repurchase',
    plainEnglish: 'Replace it with another product',
    whatIsIt: 'Replacement of custom legacy software with a commercial SaaS platform.',
    problemSolved: 'Ends custom maintenance on commodity business capabilities.',
    whatHappens: 'Guides product selection, configuration, data/user migration and legacy retirement.',
    summary: 'Replace the existing system with another product when rebuilding makes less business sense.',
    learnMoreVideoSequence: 'F04',
  },
  governance: {
    id: 'governance',
    title: 'Governance',
    whatIsIt: 'Human-in-the-loop review and approval gate for modernization decisions.',
    problemSolved: 'Ensures AI recommendations never proceed without accountable human sign-off.',
    whatHappens: 'Records named architectural, security and executive approval before execution.',
    summary: 'Ensure important modernization decisions are reviewed and approved by the right people.',
    learnMoreVideoSequence: 'F06',
  },
  execute: {
    id: 'execute',
    title: 'Execute',
    whatIsIt: 'Disposition-specific transformation timeline, checkpoint and blocker tracker.',
    problemSolved: 'Bridges the gap between static planning decks and live delivery progress.',
    whatHappens: 'Tracks approved changes as work progresses, blockers emerge and checkpoints are completed.',
    summary: 'Track approved changes as work progresses, blockers emerge and checkpoints are completed.',
    learnMoreVideoSequence: 'F19',
  },
  measure: {
    id: 'measure',
    title: 'Measure',
    whatIsIt: 'Outcome comparison across baseline, target and observed metrics.',
    problemSolved: 'Proves whether modernization delivered promised cost, risk and performance value.',
    whatHappens: 'Compares expected benefits with observed results to determine whether the change worked.',
    summary: 'Compare expected benefits with observed results to determine whether the change worked.',
    learnMoreVideoSequence: 'F19',
  },
  learn: {
    id: 'learn',
    title: 'Learn',
    whatIsIt: 'Structured capture of assumptions versus observed transformation outcomes.',
    problemSolved: 'Prevents repeating estimation errors across subsequent modernization waves.',
    whatHappens: 'Captures what happened so future decisions can use better evidence.',
    summary: 'Capture what happened so future decisions can use better evidence.',
    learnMoreVideoSequence: '00',
  },
};

export function get6RCue(disposition: Disposition6R | string): CapabilityCueDefinition {
  const key = disposition.toLowerCase();
  return CAPABILITY_CUES[key] || CAPABILITY_CUES['replatform'];
}
