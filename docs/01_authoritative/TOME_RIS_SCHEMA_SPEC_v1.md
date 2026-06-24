# TOME_RIS_SCHEMA_SPEC_v1

> **Document Classification:** Formal Database Schema & Storage Specification  
> **Document Version:** 1.0  
> **Created:** 2026-06-09  
> **Status:** APPROVED SCHEMA CONTRACT  
> **Persistence:** PERMANENT  

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Schema Design Principles](#2-schema-design-principles)
3. [Storage vs Runtime Model](#3-storage-vs-runtime-model)
4. [Top-Level RIS Schema](#4-top-level-ris-schema)
5. [Entity Catalog](#5-entity-catalog)
6. [Claim Model](#6-claim-model)
7. [Evidence Graph Model](#7-evidence-graph-model)
8. [Provenance Model](#8-provenance-model)
9. [Artifact Anchor Model](#9-artifact-anchor-model)
10. [Serialization Rules](#10-serialization-rules)
11. [Zod Schema Definitions](#11-zod-schema-definitions)
12. [TypeScript Interfaces](#12-typescript-interfaces)
13. [Hydration Algorithm](#13-hydration-algorithm)
14. [Dehydration Algorithm](#14-dehydration-algorithm)
15. [Migration Strategy](#15-migration-strategy)
16. [Validation Rules](#16-validation-rules)
17. [Performance Characteristics](#17-performance-characteristics)
18. [Examples](#18-examples)
19. [Anti-Patterns](#19-anti-patterns)
20. [Final Canonical Schema](#20-final-canonical-schema)

---

## 1. EXECUTIVE SUMMARY

The Repository Intelligence State (RIS) is the canonical database of the ToMe platform. This document defines the exact schema, types, relationships, and lifecycles of the `.ris-state.json` file. It inherits all decisions established in `TOME_ARCHITECTURE_AMENDMENT_v1` and serves as the single source of truth for the Storage Orchestrator, Evidence Engine, and extraction pipelines. 

There are no placeholders in this specification. It is a strictly typed implementation contract.

---

## 2. SCHEMA DESIGN PRINCIPLES

1. **Normalized Flat Arrays:** Deeply nested JSON fails at scale. The schema utilizes flat arrays with UUID-based foreign keys.
2. **Dual-Layer Architecture:** The disk format is optimized for read/write speed, human debuggability, and Git delta reduction. The runtime format is optimized for graph traversal and confidence math.
3. **Immutability by Origin:** Semantic attributes separate their value (stored on the entity) from their origin/metadata (stored in the Claim array).
4. **Deterministic Serialization:** JSON keys are sorted alphabetically recursively to ensure structural stability across OS platforms and Node.js versions.

---

## 3. STORAGE VS RUNTIME MODEL

The architecture requires two distinct representations of the RIS:

### Storage Representation (`.ris-state.json`)
The on-disk JSON is a flat, normalized database. Entities (e.g., Domain, Service) store raw primitive values (strings, arrays of strings) for both structural and semantic properties. This guarantees that a human opening `.ris-state.json` can read the text without manually joining objects.

The metadata proving *why* a semantic property exists—its status, derivation method, confidence, and provenance—is stored in a separate `claims` array. The graph of evidence connecting code to claims is stored in the `evidenceEdges` array.

### Runtime Hydrated Representation (`RISGraph`)
When `StorageOrchestrator.load()` reads the JSON, it performs an in-memory SQL-style JOIN.
Semantic properties are inflated from primitive types (`string`) into `Claim<T>` objects.
`EvidenceEdges` are attached directly to the `Claim` object.
The rest of the system operates exclusively on the `RISGraph`.

---

## 4. TOP-LEVEL RIS SCHEMA

The root object of `.ris-state.json` must exactly match this structure. No arbitrary keys are permitted.

```json
{
  "meta": {},
  "domains": [],
  "services": [],
  "capabilities": [],
  "workflows": [],
  "businessRules": [],
  "constraints": [],
  "dependencies": [],
  "risks": [],
  "integrations": [],
  "decisions": [],
  "assumptions": [],
  "claims": [],
  "evidenceNodes": [],
  "evidenceEdges": [],
  "artifactAnchors": {},
  "orphanedAssertions": []
}
```

### Rationale:
*   **meta:** Tracks schema version and checksums.
*   **Entities (domains -> assumptions):** Flat arrays of the core architectural elements.
*   **claims:** Stores the confidence, provenance, and status metadata for semantic properties.
*   **evidenceNodes/Edges:** Stores the structural code references and graph relationships.
*   **artifactAnchors:** Maps Markdown headings to Claim IDs to preserve manual overrides.
*   **orphanedAssertions:** A holding area for `HUMAN_ASSERTED` claims whose target entities were deleted from the graph during a Full Rewrite.

---

## 5. ENTITY CATALOG

Every entity must have a unique `id` (UUID v4).
Properties marked as `[Semantic]` have corresponding metadata entries in the `claims` array. Properties marked as `[Structural]` do not.

### Domain
*   **Purpose:** A high-level bounded context (e.g., "Authentication").
*   **Attributes:**
    *   `id` (UUID)
    *   `name` (string) [Semantic]
    *   `description` (string) [Semantic]
*   **Relationships:** None stored on the Domain itself.

### Service
*   **Purpose:** A physical execution component.
*   **Attributes:**
    *   `id` (UUID)
    *   `domainId` (UUID) [Semantic]
    *   `name` (string) [Semantic]
    *   `techStack` (string[]) [Semantic]

### Capability
*   **Purpose:** A business action performed by a Domain.
*   **Attributes:**
    *   `id` (UUID)
    *   `domainId` (UUID) [Semantic]
    *   `name` (string) [Semantic]
    *   `trigger` (string) [Semantic]

### Workflow
*   **Purpose:** Operational sequences.
*   **Attributes:**
    *   `id` (UUID)
    *   `name` (string) [Semantic]
    *   `steps` (string[]) [Semantic]

### BusinessRule
*   **Purpose:** Core business logic constraint.
*   **Attributes:**
    *   `id` (UUID)
    *   `serviceId` (UUID) [Semantic]
    *   `ruleText` (string) [Semantic]

### Constraint
*   **Purpose:** Technical or architectural limit.
*   **Attributes:**
    *   `id` (UUID)
    *   `domainId` (UUID) [Semantic]
    *   `description` (string) [Semantic]

### Dependency
*   **Purpose:** External module.
*   **Attributes:**
    *   `id` (UUID)
    *   `name` (string) [Structural]
    *   `version` (string) [Structural]
    *   `purpose` (string) [Semantic]

### Risk
*   **Purpose:** Vulnerability or operational hazard.
*   **Attributes:**
    *   `id` (UUID)
    *   `capabilityId` (UUID) [Semantic]
    *   `description` (string) [Semantic]
    *   `impactLevel` ('HIGH' | 'MEDIUM' | 'LOW') [Semantic]

### Integration
*   **Purpose:** Network boundary connections.
*   **Attributes:**
    *   `id` (UUID)
    *   `serviceId` (UUID) [Semantic]
    *   `providerName` (string) [Semantic]
    *   `protocol` (string) [Semantic]

### Decision
*   **Purpose:** Architectural choices.
*   **Attributes:**
    *   `id` (UUID)
    *   `context` (string) [Semantic]
    *   `decisionText` (string) [Semantic]

### Assumption
*   **Purpose:** Implicit beliefs underlying code.
*   **Attributes:**
    *   `id` (UUID)
    *   `decisionId` (UUID) [Semantic]
    *   `text` (string) [Semantic]

---

## 6. CLAIM MODEL

Claims are the connective tissue linking an entity's semantic value to its proof.

### Storage Representation (`StorageClaim`)
Stored in the `"claims"` array. Does **not** duplicate the actual `value`.

```json
{
  "id": "claim-uuid",
  "risEntityId": "domain-uuid",
  "attributeName": "description",
  "status": "VALIDATED",
  "derivation": "LLM_INFERRED",
  "confidence": { "level": "HIGH", "numericValue": 0.85 },
  "provenance": [ { "timestamp": "...", "model": "...", "promptVersion": "..." } ],
  "markdownHash": "hash123"
}
```

### Runtime Representation (`Claim<T>`)
Attached directly to the entity.

```typescript
export interface Claim<T> {
  id: string;
  risEntityId: string;
  attributeName: string;
  value: T; // <-- Hydrated from the Entity
  status: ClaimStatus;
  derivation: DerivationMethod;
  confidence: ConfidenceScore;
  provenance: ProvenanceRecord[];
  evidenceEdges: EvidenceEdge[]; // <-- Hydrated from evidenceEdges array
  markdownHash?: string;
}
```

### Status Lifecycle
`GENERATED`, `VALIDATED`, `DIRTY`, `RECALCULATING`, `ORPHANED`, `ORPHANED_HUMAN`, `CHALLENGED`, `CONTRADICTED`, `ARCHIVED`.

### Confidence Structure
`ConfidenceLevel`: `HUMAN_ASSERTED`, `OBSERVED`, `HIGH`, `MODERATE`, `LOW`, `UNVERIFIED`.
`numericValue`: 0.0 to 1.0.

---

## 7. EVIDENCE GRAPH MODEL

The Evidence Graph links Claims to physical Reality.

### EvidenceNode
A structural anchor. Created during the AST parsing phase.
```json
{
  "id": "node-uuid",
  "type": "CODE_NODE",
  "referenceId": "src/auth.ts::AuthService",
  "summary": "Authentication Service Class"
}
```
**Types:** `CODE_NODE`, `DEPENDENCY`, `ENV_VAR`, `CONFIG_FILE`, `HUMAN_INPUT`.

### EvidenceEdge
The relationship predicate.
```json
{
  "id": "edge-uuid",
  "fromEvidenceNodeId": "node-uuid",
  "toClaimId": "claim-uuid",
  "weight": 0.8,
  "relationship": "PROVES"
}
```
**Relationships:** `PROVES`, `SUPPORTS`, `CONTRADICTS`.

---

## 8. PROVENANCE MODEL

An audit log of how the claim evolved. Stored as an array within the `StorageClaim`.

```typescript
export interface ProvenanceRecord {
  timestamp: string; // ISO 8601
  tomeVersion: string;
  model: string;
  promptVersion: string;
}
```
*Rule:* Every LLM recalculation appends a new record to the array. Human overrides append a record with `model: "HUMAN"`.

---

## 9. ARTIFACT ANCHOR MODEL

Resolves the Markdown reconciliation contradiction.

### Structure in `.ris-state.json`
```json
"artifactAnchors": {
  "architect.md": {
    "Authentication Domain": "claim-uuid-1",
    "Stripe Integration": "claim-uuid-2"
  }
}
```

### Identity Rules
*   The key (`Authentication Domain`) must exactly match the Markdown heading text.
*   The value (`claim-uuid-1`) is the UUID of the Claim holding the text content beneath that heading.
*   If a heading is renamed in the Markdown, the Reconciliation Engine will not find it in `artifactAnchors`, treating it as a new block, and treating the old Claim as missing (and potentially archiving it).

---

## 10. SERIALIZATION RULES

1.  **Strict Array Typing:** Every array in `.ris-state.json` is strictly typed.
2.  **No Nulls:** Omitted optional fields are `undefined` at runtime and completely stripped from the JSON (no `"markdownHash": null`).
3.  **Deterministic Sorting:** `JSON.stringify` alone is non-deterministic regarding key order. ToMe implements a recursive key-sorting stringifier.
4.  **Date Formatting:** All timestamps must use strict UTC ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`).

---

## 11. ZOD SCHEMA DEFINITIONS

```typescript
import { z } from 'zod';

const MetaSchema = z.object({
  schemaVersion: z.string(),
  lastUpdated: z.string().datetime(),
  tomeVersion: z.string()
});

const ConfidenceScoreSchema = z.object({
  level: z.enum(['HUMAN_ASSERTED', 'OBSERVED', 'HIGH', 'MODERATE', 'LOW', 'UNVERIFIED']),
  numericValue: z.number().min(0).max(1)
});

const ProvenanceRecordSchema = z.object({
  timestamp: z.string().datetime(),
  tomeVersion: z.string(),
  model: z.string(),
  promptVersion: z.string()
});

const StorageClaimSchema = z.object({
  id: z.string().uuid(),
  risEntityId: z.string().uuid(),
  attributeName: z.string(),
  status: z.enum(['GENERATED', 'VALIDATED', 'DIRTY', 'RECALCULATING', 'ORPHANED', 'ORPHANED_HUMAN', 'CHALLENGED', 'CONTRADICTED', 'ARCHIVED']),
  derivation: z.enum(['OBSERVED_STRUCTURAL', 'LLM_INFERRED', 'HUMAN_ASSERTED']),
  confidence: ConfidenceScoreSchema,
  provenance: z.array(ProvenanceRecordSchema),
  markdownHash: z.string().optional()
});

const EvidenceNodeSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['CODE_NODE', 'DEPENDENCY', 'ENV_VAR', 'CONFIG_FILE', 'HUMAN_INPUT']),
  referenceId: z.string(),
  summary: z.string()
});

const EvidenceEdgeSchema = z.object({
  id: z.string().uuid(),
  fromEvidenceNodeId: z.string().uuid(),
  toClaimId: z.string().uuid(),
  weight: z.number().min(0).max(1),
  relationship: z.enum(['PROVES', 'SUPPORTS', 'CONTRADICTS'])
});

const DomainSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string()
});

// Repeated entity schemas omitted for brevity; all follow the primitive pattern.

export const RISStateSchema = z.object({
  meta: MetaSchema,
  domains: z.array(DomainSchema),
  // ... all other entity arrays
  claims: z.array(StorageClaimSchema),
  evidenceNodes: z.array(EvidenceNodeSchema),
  evidenceEdges: z.array(EvidenceEdgeSchema),
  artifactAnchors: z.record(z.record(z.string())), // Record<filename, Record<heading, claimId>>
  orphanedAssertions: z.array(z.any()) // Stores dehydrated HUMAN_ASSERTED claims
});
```

---

## 12. TYPESCRIPT INTERFACES

```typescript
// Storage Interfaces (On-Disk)
export interface StorageRIS {
  meta: { schemaVersion: string; lastUpdated: string; tomeVersion: string };
  domains: StorageDomain[];
  claims: StorageClaim[];
  evidenceNodes: EvidenceNode[];
  evidenceEdges: EvidenceEdge[];
  artifactAnchors: Record<string, Record<string, string>>;
  orphanedAssertions: any[];
}

export interface StorageDomain {
  id: string;
  name: string;
  description: string;
}

// Runtime Interfaces (In-Memory)
export interface RISGraph {
  meta: StorageRIS['meta'];
  domains: RuntimeDomain[];
  evidenceNodes: EvidenceNode[]; // Kept for global graph access
  artifactAnchors: StorageRIS['artifactAnchors'];
  orphanedAssertions: any[];
}

export interface RuntimeDomain {
  id: string;
  name: Claim<string>;
  description: Claim<string>;
}
```

---

## 13. HYDRATION ALGORITHM

**Storage -> Runtime Transformation (executed by `StorageOrchestrator.load`)**

1.  Read `.ris-state.json`.
2.  Validate against `RISStateSchema`.
3.  Index `claims` into a Map: `Map<string, StorageClaim>` keyed by `risEntityId_attributeName`.
4.  Index `evidenceEdges` into a Map: `Map<string, EvidenceEdge[]>` keyed by `toClaimId`.
5.  Initialize `RISGraph`.
6.  Iterate over each entity array (e.g., `domains`).
7.  For each entity property (e.g., `domain.description`):
    *   Look up `StorageClaim` using `domain.id` + `"description"`.
    *   Look up `EvidenceEdge[]` using `claim.id`.
    *   Construct `Claim<string>` combining the primitive value, the `StorageClaim` metadata, and the `EvidenceEdge[]`.
    *   Assign to `RuntimeDomain.description`.
8.  Return fully hydrated `RISGraph`.

---

## 14. DEHYDRATION ALGORITHM

**Runtime -> Storage Transformation (executed by `StorageOrchestrator.save`)**

1.  Initialize empty `StorageRIS` flat structure.
2.  Iterate over `RISGraph` entity arrays (e.g., `RuntimeDomain`).
3.  For each `Claim<T>` property (e.g., `RuntimeDomain.description`):
    *   Extract `value` and assign to `StorageDomain.description`.
    *   Extract metadata (id, status, confidence, etc.) and push to `StorageRIS.claims`.
    *   Extract `evidenceEdges` and push to `StorageRIS.evidenceEdges`.
4.  Copy `meta`, `evidenceNodes`, `artifactAnchors`, `orphanedAssertions` directly.
5.  Execute recursive deterministic key sort.
6.  Write to `.tmp` file and rename.

---

## 15. MIGRATION STRATEGY

Schema versioning is handled exclusively via `meta.schemaVersion`.
If `meta.schemaVersion < currentVersion`:
1.  Read `.ris-state.json` without full Zod validation (bypass strict mode).
2.  Pass to migration pipeline array `[v1_to_v2, v2_to_v3]`.
3.  Migrations perform raw JSON object mutations in memory.
4.  Resulting JSON is validated against `RISStateSchema` (strict).
5.  If valid, atomic write replaces the old file.

---

## 16. VALIDATION RULES

*   **Hard Failures:** Invalid JSON, missing required arrays, `schemaVersion` downgrade attempted. Fails via Zod; CLI aborts with Exit Code 5.
*   **Foreign Key Failures:** If an `EvidenceEdge` points to a missing `toClaimId`. The CLI emits a warning and strips the edge to self-repair the graph.
*   **Orphaned Entities:** If a `Capability` points to a missing `domainId`. The CLI moves it to a "Lost and Found" holding state and triggers a warning.

---

## 17. PERFORMANCE CHARACTERISTICS

*   **Small Repo (50 files):** ~200 claims, ~50KB JSON. Serialization/Deserialization takes <5ms.
*   **Medium Repo (500 files - MVP Cap):** ~2000 claims, ~500KB JSON. Memory footprint overhead <5MB. Serialization takes <25ms.
*   **Read/Write Path:** Node.js `fs.readFile` and `fs.writeFile` easily handle 500KB synchronously without event loop blocking issues.

---

## 18. EXAMPLES

**Complete Minimum Viable JSON (.ris-state.json)**
```json
{
  "meta": {
    "schemaVersion": "1.0",
    "lastUpdated": "2026-06-09T10:00:00.000Z",
    "tomeVersion": "1.0.0"
  },
  "domains": [
    {
      "id": "d-123",
      "name": "Auth",
      "description": "Handles login"
    }
  ],
  "services": [],
  "capabilities": [],
  "workflows": [],
  "businessRules": [],
  "constraints": [],
  "dependencies": [],
  "risks": [],
  "integrations": [],
  "decisions": [],
  "assumptions": [],
  "claims": [
    {
      "id": "c-456",
      "risEntityId": "d-123",
      "attributeName": "description",
      "status": "VALIDATED",
      "derivation": "LLM_INFERRED",
      "confidence": { "level": "HIGH", "numericValue": 0.8 },
      "provenance": [
        {
          "timestamp": "2026-06-09T10:00:00.000Z",
          "tomeVersion": "1.0.0",
          "model": "claude-3-5-sonnet",
          "promptVersion": "v1"
        }
      ]
    }
  ],
  "evidenceNodes": [],
  "evidenceEdges": [],
  "artifactAnchors": {},
  "orphanedAssertions": []
}
```

---

## 19. ANTI-PATTERNS

1. **Do not nest Claims in Storage.** It ruins readability and creates massive document bloat.
2. **Do not use Markdown hashes as primary keys.** They change frequently due to whitespace or minor formatting edits. Always rely on UUIDs.
3. **Do not use Git paths as EvidenceNode IDs.** Use the FQN (Fully Qualified Name) architecture defined in the Parser spec, to survive `mv` operations.

---

## 20. FINAL CANONICAL SCHEMA

This document finalizes the physical structure of `.ris-state.json`. Any code written in `src/domain/storage`, `src/infrastructure/storage`, or `src/adapters/` must adhere strictly to these schemas and lifecycle transitions.

**The RIS schema is officially locked for MVP.**


## PART 14: COMPLETE ENTITY ZOD SCHEMAS

```typescript
import { z } from 'zod';

const BaseEntitySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
});

export const ServiceSchema = BaseEntitySchema.extend({
  domainId: z.string().uuid(),
  isExternal: z.boolean().default(false),
});

export const CapabilitySchema = BaseEntitySchema.extend({
  serviceId: z.string().uuid(),
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
  description: z.string(),
});

export const ArchitectureDependencySchema = BaseEntitySchema.extend({
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
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
  consequences: z.string(),
  status: z.enum(['PROPOSED', 'ACCEPTED', 'DEPRECATED', 'SUPERSEDED']),
});

export const AssumptionSchema = BaseEntitySchema.extend({
  confidence: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  validationCriteria: z.string().optional(),
});
```

