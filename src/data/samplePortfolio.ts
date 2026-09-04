import type { EnterpriseWorkload, EnterpriseDna } from '../types';

/**
 * Deterministically calculates evidence completeness based on defined required DNA fields.
 * Proportion of verified known fields versus fields marked missing or incomplete.
 */
export function calculateDnaCompleteness(dna: EnterpriseDna): {
  completeness: number;
  knownCount: number;
  totalCount: number;
  missingCount: number;
  incompleteCount: number;
} {
  const allFields = [
    ...dna.business,
    ...dna.technology,
    ...dna.dependency,
    ...dna.economics,
    ...dna.dataAndRisk,
    ...dna.targetState,
  ];
  const totalCount = allFields.length;
  const knownCount = allFields.filter((f) => f.status === 'known').length;
  const missingCount = allFields.filter((f) => f.status === 'missing').length;
  const incompleteCount = allFields.filter((f) => f.status === 'incomplete').length;
  const completeness = totalCount > 0 ? Math.round((knownCount / totalCount) * 100) : 0;
  return { completeness, knownCount, totalCount, missingCount, incompleteCount };
}

// 1. Customer Analytics DNA
const customerAnalyticsDna: EnterpriseDna = {
  business: [
    { id: 'b1', label: 'Business Capability', value: 'Customer Analytics', status: 'known' },
    { id: 'b2', label: 'Business Criticality', value: 'High', status: 'known' },
    { id: 'b3', label: 'Modernization Drivers', value: 'Cost reduction, Scalability, Faster analytics', status: 'known' },
  ],
  technology: [
    { id: 't1', label: 'Runtime', value: 'Java 8', status: 'known' },
    { id: 't2', label: 'Database', value: 'Oracle', status: 'known' },
    { id: 't3', label: 'Hosting', value: 'On-premises', status: 'known' },
    { id: 't4', label: 'Technology Lifecycle Risk', value: 'Elevated', status: 'known' },
  ],
  dependency: [
    { id: 'd1', label: 'Known Downstream Integrations', value: '7 downstream integrations', status: 'known' },
    { id: 'd2', label: 'Dependency Details', value: 'Incomplete', status: 'incomplete', detail: 'Interface schemas, sync/async protocols, and latency SLAs unverified' },
  ],
  economics: [
    { id: 'e1', label: 'Infrastructure Cost', value: 'High', status: 'known' },
    { id: 'e2', label: 'Licensing Cost', value: 'High', status: 'known', detail: 'High Oracle database licensing and maintenance fees' },
    { id: 'e3', label: 'Detailed TCO Baseline', value: 'Missing', status: 'missing', detail: 'Formal multi-year total cost of ownership baseline not established' },
  ],
  dataAndRisk: [
    { id: 'dr1', label: 'Customer Data', value: 'Yes', status: 'known', detail: 'Contains customer behavior, telemetry, and transactional analytical data' },
    { id: 'dr2', label: 'Data Volume & Velocity', value: 'Missing', status: 'missing', detail: 'Total database storage size and daily ingestion rates unverified' },
    { id: 'dr3', label: 'Compliance Constraints', value: 'Missing', status: 'missing', detail: 'Specific residency, retention, or PII compliance policies not provided' },
  ],
  targetState: [
    { id: 'ts1', label: 'Target Cloud / Platform Strategy', value: 'Missing', status: 'missing', detail: 'Strategic enterprise cloud platform undecided (requires vendor-neutral assessment)' },
    { id: 'ts2', label: 'Target Architecture Constraints', value: 'Missing', status: 'missing', detail: 'Containerization, serverless, or microservices mandates unverified' },
    { id: 'ts3', label: 'Migration Downtime Tolerance', value: 'Missing', status: 'missing', detail: 'Maintenance window and maximum allowable cutover outage unverified' },
  ],
};

// 2. Enterprise Data Warehouse DNA
const enterpriseDataWarehouseDna: EnterpriseDna = {
  business: [
    { id: 'b1', label: 'Business Capability', value: 'Enterprise Analytics', status: 'known' },
    { id: 'b2', label: 'Business Criticality', value: 'High', status: 'known' },
    { id: 'b3', label: 'Modernization Drivers', value: 'Scalability constraints, Increasing AI/ML demand, Modern analytics capabilities, Cost control', status: 'known' },
  ],
  technology: [
    { id: 't1', label: 'Runtime / Processing Engine', value: 'Legacy on-premises enterprise data warehouse', status: 'known' },
    { id: 't2', label: 'Database', value: 'Legacy on-premises enterprise data warehouse', status: 'known' },
    { id: 't3', label: 'Hosting', value: 'On-premises', status: 'known' },
    { id: 't4', label: 'Technology Lifecycle Risk', value: 'Elevated', status: 'known' },
  ],
  dependency: [
    { id: 'd1', label: 'Known Dependencies', value: 'Multiple upstream and downstream data pipelines', status: 'known' },
    { id: 'd2', label: 'Dependency Details', value: 'Incomplete', status: 'incomplete', detail: 'Data lineage, batch ETL schedule dependencies, and BI tool connections unmapped' },
  ],
  economics: [
    { id: 'e1', label: 'Infrastructure Cost', value: 'Growing infrastructure cost', status: 'known' },
    { id: 'e2', label: 'Licensing Cost', value: 'High', status: 'known', detail: 'Proprietary enterprise DW appliances and hardware refresh overhead' },
    { id: 'e3', label: 'Detailed TCO Baseline', value: 'Missing', status: 'missing', detail: 'Current storage-per-terabyte and compute licensing expenditure unverified' },
  ],
  dataAndRisk: [
    { id: 'dr1', label: 'Enterprise Analytics Data', value: 'Yes', status: 'known', detail: 'Enterprise-wide historical data mart and reporting tables' },
    { id: 'dr2', label: 'Data Volume & Velocity', value: 'Missing', status: 'missing', detail: 'Petabyte/Terabyte scale and streaming/batch ingestion volume unverified' },
    { id: 'dr3', label: 'Compliance Constraints', value: 'Missing', status: 'missing', detail: 'Cross-border data regulations and enterprise governance policies unverified' },
  ],
  targetState: [
    { id: 'ts1', label: 'Target Cloud / Platform Strategy', value: 'Missing', status: 'missing', detail: 'Target cloud data warehouse / lakehouse platform undecided' },
    { id: 'ts2', label: 'Target Architecture Constraints', value: 'Missing', status: 'missing', detail: 'Modern lakehouse vs. decoupled compute/storage requirements unstated' },
    { id: 'ts3', label: 'Migration Downtime Tolerance', value: 'Missing', status: 'missing', detail: 'Parallel run cutover duration and historical data backfill constraints unverified' },
  ],
};

// 3. Document Management DNA
const documentManagementDna: EnterpriseDna = {
  business: [
    { id: 'b1', label: 'Business Capability', value: 'Enterprise Document Management', status: 'known' },
    { id: 'b2', label: 'Business Criticality', value: 'Medium', status: 'known' },
    { id: 'b3', label: 'Modernization Drivers', value: 'Aging technology, Maintainability concerns, Operational overhead', status: 'known' },
  ],
  technology: [
    { id: 't1', label: 'Runtime / Architecture', value: 'Legacy monolithic application', status: 'known' },
    { id: 't2', label: 'Database', value: 'Incomplete', status: 'incomplete', detail: 'Backend database engine and binary object store version unverified' },
    { id: 't3', label: 'Hosting', value: 'On-premises', status: 'known' },
    { id: 't4', label: 'Technology Lifecycle Risk', value: 'Elevated', status: 'known', detail: 'Legacy monolithic framework approaching end of support' },
  ],
  dependency: [
    { id: 'd1', label: 'Known Dependencies', value: 'Several enterprise integrations', status: 'known' },
    { id: 'd2', label: 'Dependency Details', value: 'Incomplete', status: 'incomplete', detail: 'Active Directory, email dispatch, and enterprise portal touchpoints unmapped' },
  ],
  economics: [
    { id: 'e1', label: 'Infrastructure Cost', value: 'Moderate', status: 'known' },
    { id: 'e2', label: 'Licensing Cost', value: 'Moderate', status: 'known' },
    { id: 'e3', label: 'Detailed TCO Baseline', value: 'Missing', status: 'missing', detail: 'Storage expansion and annual server administration cost unverified' },
  ],
  dataAndRisk: [
    { id: 'dr1', label: 'Document Content & Metadata', value: 'Yes', status: 'known', detail: 'Contains corporate documents, scans, and associated metadata' },
    { id: 'dr2', label: 'Data Volume & Velocity', value: 'Missing', status: 'missing', detail: 'Total document count, binary storage volume, and archiving rules unverified' },
    { id: 'dr3', label: 'Compliance Constraints', value: 'Missing', status: 'missing', detail: 'Statutory record retention policies and cryptographic immutability requirements unverified' },
  ],
  targetState: [
    { id: 'ts1', label: 'Target Cloud / Platform Strategy', value: 'Missing', status: 'missing', detail: 'SaaS replacement vs. cloud-hosted repository strategy undecided' },
    { id: 'ts2', label: 'Target Architecture Constraints', value: 'Missing', status: 'missing', detail: 'Commercial content services platform (CSP) vs. custom microservices unverified' },
    { id: 'ts3', label: 'Migration Downtime Tolerance', value: 'Missing', status: 'missing', detail: 'Acceptable document upload freezing during content migration unverified' },
  ],
};

export const SAMPLE_PORTFOLIO: EnterpriseWorkload[] = [
  {
    id: 'customer-analytics',
    name: 'Customer Analytics',
    type: 'Application',
    businessCapability: 'Customer Analytics',
    businessCriticality: 'High',
    currentStack: 'Java 8 + Oracle',
    hosting: 'On-premises',
    knownDependencies: '7 downstream integrations',
    modernizationSignals: [
      'High infrastructure cost',
      'High Oracle licensing cost',
      'Scalability constraints',
      'Need for faster analytics',
    ],
    evidenceCompleteness: calculateDnaCompleteness(customerAnalyticsDna).completeness,
    dna: customerAnalyticsDna,
  },
  {
    id: 'enterprise-data-warehouse',
    name: 'Enterprise Data Warehouse',
    type: 'Data Platform',
    businessCapability: 'Enterprise Analytics',
    businessCriticality: 'High',
    currentStack: 'Legacy on-premises enterprise data warehouse',
    hosting: 'On-premises',
    knownDependencies: 'Multiple upstream and downstream data pipelines',
    modernizationSignals: [
      'Growing infrastructure cost',
      'Scalability constraints',
      'Increasing AI/ML demand',
      'Need for modern analytics capabilities',
    ],
    evidenceCompleteness: calculateDnaCompleteness(enterpriseDataWarehouseDna).completeness,
    dna: enterpriseDataWarehouseDna,
  },
  {
    id: 'document-management',
    name: 'Document Management',
    type: 'Application',
    businessCapability: 'Enterprise Document Management',
    businessCriticality: 'Medium',
    currentStack: 'Legacy monolithic application',
    hosting: 'On-premises',
    knownDependencies: 'Several enterprise integrations',
    modernizationSignals: [
      'Aging technology',
      'Maintainability concerns',
      'Operational overhead',
    ],
    evidenceCompleteness: calculateDnaCompleteness(documentManagementDna).completeness,
    dna: documentManagementDna,
  },
];

/**
 * Formats the complete known & missing Enterprise DNA evidence into a structured,
 * vendor-neutral prompt for the EMOS decision intelligence engine.
 */
export function formatWorkloadDnaForAssessment(workload: EnterpriseWorkload): string {
  const { completeness, knownCount, totalCount, missingCount, incompleteCount } = calculateDnaCompleteness(workload.dna);

  const formatSection = (title: string, fields: typeof workload.dna.business) => {
    return `### ${title}\n` + fields.map((f) => {
      const statusTag = f.status === 'known' ? '[VERIFIED EVIDENCE]' : f.status === 'incomplete' ? '[INCOMPLETE EVIDENCE]' : '[MISSING EVIDENCE]';
      const detailStr = f.detail ? ` (${f.detail})` : '';
      return `- **${f.label}**: ${f.value} ${statusTag}${detailStr}`;
    }).join('\n');
  };

  return `[WORKLOAD ENTERPRISE DNA PROFILE]
Workload: ${workload.name}
Type: ${workload.type}
Business Capability: ${workload.businessCapability}
Business Criticality: ${workload.businessCriticality}
Current Stack: ${workload.currentStack}
Hosting: ${workload.hosting}
Known Dependencies: ${workload.knownDependencies}

Key Modernization Signals:
${workload.modernizationSignals.map((s) => `- ${s}`).join('\n')}

ENTERPRISE DNA STRUCTURED EVIDENCE:
${formatSection('1. Business DNA', workload.dna.business)}

${formatSection('2. Technology DNA', workload.dna.technology)}

${formatSection('3. Dependency DNA', workload.dna.dependency)}

${formatSection('4. Economics DNA', workload.dna.economics)}

${formatSection('5. Data & Risk DNA', workload.dna.dataAndRisk)}

${formatSection('6. Target-State DNA', workload.dna.targetState)}

DETERMINISTIC EVIDENCE COMPLETENESS BASELINE: ${completeness}% (${knownCount} of ${totalCount} required attributes verified; ${missingCount} missing, ${incompleteCount} incomplete).
DECISION READINESS BASELINE: NEEDS EVIDENCE (Critical target platform strategy, detailed TCO baseline, and integration specifications remain unverified).

Please assess this workload for modernization using the Canonical 6R taxonomy. Preserve vendor/platform neutrality unless an enterprise cloud standard is explicitly established.`;
}
