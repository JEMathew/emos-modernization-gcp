export interface UserProfile {
  userId: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  createdAt: string;
  lastActiveAt: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

// Modes: 'assess' (structured 6R assessment), 'options' (compare modernization strategies), 'decision' (executive decision synthesis)
// Legacy modes 'reflection', 'brainstorm', 'summary' are preserved for backward compatibility
export type AssessmentMode = 'assess' | 'options' | 'decision' | 'reflection' | 'brainstorm' | 'summary';

// Canonical 6R Modernization Dispositions (strictly no Rebuild as a separate disposition)
export type Disposition6R = 'Retain' | 'Retire' | 'Rehost' | 'Replatform' | 'Refactor' | 'Repurchase';

export type DecisionReadiness = 'READY' | 'NEEDS EVIDENCE';

export interface TrustIndicators {
  inputValidated: boolean;
  evidenceGrounded: boolean;
  schemaValidated: boolean;
  wasRepaired?: boolean;
}

export interface Interaction {
  id: string;
  userId: string;
  title: string;
  category: string;
  mode: AssessmentMode;
  content: string;
  geminiResponse: string;
  turns: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  // EMOS Structured Modernization Metadata
  workloadName?: string;
  workloadId?: string;
  recommended6R?: Disposition6R | string;
  confidenceScore?: number;
  evidenceCompleteness?: number;
  decisionReadiness?: DecisionReadiness | string;
  trustIndicators?: TrustIndicators;
}

export type DnaEvidenceStatus = 'known' | 'missing' | 'incomplete';

export interface DnaField {
  id: string;
  label: string;
  value: string;
  status: DnaEvidenceStatus;
  detail?: string;
}

export interface EnterpriseDna {
  business: DnaField[];
  technology: DnaField[];
  dependency: DnaField[];
  economics: DnaField[];
  dataAndRisk: DnaField[];
  targetState: DnaField[];
}

export interface EnterpriseWorkload {
  id: string;
  name: string;
  type: 'Application' | 'Data Platform';
  businessCapability: string;
  businessCriticality: 'High' | 'Medium' | 'Low';
  currentStack: string;
  hosting: string;
  knownDependencies: string;
  modernizationSignals: string[];
  evidenceCompleteness: number; // Deterministic calculation
  dna: EnterpriseDna;
  userId?: string;
  importedAt?: string;
  source?: 'sample' | 'imported';
  evaluationMeta?: {
    expected6r?: string;
    expectedReason?: string;
  };
}

export interface RawImportRecord {
  workload_id?: string;
  workload_name?: string;
  workload_type?: string;
  business_capability?: string;
  business_criticality?: string;
  modernization_drivers?: string;
  runtime?: string;
  database?: string;
  hosting?: string;
  technology_lifecycle_risk?: string;
  known_dependencies?: string;
  dependency_details?: string;
  infrastructure_cost?: string;
  licensing_cost?: string;
  tco_baseline?: string;
  customer_data?: string;
  data_volume_velocity?: string;
  compliance_constraints?: string;
  target_cloud_platform?: string;
  target_architecture_constraints?: string;
  migration_downtime_tolerance?: string;
  // Separate evaluation metadata fields (NEVER passed to Gemini)
  expected_6r?: string;
  expected_reason?: string;
}

export interface InvalidImportRow {
  rowNumber: number;
  id?: string;
  name?: string;
  errors: string[];
  status?: 'REJECTED' | 'WARNING';
}

export interface ImportValidationResult {
  fileName: string;
  totalDetected: number;
  validRecords: EnterpriseWorkload[];
  invalidRecords: InvalidImportRow[];
  warnings: string[];
  detectedWorkloadTypes: string[];
  totalEvidenceGaps: number;
  rowBreakdown?: {
    valid: number;
    warning: number;
    rejected: number;
  };
}

export interface ModernizationStarter {
  id: string;
  title: string;
  text: string;
  mode: AssessmentMode;
}

