/**
 * src/domain/schemas.ts
 * Zod schemas for Repository Intelligence State (RIS) and Configuration.
 * Authoritative source: TOME_RIS_SCHEMA_SPEC_v1 §14 (Canonical Implementation Contract)
 */

import { z } from 'zod';
import { 
  ClaimStatus, 
  DerivationMethod, 
  ConfidenceLevel, 
  EvidenceNodeType, 
  EvidenceRelationship 
} from './constants.js';

// ===== BASE SCHEMAS =====

export const MetaSchema = z.object({
  schemaVersion: z.string(),
  lastUpdated: z.string().datetime(),
  tomeVersion: z.string()
});

export const ConfidenceScoreSchema = z.object({
  level: z.nativeEnum(ConfidenceLevel),
  numericValue: z.number().min(0).max(1)
});

export const ProvenanceRecordSchema = z.object({
  timestamp: z.string().datetime(),
  tomeVersion: z.string(),
  model: z.string(),
  promptVersion: z.string()
});

export const StorageClaimSchema = z.object({
  id: z.string(),
  risEntityId: z.string(),
  attributeName: z.string(),
  status: z.nativeEnum(ClaimStatus),
  derivation: z.nativeEnum(DerivationMethod),
  confidence: ConfidenceScoreSchema,
  provenance: z.array(ProvenanceRecordSchema),
  markdownHash: z.string().optional()
});

export const EvidenceNodeSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(EvidenceNodeType),
  referenceId: z.string(),
  summary: z.string()
});

export const EvidenceEdgeSchema = z.object({
  id: z.string(),
  fromEvidenceNodeId: z.string(),
  toClaimId: z.string(),
  weight: z.number().min(0).max(1),
  relationship: z.nativeEnum(EvidenceRelationship)
});

// ===== ENTITY SCHEMAS (TOME_RIS_SCHEMA_SPEC_v1 §14) =====

const BaseEntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});

export const DomainSchema = BaseEntitySchema;

export const ServiceSchema = BaseEntitySchema.extend({
  domainId: z.string(),
  isExternal: z.boolean().default(false),
});

export const CapabilitySchema = BaseEntitySchema.extend({
  serviceId: z.string(),
});

export const WorkflowSchema = BaseEntitySchema.extend({
  trigger: z.string(),
  steps: z.array(z.string()),
});

export const BusinessRuleSchema = BaseEntitySchema.extend({
  condition: z.string(),
  enforcement: z.string(),
});

export const ConstraintSchema = BaseEntitySchema.extend({
  type: z.enum(['TECHNICAL', 'BUSINESS', 'REGULATORY']),
});

export const ArchitectureDependencySchema = BaseEntitySchema.extend({
  sourceId: z.string(),
  targetId: z.string(),
  criticality: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
});

export const RiskSchema = BaseEntitySchema.extend({
  impact: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  likelihood: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  mitigation: z.string().optional(),
});

export const IntegrationSchema = BaseEntitySchema.extend({
  type: z.enum(['API', 'DATABASE', 'EVENT_STREAM', 'FILE']),
  protocol: z.string(),
});

export const DecisionSchema = BaseEntitySchema.extend({
  context: z.string(),
  decisionText: z.string(), // Synchronized with RuntimeDecision
  consequences: z.string(),
  status: z.enum(['PROPOSED', 'ACCEPTED', 'DEPRECATED', 'SUPERSEDED']),
});

export const AssumptionSchema = BaseEntitySchema.extend({
  decisionId: z.string(), // Synchronized with RuntimeAssumption
  text: z.string(), // Synchronized with RuntimeAssumption
  confidence: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  validationCriteria: z.string().optional(),
});

// ===== ROOT RIS SCHEMA =====

export const RISStateSchema = z.object({
  meta: MetaSchema,
  domains: z.array(DomainSchema),
  services: z.array(ServiceSchema),
  capabilities: z.array(CapabilitySchema),
  workflows: z.array(WorkflowSchema),
  businessRules: z.array(BusinessRuleSchema),
  constraints: z.array(ConstraintSchema),
  dependencies: z.array(ArchitectureDependencySchema),
  risks: z.array(RiskSchema),
  integrations: z.array(IntegrationSchema),
  decisions: z.array(DecisionSchema),
  assumptions: z.array(AssumptionSchema),
  claims: z.array(StorageClaimSchema).optional(),
  evidenceNodes: z.array(EvidenceNodeSchema).optional(),
  evidenceEdges: z.array(EvidenceEdgeSchema).optional(),
  artifactAnchors: z.record(z.record(z.string())).optional(),
  orphanedAssertions: z.array(StorageClaimSchema).optional()
});

export const Stage1Schema = z.object({
  domains: z.array(DomainSchema),
  services: z.array(ServiceSchema),
  dependencies: z.array(ArchitectureDependencySchema),
  integrations: z.array(IntegrationSchema)
});

export const Stage2Schema = z.object({
  capabilities: z.array(CapabilitySchema),
  workflows: z.array(WorkflowSchema),
  risks: z.array(RiskSchema),
  assumptions: z.array(AssumptionSchema)
});

export const Stage3Schema = z.object({
  businessRules: z.array(BusinessRuleSchema),
  constraints: z.array(ConstraintSchema),
  decisions: z.array(DecisionSchema)
});

// ===== CONFIGURATION SCHEMA =====

export const ConfigurationSchema = z.object({
  provider: z.object({
    primary: z.string(),
    fallback: z.string().optional(),
  }),
  model: z.string(),
  extraction: z.object({
    mode: z.literal('STANDARD'),
    maxFiles: z.number().default(500),
    maxCostPerRun: z.number().default(10.0),
    maxConcurrency: z.number().default(3),
  }),
  parser: z.object({
    ignorePatterns: z.array(z.string()).default([]),
  }),
  storage: z.object({
    preserveOrphansForCycles: z.number().default(3),
  }),
  mcp: z.object({
    enabled: z.boolean().default(true),
  }),
});
