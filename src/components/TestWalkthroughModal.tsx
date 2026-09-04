import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  BrainCircuit,
  Database,
  Lock,
  ChevronRight,
  Terminal,
  Code
} from 'lucide-react';

interface TestWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TestCase {
  id: string;
  title: string;
  category: 'Authentication' | '6R Decision Engine' | 'Firestore Persistence' | 'Multi-Turn UX' | 'Portfolio Discovery' | 'Enterprise DNA';
  steps: string[];
  expectedResult: string;
}

const TEST_CASES: TestCase[] = [
  {
    id: 'TC-01',
    title: 'Federated Google Authentication & Architect Profile Sync',
    category: 'Authentication',
    steps: [
      'Click "Sign In with Google" on the EMOS Landing Page.',
      'Authenticate with your Google credentials via OAuth popup.',
      'Verify transition from Landing Page directly into your private EMOS Decision Dashboard.',
      'Check top-right header: your authenticated identity and avatar are rendered.',
    ],
    expectedResult: 'User document successfully synchronized at /users/{auth.uid} with zero password storage.',
  },
  {
    id: 'TC-02',
    title: 'Enterprise Workload Submission & Gemini 6R Assessment',
    category: '6R Decision Engine',
    steps: [
      'Click "New Assessment" or select the "Assess Legacy Application" prompt starter.',
      'Select the "Assess" mode pill.',
      'Verify input describes Java/Oracle stack, costs, and integration constraints.',
      'Click "Assess with Gemini" or press ⌘/Ctrl+Enter.',
    ],
    expectedResult: 'Gemini evaluates workload and outputs Recommended 6R Disposition, Executive Rationale, Viable Alternatives, and Critical Risks.',
  },
  {
    id: 'TC-03',
    title: 'Explore Options & Executive Decision Modes',
    category: '6R Decision Engine',
    steps: [
      'Create a new assessment and toggle to the "Explore Options" tab.',
      'Submit a workload to compare viable modernization paths (e.g. Rehost vs Replatform vs Refactor).',
      'Toggle to "Generate Decision" tab to request an executive board-ready modernization recommendation.',
    ],
    expectedResult: 'Backend prompt adapts system instructions to compare trade-offs or output high-certainty decision briefs.',
  },
  {
    id: 'TC-04',
    title: 'Multi-Turn Assessment Dialogue & Evidence Continuity',
    category: 'Multi-Turn UX',
    steps: [
      'In an active assessment view, scroll to the bottom evidence update input bar.',
      'Provide additional context (e.g. "The database has 4TB of stored procedures that cannot be rewritten this fiscal year.").',
      'Click Send or press Enter.',
      'Verify Gemini preserves earlier findings and refines the 6R recommendation based on new evidence.',
    ],
    expectedResult: 'The conversation thread appends the turn and updates the Firestore document with full historical continuity.',
  },
  {
    id: 'TC-05',
    title: 'Owner-Bound Firestore Isolation & Data Privacy',
    category: 'Firestore Persistence',
    steps: [
      'Verify assessment automatically persists to Cloud Firestore under /users/{userId}/interactions/{interactionId}.',
      'Confirm the status indicator displays "Assessment Synced & Isolated to Firestore".',
      'Verify that another user signing in on another browser cannot view or list this assessment.',
    ],
    expectedResult: 'Enforced by Firestore Security Rules: request.auth != null && request.auth.uid == userId.',
  },
  {
    id: 'TC-06',
    title: 'Workload Search, 6R Filtering, & Assessment Deletion',
    category: 'Firestore Persistence',
    steps: [
      'Type keywords into the Recent Assessments sidebar search bar to filter by workload or 6R disposition.',
      'Click category chips ("All", "Legacy Application", "Data Platform").',
      'Hover over an assessment and click the Trash icon, then confirm deletion.',
    ],
    expectedResult: 'The document is immediately removed from Cloud Firestore and the sidebar updates in real-time.',
  },
  {
    id: 'TC-07',
    title: 'Cloud & Platform Vendor Neutrality',
    category: '6R Decision Engine',
    steps: [
      'Submit a workload with no specified target cloud platform (e.g., standard on-premise Java / Oracle system).',
      'Verify EMOS describes target capabilities generically (e.g. "managed cloud-native relational database", "managed container platform") without prematurely assuming AWS, Azure, GCP, or Snowflake.',
      'Verify "Target Cloud / Platform Strategy" is highlighted under Missing Evidence Gaps.',
      'Submit a follow-up turn explicitly designating a target cloud (e.g., "Our strategic cloud is Google Cloud").',
      'Verify EMOS now appropriately grounds recommendations in native services for that specified platform.',
    ],
    expectedResult: 'Target platform is treated as enterprise evidence rather than an arbitrary assumption.',
  },
  {
    id: 'TC-08',
    title: 'Canonical Assessment Score & Metric Consistency',
    category: '6R Decision Engine',
    steps: [
      'Submit an assessment or open any existing assessment in the dashboard.',
      'Compare the 4 values in the Executive 6R Decision Bar (Header): Recommended 6R, Confidence, Evidence Completeness, Decision Readiness.',
      'Inspect the detailed markdown assessment text in the main pane.',
      'Verify each header value is identical to the detailed assessment text (e.g. Confidence 55% in header matches Confidence Score: 55% in detailed text).',
      'Refresh the browser or switch between assessments to confirm persisted consistency across Cloud Firestore sessions.',
    ],
    expectedResult: 'Single source of truth enforced: zero drift between header metrics, detailed assessment text, and Firestore storage.',
  },
  {
    id: 'TC-09',
    title: 'Sample Enterprise Portfolio Discovery & Workload Exploration',
    category: 'Portfolio Discovery',
    steps: [
      'Navigate to "Sample Portfolio" via the top navigation bar or sidebar shortcut.',
      'Verify the 3 seeded enterprise workloads are displayed: Customer Analytics, Enterprise Data Warehouse, and Document Management.',
      'Check the governance disclaimer clearly stating representative/sample dataset without live CMDB synchronization.',
      'Verify each card displays Type, Criticality, Current Stack, Hosting, Modernization Signals, and Evidence Completeness percentage.',
    ],
    expectedResult: 'All 3 workloads render with clear enterprise context and deterministic completeness baselines.',
  },
  {
    id: 'TC-10',
    title: 'Enterprise DNA Structured Evidence Profile & Missing Gap Tracking',
    category: 'Enterprise DNA',
    steps: [
      'Click "View Enterprise DNA" on any workload card (e.g. Customer Analytics).',
      'Verify all 6 structured evidence sections render: Business, Technology, Dependency, Economics, Data & Risk, Target-State DNA.',
      'Inspect field badges: verified attributes display green "Known Evidence", unverified attributes explicitly display "Missing Evidence" or "Incomplete".',
      'Check the top header score card: displays verified count, missing count, and deterministic percentage.',
    ],
    expectedResult: 'Enterprise DNA clearly surfaces known evidence and makes critical architectural gaps prominent.',
  },
  {
    id: 'TC-11',
    title: '1-Click Transition from Enterprise DNA to EMOS 6R Assessment',
    category: 'Enterprise DNA',
    steps: [
      'In the Enterprise DNA view, click the prominent "Assess for Modernization" button.',
      'Verify the user is automatically transitioned into the Assessment Workspace without having to re-type evidence.',
      'Verify EMOS passes all 18 structured Enterprise DNA attributes into the server-side Gemini decision engine.',
      'Verify the generated assessment details the workload name, 6R disposition, vendor neutrality, and persists to Firestore.',
    ],
    expectedResult: 'Seamless flow from Portfolio → Enterprise DNA → Modernization Assessment with full Firestore persistence.',
  },
  {
    id: 'TC-12',
    title: 'Import Enterprise Portfolio File & Schema Validation',
    category: 'Portfolio Discovery',
    steps: [
      'Click "Import Enterprise Portfolio" button on the portfolio view.',
      'Attempt to drop or select an unsupported file type (e.g. .xlsx, .pdf, or .docx) to verify clear error rejection.',
      'Upload a valid .csv or .json file with required columns (workload_id, workload_name, workload_type).',
      'Verify preview displays: Total Workloads, Valid Count, Invalid Rows, and Evidence Gaps.',
      'Verify formula injection protection: any values starting with =, +, -, @ are safely escaped and neutralized.',
    ],
    expectedResult: 'Robust validation ensures only well-formed, sanitized workloads are previewed with zero executable risk.',
  },
  {
    id: 'TC-13',
    title: 'Download Sample Enterprise Datasets & Canonical 6R Coverage',
    category: 'Portfolio Discovery',
    steps: [
      'In the Import Portfolio modal, toggle to the "Download Sample Datasets" tab.',
      'Verify all 4 industry archetypes are available: Diversified Enterprise, Financial Services, Retail, and Manufacturing.',
      'Click "Download CSV" for any dataset (e.g., Financial Services) and inspect the downloaded file.',
      'Verify collective coverage across all 4 sample files includes candidates for all 6 canonical 6R dispositions (Retain, Retire, Rehost, Replatform, Refactor, Repurchase).',
      'Verify evaluation metadata (expected_6r, expected_reason) is isolated and never passed into Gemini prompts.',
    ],
    expectedResult: 'Instant 1-click download of realistic enterprise benchmark portfolios with complete 6R disposition coverage.',
  },
  {
    id: 'TC-14',
    title: 'User-Isolated Imported Workloads & 6R Modernization Flow',
    category: 'Firestore Persistence',
    steps: [
      'In the Import Portfolio modal, click "Import Portfolio" with validated workloads.',
      'Verify transition to "My Imported Portfolio" tab displaying the newly imported workload cards.',
      'Click "View Enterprise DNA" on any imported workload to verify all 6 DNA dimensions and missing evidence gaps.',
      'Click "Direct Assess for Modernization" on an imported workload and verify Gemini analyzes it and saves under /users/{userId}/interactions.',
      'Test workload removal: click the Trash icon on an imported card and confirm deletion from /users/{userId}/importedWorkloads.',
    ],
    expectedResult: 'Imported workloads seamlessly integrate into Enterprise DNA and 6R assessment flow with owner-bound persistence.',
  },
];

export const TestWalkthroughModal: React.FC<TestWalkthroughModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'walkthrough' | 'rules'>('walkthrough');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0F0F0F] rounded-2xl border border-[#222] shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#D4D4D4]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between bg-[#121212]">
          <div>
            <h3 className="font-serif font-medium text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#A88554]" />
              Functional Stability & Verification Guide
            </h3>
            <p className="text-xs text-[#777] mt-0.5">
              Production test scenarios covering user flows, Gemini resilience, and Firestore ABAC rules.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#666] hover:text-white rounded-lg hover:bg-[#1A1A1A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="px-6 border-b border-[#222] flex gap-4 bg-[#0F0F0F] text-xs">
          <button
            onClick={() => setActiveTab('walkthrough')}
            className={`py-3 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'walkthrough'
                ? 'border-[#A88554] text-[#A88554]'
                : 'border-transparent text-[#666] hover:text-[#CCC]'
            }`}
          >
            Test Cases & User Flow Walkthrough ({TEST_CASES.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-3 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'rules'
                ? 'border-[#A88554] text-[#A88554]'
                : 'border-transparent text-[#666] hover:text-[#CCC]'
            }`}
          >
            Active Firestore Security Rules
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'walkthrough' ? (
            <div className="space-y-4">
              {TEST_CASES.map((tc) => (
                <div
                  key={tc.id}
                  className="p-4 rounded-xl border border-[#222] bg-[#141414] space-y-2 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#A88554] bg-[#1F1B14] border border-[#3D3222] px-1.5 py-0.5 rounded">
                        {tc.id}
                      </span>
                      <h4 className="text-xs font-semibold text-white">{tc.title}</h4>
                    </div>
                    <span className="text-[10px] font-medium text-[#888] bg-[#1A1A1A] border border-[#2A2A2A] px-2 py-0.5 rounded-md">
                      {tc.category}
                    </span>
                  </div>

                  <div className="text-xs text-[#888] pl-2 border-l-2 border-[#333] space-y-1">
                    <p className="font-medium text-[11px] text-[#A88554] uppercase tracking-wider">Test Procedure:</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-[#888]">
                      {tc.steps.map((step, sIdx) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="flex items-start gap-1.5 text-xs text-[#9AE6B4] bg-[#0E1A11] border border-[#1A3320] p-2.5 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#48BB78]" />
                    <span>
                      <strong className="font-medium text-white">Expected Result:</strong> {tc.expectedResult}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-[#888]">
                The deployed <code className="bg-[#181818] border border-[#282828] text-[#A88554] px-1 py-0.5 rounded">firestore.rules</code> enforce zero insecure defaults and lock all modernization assessment records to the authenticated owner's UID:
              </div>

              <pre className="p-4 rounded-xl bg-[#080808] border border-[#222] text-[#E5C492] text-xs font-mono overflow-x-auto leading-relaxed">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Zero insecure defaults: deny unmatched reads & writes
    match /{document=**} {
      allow read, write: if false;
    }

    // User profile document isolated to authenticated user
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User interactions strictly isolated to owning user
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User imported enterprise workloads isolated strictly to owning user
    match /users/{userId}/importedWorkloads/{workloadId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`}
              </pre>

              <div className="p-3.5 bg-[#14120D] border border-[#3D3222] rounded-xl text-xs text-[#E5C492] flex items-start gap-2">
                <Lock className="w-4 h-4 shrink-0 text-[#A88554] mt-0.5" />
                <span>
                  <strong>Owner-Bound Isolation Guarantee:</strong> Any attempt to query or update another user's path (e.g. <code>/users/otherUser/interactions</code>) is rejected immediately by the Firestore engine with <code>PERMISSION_DENIED</code>.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#222] bg-[#121212] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#A88554] hover:bg-[#E5C492] text-black text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
