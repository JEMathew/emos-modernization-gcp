import type { Disposition6R, EnterpriseDna, EnterpriseWorkload } from '../types';
import { calculateDnaCompleteness, SAMPLE_PORTFOLIO } from './samplePortfolio';
import { evaluateEvidenceReadiness } from '../lib/readiness';

export type EnterpriseSampleId = 'apex-aerospace' | 'financial-services' | 'imported';

export interface EnterpriseDomainCluster {
  id: string;
  name: string;
  assetCount: number;
  criticalCount: number;
  avgCompleteness: number;
  hotspotRisk: 'High' | 'Medium' | 'Low';
  dominantDisposition: Disposition6R;
  representativeSystems: string[];
}

export interface EnterpriseEstateProfile {
  id: EnterpriseSampleId;
  name: string;
  subtitle: string;
  industry: string;
  totalAssetsRepresented: number;
  activeModernizationScope: number;
  annualTechSpendBaseline: string;
  strategicObjective: string;
  disclaimer: string;
  domains: EnterpriseDomainCluster[];
  workloads: EnterpriseWorkload[];
}

function makeDna(fields: {
  b1: [string, 'known' | 'missing' | 'incomplete', string?];
  b2: [string, 'known' | 'missing' | 'incomplete', string?];
  b3: [string, 'known' | 'missing' | 'incomplete', string?];
  t1: [string, 'known' | 'missing' | 'incomplete', string?];
  t2: [string, 'known' | 'missing' | 'incomplete', string?];
  t3: [string, 'known' | 'missing' | 'incomplete', string?];
  t4: [string, 'known' | 'missing' | 'incomplete', string?];
  d1: [string, 'known' | 'missing' | 'incomplete', string?];
  d2: [string, 'known' | 'missing' | 'incomplete', string?];
  e1: [string, 'known' | 'missing' | 'incomplete', string?];
  e2: [string, 'known' | 'missing' | 'incomplete', string?];
  e3: [string, 'known' | 'missing' | 'incomplete', string?];
  dr1: [string, 'known' | 'missing' | 'incomplete', string?];
  dr2: [string, 'known' | 'missing' | 'incomplete', string?];
  dr3: [string, 'known' | 'missing' | 'incomplete', string?];
  ts1: [string, 'known' | 'missing' | 'incomplete', string?];
  ts2: [string, 'known' | 'missing' | 'incomplete', string?];
  ts3: [string, 'known' | 'missing' | 'incomplete', string?];
}): EnterpriseDna {
  return {
    business: [
      { id: 'b1', label: 'Business Capability', value: fields.b1[0], status: fields.b1[1], detail: fields.b1[2] },
      { id: 'b2', label: 'Business Criticality', value: fields.b2[0], status: fields.b2[1], detail: fields.b2[2] },
      { id: 'b3', label: 'Modernization Drivers', value: fields.b3[0], status: fields.b3[1], detail: fields.b3[2] },
    ],
    technology: [
      { id: 't1', label: 'Runtime', value: fields.t1[0], status: fields.t1[1], detail: fields.t1[2] },
      { id: 't2', label: 'Database', value: fields.t2[0], status: fields.t2[1], detail: fields.t2[2] },
      { id: 't3', label: 'Hosting', value: fields.t3[0], status: fields.t3[1], detail: fields.t3[2] },
      { id: 't4', label: 'Technology Lifecycle Risk', value: fields.t4[0], status: fields.t4[1], detail: fields.t4[2] },
    ],
    dependency: [
      { id: 'd1', label: 'Known Dependencies', value: fields.d1[0], status: fields.d1[1], detail: fields.d1[2] },
      { id: 'd2', label: 'Dependency Details', value: fields.d2[0], status: fields.d2[1], detail: fields.d2[2] },
    ],
    economics: [
      { id: 'e1', label: 'Infrastructure Cost', value: fields.e1[0], status: fields.e1[1], detail: fields.e1[2] },
      { id: 'e2', label: 'Licensing Cost', value: fields.e2[0], status: fields.e2[1], detail: fields.e2[2] },
      { id: 'e3', label: 'Detailed TCO Baseline', value: fields.e3[0], status: fields.e3[1], detail: fields.e3[2] },
    ],
    dataAndRisk: [
      { id: 'dr1', label: 'Customer Data / Sensitivity', value: fields.dr1[0], status: fields.dr1[1], detail: fields.dr1[2] },
      { id: 'dr2', label: 'Data Volume & Velocity', value: fields.dr2[0], status: fields.dr2[1], detail: fields.dr2[2] },
      { id: 'dr3', label: 'Compliance Constraints', value: fields.dr3[0], status: fields.dr3[1], detail: fields.dr3[2] },
    ],
    targetState: [
      { id: 'ts1', label: 'Target Cloud / Platform Strategy', value: fields.ts1[0], status: fields.ts1[1], detail: fields.ts1[2] },
      { id: 'ts2', label: 'Target Architecture Constraints', value: fields.ts2[0], status: fields.ts2[1], detail: fields.ts2[2] },
      { id: 'ts3', label: 'Migration Downtime Tolerance', value: fields.ts3[0], status: fields.ts3[1], detail: fields.ts3[2] },
    ],
  };
}

// Additional Apex Aerospace workloads (so all 6 dispositions have rich candidates alongside the 3 core SAMPLE_PORTFOLIO items)
const apexScrapReporterDna = makeDna({
  b1: ['Quality & Scrap Waste Tracking', 'known'],
  b2: ['Low', 'known'],
  b3: ['Duplicate capability superseded by modern SAP S/4HANA quality module; zero active floor users', 'known'],
  t1: ['PHP 5.6 / Apache Legacy Utility', 'known'],
  t2: ['MySQL 5.5', 'known'],
  t3: ['On-premises Legacy VM', 'known'],
  t4: ['Critical End-of-Life security patching exposure', 'known'],
  d1: ['2 downstream nightly CSV exports to plant archive', 'known'],
  d2: ['Both downstream consumers have migrated to central ERP APIs; deprecation notice verified', 'known'],
  e1: ['$140K/yr dedicated legacy cluster & backup overhead', 'known'],
  e2: ['$45K/yr extended OS support fees', 'known'],
  e3: ['$555K verified 3-year run cost baseline with zero incremental business value', 'known'],
  dr1: ['Internal non-regulated shop-floor scrap weight logs', 'known'],
  dr2: ['85 GB static historical records', 'known'],
  dr3: ['3-year cold archive retention required before server decommission', 'known'],
  ts1: ['Decommission server and archive historical snapshot to cold object storage', 'known'],
  ts2: ['Read-only cold Parquet archive; no replacement compute required', 'known'],
  ts3: ['Full downtime permitted immediately after consumer sign-off', 'known'],
});

const apexMesPlantFloorDna = makeDna({
  b1: ['Manufacturing Execution System (MES) · Wing Assembly', 'known'],
  b2: ['High', 'known'],
  b3: ['Deterministic sub-5ms shop-floor PLC/SCADA control loops; recent hardware refresh completed', 'known'],
  t1: ['C++ / Qt Industrial Real-Time Runtime', 'known'],
  t2: ['Microsoft SQL Server 2019 Enterprise', 'known'],
  t3: ['On-premises Air-Gapped Plant Edge Cluster', 'known'],
  t4: ['Low — Vendor-supported through 2031', 'known'],
  d1: ['22 shop-floor CNC & autoclave automation cells via OPC-UA', 'known'],
  d2: ['Hard real-time local industrial Ethernet bus; cannot tolerate WAN latency', 'known'],
  e1: ['Amortized plant-floor edge hardware ($210K/yr maintenance)', 'known'],
  e2: ['Perpetual industrial runtime licenses paid through 2029', 'known'],
  e3: ['$1.1M verified 3-year TCO baseline; cloud migration would increase latency risk', 'known'],
  dr1: ['Proprietary airframe manufacturing telemetry and part tolerances', 'known'],
  dr2: ['4.2 TB local time-series Ring Buffer', 'known'],
  dr3: ['FAA Part 21 production certificate & AS9100 validated configuration freeze', 'known'],
  ts1: ['Keep on-premises at plant edge; stream read-only telemetry summaries asynchronously', 'known'],
  ts2: ['Maintain certified on-prem industrial boundary without core alteration', 'known'],
  ts3: ['Zero unplanned production line downtime permitted', 'known'],
});

const apexSupplierEdiDna = makeDna({
  b1: ['Supply Chain · Global Tier-1 Supplier EDI Gateway', 'known'],
  b2: ['High', 'known'],
  b3: ['Data center colocation lease expiring in 90 days; stable Linux application requires fast exit', 'known'],
  t1: ['Java 17 LTS on Red Hat Enterprise Linux 8', 'known'],
  t2: ['PostgreSQL 14', 'known'],
  t3: ['On-premises Colocation Facility (Lease Expiring)', 'known'],
  t4: ['Low — Modern runtime and OS stack', 'known'],
  d1: ['42 external aerospace supplier AS2 and SFTP connections', 'known'],
  d2: ['Standardized static IP allowlists and TLS certificates mapped across all 42 partners', 'known'],
  e1: ['$480K/yr colocation rack and network lease fees', 'known'],
  e2: ['Standard RHEL subscription portable to cloud VMs', 'known'],
  e3: ['$1.65M verified 3-year colocation TCO; 28% infrastructure savings on cloud IaaS VMs', 'known'],
  dr1: ['Supply chain purchase orders, ASN shipping notices and part serial manifests', 'known'],
  dr2: ['2.4 TB storage, 180K EDI messages/day', 'known'],
  dr3: ['ITAR & Export Control network boundary rules', 'known'],
  ts1: ['Google Cloud Compute Engine VMs with Cloud Load Balancing', 'known'],
  ts2: ['Lift-and-shift VM image migration without application code rewrite to meet 90-day exit', 'known'],
  ts3: ['6-hour Sunday maintenance window approved with DNS cutover', 'known'],
});

export const APEX_AEROSPACE_WORKLOADS: EnterpriseWorkload[] = [
  ...SAMPLE_PORTFOLIO,
  {
    id: 'apex-scrap-quality-log',
    name: 'Legacy Airframe Scrap & Waste Logger',
    type: 'Application',
    businessCapability: 'Quality & Scrap Waste Tracking',
    businessCriticality: 'Low',
    currentStack: 'PHP 5.6 + MySQL 5.5',
    hosting: 'On-premises Legacy VM',
    knownDependencies: '2 downstream nightly CSV exports (superseded by SAP ERP)',
    modernizationSignals: [
      'Duplicate capability superseded by modern ERP quality module',
      'Zero active shop-floor users',
      'End-of-life PHP 5.6 / MySQL 5.5 security patching burden',
    ],
    evidenceCompleteness: calculateDnaCompleteness(apexScrapReporterDna).completeness,
    dna: apexScrapReporterDna,
  },
  {
    id: 'apex-wing-mes-core',
    name: 'Wing Assembly Shop-Floor MES',
    type: 'Application',
    businessCapability: 'Manufacturing Execution System (MES)',
    businessCriticality: 'High',
    currentStack: 'C++ / Qt Industrial + SQL Server 2019',
    hosting: 'On-premises Air-Gapped Plant Edge',
    knownDependencies: '22 shop-floor CNC & autoclave cells via OPC-UA',
    modernizationSignals: [
      'Sub-5ms deterministic PLC/SCADA latency requirement',
      'FAA Part 21 & AS9100 certified hardware configuration freeze',
      'Recent plant hardware refresh amortized through 2031',
    ],
    evidenceCompleteness: calculateDnaCompleteness(apexMesPlantFloorDna).completeness,
    dna: apexMesPlantFloorDna,
  },
  {
    id: 'apex-supplier-edi-hub',
    name: 'Global Tier-1 Supplier EDI Gateway',
    type: 'Application',
    businessCapability: 'Supply Chain Transactions',
    businessCriticality: 'High',
    currentStack: 'Java 17 LTS + PostgreSQL 14 on RHEL 8',
    hosting: 'On-premises Colocation (Lease Expiring)',
    knownDependencies: '42 external supplier AS2/SFTP connections',
    modernizationSignals: [
      'Urgent 90-day colocation data center lease expiration',
      'Modern portable Linux/Java 17 stack with zero code rewrite needed',
      'High colocation facility overhead',
    ],
    evidenceCompleteness: calculateDnaCompleteness(apexSupplierEdiDna).completeness,
    dna: apexSupplierEdiDna,
  },
];

// Secondary Sample Enterprise: Financial Services (Global Banking & Payments)
const fsTradeClearingDna = makeDna({
  b1: ['Capital Markets · Fixed Income Clearing Engine', 'known'],
  b2: ['High', 'known'],
  b3: ['Inability of legacy monolith to handle peak trading volume spikes; need event-driven streaming', 'known'],
  t1: ['C++ / CORBA & Java 8 Monolith', 'known'],
  t2: ['Sybase ASE 16 / Oracle 12c', 'known'],
  t3: ['On-premises Solaris / Mainframe Tier', 'known'],
  t4: ['Critical — Aging CORBA middleware and specialist staffing shortage', 'known'],
  d1: ['24 exchange, custody and settlement feeds', 'known'],
  d2: ['Incomplete', 'incomplete', 'Synchronous RPC latency budgets and message ordering guarantees unverified'],
  e1: ['High ($2.8M/yr specialized hardware and mainframe MIPS)', 'known'],
  e2: ['High ($1.4M/yr proprietary middleware and database licenses)', 'known'],
  e3: ['Missing', 'missing', '3-year cloud-native decomposition TCO baseline not yet baselined'],
  dr1: ['Regulated Securities Settlement & Counterparty PII', 'known'],
  dr2: ['12 TB state / 10M settlement events daily', 'known'],
  dr3: ['SEC Rule 17a-4, FINRA & SOX audit immutability', 'known'],
  ts1: ['Missing', 'missing', 'Target cloud event-streaming platform unconfirmed'],
  ts2: ['Missing', 'missing', 'Active-active strangler-fig service boundaries unverified'],
  ts3: ['Missing', 'missing', 'Maximum cutover settlement freeze window unverified'],
});

const fsRiskDataWarehouseDna = makeDna({
  b1: ['Enterprise Risk & Liquidity Data Warehouse', 'known'],
  b2: ['High', 'known'],
  b3: ['Intraday Basel III stress-testing scalability limits, growing appliance costs, AI anomaly detection demand', 'known'],
  t1: ['Legacy On-Premises MPP Data Warehouse Appliance', 'known'],
  t2: ['Proprietary EDW Appliance Storage', 'known'],
  t3: ['On-premises Data Center', 'known'],
  t4: ['Elevated — Hardware maintenance contract renewal in 6 months', 'known'],
  d1: ['16 upstream core banking & treasury batch pipelines', 'known'],
  d2: ['Incomplete', 'incomplete', 'Downstream regulatory reporting SQL dialect compatibility unverified'],
  e1: ['Growing appliance expansion cost ($1.9M/yr)', 'known'],
  e2: ['High proprietary per-core database licensing', 'known'],
  e3: ['Missing', 'missing', 'Detailed 3-year serverless analytics TCO comparison missing'],
  dr1: ['Enterprise Credit, Market Risk & Liquidity Exposures', 'known'],
  dr2: ['45 TB historical risk warehouse', 'known'],
  dr3: ['Basel III, FRTB & BCBS 239 data lineage mandates', 'known'],
  ts1: ['Missing', 'missing', 'Target cloud analytics platform strategy not yet marked verified'],
  ts2: ['Missing', 'missing', 'Decoupled storage/compute lakehouse governance rules unverified'],
  ts3: ['Missing', 'missing', 'Weekend parallel-run cutover window unverified'],
});

const fsDoddFrankArchiveDna = makeDna({
  b1: ['Historical Compliance Archiving (2015 Dodd-Frank Reporter)', 'known'],
  b2: ['Low', 'known'],
  b3: ['Statutory 7-year reporting retention period expired; duplicate dataset already in central compliance lake', 'known'],
  t1: ['Python 2.7 Legacy Web Utility', 'known'],
  t2: ['IBM Informix 11', 'known'],
  t3: ['On-premises VM Cluster', 'known'],
  t4: ['Severe — Python 2.7 unsupported and flagged in CISO vulnerability scan', 'known'],
  d1: ['1 read-only nightly archive feed', 'known'],
  d2: ['Verified zero active downstream consumers; legal hold release confirmed by Compliance', 'known'],
  e1: ['$195K/yr dedicated VM and SAN storage footprint', 'known'],
  e2: ['$110K/yr legacy Informix renewal fee', 'known'],
  e3: ['$915K verified 3-year cost avoidance upon decommissioning', 'known'],
  dr1: ['Historical pre-2017 trade audit snapshots', 'known'],
  dr2: ['320 GB static archive', 'known'],
  dr3: ['Legal hold expired; cold WORM snapshot retained in central archive', 'known'],
  ts1: ['Decommission application servers and terminate database license', 'known'],
  ts2: ['No replacement runtime; retain encrypted cold bucket snapshot only', 'known'],
  ts3: ['Immediate full shutdown approved', 'known'],
});

const fsAmlCaseMgmtDna = makeDna({
  b1: ['Financial Crime · Anti-Money Laundering (AML) Case Tracker', 'known'],
  b2: ['High', 'known'],
  b3: ['Heavy custom maintenance backlog on commodity case tool; modern compliant AML SaaS platforms available', 'known'],
  t1: ['Legacy ASP.NET 4.5 / VB.NET', 'known'],
  t2: ['SQL Server 2012', 'known'],
  t3: ['On-premises Windows Server', 'known'],
  t4: ['Elevated — SQL Server 2012 end of support', 'known'],
  d1: ['5 transaction monitoring alert feeds and SAR filing export', 'known'],
  d2: ['Standard REST/JSON and batch CSV interfaces verified with compliance operations', 'known'],
  e1: ['$340K/yr internal hosting and patching', 'known'],
  e2: ['$620K/yr internal developer maintenance on custom case UI', 'known'],
  e3: ['$2.88M verified 3-year custom TCO vs. $1.45M turnkey regulated AML SaaS subscription', 'known'],
  dr1: ['Suspicious Activity Reports (SAR) & KYC Investigation Files', 'known'],
  dr2: ['1.2 TB case documents and audit logs', 'known'],
  dr3: ['BSA, FinCEN & SOC2 Type II SaaS tenancy compliance verified', 'known'],
  ts1: ['Turnkey Enterprise Financial Crime & AML Cloud SaaS Platform', 'known'],
  ts2: ['Replace custom VB.NET code with commercial SaaS configuration and SSO', 'known'],
  ts3: ['30-day parallel run with weekend cutover approved', 'known'],
});

const fsCoreSwiftGatewayDna = makeDna({
  b1: ['Payments · Regional SWIFT & Wire Settlement Gateway', 'known'],
  b2: ['High', 'known'],
  b3: ['Colocation facility exit mandate; modern containerized Linux stack ready for lift-and-shift', 'known'],
  t1: ['Java 17 LTS / Spring Boot', 'known'],
  t2: ['PostgreSQL 15', 'known'],
  t3: ['On-premises Regional Colocation', 'known'],
  t4: ['Low — Current LTS runtime', 'known'],
  d1: ['14 core banking ledger and HSM signing endpoints', 'known'],
  d2: ['Dedicated Cloud Interconnect and mTLS routes mapped and latency-tested', 'known'],
  e1: ['$520K/yr colocation and dedicated hardware', 'known'],
  e2: ['Low open-source + standard Linux support', 'known'],
  e3: ['$1.56M verified 3-year baseline; 32% savings via cloud VM migration', 'known'],
  dr1: ['High-value interbank wire instructions', 'known'],
  dr2: ['1.8 TB encrypted audit ledger', 'known'],
  dr3: ['SWIFT CSP & PCI-DSS network segmentation verified', 'known'],
  ts1: ['Google Cloud Compute Engine Confidential VMs', 'known'],
  ts2: ['Lift-and-shift verified VM images with zero application logic modification', 'known'],
  ts3: ['4-hour Saturday night settlement maintenance window', 'known'],
});

const fsAtmSwitchEdgeDna = makeDna({
  b1: ['Retail Banking · Hardware HSM & ATM Iso8583 Switch', 'known'],
  b2: ['High', 'known'],
  b3: ['Direct physical coax/leased-line connection to physical HSM cryptographic modules; recently recertified', 'known'],
  t1: ['C / Tandem NonStop Fault-Tolerant Runtime', 'known'],
  t2: ['Embedded NonStop Enscribe DB', 'known'],
  t3: ['On-premises Vault Data Center', 'known'],
  t4: ['Low — 5-year hardware & vendor support contract signed last quarter', 'known'],
  d1: ['18,000 physical ATM terminals & physical PCI-HSM racks', 'known'],
  d2: ['Hardware-bound PKCS#11 physical cable bus; cannot be virtualized without full HSM replacement', 'known'],
  e1: ['Amortized fault-tolerant hardware ($390K/yr)', 'known'],
  e2: ['Pre-paid 5-year vendor maintenance agreement', 'known'],
  e3: ['$1.95M verified 5-year sunk-cost baseline; migration ROI is negative until 2029', 'known'],
  dr1: ['PIN blocks and raw ISO8583 card authorization frames', 'known'],
  dr2: ['900 GB high-IOPS transactional log', 'known'],
  dr3: ['PCI-PIN & physical FIPS 140-3 Level 4 hardware vault mandate', 'known'],
  ts1: ['Retain in on-premises cryptographic vault through 2029 depreciation cycle', 'known'],
  ts2: ['Keep current validated fault-tolerant architecture intact', 'known'],
  ts3: ['Zero downtime (99.999% continuous availability)', 'known'],
});

export const FINANCIAL_SERVICES_WORKLOADS: EnterpriseWorkload[] = [
  {
    id: 'fs-trade-clearing-core',
    name: 'Fixed Income Clearing & Settlement Engine',
    type: 'Application',
    businessCapability: 'Securities Settlement',
    businessCriticality: 'High',
    currentStack: 'C++ / CORBA + Sybase ASE 16',
    hosting: 'On-premises Solaris / Mainframe',
    knownDependencies: '24 exchange and settlement feeds',
    modernizationSignals: [
      'Sub-millisecond peak trading volume bottlenecks',
      'Aging CORBA monolithic middleware',
      'Need for cloud-native event-driven scaling',
    ],
    evidenceCompleteness: calculateDnaCompleteness(fsTradeClearingDna).completeness,
    dna: fsTradeClearingDna,
  },
  {
    id: 'fs-risk-data-warehouse',
    name: 'Enterprise Risk & Liquidity Data Warehouse',
    type: 'Data Platform',
    businessCapability: 'Quantitative Risk & Basel III Analytics',
    businessCriticality: 'High',
    currentStack: 'Legacy On-Premises MPP Data Warehouse Appliance',
    hosting: 'On-premises Data Center',
    knownDependencies: '16 upstream core banking & treasury pipelines',
    modernizationSignals: [
      'Intraday stress-testing compute capacity limits',
      'High appliance hardware refresh and licensing cost',
      'Demand for real-time AI/ML risk anomaly modeling',
    ],
    evidenceCompleteness: calculateDnaCompleteness(fsRiskDataWarehouseDna).completeness,
    dna: fsRiskDataWarehouseDna,
  },
  {
    id: 'fs-dodd-frank-2015-archive',
    name: 'Dodd-Frank 2015 Archival Reporter',
    type: 'Application',
    businessCapability: 'Historical Compliance Archiving',
    businessCriticality: 'Low',
    currentStack: 'Python 2.7 + IBM Informix 11',
    hosting: 'On-premises VM Cluster',
    knownDependencies: '1 read-only archive feed (0 active users)',
    modernizationSignals: [
      'Mandatory 7-year regulatory retention period expired',
      'Zero active users; duplicated in central compliance lake',
      'Unsupported Python 2.7 security vulnerability exposure',
    ],
    evidenceCompleteness: calculateDnaCompleteness(fsDoddFrankArchiveDna).completeness,
    dna: fsDoddFrankArchiveDna,
  },
  {
    id: 'fs-aml-case-tracker',
    name: 'Anti-Money Laundering (AML) Case Tracker',
    type: 'Application',
    businessCapability: 'Regulatory Compliance Investigation',
    businessCriticality: 'High',
    currentStack: 'Legacy VB.NET + SQL Server 2012',
    hosting: 'On-premises Windows Server',
    knownDependencies: '5 transaction monitoring feeds',
    modernizationSignals: [
      'High custom maintenance backlog on commodity investigation tool',
      'SQL Server 2012 end-of-support lifecycle risk',
      'Turnkey regulated AML SaaS platforms readily available',
    ],
    evidenceCompleteness: calculateDnaCompleteness(fsAmlCaseMgmtDna).completeness,
    dna: fsAmlCaseMgmtDna,
  },
  {
    id: 'fs-swift-wire-gateway',
    name: 'Regional SWIFT & Wire Settlement Gateway',
    type: 'Application',
    businessCapability: 'Interbank Payments',
    businessCriticality: 'High',
    currentStack: 'Java 17 LTS + PostgreSQL 15',
    hosting: 'On-premises Regional Colocation',
    knownDependencies: '14 core banking ledger and HSM endpoints',
    modernizationSignals: [
      'Regional data center colocation lease exit deadline',
      'Modern portable Java 17 / PostgreSQL stack',
      'Low architectural change required for cloud VM move',
    ],
    evidenceCompleteness: calculateDnaCompleteness(fsCoreSwiftGatewayDna).completeness,
    dna: fsCoreSwiftGatewayDna,
  },
  {
    id: 'fs-atm-hsm-switch',
    name: 'Hardware HSM & ATM ISO8583 Switch',
    type: 'Application',
    businessCapability: 'Retail Card Authorization',
    businessCriticality: 'High',
    currentStack: 'Tandem NonStop C + Embedded Enscribe DB',
    hosting: 'On-premises Cryptographic Vault',
    knownDependencies: '18,000 ATM terminals & physical FIPS 140-3 HSM racks',
    modernizationSignals: [
      'Hard physical coax binding to FIPS 140-3 Level 4 HSM vault',
      'Recently renewed 5-year fault-tolerant hardware contract',
      '99.999% continuous offline/vault availability mandate',
    ],
    evidenceCompleteness: calculateDnaCompleteness(fsAtmSwitchEdgeDna).completeness,
    dna: fsAtmSwitchEdgeDna,
  },
];

export const ENTERPRISE_ESTATE_PROFILES: Record<'apex-aerospace' | 'financial-services', EnterpriseEstateProfile> = {
  'apex-aerospace': {
    id: 'apex-aerospace',
    name: 'Apex Aerospace',
    subtitle: 'Global Aircraft Manufacturer (Synthetic Enterprise Estate)',
    industry: 'Aerospace & Industrial Manufacturing',
    totalAssetsRepresented: 10420,
    activeModernizationScope: 6,
    annualTechSpendBaseline: '$412M / yr',
    strategicObjective: 'Unify customer & supply-chain analytics, exit expiring colocation facilities, retire duplicate plant utilities, and protect certified shop-floor MES systems.',
    disclaimer: 'Apex Aerospace is a wholly synthetic enterprise dataset representing a 10,000+ asset global manufacturer. It does not represent Boeing, Airbus, or any real company’s proprietary systems.',
    domains: [
      { id: 'eng-plm', name: 'Engineering, Aircraft Design & PLM', assetCount: 1840, criticalCount: 410, avgCompleteness: 74, hotspotRisk: 'Medium', dominantDisposition: 'Replatform', representativeSystems: ['CATIA / PLM Vault Federation', 'Aerodynamic CFD Simulation Grid'] },
      { id: 'mfg-mes', name: 'Manufacturing, MES & Shop Floor', assetCount: 2190, criticalCount: 680, avgCompleteness: 88, hotspotRisk: 'Low', dominantDisposition: 'Retain', representativeSystems: ['Wing Assembly Shop-Floor MES', 'Autoclave Cure Telemetry'] },
      { id: 'supply-chain', name: 'Global Supply Chain & Logistics', assetCount: 1620, criticalCount: 390, avgCompleteness: 82, hotspotRisk: 'High', dominantDisposition: 'Rehost', representativeSystems: ['Global Tier-1 Supplier EDI Gateway', 'Part Serialization Tracker'] },
      { id: 'quality-cert', name: 'Quality, Airworthiness & Certification', assetCount: 980, criticalCount: 240, avgCompleteness: 79, hotspotRisk: 'Medium', dominantDisposition: 'Retire', representativeSystems: ['Legacy Airframe Scrap & Waste Logger', 'FAA Conformity Dossier Archive'] },
      { id: 'data-analytics', name: 'Enterprise Data, AI & Customer Analytics', assetCount: 1490, criticalCount: 310, avgCompleteness: 61, hotspotRisk: 'High', dominantDisposition: 'Replatform', representativeSystems: ['Customer Analytics', 'Enterprise Data Warehouse'] },
      { id: 'corp-erp-hr', name: 'Corporate ERP, Finance, HR & Document Systems', assetCount: 2300, criticalCount: 290, avgCompleteness: 58, hotspotRisk: 'Medium', dominantDisposition: 'Repurchase', representativeSystems: ['Document Management', 'Supplier Invoicing Portal'] },
    ],
    workloads: APEX_AEROSPACE_WORKLOADS,
  },
  'financial-services': {
    id: 'financial-services',
    name: 'Global Financial Services',
    subtitle: 'Global Banking, Capital Markets & Payments Enterprise (Synthetic Estate)',
    industry: 'Banking, Capital Markets & Payments',
    totalAssetsRepresented: 6850,
    activeModernizationScope: 6,
    annualTechSpendBaseline: '$580M / yr',
    strategicObjective: 'Modernize fixed-income clearing and Basel III risk analytics, decommission expired regulatory archives, and transition custom compliance tools to governed SaaS.',
    disclaimer: 'Global Financial Services is a wholly synthetic banking and payments dataset created for enterprise modernization evaluation.',
    domains: [
      { id: 'cap-markets', name: 'Capital Markets & Securities Settlement', assetCount: 1420, criticalCount: 510, avgCompleteness: 61, hotspotRisk: 'High', dominantDisposition: 'Refactor', representativeSystems: ['Fixed Income Clearing & Settlement Engine', 'Order Routing Bus'] },
      { id: 'risk-treasury', name: 'Enterprise Risk, Liquidity & Basel III Data', assetCount: 1180, criticalCount: 390, avgCompleteness: 61, hotspotRisk: 'High', dominantDisposition: 'Replatform', representativeSystems: ['Enterprise Risk & Liquidity Data Warehouse', 'FRTB Stress Grid'] },
      { id: 'fin-crime-compliance', name: 'Financial Crime, AML & Regulatory Archives', assetCount: 1340, criticalCount: 280, avgCompleteness: 95, hotspotRisk: 'Medium', dominantDisposition: 'Repurchase', representativeSystems: ['Anti-Money Laundering (AML) Case Tracker', 'Dodd-Frank 2015 Archival Reporter'] },
      { id: 'payments-swift', name: 'Global Payments, Wire & SWIFT Gateways', assetCount: 1290, criticalCount: 460, avgCompleteness: 100, hotspotRisk: 'Medium', dominantDisposition: 'Rehost', representativeSystems: ['Regional SWIFT & Wire Settlement Gateway', 'SEPA Instant Connector'] },
      { id: 'retail-vault', name: 'Retail Card Authorization & Cryptographic Vaults', assetCount: 1620, criticalCount: 540, avgCompleteness: 100, hotspotRisk: 'Low', dominantDisposition: 'Retain', representativeSystems: ['Hardware HSM & ATM ISO8583 Switch', 'Card Tokenization Vault'] },
    ],
    workloads: FINANCIAL_SERVICES_WORKLOADS,
  },
};

export interface DeterministicAgentRecommendation {
  recommended6R: Disposition6R;
  plainEnglish: string;
  confidenceScore: number;
  evidenceCompleteness: number;
  decisionReadiness: 'READY' | 'NEEDS EVIDENCE';
  topReasons: [string, string, string];
  expectedImpact: string;
  alternatives: { disposition: Disposition6R; plainEnglish: string; whyNot: string }[];
  keyRisks: string[];
  criticalGaps: string[];
}

/**
 * Derives an evidence-driven 6R recommendation deterministically from a workload's
 * Enterprise DNA facts (never hardcoded inside the input file).
 */
export function deriveEvidenceDrivenRecommendation(workload: EnterpriseWorkload): DeterministicAgentRecommendation {
  const readiness = evaluateEvidenceReadiness(workload.dna);
  const allFields = Object.values(workload.dna).flat();
  const textBlob = [
    workload.name,
    workload.businessCapability,
    workload.currentStack,
    workload.hosting,
    workload.knownDependencies,
    ...workload.modernizationSignals,
    ...allFields.map((f) => `${f.label}: ${f.value} ${f.detail || ''}`),
  ].join(' ').toLowerCase();

  let disposition: Disposition6R = 'Replatform';

  if (
    /decommission|duplicate|superseded|zero active|retention period expired|obsolete|shut down|scrap|archival reporter/.test(textBlob) &&
    workload.businessCriticality === 'Low'
  ) {
    disposition = 'Retire';
  } else if (
    /air-gapped|plc|scada|opc-ua|shop-floor|hsm|tandem nonstop|iso8583|amortized|retain in on-premises|keep on-premises|recent hardware refresh/.test(textBlob)
  ) {
    disposition = 'Retain';
  } else if (
    /saas|turnkey|commercial|commodity|document management|case tracker|cmms|expense tracker/.test(textBlob)
  ) {
    disposition = 'Repurchase';
  } else if (
    /lease expiring|colocation|lift-and-shift|lift and shift|edi gateway|swift|vm migration without/.test(textBlob)
  ) {
    disposition = 'Rehost';
  } else if (
    workload.type === 'Data Platform' ||
    /data warehouse|edw|bigquery|lakehouse|managed cloud|hadoop|spark|mpp/.test(textBlob)
  ) {
    disposition = 'Replatform';
  } else if (
    /java 8|corba|monolith|microservices|event-driven|sub-millisecond|clearing engine|customer analytics/.test(textBlob)
  ) {
    disposition = 'Refactor';
  }

  const confidenceScore = readiness.decisionReadiness === 'READY'
    ? Math.min(96, Math.max(82, readiness.completeness - 4))
    : Math.min(65, Math.max(48, readiness.completeness));

  const reasonsBy6R: Record<Disposition6R, [string, string, string]> = {
    Retain: [
      `Direct hardware/industrial or cryptographic latency constraints (${workload.hosting}) make cloud migration high-risk.`,
      `Current stack (${workload.currentStack}) is stable, recently refreshed, and compliant with operational mandates.`,
      'Keeping and monitoring in place preserves 100% operational continuity and avoids negative-ROI migration spend.',
    ],
    Retire: [
      `Business capability (${workload.businessCapability}) is duplicated by modern enterprise platforms with near-zero active usage.`,
      `Legacy stack (${workload.currentStack}) creates unnecessary security patching and licensing overhead.`,
      'Decommissioning after cold archival eliminates 100% of ongoing run cost and compliance exposure.',
    ],
    Rehost: [
      `Urgent infrastructure/colocation timeline driver requires fast exit without risky application code rewrites.`,
      `Current runtime (${workload.currentStack}) is modern and portable directly onto managed cloud virtual machines.`,
      `Preserves all ${workload.knownDependencies} interface contracts while reducing facility lease costs.`,
    ],
    Replatform: [
      `Legacy platform (${workload.currentStack}) limits analytics scale, AI/ML readiness, and cost elasticity.`,
      'Moving to a managed cloud platform eliminates hardware refresh and database administration toil without a full logic rewrite.',
      'Delivers the strongest balance of faster performance, lower TCO, and controlled cutover risk.',
    ],
    Refactor: [
      `Tightly coupled architecture (${workload.currentStack}) and ${workload.knownDependencies} bottleneck release velocity and elastic scale.`,
      'Lifting and shifting would preserve licensing debt and architectural fragility in the cloud.',
      'Phased decomposition unlocks independent scaling, modern API boundaries, and long-term engineering agility.',
    ],
    Repurchase: [
      `${workload.businessCapability} is a standard enterprise capability where custom maintenance (${workload.currentStack}) yields low differentiation.`,
      'Commercial SaaS solutions provide superior compliance, workflow automation, and mobile/user experience out of the box.',
      'Replacing custom code with a governed SaaS platform eliminates technical debt and redirects engineering capacity.',
    ],
  };

  const impactBy6R: Record<Disposition6R, string> = {
    Retain: 'Zero production disruption · Avoids $1.1M+ unnecessary migration spend · 99.99% stability preserved',
    Retire: '100% run-cost elimination ($185K–$305K/yr saved) · EOL security vulnerability surface removed in < 45 days',
    Rehost: '28–32% infrastructure cost reduction · Meets 90-day facility exit deadline with zero code rewrite',
    Replatform: '35–42% lower 3-year TCO · 4x query/processing throughput · Unlocks governed cloud AI & analytics',
    Refactor: '60% faster feature release cadence · Elastic peak-load scaling · Eliminates legacy middleware licensing',
    Repurchase: '45% lower total ownership cost · 100% EOL stack retirement · Turnkey compliance & vendor SLA',
  };

  const plainMap: Record<Disposition6R, string> = {
    Retain: 'Keep it as-is',
    Retire: 'Safely shut it down',
    Rehost: 'Move it largely unchanged',
    Replatform: 'Move it to a better platform',
    Refactor: 'Redesign parts of it',
    Repurchase: 'Replace it with another product',
  };

  const allDispositions: Disposition6R[] = ['Retain', 'Retire', 'Rehost', 'Replatform', 'Refactor', 'Repurchase'];
  const alternatives = allDispositions
    .filter((d) => d !== disposition)
    .map((d) => ({
      disposition: d,
      plainEnglish: plainMap[d],
      whyNot:
        d === 'Retain'
          ? 'Does not resolve the aging technology, cost, or scalability constraints identified in evidence.'
          : d === 'Retire'
          ? `Cannot shut down while ${workload.businessCriticality.toLowerCase()}-criticality business operations depend on ${workload.name}.`
          : d === 'Rehost'
          ? 'Moves servers without fixing underlying database licensing or platform scalability bottlenecks.'
          : d === 'Replatform'
          ? 'Managed platform upgrade alone is either unnecessary for this system or insufficient for deep monolithic coupling.'
          : d === 'Refactor'
          ? 'Full architectural redesign introduces excessive cost, duration, and dependency risk compared to the recommended path.'
          : 'No commercial off-the-shelf SaaS product matches the specialized domain or latency requirements.',
    }));

  return {
    recommended6R: disposition,
    plainEnglish: plainMap[disposition],
    confidenceScore,
    evidenceCompleteness: readiness.completeness,
    decisionReadiness: readiness.decisionReadiness,
    topReasons: reasonsBy6R[disposition],
    expectedImpact: impactBy6R[disposition],
    alternatives,
    keyRisks: [
      `Dependency blast radius across ${workload.knownDependencies}`,
      readiness.criticalGaps.length > 0
        ? `Unverified critical evidence: ${readiness.criticalGaps.join(', ')}`
        : 'Cutover window coordination and rollback verification across downstream consumers',
      `Data integrity and regulatory compliance during ${plainMap[disposition].toLowerCase()} execution`,
    ],
    criticalGaps: readiness.criticalGaps,
  };
}
