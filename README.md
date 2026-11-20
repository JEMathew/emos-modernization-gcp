# EMOS — Enterprise Modernization Operating System

> **EMOS v2: Full-Lifecycle Enterprise Modernization Operating System**
>
> **One operating system for the entire enterprise modernization journey.**
>
> **Available today: Strategy → Discover → Enterprise DNA → Assess → Decide → Govern → Plan → Execute → Measure → Learn.**

EMOS is a vendor-neutral operating system for enterprise modernization, designed to govern the entire journey—from the business initiative that triggers modernization, through portfolio evidence and the 6R decision, into human governance approval, wave sequencing, disposition-specific transformation execution, outcome measurement (`Baseline vs. Target vs. Observed`) and institutional learning.

EMOS v2 delivers the full modernization lifecycle today using deterministic evidence scoring, a governed Modernization Agent (`Agent Recommends → EMOS Validates → Human Approves`), disposition-specific transformation workflows across all six canonical 6R paths (`Retain`, `Retire`, `Rehost`, `Replatform`, `Refactor`, `Repurchase`), and synthetic enterprise estates (**Apex Aerospace** with 10,420+ assets across 6 domains and **Global Financial Services** with 6,850+ assets across 5 domains). See the [canonical messaging source](claude/messaging-source.md) for the shared capability and vision language.

Enterprise modernization teams routinely make multi-million dollar application and data-platform decisions using information fragmented across legacy inventories, architectural tribal knowledge, partial dependency maps, operational cost signals, compliance constraints, and subjective expert judgment.

**EMOS v2** addresses this critical bottleneck end-to-end. It structures legacy workload evidence into a rigorous **Enterprise DNA** (in both 2D structured and Spatial Relationship Graph views), calculates deterministic evidence completeness, leverages a single governed **Modernization Agent** powered by **Google Gemini** to produce explainable, vendor-neutral modernization assessments governed by the canonical **6R framework**, enforces human governance approval gates, sequences delivery waves, tracks disposition-specific transformation execution and blockers, measures realized outcomes against targets, and captures lessons learned for future waves.

### The Modernization Principle
> **“The modernization disposition is not the end of the EMOS journey. It is the routing decision that determines which governed modernization path should follow.”**

EMOS determines *what* should happen based on evidence, and then governs, plans, tracks execution checkpoints, measures realized outcomes, and captures institutional learning for *what happens after* that decision.

---

## Live Demo

- **Application**: [https://emos-modernization.ai.studio](https://emos-modernization.ai.studio)
- **Learn EMOS**: [Public Beta v1.0 Learning Center](docs/LEARN.md) — product introduction and 19 task-based walkthroughs; no EMOS sign-in required
- **Demo Videos**: [Complete library on Google Drive](https://drive.google.com/drive/folders/1ONwIDuVpKqu3DJzmHgzrtYTeJaOUXqQ1?usp=drive_link) · [Narrated EMOS Beta introduction](docs/demo/EMOS-Beta-Introduction.mp4)
- **Subtitles**: [WebVTT](docs/demo/EMOS-Beta-Introduction.vtt) · [SRT](docs/demo/EMOS-Beta-Introduction.srt)
- **Repository**: [github.com/JEMathew/emos-modernization-gcp](https://github.com/JEMathew/emos-modernization-gcp)
- **Engineering Evidence**: [Google AI Studio security constitution](docs/AI_STUDIO_SECURITY_CONSTITUTION.md) · [Claim-to-source evidence index](docs/EVIDENCE_INDEX.md)

[<img src="docs/learning/emos-learning-background.png" alt="Open the public EMOS Beta v1.0 Learning Center" width="760">](docs/LEARN.md)

**Beta implementation:** EMOS is deployed on Google Cloud Run and built using Google AI Studio. It uses deterministic Enterprise DNA extraction, Gemini-powered explainable 6R decisions, evidence-gap analysis, modernization wave planning, server-side API protection, owner-isolated Cloud Firestore persistence, and Firebase Emulator-tested security controls.

---

## The Problem

Enterprises frequently manage hundreds or thousands of legacy applications and data platforms requiring modernization. However, strategic modernization programs are systematically slowed or compromised by:

- **Fragmented workload evidence**: Architecture, runtime, dependency, and cost details scattered across disparate documents and teams.
- **Incomplete dependency information**: Hidden downstream integrations and undocumented data pipelines that introduce high cutover risk.
- **Inconsistent modernization assessments**: Different teams applying subjective, divergent definitions of cloud migration strategies.
- **Unclear modernization dispositions**: Ambiguity between tactical migrations versus strategic platform transformations.
- **Opaque AI recommendations**: Generic AI chatbots generating unsupported migration plans without explaining *why* an option was chosen.
- **False confidence from missing evidence**: Large language models delivering fluent, persuasive recommendations even when critical baseline data (e.g., TCO, peak throughput, downtime tolerance) is entirely absent.

---

## Full EMOS Product Vision

The broader EMOS vision is an **AI-native Operating System for the complete enterprise modernization lifecycle**. Modernization is not a one-time static assessment project; it is a continuous, closed-loop discipline.

The comprehensive EMOS lifecycle spans:
```
Discover → Understand → Assess → Decide → Govern → Prioritize → Plan → Define Target State → Execute → Validate → Deploy / Transition → Measure Benefits → Learn → Continuously Reassess
```

The long-term objective of EMOS is **continuous enterprise modernization**—shifting enterprises from high-risk big-bang migrations to an agile, evidence-governed operating rhythm.

---

## Product Architecture

Conceptually, EMOS organizes enterprise modernization capabilities into an integrated operating system:

```
EMOS (Enterprise Modernization Operating System — v2)
│
├── Strategy & Align
│   Program Sponsor, Business Outcomes, Constraints & Target Platform Context
│
├── Discover
│   Portfolio Discovery & Command Center (Apex Aerospace 10,420+ Assets, Financial Services 6,850+ Assets + BYOP CSV/JSON Ingestion + Spatial Portfolio Topology)
│
├── Enterprise DNA
│   Structured 18-Attribute Evidence Model across 6 Dimensions (2D Structured View + Spatial DNA Relationship Graph + Controlled Verification & Editing)
│
├── Assess & Decide
│   Canonical 6R Decision Intelligence (Plain-English Hero Summary, Top 3 Reasons, Compare All 6R Options, Governed Modernization Agent with Tool Trace)
│
├── Govern
│   Deterministic 70% + Zero-Critical-Gap Readiness Gate & Explicit Human Governance Approval Sign-Off
│
├── Plan & Mobilize
│   Deterministic, Evidence-Gated Modernization Wave Planning, Mobilization Readiness Controls & Executive Decision Export
│
├── Execute
│   Disposition-Specific Transformation Workflows, Spatial Current → Decision → Target Story, Stage Timelines, Blockers & Checkpoint Gates across all 6 Rs
│
├── Measure
│   Outcome Realization Scorecards comparing Baseline vs. Target vs. Observed Cost, Performance & Risk Metrics
│
└── Learn
    Structured 5-Part Learning Capture (Original Assumption vs. Actual Result vs. Variance vs. Lesson vs. Future Wave Applicability)
```

---

## Current vs. Future Scope

| Capability | EMOS v2 (Implemented) | Full EMOS Vision (Future Scope) |
| :--- | :--- | :--- |
| **Portfolio Discovery** | Sample estates (Apex Aerospace, Financial Services) + user-imported CSV/JSON + `"Here's What EMOS Understood"` summary + Spatial Topology | Automated enterprise discovery & live CMDB sync |
| **Enterprise DNA** | Structured 18-attribute evidence model in 2D + Spatial Relationship Graph + controlled evidence verification/editing | Continuously refreshed enterprise evidence from live runtime telemetry |
| **Assessment & Modernization Agent** | Implemented (Single governed Modernization Agent with tool traces + Gemini fallback ladder) | Multi-system live telemetry agents |
| **Modernization Disposition** | Canonical 6R (`Retain`, `Retire`, `Rehost`, `Replatform`, `Refactor`, `Repurchase`) with plain-English-first actions | Configurable 6R/7R enterprise models |
| **Explainability** | Implemented (Plain-English Hero, Top 3 Reasons, Compare All 6R Options, progressive disclosure) | Automated corporate policy lineage |
| **Trust Readiness** | Implemented (`READY` vs. `NEEDS EVIDENCE` — 70% threshold + zero critical gaps) | Automated enterprise compliance policy engines |
| **Risk Identification** | Implemented (DNA risk factors & transformation stage blockers) | Autonomous live vulnerability scanning |
| **Governance / Approval** | Implemented (`Agent Recommends → EMOS Validates → Human Approves` gate & sign-off) | Multi-team organization-wide ARB hierarchy & RBAC |
| **Portfolio Prioritization** | Implemented (Command Center attention KPIs, hotspot & domain clustering) | Autonomous capacity-aware portfolio optimization |
| **Program Alignment** | Implemented (owner-isolated program context) | Enterprise policy hierarchy and multi-stakeholder approvals |
| **Wave Planning** | Implemented (deterministic evidence-gated wave sequencing) | Live dependency graph and capacity-aware scheduling |
| **Mobilization Readiness** | Implemented (governance, people, platform, security, delivery gates) | Workflow automation across external ticketing systems |
| **Executive Decision Export** | Implemented (portable HTML/printable decision brief & evidence action plan) | Signed PDF and enterprise BI feeds |
| **Target-State Architecture** | Implemented (`1. Current State → 2. Governed EMOS Decision → 3. Target State` spatial transformation story) | Autonomous infrastructure-as-code synthesis |
| **Execution** | Implemented (Disposition-specific stage timelines, checkpoint gates & blocker resolution across all 6 Rs) | Direct automated production cloud mutation |
| **Validation** | Implemented (Stage checkpoint verification gates) | Synthetic load generation & automated parity testing |
| **Benefit Realization (Measure)** | Implemented (`Baseline vs. Target vs. Observed` outcome scorecards for all 6 Rs) | Live post-cutover cloud billing & APM ingestion |
| **Continuous Learning (Learn)** | Implemented (5-part assumption vs. outcome variance & reusable lesson playbook capture) | Closed-loop automated portfolio reassessment |

---

## Current 6R vs. Future Configurable 7R Framework

### Current Release Implementation: Canonical 6R
The active application implements strictly the **canonical 6R modernization taxonomy** paired with plain-English-first actions:
- **Retain (`Keep it as-is`)**: Keep workload in its current operational state; optimize, monitor tech debt, and review outcomes.
- **Retire (`Safely shut it down`)**: Transition downstream consumers, archive required compliance data, decommission servers, and validate cost/risk removal.
- **Rehost (`Move it largely unchanged`)**: Lift-and-shift infrastructure to modern cloud compute without core code changes.
- **Replatform (`Move it to a better platform`)**: Migrate to managed cloud platforms (containers, managed data platforms/databases) while preserving core application logic.
- **Refactor (`Redesign parts of it`)**: Re-architect bottlenecked monoliths into cloud-native or event-driven services for scale and agility.
- **Repurchase (`Replace it with another product`)**: Replace custom commodity software with a modern commercial or SaaS platform and retire the previous system.

*(Note: The current application does NOT claim to implement 7R).*

### Broader EMOS Roadmap: Configurable 7R Model
In enterprise environments with specialized hypervisor migrations, the disposition framework will be extensible to support a **7R model** where **Relocate** is recognized as a dedicated disposition:
- Retain
- Retire
- Rehost
- **Relocate** *(Future Scope: Relocate workload/platform with minimal application redesign, e.g. VMware Engine)*
- Replatform
- Refactor
- Repurchase

---

## Disposition-Specific Execution Journeys (Implemented in EMOS v2)

In EMOS v2, the modernization disposition is a **routing decision** that activates a disposition-specific governed transformation workflow across **Execute → Measure → Learn**:

- **RETAIN (`Keep it as-is`)** → `Keep → Optimize → Monitor → Review Outcome → Learn`
- **RETIRE (`Safely shut it down`)** → `Approve → Consumer Transition → Archive → Decommission → Validate Closure → Measure Savings/Risk → Learn`
- **REHOST (`Move it largely unchanged`)** → `Approve → Prepare Destination → Move → Validate → Cutover → Stabilize → Measure → Learn`
- **RELOCATE** *(Future 7R Scope)* → `Prepare target environment → Relocate workload/platform with minimal application redesign → Cut over → Validate`
- **REPLATFORM (`Move it to a better platform`)** → `Approve → Prepare Target Platform → Transform/Migrate → Validate → Cutover → Optimize → Measure → Learn`
- **REFACTOR (`Redesign parts of it`)** → `Approve → Redesign/Decompose → Implement → Test → Transition → Stabilize → Measure → Learn`
- **REPURCHASE (`Replace it with another product`)** → `Approve → Select Replacement → Configure → Migrate Data/Users → Transition → Retire Previous Product → Measure → Learn`

> **Scope Note**: EMOS v2 implements and tracks these disposition-specific transformation workflows, checkpoint gates, blockers, outcome scorecards (`Baseline vs. Target vs. Observed`), and learning playbooks inside the product experience. It does not directly mutate external production cloud infrastructure.

---

## The Implemented Capability: Full-Lifecycle EMOS v2

The current release implements the complete governed modernization lifecycle:

```
Strategy/Align ➔ Discover ➔ Enterprise DNA ➔ Assess ➔ Decide ➔ Govern ➔ Plan & Mobilize ➔ Execute ➔ Measure ➔ Learn
```

More specifically:
```
Sample / Imported Enterprise Portfolio
        ↓
Enterprise DNA (Structured Evidence Across 6 Dimensions)
        ↓
Deterministic Evidence Completeness Calculation
        ↓
Gemini Modernization Assessment
        ↓
Canonical 6R Disposition (Retain, Retire, Rehost, Replatform, Refactor, Repurchase)
        ↓
Recommendation Confidence & Decision Readiness (READY vs. NEEDS EVIDENCE)
        ↓
Architectural Rationale & Viable Alternatives
        ↓
Missing Evidence Identification & Critical Risks
        ↓
Recommended Next Actions
```

---

## What Makes EMOS Different

### 1. Portfolio-First Modernization & "Bring Your Own Portfolio"
Users start from a representative enterprise portfolio or import their own real-world portfolio CSV/JSON files instead of a blank AI prompt.
- **Pre-Seeded Archetypes**: Representative enterprise workloads across core legacy patterns (monolithic web apps, legacy data warehouses, client-server document management).
- **Import Enterprise Portfolio (BYOP)**: Architects can upload custom enterprise inventory files (`.csv`, `.json`) or download 4 benchmark industry portfolios with instant schema validation and visual preview.
*(Note: The current Beta provides controlled CSV/JSON ingestion and sample datasets for discovery and does not claim live automated CMDB or cloud agent discovery).*

### 2. Enterprise DNA
Each workload is represented through structured evidence across six core architectural dimensions:
1. **Business DNA**: Business capability, operational criticality, business modernization drivers.
2. **Technology DNA**: Application runtime, backend database, current hosting, technology lifecycle risk.
3. **Dependency DNA**: Known upstream/downstream integrations, shared batch pipelines, interface protocols.
4. **Economics DNA**: Infrastructure expenditure, licensing overhead, total cost of ownership (TCO) baseline.
5. **Data & Risk DNA**: Data sensitivity, classification, storage volume/velocity, statutory compliance mandates.
6. **Target-State DNA**: Enterprise cloud strategy, target architectural constraints, maximum allowable downtime.

When custom portfolios are imported, **missing fields do not fail the import**. Instead, missing fields are automatically mapped into Enterprise DNA evidence gaps, lowering the deterministic completeness score and prompting architects on what critical data must be gathered before cutover.

### 3. Deterministic Evidence Completeness
Evidence completeness is calculated directly from the structured Enterprise DNA evidence model—not guessed by an LLM.

For the **Customer Analytics** reference workload:
- **11 of 18** required attributes verified as **Known Evidence**
- **6** attributes identified as **Missing Evidence**
- **1** attribute flagged as **Incomplete**
- **Deterministic Evidence Completeness**: **61%**

This establishes an objective, mathematically verifiable evidence baseline prior to AI evaluation.

### 4. Canonical 6R Decision Intelligence
EMOS adheres strictly to the canonical 6R modernization taxonomy:
- **Retain**: Keep workload in its current state until technical debt or business drivers warrant change.
- **Retire**: Decommission workloads that no longer provide business value or duplicate functionality.
- **Rehost**: Lift-and-shift to cloud infrastructure without code modification.
- **Replatform**: Move to managed cloud services (e.g., container platforms, managed databases) without core redesign.
- **Refactor**: Re-architect into cloud-native microservices or event-driven patterns to maximize agility and scale.
- **Repurchase**: Replace custom software with a modern commercial-off-the-shelf SaaS solution.

Gemini reasons over the structured Enterprise DNA to identify the primary 6R recommendation and explicitly explains alternative dispositions that were considered and rejected.

### 5. Trust Before Action
EMOS enforces critical semantic distinctions before any recommendation is treated as actionable:
- **Evidence Completeness**: How much required workload evidence is actually known (*percentage of verified attributes*).
- **Recommendation Confidence**: How strongly the available evidence supports Gemini's recommendation (*score based on evidence alignment*).
- **Decision Readiness**: Whether the available evidence is sufficient for the recommendation to be treated as decision-ready (`READY` vs. `NEEDS EVIDENCE`).

When essential information (such as target platform strategy or TCO) is unverified, EMOS flags the decision as **NEEDS EVIDENCE**, preventing dangerous false confidence in enterprise modernization planning.

---

## Enterprise Decision Journey

```
Sample Enterprise Portfolio
        ↓  [What workloads exist and what are their high-level signals?]
Enterprise DNA
        ↓  [What architectural attributes are known vs. missing across 6 dimensions?]
Known Evidence + Missing Evidence
        ↓  [What factual evidence can be substantiated?]
Deterministic Evidence Completeness
        ↓  [What percentage of required evidence is objectively verified?]
Gemini Modernization Assessment
        ↓  [How does enterprise AI reason over the evidence using canonical 6R rules?]
Canonical 6R Recommendation
        ↓  [Which disposition (Retain, Retire, Rehost, Replatform, Refactor, Repurchase) is primary?]
Recommendation Confidence
        ↓  [How strongly does the verified evidence support this specific path?]
Decision Readiness
        ↓  [Is the evidence sufficient (READY) or are critical gaps open (NEEDS EVIDENCE)?]
Rationale + Alternatives + Risks
        ↓  [Why was this path chosen, why were others rejected, and what are the technical risks?]
Missing Evidence
        ↓  [What unverified information must enterprise architects clarify before cutover?]
Recommended Next Actions
           [What concrete governance, discovery, or spikes should the team execute next?]
```

---

## Example — Customer Analytics

EMOS includes a representative enterprise application workload implementing the full decision lifecycle:

### Known Evidence (Verified)
- **Business Capability**: Customer Analytics
- **Business Criticality**: High
- **Runtime**: Java 8 (End-of-Life maintenance risk)
- **Database**: Oracle
- **Hosting**: On-premises
- **Known Downstream Integrations**: 7 external consumers
- **Infrastructure Cost**: High
- **Licensing Cost**: High (Proprietary database and compute licensing)
- **Modernization Drivers**: Cost reduction, scalability constraints, faster analytics delivery

### Missing / Incomplete Evidence (Gaps)
- Detailed dependency specifications (sync/async protocols, latency SLAs)
- Detailed multi-year TCO baseline
- Data volume and ingestion velocity
- Regulatory and compliance constraints
- Target cloud / platform strategy
- Target architecture constraints (containers vs. serverless)
- Maximum allowable migration downtime tolerance

### Baseline Assessment State
- **11 of 18** attributes verified
- **Evidence Completeness**: **61%**
- **Decision Readiness Baseline**: **NEEDS EVIDENCE**

When assessed, this structured Enterprise DNA is injected directly into Gemini without requiring the user to re-type evidence. The engine preserves vendor neutrality (since target cloud is unverified) and delivers an explainable assessment (e.g., evaluating **Replatform** vs. **Refactor**) while highlighting the 7 missing evidence gaps that block migration cutover.

---

## Bring Your Own Enterprise Portfolio (Import Capability)

EMOS allows architects and migration practitioners to **Bring Your Own Portfolio (BYOP)** by importing workload inventories via **CSV** or **JSON**, instantly unlocking Enterprise DNA modeling and 6R Modernization Assessments on real-world enterprise estates.

```
Upload Inventory (CSV/JSON) or Download Benchmark Archetype
                           ↓
Schema Validation & Formula Injection Neutralization
                           ↓
Interactive Preview (Valid Count, Row Gaps, Attribute Warnings)
                           ↓
Owner-Bound Persistence in Cloud Firestore
                           ↓
Enterprise DNA Generation (Known vs Missing Evidence Gaps)
                           ↓
Deterministic Completeness Scoring & 1-Click 6R Assessment
```

### 1. Supported Import Schema

Workload records can be imported using standard column headers (case-insensitive, supporting snake_case, camelCase, or space-separated names):

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `workload_id` | **Required** | Unique string identifier for the system (e.g., `FIN-CORE-001`) |
| `workload_name` | **Required** | Descriptive business or system title |
| `workload_type` | **Required** | Classification (e.g., `Core Banking`, `Analytics`, `ERP`, `E-Commerce`) |
| `business_capability` | Optional | Capability mapped to business architecture |
| `criticality` | Optional | `Tier 1 - Mission Critical`, `Tier 2 - Business Critical`, or `Tier 3` |
| `current_stack` | Optional | Runtime, programming language, and version (e.g., `Java 8 / WebLogic`) |
| `database` | Optional | Backend persistence engine (e.g., `Oracle 11g RAC`, `DB2`, `PostgreSQL`) |
| `hosting` | Optional | Current deployment model (`On-premises DC`, `Colocation`, `IaaS VM`) |
| `lifecycle_risk` | Optional | Tech debt / EOL indicator (`Critical EOL Risk`, `Moderate`, `Low`) |
| `upstream_deps` | Optional | Known upstream integration count or pipe-separated list |
| `downstream_deps`| Optional | Known downstream consumer count or pipe-separated list |
| `infra_cost` | Optional | Relative or estimated annual infrastructure expenditure |
| `license_cost` | Optional | Annual software/proprietary license expenditure |
| `modernization_drivers`| Optional | Primary motivations (e.g., `License Reduction; Scalability`) |
| `data_classification` | Optional | Compliance tier (`PII / PCI-DSS`, `Confidential`, `Internal`) |
| `data_volume` | Optional | Storage scale and velocity |
| `compliance_mandates` | Optional | Applicable regulatory constraints (e.g., `SOX, GDPR`) |
| `target_cloud` | Optional | Enterprise target standard (`GCP`, `AWS`, `Azure`, or `Vendor Neutral`) |
| `downtime_tolerance` | Optional | Maximum allowable cutover downtime window |
| `expected_6r` | Benchmark | *Evaluation benchmark only* (e.g., `Refactor`, `Replatform`) |
| `expected_reason` | Benchmark | *Evaluation benchmark only* — expected architecture rationale |

> **Evaluation Neutrality Guarantee**: Benchmark fields (`expected_6r`, `expected_reason`) are utilized solely for benchmark comparison in testing. They are **never** passed into Gemini prompt payloads or system instructions, ensuring zero confirmation bias during assessment.

### 2. Missing Evidence as First-Class Architectural Gaps

In enterprise modernization, inventory data is almost never complete. Unlike rigid tools that fail on missing attributes:
- Missing fields in EMOS **do not cause the import to fail**.
- Instead, omitted or empty fields are automatically categorized as **Missing Evidence Gaps** within the workload's Enterprise DNA.
- Missing evidence directly reduces the workload's **Deterministic Evidence Completeness** score and triggers a **`NEEDS EVIDENCE`** decision readiness status until validated.

### 3. Untrusted Input & Data Hygiene Model

Uploaded CSV and JSON files represent untrusted external input and are defended with strict security controls:
1. **Zero Execution & Safe Parsing**: Files are parsed in memory using regex-based CSV scanning and guarded JSON deserialization. No dynamic scripts, macros, or `eval()` constructs are ever executed.
2. **Spreadsheet & Formula Injection Protection**: Any value starting with formula trigger characters (`=`, `+`, `-`, `@`, `\t`, `\r`) is automatically sanitized by prepending a safe apostrophe (`'`), preventing formula execution if exported into spreadsheet viewers.
3. **Payload Thresholds**: Files above 5MB and CSV/JSON portfolios above 200 workload records are rejected before import to reduce memory-exhaustion and denial-of-service risk. Oversized portfolios are never partially imported, and the UI, parsers, tests, and documentation use the same canonical limits.
4. **Owner-Bound Subcollection**: Successfully imported workloads are sanitized of `undefined` fields and stored under the authenticated user's private path `/users/{userId}/importedWorkloads/{workloadId}` governed by Firestore security rules.

AI requests use the same authenticated boundary: `/api/chat` and `/api/summarize-title` reject anonymous or expired sessions, and the server verifies the Firebase ID token signature, project audience, issuer, and subject before invoking Gemini. The browser never sends the Gemini API key.

### 4. Downloadable Enterprise Benchmark Datasets (Canonical 6R Coverage)

EMOS bundles **4 realistic industry benchmark portfolios** available for 1-click download in CSV format directly within the application:

1. **Diversified Enterprise Benchmark** (8 workloads): Mixed legacy estate spanning Core Banking Mainframe, Claims Engine, Customer Data Warehouse, HR Portal, Enterprise CMS, Legacy Pricing Engine, and Internal Wiki.
2. **Financial Services Benchmark** (6 workloads): High-compliance banking workloads including Core Ledger, Payments Gateway, AML Screening Engine, and Regulatory Reporting.
3. **Retail & E-Commerce Benchmark** (6 workloads): Scalability-driven workloads including E-Commerce Storefront, Inventory Management, Point-of-Sale Hub, and Recommendation Engine.
4. **Manufacturing & Supply Chain Benchmark** (6 workloads): Operational workloads including ERP Core, Warehouse Management System (WMS), IoT Sensor Aggregator, and Vendor Portal.

Across these 4 portfolios, all **six canonical 6R dispositions** are represented:
- **Retain**: Mission-critical Mainframe Ledger (active stability, near-zero change rate).
- **Retire**: Legacy Reporting Database (duplicated by modern cloud warehouse, zero active consumers).
- **Rehost**: Statutory Payroll Calculator (Windows 2012 VM, lift-and-shift to IaaS before OS deprecation).
- **Replatform**: Claims Ingestion Pipeline (containerize to managed Kubernetes and migrate Oracle to managed PostgreSQL).
- **Refactor**: High-velocity Recommendation Engine (decompose monolithic Java monolith into event-driven microservices).
- **Repurchase**: On-Premise Internal Wiki & HR Portal (retire custom servers in favor of SaaS enterprise platforms).

---

## Google Cloud Architecture

```
User
  ↓
Firebase Authentication (Google Sign-In)
  ↓
EMOS React Experience (Vite / Tailwind CSS / Lucide)
  ↓
Cloud Run / Express Backend
  ├── Google Gemini (gemini-3.6-flash primary + resilient fallback ladder)
  │     Evidence-aware modernization reasoning & structured 6R extraction
  ├── Cloud Firestore
  │     Owner-bound assessment persistence, history & multi-turn thread storage
  └── Google Cloud Secret Manager / Environment Injection
        Server-side credential security (zero browser exposure)
```

- **Firebase Authentication**: Federated Google Sign-In with verified user identity.
- **Cloud Firestore**: Owner-bound assessment persistence, multi-turn follow-up history, and audit logging.
- **Gemini**: Evidence-aware modernization reasoning, 6R disposition analysis, and confidence scoring.
- **Google Cloud Run**: Managed container execution running the unified full-stack application.
- **Secret Manager**: Production-grade isolation of `GEMINI_API_KEY` on the server runtime.
- **Google AI Studio**: Agentic development environment used to build, iterate, test, and publish the EMOS beta.

---

## Security Model

The application enforces defense-in-depth principles for enterprise data protection:

1. **Authenticated User Data Isolation**: User assessments, thread histories, and portfolio interactions are strictly partitioned by authenticated user ID (`/users/{userId}/interactions/{interactionId}`).
2. **Owner-Bound Security Rules**: Cloud Firestore security rules enforce owner-bound read/write access (`request.auth.uid == userId`) with zero insecure defaults (`match /{document=**} { allow read, write: if false; }`).
3. **Zero Client Secret Exposure**: The Gemini API key is accessed strictly on the server layer. No AI credentials or API keys are exposed to the browser.
4. **Resilient AI Pipeline**: The backend wraps `@google/genai` with a 4-tier model fallback ladder:
   - Primary: `gemini-3.6-flash`
   - High-Availability Fallback: `gemini-3.1-flash-lite`
   - Dynamic Alias: `gemini-flash-latest`
   - Deep Reasoning Fallback: `gemini-3.7-flash`
   Recoverable errors (`429`, `503`, `500`) are handled gracefully before bubbling to the UI.
5. **Defensive Request Ingestion**: Top-level body parsing ordering guarantees, null-safe payload destructuring, and explicit payload sanitization to prevent unhandled runtime failures.
6. **Platform-Neutral Reasoning**: When Target-State DNA lacks an established enterprise cloud standard, the reasoning engine enforces vendor-neutral architectural guidance.

---

## Implementation Evidence

| Product Attribute | EMOS Implementation |
| :--- | :--- |
| **Authenticity** | Dedicated enterprise modernization decision intelligence that replaces open-ended chat with structured portfolio discovery, Enterprise DNA modeling, and canonical 6R analysis. |
| **Usability** | Guided end-to-end user journey: Portfolio Discovery ➔ Enterprise DNA ➔ 1-Click Modernization Assessment ➔ Explainable 6R Decision with interactive multi-turn advisory. |
| **Stability** | Fully persistent state in Cloud Firestore, defensive backend request validation, multi-model Gemini fallback protocol, and 100% clean production TypeScript compilation. |
| **Security** | Federated Google Sign-In via Firebase Auth, owner-bound Firestore rules, server-side secret management via Secret Manager, and zero client key exposure. |

---

## Current Release Scope: Full-Lifecycle Governed Modernization

EMOS v2 delivers a **secure, production-deployed full-lifecycle operating system spanning Strategy, Discovery, Enterprise DNA, 6R Decision Intelligence, Human Governance, Wave Planning, Transformation Execution, Outcome Measurement, and Continuous Learning**:

```
Portfolio Discovery ➔ Enterprise DNA ➔ Deterministic Completeness ➔ Governed 6R Assessment ➔ Human Governance Approval ➔ Wave Plan & Mobilize ➔ Transformation Execution ➔ Outcome Measurement ➔ Institutional Learning
```

By combining deterministic readiness gates, real Firebase Authentication, owner-bound Cloud Firestore storage, and a single governed Modernization Agent backed by a multi-model Gemini fallback ladder, EMOS v2 establishes an accountable operating system for enterprise modernization.

---

## Future Autonomous Infrastructure Roadmap

The following capabilities represent external infrastructure automation beyond the current EMOS v2 release:

- **Automated Enterprise Discovery & Connectors**: Live CMDB, Git repository, and cloud infrastructure metadata ingestion pipelines.
- **Continuously Refreshed Enterprise DNA**: Dynamic architectural telemetry and automated runtime dependency observation.
- **Direct Cloud Infrastructure Mutation**: Automated code refactoring commits, live schema migration execution, and automated Terraform/IaC provisioning in customer cloud accounts.
- **Live Post-Cutover Billing & APM Telemetry**: Direct ingestion of real-time cloud billing exports and production APM metrics into the Measure workspace.
- **Organization-Wide Multi-Tenant RBAC**: Enterprise tenant workspaces and multi-team Architectural Review Board (ARB) role hierarchies.

---

## Current Boundaries

- **Sample & User-Imported Portfolio**: Workload discovery uses synthetic reference estates (Apex Aerospace and Global Financial Services) or user-imported CSV/JSON files; automated real-time discovery via live CMDB/cloud agent ingestion is future scope.
- **Structured 18-Attribute Evidence Schema**: Enterprise DNA uses a structured 18-attribute model across 6 dimensions with controlled verification and editing rather than continuous dynamic repository analysis.
- **Canonical 6R Taxonomy**: The current release evaluates and executes canonical 6R dispositions (`Retain`, `Retire`, `Rehost`, `Replatform`, `Refactor`, `Repurchase`); extensible 7R (including a separate `Relocate` disposition) is future scope.
- **Bounded Execution Scope**: EMOS v2 governs and tracks disposition-specific transformation stages, blockers, checkpoint gates, outcome scorecards, and learning playbooks, but does not directly mutate external production cloud infrastructure.
- **User-Bound Multi-Tenancy**: Authenticated data isolation is enforced at the user level (`/users/{userId}`); organization-wide role-based access control (RBAC) is planned for future releases.

---

## Technology Stack

- **AI-assisted development**: Google AI Studio for agentic application design, implementation, iteration, testing, and publishing
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, and Vite
- **Backend and API security**: Node.js and Express with Firebase ID-token verification, request validation, response schemas, prompt-injection guardrails, and secret redaction
- **AI and decision intelligence**: `@google/genai` with Google Gemini (`gemini-3.6-flash` primary and a resilient fallback ladder), deterministic Enterprise DNA completeness scoring, explainable canonical 6R assessment, and evidence-gap detection
- **Identity and authentication**: Firebase Authentication with federated Google Sign-In, desktop popup handling, and same-origin mobile redirect support
- **Data and multi-turn persistence**: Cloud Firestore with real-time listeners, owner-bound document paths, multi-turn history, imported workloads, and modernization-program context
- **Planning and mobilization**: Deterministic modernization wave planning, readiness controls, and executive decision export
- **Runtime**: Google Cloud Run managed container execution for the unified frontend and Express backend
- **Secret integration**: Google Cloud Secret Manager-compatible Cloud Run injection for the server-only `GEMINI_API_KEY`; the key is never returned to the browser
- **Testing and release controls**: Vitest, Supertest, Firebase Emulator Suite, Firestore owner-isolation tests, and a required GitHub Actions release gate

---

## Prerequisites & Environment Setup

### 1. Enable Required Google Cloud APIs

```bash
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com
```

---

## Firestore Provisioning & Security Rules

Deploy the owner-bound security rules to ensure authenticated user data isolation:

```javascript
rules_version = '2';
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

    // User assessments strictly isolated to owning user
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User imported enterprise workloads isolated strictly to owning user
    match /users/{userId}/importedWorkloads/{workloadId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Deploy the rules using the Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

---

## Secret Management (Google Cloud Secret Manager)

The active production service is `gemini-reflection-journal` in project `codev-0326` and region `asia-southeast1`. It exposes the server-only environment variable `GEMINI_API_KEY` through a Secret Manager reference to `emos-gemini-api-key`; the key value is never committed or returned to the browser.

For a new environment, store the Gemini API key in Google Cloud Secret Manager and grant access only to the Cloud Run runtime service account:

```bash
# 1. Create and populate the secret
gcloud secrets create emos-gemini-api-key --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add emos-gemini-api-key --data-file=-

# 2. Grant the Cloud Run service account access to read the secret
gcloud secrets add-iam-policy-binding emos-gemini-api-key \
  --member="serviceAccount:YOUR_RUNTIME_SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Google Cloud Run Deployment

*Note: The current deployment is hosted in `asia-southeast1`.*

### 1. Deploy the Application

Deploy directly from source to Cloud Run:

```bash
gcloud run deploy gemini-reflection-journal \
  --source . \
  --platform managed \
  --region <REGION> \
  --allow-unauthenticated \
  --port 3000 \
  --set-secrets="GEMINI_API_KEY=emos-gemini-api-key:latest"
```

*(To match the active deployment, replace `<REGION>` with `asia-southeast1`).*

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure local environment
cp .env.example .env
# Add your GEMINI_API_KEY in .env

# 3. Start full-stack development server (Express + Vite on port 3000)
npm run dev

# 4. Compile and verify production build
npm run build

# 5. Run the release gate (unit, API, rendering, and Firestore Emulator tests; Java 21+ required)
npm test

# 6. Start compiled production server
npm start
```

---

## Verification

The codebase includes verification across all critical paths (accessible interactively via the in-app **Verification & Test Guide** modal):

- [x] **Google Sign-In**: Federated authentication, secure session handling, graceful logout.
- [x] **Sample Enterprise Portfolio**: Discovery rendering of all 3 candidate workloads with metadata, criticality, and governance notices.
- [x] **Enterprise DNA Rendering**: Complete breakdown across 6 architectural dimensions (Business, Tech, Dependency, Economics, Risk, Target-State).
- [x] **Evidence State Badging**: Explicit visual distinction between Known Evidence vs. Missing/Incomplete Evidence.
- [x] **Deterministic Evidence Completeness**: Mathematical calculation (e.g., 61% for Customer Analytics) reflecting verified attributes.
- [x] **1-Click DNA Hand-off**: Seamless transition from DNA profile into the Assessment Workspace without re-typing context.
- [x] **Canonical 6R Output**: Standardized dispositions (Retain, Retire, Rehost, Replatform, Refactor, Repurchase) with alternative analyses.
- [x] **Platform Neutrality**: Vendor-neutral target recommendations when target cloud strategy is missing from evidence.
- [x] **Decision Readiness Consistency**: Single source of truth across header badges, explainability text, and Firestore storage (`READY` vs. `NEEDS EVIDENCE`).
- [x] **Bring Your Own Portfolio (CSV/JSON)**: Client-side schema validation, spreadsheet/formula injection protection, and graceful evidence gap extraction.
- [x] **Downloadable Enterprise Benchmarks**: 4 industry portfolios (Diversified, Financial, Retail, Manufacturing) covering all 6 canonical 6R dispositions (Retain, Retire, Rehost, Replatform, Refactor, Repurchase).
- [x] **Imported Workload DNA & Assessment**: Full integration of imported workloads into Enterprise DNA modeling, completeness calculation, and 6R Modernization Assessment.
- [x] **Lightweight Guardrails Layer**: Structured JSON serialization of untrusted evidence, adversarial injection rejection, and input length limits.
- [x] **Automated Secret & Token Redaction**: Outbound payload scanning to neutralize accidental API keys, tokens, or credential leakage in model outputs.
- [x] **Canonical 6R Repair & Enforcement**: Mathematical validation guaranteeing output conforms strictly to canonical 6R taxonomy (Retain, Retire, Rehost, Replatform, Refactor, Repurchase) and auto-repairs legacy or non-canonical terms like "Rebuild".
- [x] **Deterministic DNA Grounding**: Server-side evidence scoring; Decision Readiness strictly enforced to `NEEDS EVIDENCE` whenever evidence completeness < 70% or critical dimensions are unmapped.
- [x] **Formula Injection & Import Defense**: Neutralizes CSV formula triggers (`=`, `+`, `-`, `@`), enforces the 5MB file boundary, and rejects CSV/JSON portfolios above 200 workloads without partial ingestion.
- [x] **Responsive Theming (Light, Dark, System)**: WCAG AA contrast compliance, system preference detection, and zero-flash persistence across devices.
- [x] **Cloud Firestore Persistence**: Transactional save of assessments, multi-turn follow-ups, and user-isolated history & imported workloads.
- [x] **Production Compilation**: Clean Vite build and esbuild backend bundle passing all strict TypeScript validations.
