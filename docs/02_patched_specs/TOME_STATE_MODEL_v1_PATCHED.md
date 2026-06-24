# TOME_STATE_MODEL_v1

> [!IMPORTANT] **[IMPLEMENTATION NOTICE]** 
> This document provides foundational philosophy. For strict schema implementations, interfaces, and file formats, you MUST use `TOME_RIS_SCHEMA_SPEC_v1`. In the event of any conflict, the Schema Spec governs.


> **[CORPUS PATCH APPLIED]** This document has been patched by `TOME_CORPUS_PATCH_SET_v1` and inherits all definitions from `TOME_ARCHITECTURE_AMENDMENT_v1`.


> **Document Classification:** Core Persistence & Lifecycle Specification  
> **Document Version:** 1.0  
> **Created:** 2026-06-08  
> **Status:** APPROVED STATE CONTRACT  
> **Persistence:** PERMANENT  

---

## TABLE OF CONTENTS

1. [State Model Philosophy](#1-state-model-philosophy)
2. [State Architecture Overview](#2-state-architecture-overview)
3. [State Taxonomy](#3-state-taxonomy)
4. [Canonical Source of Truth Strategy](#4-canonical-source-of-truth-strategy)
5. [Repository Model Lifecycle](#5-repository-model-lifecycle)
6. [Repository Skeleton Lifecycle](#6-repository-skeleton-lifecycle)
7. [RIS Lifecycle](#7-ris-lifecycle)
8. [Evidence Graph Lifecycle](#8-evidence-graph-lifecycle)
9. [Artifact Lifecycle](#9-artifact-lifecycle)
10. [Human Assertion Lifecycle](#10-human-assertion-lifecycle)
11. [Provenance Lifecycle](#11-provenance-lifecycle)
12. [Update Lifecycle](#12-update-lifecycle)
13. [State Ownership Rules](#13-state-ownership-rules)
14. [State Persistence Rules](#14-state-persistence-rules)
15. [State Invalidation Rules](#15-state-invalidation-rules)
16. [State Mutation Rules](#16-state-mutation-rules)
17. [State Reconstruction Rules](#17-state-reconstruction-rules)
18. [State Migration Rules](#18-state-migration-rules)
19. [State Versioning Rules](#19-state-versioning-rules)
20. [State Consistency Rules](#20-state-consistency-rules)
21. [Conflict Resolution Framework](#21-conflict-resolution-framework)
22. [Garbage Collection Strategy](#22-garbage-collection-strategy)
23. [Backup and Recovery Strategy](#23-backup-and-recovery-strategy)
24. [Local Storage Architecture](#24-local-storage-architecture)
25. [Multi-Version Compatibility Strategy](#25-multi-version-compatibility-strategy)
26. [Future Cloud Synchronization Strategy](#26-future-cloud-synchronization-strategy)
27. [State Integrity Validation](#27-state-integrity-validation)
28. [State Checksums](#28-state-checksums)
29. [State Snapshots](#29-state-snapshots)
30. [Final Engineering Verdict](#30-final-engineering-verdict)

---

## 1. STATE MODEL PHILOSOPHY

A system with multiple sources of truth is a system designed to fail. Prior specifications introduced ambiguity regarding whether Markdown artifacts or the internal JSON representation governed the project's intelligence. 

This document eliminates that ambiguity. **State is binary: it is either Canonical or it is a View.** 
If ToMe crashes halfway through an update, the state model dictates exactly which data is trusted and which data is dropped. 

## 2. STATE ARCHITECTURE OVERVIEW

The state architecture is divided into three physical boundaries:
1. **The Codebase:** The immutable physical reality (outside of ToMe's control).
2. **The Intelligence Database:** The canonical source of truth for semantic understanding (`.tome/.ris-state.json`).
3. **The Presentation Layer:** Lossy, serialized views generated from the database (`.tome/*.md`).

## 3. STATE TAXONOMY

**Question:** What data exists in ToMe?
**Answer:**
1.  **Source Code:** Owned by the user.
2.  **Repository Model / Skeleton:** Transient AST mappings.
3.  **Repository Intelligence State (RIS):** The core semantic graph.
4.  **Evidence Graph:** Pointers connecting RIS claims to structural origins.
5.  **Markdown Artifacts:** Human-readable text projections.

**Taxonomy Rules:**
*   **Transient:** Repository Model, Repository Skeleton, Prompts. (These live only in RAM during execution).
*   **Persisted:** RIS, Evidence Graph, Markdown Artifacts.
*   **Canonical:** Source Code (for structure), `.ris-state.json` (for intelligence).
*   **Reconstructable:** Markdown Artifacts (can be 100% regenerated from `.ris-state.json`).
*   **Disposable:** Generated JSON artifacts that fail schema validation.

---

## 4. CANONICAL SOURCE OF TRUTH STRATEGY

### Resolution of Architectural Contradiction (Question A)

*Previous ambiguity:* Is the Markdown file the source of truth, or is the RIS JSON? If the Markdown file changes, which wins?

**The Final Decision: The `.ris-state.json` file is the absolute Canonical Source of Truth for the intelligence layer.**

**Why:** Markdown cannot efficiently store Evidence Edges, Confidence Scores, or Provenance Records without becoming illegible to humans. Attempting to make Markdown the canonical database requires horrific regex hacking and HTML comment embedding.

**How Dual-Source Contradictions are Avoided:**
1.  When `tome update` is executed, ToMe first runs a **Reconciliation Pass**.
2.  It hashes the text blocks of the existing Markdown files.
3.  It compares these hashes to the `markdown_hash` stored inside `.ris-state.json` for each Claim.
4.  If the hashes differ, it means a **Human Edited the Markdown**.
5.  ToMe parses the human's markdown diff, maps it to the Claim ID, updates `.ris-state.json`, and marks the Claim as `HUMAN_ASSERTED`.
6.  Only *after* `.ris-state.json` is updated via human edits does the LLM evaluation begin.
7.  The Markdown files are then entirely overwritten by the new `.ris-state.json`.

Markdown is simply a UI that supports two-way data binding to the canonical `.ris-state.json`.

---

## 5. REPOSITORY MODEL LIFECYCLE
*   **Born:** When `IParser` scans the codebase.
*   **Lives:** In RAM (Node.js heap) for ~5 seconds.
*   **Dies:** Replaced by the Repository Skeleton. Never touches the disk.

## 6. REPOSITORY SKELETON LIFECYCLE
*   **Born:** When the Repository Model is compressed.
*   **Lives:** In RAM during LLM context assembly.
*   **Dies:** Once the RIS is fully synthesized. Never saved.

## 7. RIS LIFECYCLE
*   **Born:** Synthesized from LLM JSON payloads.
*   **Lives:** Persisted permanently in `.tome/.ris-state.json`.
*   **Updates:** Patched during `tome update`.
*   **Dies:** Claims die if marked `ORPHANED` for 3 cycles.

## 8. EVIDENCE GRAPH LIFECYCLE
*   **Born:** Generated alongside RIS Claims.
*   **Lives:** Embedded inside the `Claim` objects within `.tome/.ris-state.json`.
*   **Updates:** Edges are severed if structural nodes vanish.

## 9. ARTIFACT LIFECYCLE
*   **Born:** Serialized at the end of the pipeline.
*   **Lives:** Persisted as `.md` files in `.tome/`.
*   **Updates:** Completely overwritten by the `MemorySerializer` on every successful `tome update`.

---

## 10. HUMAN ASSERTION LIFECYCLE

### Resolution of Human Edits (Question B)

**Scenario:** User opens `memory.md` and deletes the sentence "This uses Redis" and types "This uses Memcached."

**What exactly happens?**
1.  User saves the file.
2.  User runs `tome update`.
3.  ToMe calculates that the chunk mapping to `Claim_123` has drifted from its serialized hash.
4.  ToMe updates `.ris-state.json`:
    *   `Claim_123.value = "This uses Memcached"`
    *   `Claim_123.derivation = "HUMAN_ASSERTED"`
    *   `Claim_123.confidence.value = 1.0`
5.  Ownership of `Claim_123` is permanently transferred from `LLM` to `HUMAN`.
6.  The pipeline runs. The LLM suggests: "I see no Memcached, but I see Redis in package.json."
7.  Because `Claim_123` is `HUMAN_ASSERTED`, the LLM is **forbidden** from overwriting it.
8.  Instead, ToMe generates a `SuggestedMutation` edge.
9.  When `architect.md` is re-serialized, it prints the human's text, but appends a warning: `> [!WARNING] ToMe found evidence contradicting this manual assertion.`

---

## 11. PROVENANCE LIFECYCLE
Provenance records are immutable. Once a `Claim` is generated by `claude-3-5-sonnet` via `prompt_v1.2`, that record remains forever, even if the confidence score changes. If a Human asserts over it, a new Provenance Record is pushed to an audit array (`previous_provenance`).

---

## 12. UPDATE LIFECYCLE

**The 5-Step Update Machine:**
1.  **Ingest Code:** Checksum the physical code state.
2.  **Ingest Markdown:** Detect manual human UI edits -> sync to `.ris-state.json`.
3.  **Invalidate Evidence:** Sever edges for deleted files -> Mark Claims `DIRTY` or `ORPHANED`.
4.  **Extract:** Pass `DIRTY` claims and diffs to LLM -> Patch `.ris-state.json`.
5.  **Serialize:** Flush `.ris-state.json` out to the 5 Markdown artifacts.

---

## 13. STATE OWNERSHIP RULES
*   **The Developer** owns the Source Code.
*   **The Evidence Engine** owns the Evidence Edges.
*   **The LLM** owns `LLM_INFERRED` claims.
*   **The Developer** owns `HUMAN_ASSERTED` claims.

---

## 14. STATE PERSISTENCE RULES

### Resolution of .ris-state.json (Question C)

**Does `.ris-state.json` exist?** YES.
*   **Where:** `.tome/.ris-state.json`.
*   **What:** It stores the serialized `RepositoryIntelligenceState` interface, containing all `Claims`, `EvidenceEdges`, and `ProvenanceRecords`.
*   **Why:** Without it, the Evidence Engine cannot exist, because Markdown cannot store graphs.
*   **Is it canonical?** Yes. It is the absolute source of truth.

---

## 15. STATE INVALIDATION RULES
If `src/auth.ts` is deleted:
1. `EvidenceEdge` pointing to `src/auth.ts` is deleted.
2. If `Claim_Login` has 0 remaining Evidence Edges, its status changes to `ORPHANED`.
3. If `Claim_Login` has >0 remaining edges, its status changes to `DIRTY` (recalculate confidence).

---

## 16. STATE MUTATION RULES
Only the `MemoryUpdater` class is authorized to mutate `.ris-state.json`. 

---

## 17. STATE RECONSTRUCTION RULES
If a user accidentally deletes `.tome/architect.md`, running `tome validate` will instantly regenerate it from `.ris-state.json` without costing a single LLM token.

If a user deletes `.tome/.ris-state.json`, the intelligence is lost. A `tome update` will fall back to a `FullRewriteStrategy`, costing API tokens to rebuild the database from scratch.

---

## 18. STATE MIGRATION RULES

### Resolution of Schema Migration (Question F)

**Scenario:** Upgrade from `tome-cli v1.0` (Schema v1.0) to `tome-cli v2.0` (Schema v2.0).
1.  User runs `tome update` using the new CLI.
2.  CLI detects `tome_schema_version: "1.0"` in `.ris-state.json`.
3.  CLI pauses extraction.
4.  CLI executes the local migration script `migrations/v1_to_v2.ts`.
5.  The script mutates `.ris-state.json` in memory (e.g., renaming `businessRules` to `domainRules`).
6.  CLI writes the migrated `.ris-state.json`.
7.  CLI proceeds with standard `tome update` extraction loop.

---

## 19. STATE VERSIONING RULES
The state version is bound to the ToMe Core engine version. `.ris-state.json` always stamps its schema version in the root JSON node.

---

## 20. STATE CONSISTENCY RULES
The serialization phase (`.ris-state.json` -> `.md`) operates in an atomic transaction. Either all 5 files are written successfully, or none are. Temporary files (`.tome/tmp_architect.md`) are written first, then renamed.

---

## 21. CONFLICT RESOLUTION FRAMEWORK
If an LLM hallucination (`Confidence: 0.9`) conflicts with a Human Assertion (`Confidence: 1.0`), the Human Assertion wins. The LLM claim is discarded.
If two LLM claims conflict (e.g., Service A claims it owns Capability X, Service B claims it owns Capability X), the Claim with denser Evidence Edges wins.

---

## 22. GARBAGE COLLECTION STRATEGY

### Resolution of Orphaned Claims (Question G)

*   **Rule:** When a Claim becomes `ORPHANED` (0 valid evidence edges), it is kept in `.ris-state.json` for **3 update cycles**.
*   **Why:** The user might be doing a temporary Git branch checkout. We do not want to delete memory because of a transient Git state.
*   **Execution:** On the 4th `tome update` where the claim is still `ORPHANED`, the Garbage Collector physically deletes the Claim from `.ris-state.json`.

---

## 23. BACKUP AND RECOVERY STRATEGY
Before any mutation to `.ris-state.json`, the CLI copies it to `.tome/.ris-state.backup.json`. If a fatal LLM failure or unhandled exception crashes the CLI, the next run restores the backup automatically.

---

## 24. LOCAL STORAGE ARCHITECTURE

The `.tome/` directory final layout:
```text
.tome/
  architect.md         (Human UI)
  memory.md            (Human UI)
  guardrails.md        (Human UI)
  recover.md           (Human UI)
  walkthrough.md       (Human UI)
  .ris-state.json      (Canonical Database)
  .ris-state.backup    (Recovery file)
```

---

## 25. MULTI-VERSION COMPATIBILITY STRATEGY
If a teammate using `tome-cli v1.0` pulls `.tome/` generated by a teammate using `tome-cli v2.0`, the CLI throws a fatal `VersionMismatchError` and instructs the user to upgrade their CLI. Downgrade migrations are NOT supported.

---

## 26. FUTURE CLOUD SYNCHRONIZATION STRATEGY
In Phase 3 (Monetization), the local `.ris-state.json` acts as the local cache. When the `tome update` finishes, the engine simply pushes the raw JSON payload to the `api.tome.dev` synchronization endpoint, achieving cloud syncing with zero complex diff logic required on the backend.

---

## 27. STATE INTEGRITY VALIDATION
Upon CLI initialization, `Zod` validates `.ris-state.json`. If a developer manually opened the JSON file and corrupted it, the engine throws a `StateCorruptionError` and falls back to a Full Rewrite.

---

## 28. STATE CHECKSUMS
The state utilizes three checksums:
1. `CodeChecksum`: Hash of the physical repository (excludes `.tome/` and `.gitignore`).
2. `RISChecksum`: Hash of the `.ris-state.json` object.
3. `MarkdownChecksum`: Hash of the exact layout of the 5 Markdown files.

---

## 29. STATE SNAPSHOTS

### Resolution of Full Rewrite Strategy (Question E)

**What survives a complete rewrite?**
When a `FullRewriteStrategy` is executed:
1.  All `OBSERVED` structural facts are purged.
2.  All `LLM_INFERRED` claims are purged.
3.  **All `HUMAN_ASSERTED` claims are preserved.** They are temporarily held in RAM.
4.  The entire codebase is parsed from scratch. New RIS is built.
5.  The preserved `HUMAN_ASSERTED` claims are merged back into the new RIS by matching Claim IDs.

**What survives 100 updates? (Question D)**
`HUMAN_ASSERTED` claims survive permanently until explicitly deleted by the user.

### Human Edit Preservation (Question H)
If the structural code node that a `HUMAN_ASSERTED` claim points to is deleted, the claim becomes `ORPHANED_HUMAN`. 
Because it is human, the 3-cycle Garbage Collector **bypasses** it. It is never deleted.
Instead, on the 4th cycle, it is moved to an `archive` state within the JSON and appended to a `> [!NOTE] Historical Legacy` section in `memory.md`, preserving the intelligence without stalling active execution.

---

## 30. FINAL ENGINEERING VERDICT

By establishing `.ris-state.json` as the exclusive canonical database, and treating Markdown strictly as a UI projection layer equipped with bi-directional syncing for human overrides, we have eliminated the dual-source-of-truth hazard that plagues most file-based AI tools.

This architecture guarantees that ToMe can perform complex graph math, evidence tracking, and confidence scoring invisibly, while providing developers with the clean, readable Markdown artifacts they desire. The state model is deterministic, robust, and implementation-ready.
