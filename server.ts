import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Standard Top-Level Request Deserialization (Ordering Guarantee)
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Lazy GoogleGenAI client initialization
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not set. Gemini requests will fail until configured.");
      throw new Error("GEMINI_API_KEY is required but not set in environment.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Resilient Model Fallback Ladder Protocol
const FALLBACK_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.7-flash",
];

async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
}): Promise<{ text: string; modelUsed: string }> {
  const ai = getAIClient();
  let lastError: any = null;

  for (const model of FALLBACK_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      return {
        text: response.text ?? "",
        modelUsed: model,
      };
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.statusCode || err?.response?.status;
      console.warn(
        `[Gemini Resilience Ladder] Model ${model} encountered error (Status: ${status}): ${err?.message || err}. Attempting next fallback model...`
      );
    }
  }

  throw new Error(
    `All Gemini fallback models failed. Last error: ${lastError?.message || String(lastError)}`
  );
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Canonical Assessment Attributes Extractor (Single Source of Truth)
function extractAssessmentAttributes(text: string) {
  if (!text) return {};

  // 1. Recommended 6R Disposition
  const r6Match = text.match(/(?:Recommended\s+6R\s+Disposition|6R\s+Disposition|Recommended\s+Disposition)\s*:\*{0,2}\s*(?:\*\*)?\s*([A-Za-z]+)/i);
  let recommended6R: string | undefined;
  if (r6Match) {
    const candidate = r6Match[1].trim();
    const valid = ['Retain', 'Retire', 'Rehost', 'Replatform', 'Refactor', 'Repurchase'];
    const found = valid.find((v) => v.toLowerCase() === candidate.toLowerCase());
    if (found) recommended6R = found;
  }

  // 2. Confidence Score
  const confMatch = text.match(/(?:Confidence\s+Score|Confidence)\s*:\*{0,2}\s*(?:\*\*)?\s*(\d{1,3})%?/i);
  let confidenceScore: number | undefined;
  if (confMatch) {
    const val = parseInt(confMatch[1], 10);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      confidenceScore = val;
    }
  }

  // 3. Evidence Completeness
  const compMatch = text.match(/(?:Evidence\s+Completeness|Completeness)\s*:\*{0,2}\s*(?:\*\*)?\s*(\d{1,3})%?/i);
  let evidenceCompleteness: number | undefined;
  if (compMatch) {
    const val = parseInt(compMatch[1], 10);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      evidenceCompleteness = val;
    }
  }

  // 4. Decision Readiness
  const readyMatch = text.match(/Decision\s+Readiness\s*:\*{0,2}\s*(?:\*\*)?\s*(READY|NEEDS\s+EVIDENCE)/i);
  let decisionReadiness: string | undefined;
  if (readyMatch) {
    decisionReadiness = readyMatch[1].toUpperCase().includes('NEEDS') ? 'NEEDS EVIDENCE' : 'READY';
  }

  // 5. Workload / Application
  const workMatch = text.match(/(?:Workload\s*\/\s*Application|Application|Workload)\s*:\*{0,2}\s*(?:\*\*)?\s*([^\n\r*]+)/i);
  let workloadName: string | undefined;
  if (workMatch) {
    const raw = workMatch[1].trim().replace(/^\[|\]$/g, '').replace(/^\*+|\*+$/g, '').trim();
    if (raw && !raw.toLowerCase().includes('identified or inferred')) {
      workloadName = raw;
    }
  }

  return {
    recommended6R,
    confidenceScore,
    evidenceCompleteness,
    decisionReadiness,
    workloadName,
  };
}

// AI Chat & Modernization Assessment endpoint
app.post("/api/chat", async (req, res) => {
  try {
    // Defensive Payload Ingestion (Null-Safe Destructuring)
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const rawMode = typeof body.mode === "string" ? body.mode : "assess";
    // Normalize mode mapping legacy terms to EMOS modes
    const mode = rawMode === "brainstorm" ? "options" : rawMode === "summary" ? "decision" : rawMode === "reflection" ? "assess" : rawMode;
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return res.status(400).json({ error: "A message or modernization description is required." });
    }

    // Determine system instructions based on assessment mode
    let systemInstruction = `You are EMOS — Enterprise Modernization Decision Intelligence, an expert enterprise architecture and cloud modernization advisor.
Your purpose is to help enterprise users turn modernization conversations and available evidence into structured, explainable modernization assessments.

CANONICAL 6R MODERNIZATION TAXONOMY:
You must use ONLY these 6 canonical dispositions:
- Retain: Keep the workload in its current environment with minimal alterations.
- Retire: Decommission, archive, or sunset workloads no longer providing business value.
- Rehost: Lift and shift the workload without architectural modifications (IaaS / VM migration).
- Replatform: Move to cloud-managed platforms (managed databases, container platforms, PaaS) with targeted optimizations and minimal code rewrites.
- Refactor: Re-architect or rebuild applications into cloud-native services or microservices to exploit cloud elasticity and agility. (Note: Rebuilding is represented under Refactor; NEVER invent "Rebuild" as a separate disposition).
- Repurchase: Replace the workload or capability with a commercial SaaS or cloud-native off-the-shelf product.
STRICT RULE: Do NOT invent additional dispositions. Do NOT use "Rebuild" as a standalone 6R disposition.

VENDOR & CLOUD PLATFORM NEUTRALITY (MANDATORY ENTERPRISE GOVERNANCE):
- When the user's target cloud or target technology platform has NOT been explicitly provided:
  * EMOS MUST REMAIN STRICTLY VENDOR- AND CLOUD-NEUTRAL.
  * Do NOT arbitrarily recommend AWS-, Azure-, Google Cloud-, Databricks-, Snowflake-, Oracle Cloud-, or other vendor-specific products or services (e.g., do NOT assume or default to Cloud SQL, BigQuery, AWS RDS, Aurora, Redshift, Azure SQL, GKE, EKS, AKS, ECS, Cloud Run, etc.) as though a target platform decision has already been made.
  * Instead:
    - Describe required target capabilities generically (e.g., "managed cloud-native relational database", "cloud data warehouse/lakehouse", "managed container/runtime platform", "schema-conversion and migration assessment tooling", "managed serverless compute", "cloud-native message broker").
    - Explain relevant architectural considerations generically (e.g., operational overhead, read/write scalability, high availability, cross-region replication, vendor lock-in).
    - Identify "Target Cloud / Platform Strategy" as missing evidence under "Missing Evidence Gaps" whenever the target platform is unstated or undecided.
    - Avoid assuming a cloud provider from unrelated evidence (e.g., existing Linux hosting does not imply AWS, existing Windows Server does not imply Azure, and existing Oracle does not imply Oracle Cloud).
- IF AND ONLY IF the user explicitly provides a target platform — for example, "Our strategic cloud is Google Cloud", "We are migrating to AWS", "Our corporate platform is Azure", or "We use Databricks" — EMOS may then appropriately reference relevant services and native tooling from that specific platform.
- Treat target-platform selection as enterprise evidence, never an assumption.

PROGRESSIVE CONTEXT & EVIDENCE DISCOVERY:
Progressively assess what is known and identify what evidence is still missing:
- Workload / Application name & business purpose
- Business criticality & technical lifecycle
- Current technology stack & hosting environment
- Operational pain points, infrastructure & licensing costs
- Performance / scalability constraints
- Dependencies, downstream integrations, and data considerations
- Security, compliance, and regulatory constraints
- Modernization drivers & target-state requirements
- Migration risks and technical debt

RESPONSIBLE DECISION BEHAVIOR (CRITICAL DIFFERENTIATOR):
- EMOS must NEVER turn weak evidence into a falsely confident enterprise decision.
- If important information or evidence is missing:
  * Clearly label: **Decision Readiness: NEEDS EVIDENCE**
  * Reduce Confidence Score appropriately (e.g., 40% - 70%).
  * Reduce Evidence Completeness appropriately (e.g., 25% - 55%).
  * Explicitly identify the missing evidence gaps.
  * Clearly distinguish this as a preliminary recommendation that could change once missing evidence is verified.
- If sufficient, comprehensive evidence is provided:
  * Label: **Decision Readiness: READY**
  * Confidence Score can reflect high certainty (e.g., 80% - 95%).
  * Evidence Completeness can reflect high coverage (e.g., 75% - 95%).
- Never fabricate enterprise facts. Never assume missing evidence is favorable.

STRUCTURED ASSESSMENT FORMAT:
When assessing a workload, exploring options, or generating a decision, format your output with this clear, enterprise-grade Markdown structure:

### MODERNIZATION ASSESSMENT
**Workload / Application:** [Identified or Inferred Application Name]
**Current-State Summary:** [Concise architectural summary: stack, hosting, business criticality]
**Recommended 6R Disposition:** [Retain | Retire | Rehost | Replatform | Refactor | Repurchase]
**Confidence Score:** [XX%]
**Evidence Completeness:** [XX%]
**Decision Readiness:** [READY | NEEDS EVIDENCE]

#### 1. Recommendation Rationale
[Why this specific 6R disposition is favored based on verified evidence; note if preliminary due to missing data]

#### 2. Key Evidence
[Bullet points of verified facts and architectural evidence supporting this recommendation]

#### 3. Alternatives Considered
- **[Alternative 6R]**: [Why it is less suitable or premature based on current constraints]
- **[Alternative 6R]**: [Why it is less suitable or premature based on current constraints]

#### 4. Key Risks & Assumptions
[Architectural, operational, cost, or dependency risks identified]

#### 5. Missing Evidence Gaps
[Critical information needed: e.g. Target Cloud / Platform Strategy (if unstated), database migration feasibility, network latency, peak load metrics]

#### 6. Recommended Next Actions
[Concrete discovery spikes, dependency mapping, or architectural proofs of concept]

Always maintain an objective, authoritative enterprise architecture tone.`;

    if (mode === "options") {
      systemInstruction = `You are EMOS — Enterprise Modernization Decision Intelligence, specializing in Modernization Strategy & Trade-Off Comparison.
- Compare the viable 6R modernization strategies (Rehost, Replatform, Refactor, Repurchase, Retain, Retire) for the workload described.
- Present clear architectural trade-offs: cost, effort, migration timeline, organizational complexity, and cloud value realization.
- Highlight the primary recommended 6R disposition along with secondary options.
- Maintain the Canonical 6R taxonomy (no "Rebuild" as a separate category; include rebuild under Refactor).
- VENDOR NEUTRALITY: If no target platform is explicitly specified, describe target capabilities generically (e.g. "managed container platform", "cloud-native relational database") and list Target Cloud Platform Selection as a critical strategic dependency. Only reference vendor-specific services (AWS, Azure, Google Cloud, Databricks, Snowflake) if the user explicitly specifies that target.
- Include the structured **MODERNIZATION ASSESSMENT** header with Recommended 6R, Confidence Score, Evidence Completeness, and Decision Readiness (READY or NEEDS EVIDENCE).`;
    } else if (mode === "decision") {
      systemInstruction = `You are EMOS — Enterprise Modernization Decision Intelligence, acting as the Executive Modernization Synthesis Engine.
- Synthesize all available evidence into an executive-ready modernization decision brief.
- Provide a decisive, clear 6R recommendation based strictly on known facts.
- Highlight Decision Readiness (READY or NEEDS EVIDENCE), Confidence Score, and Evidence Completeness.
- VENDOR NEUTRALITY: Maintain strict vendor neutrality unless a target cloud has been explicitly specified by the user. If unstated, define the target architecture using generic enterprise cloud capabilities and note Target Cloud / Platform Selection under Missing Evidence or Next Actions.
- Detail the exact evidence supporting the decision, major enterprise risks, and missing evidence required before architectural sign-off.
- Provide immediate next actions for the modernization program team.`;
    }

    // Build multi-turn content objects safely
    const formattedContents: any[] = [];

    // Include previous conversation history safely
    for (const item of history) {
      if (item && typeof item === "object" && typeof item.content === "string") {
        const role = item.role === "assistant" || item.role === "model" ? "model" : "user";
        formattedContents.push({
          role,
          parts: [{ text: item.content }],
        });
      }
    }

    // Add current user modernization message
    formattedContents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const { text, modelUsed } = await generateContentWithFallback({
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    // Extract canonical attributes directly from the generated assessment text (Single Source of Truth)
    const attributes = extractAssessmentAttributes(text);

    return res.json({
      response: text,
      modelUsed,
      attributes,
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return res.status(500).json({
      error: error?.message || "Internal server error occurred while generating modernization assessment with Gemini.",
    });
  }
});

// Title & Category generation endpoint (Scores are NEVER independently generated here)
app.post("/api/summarize-title", async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!content) {
      return res.json({
        title: "Modernization Assessment " + new Date().toLocaleDateString(),
        category: "Legacy Application",
      });
    }

    const prompt = `Analyze this enterprise modernization description and extract ONLY a title and category:
1. "title": A crisp name for the workload/assessment (max 4-6 words, e.g. "Oracle Java 8 Core Modernization" or "EDW Data Platform Migration").
2. "category": Choose one from: ["Legacy Application", "Data Platform", "Architecture Review", "Cloud Migration", "Cost Optimization", "SaaS Evaluation"].

Output ONLY a single JSON object in this exact schema, with no markdown code blocks:
{
  "title": "...",
  "category": "..."
}

Modernization content:
"${content.slice(0, 2000)}"`;

    const { text } = await generateContentWithFallback({
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    });

    try {
      const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      return res.json({
        title: parsed.title || "Modernization Assessment",
        category: parsed.category || "Legacy Application",
      });
    } catch {
      return res.json({
        title: content.slice(0, 35) + "...",
        category: "Legacy Application",
      });
    }
  } catch (error: any) {
    console.warn("Failed to generate assessment metadata, using fallback:", error?.message);
    return res.json({
      title: "Modernization Assessment " + new Date().toLocaleDateString(),
      category: "Legacy Application",
    });
  }
});

// Setup Vite development middleware or static production serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
