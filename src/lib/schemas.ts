import { z } from 'zod';
import { MAX_PROMPT_LENGTH } from './guardrails';

const dnaFieldSchema = z.object({
  id: z.string().min(1).max(32),
  label: z.string().min(1).max(250),
  value: z.string().max(2000),
  status: z.enum(['known', 'missing', 'incomplete']),
  detail: z.string().max(2000).optional(),
}).strict();

const dnaDimensionSchema = (expectedIds: readonly string[]) => z
  .array(dnaFieldSchema)
  .length(expectedIds.length)
  .refine(
    (fields) => fields.every((field) => expectedIds.includes(field.id)) &&
      new Set(fields.map((field) => field.id)).size === expectedIds.length,
    'DNA fields must contain each canonical field ID exactly once.',
  );

export const enterpriseDnaSchema = z.object({
  business: dnaDimensionSchema(['b1', 'b2', 'b3']),
  technology: dnaDimensionSchema(['t1', 't2', 't3', 't4']),
  dependency: dnaDimensionSchema(['d1', 'd2']),
  economics: dnaDimensionSchema(['e1', 'e2', 'e3']),
  dataAndRisk: dnaDimensionSchema(['dr1', 'dr2', 'dr3']),
  targetState: dnaDimensionSchema(['ts1', 'ts2', 'ts3']),
}).strict();

const historyItemSchema = z.object({
  role: z.enum(['user', 'model', 'assistant']),
  content: z.string().min(1).max(8000),
  timestamp: z.string().max(100).optional(),
  modelUsed: z.string().max(100).optional(),
}).strict();

export const chatRequestSchema = z.object({
  message: z.string().min(1).max(MAX_PROMPT_LENGTH),
  history: z.array(historyItemSchema).max(20).default([]),
  mode: z.enum(['assess', 'options', 'decision', 'reflection', 'brainstorm', 'summary']),
  deterministicCompleteness: z.number().min(0).max(100).optional(),
  workloadDna: enterpriseDnaSchema.optional(),
}).strict();

export const assessmentAttributesSchema = z.object({
  recommended6R: z.enum(['Retain', 'Retire', 'Rehost', 'Replatform', 'Refactor', 'Repurchase']),
  confidenceScore: z.number().min(0).max(100),
  evidenceCompleteness: z.number().min(0).max(100),
  decisionReadiness: z.enum(['READY', 'NEEDS EVIDENCE']),
  workloadName: z.string().max(250).optional(),
  wasRepaired: z.boolean(),
  repairedReasons: z.array(z.string().max(500)).max(20),
  isGrounded: z.boolean(),
  trustIndicators: z.object({
    inputValidated: z.literal(true),
    evidenceGrounded: z.boolean(),
    schemaValidated: z.literal(true),
    wasRepaired: z.boolean(),
  }).strict(),
}).strict();

export const chatResponseSchema = z.object({
  response: z.string().min(1).max(50_000),
  sanitizedInput: z.string().max(MAX_PROMPT_LENGTH + 100),
  modelUsed: z.string().min(1).max(100),
  attributes: assessmentAttributesSchema,
  trustIndicators: assessmentAttributesSchema.shape.trustIndicators,
}).strict();

export const titleRequestSchema = z.object({
  content: z.string().min(1).max(MAX_PROMPT_LENGTH),
}).strict();

export const titleResponseSchema = z.object({
  title: z.string().min(1).max(80),
  category: z.enum([
    'Legacy Application',
    'Data Platform',
    'Architecture Review',
    'Cloud Migration',
    'Cost Optimization',
    'SaaS Evaluation',
  ]),
}).strict();

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  hasGeminiKey: z.boolean(),
  timestamp: z.string().datetime(),
}).strict();
