import { z } from 'zod';

export const canonical6RSchema = z.enum([
  'Retain',
  'Retire',
  'Rehost',
  'Replatform',
  'Refactor',
  'Repurchase',
]);

/**
 * Structured output contract for the Gemini-backed Portfolio Discovery Agent.
 * Validated deterministically before exposing results to EMOS workflows or Ask EMOS.
 */
export const portfolioDiscoveryOutputSchema = z.object({
  findings: z.array(z.string().min(1)).min(1).max(6),
  relationships: z.array(z.string().min(1)).max(6),
  missingEvidence: z.array(z.string().min(1)).max(10),
  ambiguities: z.array(z.string().min(1)).max(6),
  recommendedInvestigations: z.array(z.string().min(1)).min(1).max(6),
  evidenceReferences: z.array(z.string().min(1)).min(1).max(12),
  confidence: z.number().min(0).max(100),
});

export type PortfolioDiscoveryOutput = z.infer<typeof portfolioDiscoveryOutputSchema>;

/**
 * Structured output contract for the Gemini-backed Enterprise Architect Agent.
 * Validated deterministically against canonical 6R taxonomy, evidence state,
 * and governance constraints before exposing results.
 */
export const enterpriseArchitectOutputSchema = z.object({
  recommendedDisposition: canonical6RSchema,
  directAnswer: z.string().min(1).optional(),
  rationale: z.array(z.string().min(1)).min(1).max(6),
  alternatives: z
    .array(
      z.object({
        disposition: canonical6RSchema,
        whyWeaker: z.string().min(1),
      }),
    )
    .min(1)
    .max(5),
  risks: z.array(z.string().min(1)).min(1).max(6),
  evidenceReferences: z.array(z.string().min(1)).min(1).max(12),
  missingEvidence: z.array(z.string().min(1)).max(10),
  recommendationChangeTriggers: z.array(z.string().min(1)).min(1).max(6),
  confidence: z.number().min(0).max(100),
});

export type EnterpriseArchitectOutput = z.infer<typeof enterpriseArchitectOutputSchema>;
