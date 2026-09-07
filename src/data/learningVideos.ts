export const CANONICAL_DRIVE_LIBRARY_URL =
  'https://drive.google.com/drive/folders/1ONwIDuVpKqu3DJzmHgzrtYTeJaOUXqQ1?usp=drive_link';

export const LEARNING_CATEGORIES = [
  'Start Here',
  'Assess and Decide',
  'Trust and Governance',
  'Portfolio and Enterprise DNA',
  'Product Experience and Security',
  'Plan and Mobilize',
] as const;

export type LearningCategory = (typeof LEARNING_CATEGORIES)[number];

export interface LearningVideo {
  sequence: string;
  title: string;
  description: string;
  category: LearningCategory;
  tags: string[];
  fileName: string;
  thumbnailUrl: string;
  duration?: string;
}

const THUMBNAILS = {
  '00': new URL('../../docs/learning/thumbnails/00-beta-introduction.svg', import.meta.url).href,
  F01: new URL('../../docs/learning/thumbnails/f01-sign-in.svg', import.meta.url).href,
  F02: new URL('../../docs/learning/thumbnails/f02-product-tour.svg', import.meta.url).href,
  F03: new URL('../../docs/learning/thumbnails/f03-6r-assessment.svg', import.meta.url).href,
  F04: new URL('../../docs/learning/thumbnails/f04-executive-decision.svg', import.meta.url).href,
  F05: new URL('../../docs/learning/thumbnails/f05-new-evidence.svg', import.meta.url).href,
  F06: new URL('../../docs/learning/thumbnails/f06-persistence-privacy.svg', import.meta.url).href,
  F07: new URL('../../docs/learning/thumbnails/f07-assessment-history.svg', import.meta.url).href,
  F08: new URL('../../docs/learning/thumbnails/f08-platform-neutrality.svg', import.meta.url).href,
  F09: new URL('../../docs/learning/thumbnails/f09-score-consistency.svg', import.meta.url).href,
  F10: new URL('../../docs/learning/thumbnails/f10-sample-portfolio.svg', import.meta.url).href,
  F11: new URL('../../docs/learning/thumbnails/f11-evidence-gaps.svg', import.meta.url).href,
  F12: new URL('../../docs/learning/thumbnails/f12-dna-to-assessment.svg', import.meta.url).href,
  F13: new URL('../../docs/learning/thumbnails/f13-import-portfolio.svg', import.meta.url).href,
  F14: new URL('../../docs/learning/thumbnails/f14-sample-dataset.svg', import.meta.url).href,
  F15: new URL('../../docs/learning/thumbnails/f15-imported-workloads.svg', import.meta.url).href,
  F16: new URL('../../docs/learning/thumbnails/f16-responsive-layouts.svg', import.meta.url).href,
  F17: new URL('../../docs/learning/thumbnails/f17-prompt-security.svg', import.meta.url).href,
  F18: new URL('../../docs/learning/thumbnails/f18-6r-readiness.svg', import.meta.url).href,
  F19: new URL('../../docs/learning/thumbnails/f19-plan-mobilize.svg', import.meta.url).href,
} as const;

export const LEARNING_HERO_IMAGE = new URL(
  '../../docs/learning/emos-learning-background.png',
  import.meta.url,
).href;

export const LEARNING_VIDEOS: LearningVideo[] = [
  {
    sequence: '00',
    title: 'EMOS Beta Introduction',
    description:
      'Understand the enterprise problem, the modernization journey, the implemented beta scope, the Google Cloud architecture, and the future roadmap.',
    category: 'Start Here',
    tags: ['Introduction'],
    fileName: 'EMOS-Beta-Introduction.mp4',
    thumbnailUrl: THUMBNAILS['00'],
    duration: '4:17',
  },
  {
    sequence: 'F01',
    title: 'Sign in and enter the private workspace',
    description:
      'See the Firebase Google Sign-In entry point and the owner-bound EMOS workspace.',
    category: 'Start Here',
    tags: ['Getting Started', 'Authentication'],
    fileName: 'F01-sign-in-enter-the-private-workspace.mp4',
    thumbnailUrl: THUMBNAILS.F01,
  },
  {
    sequence: 'F02',
    title: 'Take the guided product tour',
    description: 'Orient yourself to the beta experience and the major product areas.',
    category: 'Start Here',
    tags: ['Getting Started', 'Product Tour'],
    fileName: 'F02-take-the-guided-product-tour.mp4',
    thumbnailUrl: THUMBNAILS.F02,
  },
  {
    sequence: 'F03',
    title: 'Submit a workload for a 6R assessment',
    description:
      'Send structured workload evidence through the authenticated assessment workflow.',
    category: 'Assess and Decide',
    tags: ['Decision Intelligence', 'Canonical 6R'],
    fileName: 'F03-submit-a-workload-for-a-6r-assessment.mp4',
    thumbnailUrl: THUMBNAILS.F03,
  },
  {
    sequence: 'F04',
    title: 'Explore options and generate an executive decision',
    description:
      'Review the recommended disposition, rationale, alternatives, risks, and decision output.',
    category: 'Assess and Decide',
    tags: ['Decision Intelligence', 'Explainability'],
    fileName: 'F04-explore-options-generate-an-executive-decision.mp4',
    thumbnailUrl: THUMBNAILS.F04,
  },
  {
    sequence: 'F05',
    title: 'Refine an assessment with new evidence',
    description:
      'Use a multi-turn follow-up to improve the recommendation as evidence changes.',
    category: 'Assess and Decide',
    tags: ['Decision Intelligence', 'Gemini Follow-up'],
    fileName: 'F05-refine-an-assessment-with-new-evidence.mp4',
    thumbnailUrl: THUMBNAILS.F05,
  },
  {
    sequence: 'F06',
    title: 'Verify owner-bound persistence and privacy',
    description:
      'Understand how authenticated user data remains isolated in Cloud Firestore.',
    category: 'Trust and Governance',
    tags: ['Trust & Governance', 'Firestore'],
    fileName: 'F06-verify-owner-bound-persistence-privacy.mp4',
    thumbnailUrl: THUMBNAILS.F06,
  },
  {
    sequence: 'F07',
    title: 'Search, filter, and manage assessment history',
    description: 'Find and revisit persisted modernization assessments.',
    category: 'Trust and Governance',
    tags: ['Trust & Governance', 'History'],
    fileName: 'F07-search-filter-manage-assessment-history.mp4',
    thumbnailUrl: THUMBNAILS.F07,
  },
  {
    sequence: 'F08',
    title: 'Preserve cloud-platform neutrality',
    description:
      'See how EMOS avoids inventing a hyperscaler choice when target-state evidence is missing.',
    category: 'Trust and Governance',
    tags: ['Trust & Governance', 'Vendor Neutrality'],
    fileName: 'F08-preserve-cloud-platform-neutrality.mp4',
    thumbnailUrl: THUMBNAILS.F08,
  },
  {
    sequence: 'F09',
    title: 'Validate assessment-score consistency',
    description:
      'Compare evidence completeness, recommendation confidence, and decision readiness without conflating them.',
    category: 'Trust and Governance',
    tags: ['Trust & Governance', 'Consistency'],
    fileName: 'F09-validate-assessment-score-consistency.mp4',
    thumbnailUrl: THUMBNAILS.F09,
  },
  {
    sequence: 'F10',
    title: 'Explore the sample enterprise portfolio',
    description: 'Start with representative enterprise workloads and modernization signals.',
    category: 'Portfolio and Enterprise DNA',
    tags: ['Portfolio & DNA', 'Discovery'],
    fileName: 'F10-explore-the-sample-enterprise-portfolio.mp4',
    thumbnailUrl: THUMBNAILS.F10,
  },
  {
    sequence: 'F11',
    title: 'Inspect Enterprise DNA and evidence gaps',
    description:
      'Review known, incomplete, and missing evidence across the six DNA dimensions.',
    category: 'Portfolio and Enterprise DNA',
    tags: ['Portfolio & DNA', 'Evidence Gaps'],
    fileName: 'F11-inspect-enterprise-dna-evidence-gaps.mp4',
    thumbnailUrl: THUMBNAILS.F11,
  },
  {
    sequence: 'F12',
    title: 'Go from Enterprise DNA to assessment in one click',
    description:
      'Carry structured context directly into assessment without re-entering evidence.',
    category: 'Portfolio and Enterprise DNA',
    tags: ['Portfolio & DNA', 'Guided Flow'],
    fileName: 'F12-go-from-enterprise-dna-to-assessment-in-one-click.mp4',
    thumbnailUrl: THUMBNAILS.F12,
  },
  {
    sequence: 'F13',
    title: 'Import a CSV or JSON portfolio',
    description:
      'Bring a controlled workload inventory into EMOS with schema and input-safety checks.',
    category: 'Portfolio and Enterprise DNA',
    tags: ['Portfolio & DNA', 'BYOP'],
    fileName: 'F13-import-a-csv-or-json-portfolio.mp4',
    thumbnailUrl: THUMBNAILS.F13,
  },
  {
    sequence: 'F14',
    title: 'Download a sample enterprise dataset',
    description: 'Use a benchmark portfolio to evaluate the import and assessment experience.',
    category: 'Portfolio and Enterprise DNA',
    tags: ['Portfolio & DNA', 'Sample Data'],
    fileName: 'F14-download-a-sample-enterprise-dataset.mp4',
    thumbnailUrl: THUMBNAILS.F14,
  },
  {
    sequence: 'F15',
    title: 'Assess and manage imported workloads',
    description: 'Move imported portfolio records through Enterprise DNA and 6R assessment.',
    category: 'Portfolio and Enterprise DNA',
    tags: ['Portfolio & DNA', 'BYOP'],
    fileName: 'F15-assess-manage-imported-workloads.mp4',
    thumbnailUrl: THUMBNAILS.F15,
  },
  {
    sequence: 'F16',
    title: 'Switch appearance and use responsive layouts',
    description:
      'Explore light, dark, and system themes across responsive product layouts.',
    category: 'Product Experience and Security',
    tags: ['Product Experience', 'Accessibility'],
    fileName: 'F16-switch-appearance-use-responsive-layouts.mp4',
    thumbnailUrl: THUMBNAILS.F16,
  },
  {
    sequence: 'F17',
    title: 'Fence adversarial prompts and redact secrets',
    description:
      'See the input guardrails and output-redaction controls applied around Gemini.',
    category: 'Product Experience and Security',
    tags: ['Security', 'AI Guardrails'],
    fileName: 'F17-fence-adversarial-prompts-redact-secrets.mp4',
    thumbnailUrl: THUMBNAILS.F17,
  },
  {
    sequence: 'F18',
    title: 'Enforce canonical 6R and evidence readiness',
    description:
      'Review deterministic taxonomy repair and evidence-gated readiness behavior.',
    category: 'Product Experience and Security',
    tags: ['Security', 'Release Controls'],
    fileName: 'F18-enforce-canonical-6r-evidence-readiness.mp4',
    thumbnailUrl: THUMBNAILS.F18,
  },
  {
    sequence: 'F19',
    title: 'Plan and mobilize the modernization program',
    description:
      'Translate assessed workloads into preliminary modernization waves, readiness actions, and an executive decision pack.',
    category: 'Plan and Mobilize',
    tags: ['Planning & Mobilization', 'Wave Planning'],
    fileName: 'F19-plan-mobilize-the-modernization-program.mp4',
    thumbnailUrl: THUMBNAILS.F19,
  },
];

export const CURRENT_BETA_CAPABILITIES = [
  'Portfolio discovery with sample and CSV/JSON-imported workloads',
  'Structured Enterprise DNA with deterministic evidence completeness',
  'Gemini-powered, explainable canonical 6R assessments',
  'Evidence-gap, confidence, risk, and readiness distinctions',
  'Preliminary modernization wave planning and mobilization readiness',
  'Owner-isolated Firestore persistence and tested security controls',
] as const;

export const FUTURE_ROADMAP_CAPABILITIES = [
  'Automated CMDB and telemetry discovery',
  'Organization-wide governance and approval workflows',
  'Disposition-specific governed execution agents',
  'Autonomous validation and parity verification',
  'Benefits-realization and continuous outcome tracking',
  'Continuous modernization and marketplace distribution',
] as const;
