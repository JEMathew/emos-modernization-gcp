import type { EnterpriseDna, EnterpriseWorkload } from '../../src/types';
import { evaluateEvidenceReadiness } from '../../src/lib/readiness';
import type { SixREvalScenario } from '../types';

interface ScenarioSeed {
  scenarioId: string;
  id: string;
  name: string;
  type: EnterpriseWorkload['type'];
  businessCapability: string;
  businessCriticality: EnterpriseWorkload['businessCriticality'];
  currentStack: string;
  hosting: string;
  knownDependencies: string;
  modernizationSignals: string[];
  businessContext: string;
  technicalContext: string;
  constraints: string;
  missingFieldIds?: string[];
  incompleteFieldIds?: string[];
  expectedDisposition: SixREvalScenario['expectedDisposition'];
  expectedReasoningThemes: string[];
  unacceptableClaims: string[];
}

function buildScenarioDna(seed: ScenarioSeed): EnterpriseDna {
  const missing = new Set(seed.missingFieldIds || []);
  const incomplete = new Set(seed.incompleteFieldIds || []);

  const statusFor = (id: string): 'known' | 'missing' | 'incomplete' => {
    if (missing.has(id)) return 'missing';
    if (incomplete.has(id)) return 'incomplete';
    return 'known';
  };

  const valFor = (id: string, knownValue: string): string => {
    const st = statusFor(id);
    if (st === 'missing') return 'Missing';
    if (st === 'incomplete') return 'Incomplete';
    return knownValue;
  };

  return {
    business: [
      { id: 'b1', label: 'Business Capability', value: seed.businessCapability, status: 'known' },
      { id: 'b2', label: 'Business Criticality', value: seed.businessCriticality, status: 'known' },
      { id: 'b3', label: 'Modernization Drivers', value: seed.modernizationSignals.join(', '), status: 'known' },
    ],
    technology: [
      { id: 't1', label: 'Runtime / Stack', value: seed.currentStack, status: 'known' },
      { id: 't2', label: 'Database / Storage', value: seed.technicalContext, status: 'known' },
      { id: 't3', label: 'Hosting', value: seed.hosting, status: 'known' },
      { id: 't4', label: 'Technology Lifecycle Risk', value: seed.constraints, status: 'known' },
    ],
    dependency: [
      { id: 'd1', label: 'Known Dependencies', value: seed.knownDependencies, status: 'known' },
      {
        id: 'd2',
        label: 'Dependency Details',
        value: valFor('d2', `Mapped interface contracts and latency SLAs for ${seed.knownDependencies}`),
        status: statusFor('d2'),
        detail:
          statusFor('d2') !== 'known'
            ? 'Interface protocols, owners, and cutover sequencing remain unverified'
            : 'Verified interface contracts and owners',
      },
    ],
    economics: [
      { id: 'e1', label: 'Infrastructure Cost', value: 'Verified annual infrastructure baseline', status: 'known' },
      { id: 'e2', label: 'Licensing Cost', value: 'Verified licensing and support structure', status: 'known' },
      {
        id: 'e3',
        label: 'Detailed TCO Baseline',
        value: valFor('e3', 'Verified 3-year TCO baseline documented'),
        status: statusFor('e3'),
        detail:
          statusFor('e3') !== 'known'
            ? 'Multi-year TCO baseline not yet provided by Finance'
            : 'Finance-verified 3-year TCO baseline',
      },
    ],
    dataAndRisk: [
      { id: 'dr1', label: 'Data Classification', value: seed.businessContext, status: 'known' },
      {
        id: 'dr2',
        label: 'Data Volume & Velocity',
        value: valFor('dr2', 'Verified daily volume and retention profile'),
        status: statusFor('dr2'),
      },
      {
        id: 'dr3',
        label: 'Compliance Constraints',
        value: valFor('dr3', seed.constraints),
        status: statusFor('dr3'),
      },
    ],
    targetState: [
      {
        id: 'ts1',
        label: 'Target Cloud / Platform Strategy',
        value: valFor('ts1', `Aligned to enterprise target strategy (${seed.constraints})`),
        status: statusFor('ts1'),
      },
      {
        id: 'ts2',
        label: 'Target Architecture Constraints',
        value: valFor('ts2', seed.constraints),
        status: statusFor('ts2'),
      },
      {
        id: 'ts3',
        label: 'Migration Downtime Tolerance',
        value: valFor('ts3', 'Verified maintenance window and rollback checkpoint'),
        status: statusFor('ts3'),
      },
    ],
  };
}

const SCENARIO_SEEDS: ScenarioSeed[] = [
  // ==================== RETAIN (3 scenarios) ====================
  {
    scenarioId: 'SCEN-RETAIN-01',
    id: 'eval-retain-hsm-switch',
    name: 'Card Authorization HSM & ISO8583 Switch',
    type: 'Application',
    businessCapability: 'Real-Time Card Authorization',
    businessCriticality: 'High',
    currentStack: 'Tandem NonStop + Hardware HSM + ISO8583',
    hosting: 'Tier-4 Sovereign On-Premises Vault',
    knownDependencies: '4 payment card network trunks',
    modernizationSignals: ['Sub-millisecond hardware cryptographic constraint', 'Recent hardware refresh amortized through 2029'],
    businessContext: 'Mission-critical retail card authorization requiring PCI-HSM physical boundary.',
    technicalContext: 'Hardware HSM cryptographic vault with ISO8583 switch.',
    constraints: 'Air-gapped HSM requirement; retain in on-premises vault; zero cloud ROI.',
    expectedDisposition: 'Retain',
    expectedReasoningThemes: ['hardware', 'latency', 'retain', 'continuity', 'on-premises'],
    unacceptableClaims: ['approve automatically', 'migrate to public cloud immediately', 'decommission'],
  },
  {
    scenarioId: 'SCEN-RETAIN-02',
    id: 'eval-retain-scada-plc',
    name: 'Plant Floor PLC & SCADA Telemetry Controller',
    type: 'Application',
    businessCapability: 'Industrial Manufacturing Control',
    businessCriticality: 'High',
    currentStack: 'Siemens PLC + OPC-UA SCADA',
    hosting: 'Air-gapped Shop-Floor Edge Cluster',
    knownDependencies: '14 assembly-line robotic controllers',
    modernizationSignals: ['Air-gapped shop-floor safety loop', 'Sub-2ms deterministic control loop'],
    businessContext: 'Factory safety and physical robotics actuation.',
    technicalContext: 'OPC-UA industrial control network.',
    constraints: 'Air-gapped plant floor network; physical safety certification locks deployment on-premises.',
    expectedDisposition: 'Retain',
    expectedReasoningThemes: ['hardware', 'continuity', 'on-premises', 'retain'],
    unacceptableClaims: ['shut down', 'replace with saas'],
  },
  {
    scenarioId: 'SCEN-RETAIN-03',
    id: 'eval-retain-mainframe-vault',
    name: 'Sovereign Core Settlement Vault',
    type: 'Application',
    businessCapability: 'Central Bank Clearing Settlement',
    businessCriticality: 'High',
    currentStack: 'IBM z16 + Sovereign Hardware Vault',
    hosting: 'On-Premises Sovereign Datacenter',
    knownDependencies: '3 central bank clearing rails',
    modernizationSignals: ['Recent hardware refresh', 'Keep on-premises under regulatory lock'],
    businessContext: 'Regulated central-bank settlement ledger.',
    technicalContext: 'Amortized z16 hardware with regulatory residency lock.',
    constraints: 'Mainframe regulatory lock; retain in on-premises datacenter.',
    missingFieldIds: ['e3'],
    expectedDisposition: 'Retain',
    expectedReasoningThemes: ['retain', 'continuity', 'hardware', 'on-premises'],
    unacceptableClaims: ['ready for approval', 'invented cost'],
  },

  // ==================== RETIRE (3 scenarios) ====================
  {
    scenarioId: 'SCEN-RETIRE-01',
    id: 'eval-retire-dodd-frank',
    name: 'Dodd-Frank 2015 Archival Reporter',
    type: 'Application',
    businessCapability: 'Historical Regulatory Reporting',
    businessCriticality: 'Low',
    currentStack: 'Windows Server 2012 + Legacy .NET',
    hosting: 'On-Premises Legacy Cluster',
    knownDependencies: 'Zero active downstream consumers',
    modernizationSignals: ['Retention period expired', 'Zero active users', 'Decommission candidate'],
    businessContext: 'Superseded regulatory reporting app with expired retention window.',
    technicalContext: 'EOL Windows Server 2012 creating patching exposure.',
    constraints: 'Cold archive required before shut down; duplicate of modern compliance platform.',
    expectedDisposition: 'Retire',
    expectedReasoningThemes: ['retire', 'decommission', 'duplicate', 'archival', 'cost'],
    unacceptableClaims: ['refactor into microservices', 'high business criticality'],
  },
  {
    scenarioId: 'SCEN-RETIRE-02',
    id: 'eval-retire-promo-portal',
    name: 'Legacy Regional Dealer Promo Portal',
    type: 'Application',
    businessCapability: 'Dealer Campaign Tracking',
    businessCriticality: 'Low',
    currentStack: 'PHP 5.6 + MySQL 5.5',
    hosting: 'On-Premises DMZ',
    knownDependencies: '1 batch export already superseded',
    modernizationSignals: ['Fully superseded by enterprise CRM', 'Obsolete stack', 'Shut down after export'],
    businessContext: 'Duplicate regional portal replaced by global dealer platform.',
    technicalContext: 'Unsupported PHP 5.6 runtime with security findings.',
    constraints: 'Low criticality; redundant capability; sunsetting approved in principle.',
    expectedDisposition: 'Retire',
    expectedReasoningThemes: ['retire', 'decommission', 'security', 'cost'],
    unacceptableClaims: ['lift and shift', 'replatform to kubernetes'],
  },
  {
    scenarioId: 'SCEN-RETIRE-03',
    id: 'eval-retire-legacy-bi',
    name: 'Deprecated Branch Fax & Report Spooler',
    type: 'Application',
    businessCapability: 'Branch Print & Fax Archiving',
    businessCriticality: 'Low',
    currentStack: 'Solaris 10 + Perl Scripts',
    hosting: 'On-Premises Branch Rack',
    knownDependencies: 'No active upstream feeds',
    modernizationSignals: ['Obsolete', 'Zero active users', 'Scrap legacy server'],
    businessContext: 'Redundant legacy reporting utility.',
    technicalContext: 'EOL Solaris hardware.',
    constraints: 'Retention verification pending before decommissioning.',
    missingFieldIds: ['ts3'],
    expectedDisposition: 'Retire',
    expectedReasoningThemes: ['retire', 'decommission', 'archival', 'licensing'],
    unacceptableClaims: ['approved without human review'],
  },

  // ==================== REHOST (3 scenarios) ====================
  {
    scenarioId: 'SCEN-REHOST-01',
    id: 'eval-rehost-swift-gateway',
    name: 'Regional SWIFT & Wire Settlement Gateway',
    type: 'Application',
    businessCapability: 'Cross-Border Wire Settlement',
    businessCriticality: 'High',
    currentStack: 'RHEL 8 + Java 17 + MQ Gateway',
    hosting: 'Colocation Facility (Lease Expiring in 90 Days)',
    knownDependencies: '6 correspondent banking connectors',
    modernizationSignals: ['Colocation lease expiring', 'Lift-and-shift VM migration without code rewrite'],
    businessContext: 'Time-bound colocation exit requires zero-rewrite relocation.',
    technicalContext: 'Modern RHEL 8 / Java 17 portable directly to cloud VMs.',
    constraints: '90-day datacenter exit deadline; preserve wire interface contracts.',
    expectedDisposition: 'Rehost',
    expectedReasoningThemes: ['rehost', 'lease', 'code rewrite', 'virtual machines', 'contracts'],
    unacceptableClaims: ['rewrite from scratch', 'decommission'],
  },
  {
    scenarioId: 'SCEN-REHOST-02',
    id: 'eval-rehost-edi-gateway',
    name: 'Supplier EDI Gateway & AS2 Hub',
    type: 'Application',
    businessCapability: 'Supply Chain EDI Exchange',
    businessCriticality: 'High',
    currentStack: 'Linux VMs + Sterling EDI Gateway',
    hosting: 'Expiring Regional Colocation',
    knownDependencies: '42 tier-1 supplier AS2 tunnels',
    modernizationSignals: ['Datacenter exit in Q3', 'EDI gateway lift-and-shift', 'No code change allowed'],
    businessContext: 'Must exit colocation facility before penalty renewal.',
    technicalContext: 'Vendor-supported Linux VMs ready for as-is VM migration.',
    constraints: 'Rapid exit timeline; partner IP allow-lists require careful cutover.',
    expectedDisposition: 'Rehost',
    expectedReasoningThemes: ['rehost', 'exit', 'portable', 'contracts'],
    unacceptableClaims: ['retire immediately', 're-architect into serverless'],
  },
  {
    scenarioId: 'SCEN-REHOST-03',
    id: 'eval-rehost-erp-satellite',
    name: 'Warehouse Label Print & RF Server',
    type: 'Application',
    businessCapability: 'Warehouse Dispatch Operations',
    businessCriticality: 'Medium',
    currentStack: 'Windows Server 2022 + IIS',
    hosting: 'Colocation Facility (Lease Expiring)',
    knownDependencies: '5 regional WMS scanners',
    modernizationSignals: ['Lease expiring', 'Rapid exit via as-is VM migration'],
    businessContext: 'Needs rapid relocation out of closing colocation site.',
    technicalContext: 'Modern Windows Server 2022 VM image.',
    constraints: 'Missing TCO baseline and downtime tolerance must be verified first.',
    missingFieldIds: ['e3', 'ts3'],
    expectedDisposition: 'Rehost',
    expectedReasoningThemes: ['rehost', 'exit', 'timeline', 'portable'],
    unacceptableClaims: ['evidence gate is ready'],
  },

  // ==================== REPLATFORM (3 scenarios) ====================
  {
    scenarioId: 'SCEN-REPLATFORM-01',
    id: 'eval-replatform-edw',
    name: 'Enterprise Risk & Liquidity Data Warehouse',
    type: 'Data Platform',
    businessCapability: 'Enterprise Risk & Regulatory Analytics',
    businessCriticality: 'High',
    currentStack: 'Teradata MPP Appliance + Informatica ETL',
    hosting: 'On-Premises Data Center',
    knownDependencies: '18 upstream risk feeds & 12 BI reporting marts',
    modernizationSignals: ['Hardware refresh avoidance', 'Managed cloud lakehouse / BigQuery target', 'AI/ML scalability'],
    businessContext: 'High-growth analytics and Basel III stress testing workload.',
    technicalContext: 'Proprietary MPP data warehouse hitting storage/compute ceilings.',
    constraints: 'Preserve SQL semantics while moving to managed cloud data platform.',
    expectedDisposition: 'Replatform',
    expectedReasoningThemes: ['replatform', 'managed cloud', 'tco', 'scale', 'analytics'],
    unacceptableClaims: ['retain on teradata forever', 'retire'],
  },
  {
    scenarioId: 'SCEN-REPLATFORM-02',
    id: 'eval-replatform-hadoop',
    name: 'Clickstream Hadoop & Spark Lake',
    type: 'Data Platform',
    businessCapability: 'Digital Telemetry Analytics',
    businessCriticality: 'High',
    currentStack: 'Cloudera Hadoop + Apache Spark 2.4',
    hosting: 'On-Premises Bare Metal Cluster',
    knownDependencies: '9 streaming Kafka producers & 6 ML pipelines',
    modernizationSignals: ['Managed cloud Spark & lakehouse', 'Eliminate cluster administration toil'],
    businessContext: 'Powers marketing attribution and churn models.',
    technicalContext: 'Aging on-prem Hadoop cluster with high ops overhead.',
    constraints: 'Keep Spark jobs intact while moving to managed cloud platform.',
    expectedDisposition: 'Replatform',
    expectedReasoningThemes: ['replatform', 'managed cloud', 'hardware', 'toil'],
    unacceptableClaims: ['replace with saas crm', 'shut down'],
  },
  {
    scenarioId: 'SCEN-REPLATFORM-03',
    id: 'eval-replatform-postgres',
    name: 'Regional Order Reporting Mart',
    type: 'Data Platform',
    businessCapability: 'Commercial Sales Reporting',
    businessCriticality: 'Medium',
    currentStack: 'Self-Managed PostgreSQL 12 + Python ETL',
    hosting: 'On-Premises VMware',
    knownDependencies: '4 ERP extracts & 3 executive dashboards',
    modernizationSignals: ['Move to managed cloud SQL / PaaS database', 'Reduce DBA patching toil'],
    businessContext: 'Daily commercial reporting mart.',
    technicalContext: 'Standard SQL reporting engine suitable for managed cloud DB.',
    constraints: 'Dependency lineage incomplete; requires verification before approval.',
    incompleteFieldIds: ['d2'],
    expectedDisposition: 'Replatform',
    expectedReasoningThemes: ['replatform', 'managed cloud', 'database'],
    unacceptableClaims: ['zero gaps remaining'],
  },

  // ==================== REFACTOR (3 scenarios) ====================
  {
    scenarioId: 'SCEN-REFACTOR-01',
    id: 'eval-refactor-analytics',
    name: 'Core Customer Analytics & Scoring Engine',
    type: 'Application',
    businessCapability: 'Real-Time Customer Intelligence',
    businessCriticality: 'High',
    currentStack: 'Java 8 Monolith + Oracle Enterprise DB',
    hosting: 'On-Premises WebLogic Cluster',
    knownDependencies: '7 downstream digital & CRM integrations',
    modernizationSignals: ['Tightly coupled monolith bottleneck', 'Event-driven microservices target', 'Eliminate Oracle licensing debt'],
    businessContext: 'Core differentiating revenue platform with weekly feature demand.',
    technicalContext: 'Java 8 monolith unable to scale independently during peak traffic.',
    constraints: 'Phased strangler-fig decomposition required with zero-downtime cutover.',
    expectedDisposition: 'Refactor',
    expectedReasoningThemes: ['refactor', 'coupled', 'decomposition', 'licensing', 'agility'],
    unacceptableClaims: ['retire this core revenue engine', 'keep on java 8'],
  },
  {
    scenarioId: 'SCEN-REFACTOR-02',
    id: 'eval-refactor-clearing',
    name: 'Real-Time Equities Clearing Engine',
    type: 'Application',
    businessCapability: 'Institutional Trade Clearing',
    businessCriticality: 'High',
    currentStack: 'Legacy C++ / CORBA Monolith + Oracle RAC',
    hosting: 'On-Premises Trading Datacenter',
    knownDependencies: '11 OMS, risk, and settlement microservices',
    modernizationSignals: ['CORBA EOL risk', 'Event-driven domain decomposition', 'Elastic peak-volume scaling'],
    businessContext: 'Core institutional clearing engine differentiating firm latency SLA.',
    technicalContext: 'CORBA monolith cannot scale horizontally during market spikes.',
    constraints: 'Strict determinism and phased domain boundary extraction.',
    expectedDisposition: 'Refactor',
    expectedReasoningThemes: ['refactor', 'coupled', 'scaling', 'decomposition'],
    unacceptableClaims: ['replace with generic saas', 'rehost without solving corba'],
  },
  {
    scenarioId: 'SCEN-REFACTOR-03',
    id: 'eval-refactor-pricing',
    name: 'Dynamic Underwriting & Pricing Monolith',
    type: 'Application',
    businessCapability: 'Commercial Policy Underwriting',
    businessCriticality: 'High',
    currentStack: 'Java 8 Monolith + DB2',
    hosting: 'On-Premises Private Cloud',
    knownDependencies: '8 broker quote APIs & actuarial engines',
    modernizationSignals: ['Monolith release bottleneck', 'Microservices re-architecture'],
    businessContext: 'Strategic underwriting differentiator.',
    technicalContext: 'Java 8 monolith blocking parallel team releases.',
    constraints: 'Target-state architecture and TCO baseline still missing.',
    missingFieldIds: ['e3', 'ts1', 'ts2'],
    expectedDisposition: 'Refactor',
    expectedReasoningThemes: ['refactor', 'coupled', 'decomposition', 'agility'],
    unacceptableClaims: ['ready for immediate execution'],
  },

  // ==================== REPURCHASE (3 scenarios) ====================
  {
    scenarioId: 'SCEN-REPURCHASE-01',
    id: 'eval-repurchase-aml',
    name: 'Anti-Money Laundering (AML) Case Tracker',
    type: 'Application',
    businessCapability: 'Financial Crime Case Management',
    businessCriticality: 'Medium',
    currentStack: 'Custom .NET 4.5 + SQL Server',
    hosting: 'On-Premises Windows Farm',
    knownDependencies: '3 sanctions screening & alert feeds',
    modernizationSignals: ['Commercial SaaS case tracker available', 'Commodity compliance workflow'],
    businessContext: 'Standard regulatory case-management workflow with no proprietary edge.',
    technicalContext: 'Custom .NET app requiring manual compliance rule updates.',
    constraints: 'Data migration and audit-trail retention required when moving to turnkey SaaS.',
    expectedDisposition: 'Repurchase',
    expectedReasoningThemes: ['repurchase', 'saas', 'commodity', 'custom', 'compliance'],
    unacceptableClaims: ['refactor into custom microservices', 'retain custom .net'],
  },
  {
    scenarioId: 'SCEN-REPURCHASE-02',
    id: 'eval-repurchase-dms',
    name: 'Enterprise Document Management Repository',
    type: 'Application',
    businessCapability: 'Enterprise Document Management',
    businessCriticality: 'Medium',
    currentStack: 'Legacy Custom Web Portal + File Share',
    hosting: 'On-Premises Storage Cluster',
    knownDependencies: '4 AD, email, and intranet integrations',
    modernizationSignals: ['Turnkey commercial document management SaaS', 'High maintenance overhead'],
    businessContext: 'Commodity corporate document storage and approval routing.',
    technicalContext: 'Aging custom document management portal.',
    constraints: 'Preserve statutory retention policies during SaaS migration.',
    expectedDisposition: 'Repurchase',
    expectedReasoningThemes: ['repurchase', 'saas', 'standard', 'technical debt'],
    unacceptableClaims: ['build a new custom portal from scratch'],
  },
  {
    scenarioId: 'SCEN-REPURCHASE-03',
    id: 'eval-repurchase-expense',
    name: 'Global Travel & Expense Tracker',
    type: 'Application',
    businessCapability: 'Employee Expense Management',
    businessCriticality: 'Low',
    currentStack: 'Custom Java WebApp + Oracle',
    hosting: 'On-Premises App Server',
    knownDependencies: '2 ERP GL posting & payroll connectors',
    modernizationSignals: ['Commodity expense tracker', 'Replace with commercial SaaS platform'],
    businessContext: 'Standard employee expense reimbursement capability.',
    technicalContext: 'Bespoke expense tracker consuming engineering capacity.',
    constraints: 'TCO baseline missing; verify before finalizing SaaS contract.',
    missingFieldIds: ['e3'],
    expectedDisposition: 'Repurchase',
    expectedReasoningThemes: ['repurchase', 'saas', 'custom', 'commercial'],
    unacceptableClaims: ['evidence completeness is 100%'],
  },
];

export const SIX_R_EVAL_DATASET: SixREvalScenario[] = SCENARIO_SEEDS.map((seed) => {
  const dna = buildScenarioDna(seed);
  const readiness = evaluateEvidenceReadiness(dna);
  const allFields = Object.values(dna).flat();
  const evidenceSupplied = allFields.filter((f) => f.status === 'known').map((f) => `${f.label}: ${f.value}`);
  const evidenceMissing = allFields.filter((f) => f.status !== 'known').map((f) => `${f.label} (${f.status})`);

  const workload: EnterpriseWorkload = {
    id: seed.id,
    name: seed.name,
    type: seed.type,
    businessCapability: seed.businessCapability,
    businessCriticality: seed.businessCriticality,
    currentStack: seed.currentStack,
    hosting: seed.hosting,
    knownDependencies: seed.knownDependencies,
    modernizationSignals: seed.modernizationSignals,
    evidenceCompleteness: readiness.completeness,
    dna,
  };

  return {
    scenarioId: seed.scenarioId,
    workload,
    businessContext: seed.businessContext,
    technicalContext: seed.technicalContext,
    dependencies: seed.knownDependencies,
    constraints: seed.constraints,
    evidenceSupplied,
    evidenceMissing,
    expectedDisposition: seed.expectedDisposition,
    expectedReadiness: readiness.decisionReadiness,
    expectedReasoningThemes: seed.expectedReasoningThemes,
    unacceptableClaims: seed.unacceptableClaims,
  };
});
