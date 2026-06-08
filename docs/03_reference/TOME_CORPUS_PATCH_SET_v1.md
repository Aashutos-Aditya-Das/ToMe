# TOME_CORPUS_PATCH_SET_v1

> **Document Classification:** Executable Corpus Patch Instructions  
> **Document Version:** 1.0  
> **Created:** 2026-06-09  
> **Status:** AUTHORIZED FOR APPLICATION  
> **Persistence:** PERMANENT  

This document contains explicit, manual patch instructions for every architecture specification in the ToMe corpus. An engineer must apply these exact text replacements to guarantee implementation consistency.

All patches inherit authority from:
- `TOME_ARCHITECTURE_AMENDMENT_v1`
- `TOME_CORPUS_CONSOLIDATION_v1`
- `TOME_RIS_SCHEMA_SPEC_v1`
- `TOME_PROMPT_ARCHITECTURE_v1`

---

## 1. TOME_SYSTEM_ARCHITECTURE_v1

### Patch 1.1: IKnowledgeStore Removal
**Location:** Section 3 (Ports and Adapters)
**Action:** REPLACE

**Exact Deletion Text:**
```markdown
### Storage Port
The `IKnowledgeStore` interface governs all disk operations, reading and writing the RIS state and ensuring data persistence.
```

**Exact Replacement Text:**
```markdown
### Storage Port
> [!WARNING] **[DEPRECATED]** `IKnowledgeStore` is superseded. Use `IStorageOrchestrator`.

The `IStorageOrchestrator` interface governs all disk operations, atomic `.tmp` renames, lock file management, and RIS state hydration/dehydration. See `TOME_ARCHITECTURE_AMENDMENT_v1` Part VIII for the canonical interface.
```

### Patch 1.2: RIS Storage vs Runtime Interfaces
**Location:** Section 4 (RIS Entities)
**Action:** REPLACE

**Exact Deletion Text:**
```markdown
interface Domain {
  id: string;
  name: string;
  description: string;
}
```

**Exact Replacement Text:**
```markdown
> [!IMPORTANT] **[SUPERSEDED]** All RIS interfaces defined here are strictly conceptual.

The canonical storage arrays (primitive values) and runtime interfaces (hydrated `Claim<T>` values) are formally defined in `TOME_RIS_SCHEMA_SPEC_v1`. Do not implement interfaces directly from this document.
```

### Patch 1.3: ILLMClient Definition
**Location:** Section 9 (LLM Client)
**Action:** REPLACE

**Exact Deletion Text:**
```typescript
interface ILLMClient {
  generateStructured<T>(prompt: string, schema: any): Promise<T>;
  generateText(prompt: string): Promise<string>;
}
```

**Exact Replacement Text:**
```markdown
> [!WARNING] **[DEPRECATED]** The `generateText` method and `schema: any` typing are obsolete.

```typescript
// Authoritative interface defined in TOME_ARCHITECTURE_AMENDMENT_v1
export interface ILLMClient {
  readonly providerId: string;
  generateStructured<T>(prompt: PromptRequest, schema: ZodSchema<T>): Promise<LLMResult<T>>;
  countTokens(text: string): Promise<number>;
}
```
```

### Patch 1.4: Exit Codes
**Location:** Section 11 (Exit Codes)
**Action:** REPLACE

**Exact Replacement Text:**
```markdown
> [!IMPORTANT] **[SUPERSEDED]** 

The 4-code exit table is replaced by the unified 6-code table defined in `TOME_ARCHITECTURE_AMENDMENT_v1` Resolution 13 (0=Success, 1=UserError, 2=ConfigError, 3=RepoError, 4=ProviderError, 5=DataError, 6=SystemError).
```

---

## 2. TOME_EVIDENCE_ENGINE_v1

### Patch 2.1: ClaimStatus Enum
**Location:** Section 7
**Action:** REPLACE

**Exact Deletion Text:**
```typescript
type ClaimStatus = 'VALIDATED' | 'DIRTY' | 'ORPHANED' | 'CONTRADICTED';
```

**Exact Replacement Text:**
```markdown
> [!IMPORTANT] **[SUPERSEDED]** Replaced by the 9-state unified lifecycle.

```typescript
export type ClaimStatus =
  | 'GENERATED'
  | 'VALIDATED'
  | 'DIRTY'
  | 'RECALCULATING'
  | 'ORPHANED'
  | 'ORPHANED_HUMAN'
  | 'CHALLENGED'
  | 'CONTRADICTED'
  | 'ARCHIVED';
```
```

### Patch 2.2: Confidence Math
**Location:** Section 13-14
**Action:** REPLACE

**Exact Deletion Text:**
```markdown
FinalConfidence = min(1.0, BaselineConfidence * (1 + Sum(EvidenceNode.weight * Edge.weight)))
```

**Exact Replacement Text:**
```markdown
> [!IMPORTANT] **[SUPERSEDED]** LLM Baseline Confidence is explicitly ignored.

Confidence scoring uses the hybrid discrete/numeric system defined in `TOME_ARCHITECTURE_AMENDMENT_v1` Resolution 6. Base LLM claims start at 0.5 and increase/decrease strictly based on structural evidence edge counts.
```

---

## 3. TOME_UPDATE_ENGINE_v1

### Patch 3.1: Markdown Reconciliation
**Location:** Section 19-22
**Action:** REPLACE

**Exact Deletion Text:**
```markdown
The engine injects invisible HTML comments `<!-- tome-claim-id: uuid -->` into the generated Markdown...
```

**Exact Replacement Text:**
```markdown
> [!WARNING] **[DEPRECATED]** Invisible HTML comments are strictly banned.

Reconciliation utilizes **Heading Anchors**. The `MemorySerializer` writes standard Markdown headings and records the `Heading Text -> Claim ID` mapping in the `artifactAnchors` object inside `.ris-state.json`. Human overrides are handled via explicit file edits beneath recognized headings, or via the `tome assert` CLI command. (See `TOME_ARCHITECTURE_AMENDMENT_v1` Res 5).
```

### Patch 3.2: Atomicity Guarantees
**Location:** Section 36
**Action:** REPLACE

**Exact Deletion Text:**
```markdown
Partial updates to the `.tome/` directory are physically impossible due to the `.tmp` rename strategy.
```

**Exact Replacement Text:**
```markdown
> [!NOTE] **[CORRECTED]** Multi-file transaction atomicity is not guaranteed natively.

Guarantees are strictly per-file. `.ris-state.json` is renamed *last*. If the process crashes mid-batch, the `IntegrityValidator` recovers on the next boot by restoring `.ris-state.backup.json` and regenerating inconsistent Markdown.
```

---

## 4. TOME_PARSER_ARCHITECTURE_v1

### Patch 4.1: Stable Node IDs
**Location:** Section 21
**Action:** REPLACE

**Exact Deletion Text:**
```markdown
Node IDs are calculated using a SHA-256 hash of the file's Exported Public Interface...
```

**Exact Replacement Text:**
```markdown
> [!IMPORTANT] **[SUPERSEDED]** O(N²) SHA-256 hashing is removed for MVP.

Node IDs are deterministic FQN paths (`[package]::[relativePath]::[symbolName]`). Rename detection uses a lightweight `StructuralChecksum` (AST topology hash) to track files moved without semantic changes.
```

### Patch 4.2: Worker Threads & Cross-Language
**Location:** Section 44 and 51
**Action:** INSERT

**Exact Insertion Text:**
```markdown
> [!NOTE] **[PHASE_2_DEFERRAL]** This feature (Worker Threads / Cross-Language routing) is explicitly postponed. MVP uses single-threaded `async` parsing and LLM-based semantic graph unification.
```

---

## 5. TOME_LLM_PROVIDER_ARCHITECTURE_v1

### Patch 5.1: Provider Fallback
**Location:** Section 30
**Action:** REPLACE

**Exact Deletion Text:**
```markdown
If the primary provider fails, dynamically swap to the fallback provider and resume exactly where it failed.
```

**Exact Replacement Text:**
```markdown
> [!IMPORTANT] **[AMENDED]** Request-level fallback is removed.

Provider fallback operates strictly at the **Pipeline Level**. If 3 retries/repairs fail, the entire extraction stage aborts, swaps the active provider, and restarts the stage from scratch using the new provider's optimized prompt stack.
```

### Patch 5.2: Local Models
**Location:** Section 16
**Action:** INSERT

**Exact Insertion Text:**
```markdown
> [!WARNING] **[EXPERIMENTAL / POSTPONED]** Local models lack the context windows and instruction-following fidelity required for the ToMe Zod schemas. This adapter is excluded from the MVP.
```

---

## 6. TOME_CONFIGURATION_SPEC_v1

### Patch 6.1: Drift Detection
**Location:** Section 31
**Action:** REPLACE

**Exact Deletion Text:**
```markdown
Changing `extraction.mode` automatically triggers the FullRewriteStrategy.
```

**Exact Replacement Text:**
```markdown
> [!IMPORTANT] **[AMENDED]** Drift detection is advisory, not destructive.

Configuration changes trigger a CLI warning suggesting `tome update --force`. The system does NOT automatically drop the intelligence state and trigger a Full Rewrite without explicit user consent.
```

---

## 7. TOME_CLI_ARCHITECTURE_v1

### Patch 7.1: Sleep Prevention
**Location:** Section 45
**Action:** REPLACE

**Exact Deletion Text:**
```markdown
The CLI hooks into OS-level power management to prevent sleep during `tome update`.
```

**Exact Replacement Text:**
```markdown
> [!WARNING] **[REMOVED]** Sleep prevention is stripped from MVP due to cross-platform Node.js limitations.
```

### Patch 7.2: Exit Codes
**Location:** Section 39-40
**Action:** REPLACE

**Exact Replacement Text:**
```markdown
> [!IMPORTANT] **[SUPERSEDED]** See the unified 6-code table in `TOME_ARCHITECTURE_AMENDMENT_v1`.
```

---

## 8. TOME_MCP_ARCHITECTURE_v1

### Patch 8.1: Enterprise Features
**Location:** Sections 11 through 60
**Action:** INSERT

**Exact Insertion Text:**
```markdown
> [!NOTE] **[MVP SCOPE RESTRICTION]** MVP scope for MCP is strictly limited to: Stdio transport, 3 read-only resources, 3 extraction tools, and 1 context prompt. 

All SSE transport, JWT auth, enterprise governance, multi-agent swarms, and remote hosting features detailed in this document are deferred to Phase 8.
```

---

## 9. TOME_STATE_MODEL_v1 & TOME_ARTIFACT_SPEC_v1 & TOME_RIS_SPEC_v1

### Patch 9.1: Universal Header Notice
**Location:** Top of Document (Line 1)
**Action:** INSERT

**Exact Insertion Text:**
```markdown
> [!IMPORTANT] **[IMPLEMENTATION NOTICE]** 
> This document provides foundational philosophy. For strict schema implementations, interfaces, and file formats, you MUST use `TOME_RIS_SCHEMA_SPEC_v1`. In the event of any conflict, the Schema Spec governs.
```

---

**END OF PATCH SET.**  
Engineers: Do not attempt to implement ToMe by reading historical documents in isolation. Always execute these patches conceptually or physically before referencing a subsystem.
