# TOME_UPDATE_ENGINE_v1

> **[CORPUS PATCH APPLIED]** This document has been patched by `TOME_CORPUS_PATCH_SET_v1` and inherits all definitions from `TOME_ARCHITECTURE_AMENDMENT_v1`.


> **Document Classification:** Intelligence Evolution & Reconciliation Specification  
> **Document Version:** 1.0  
> **Created:** 2026-06-08  
> **Status:** APPROVED UPDATE CONTRACT  
> **Persistence:** PERMANENT  

---

## TABLE OF CONTENTS

1. [Update Philosophy](#1-update-philosophy)
2. [Why Updates Are Hard](#2-why-updates-are-hard)
3. [Update Engine Responsibilities](#3-update-engine-responsibilities)
4. [Update Architecture Overview](#4-update-architecture-overview)
5. [End-to-End Update Lifecycle](#5-end-to-end-update-lifecycle)
6. [State Machine Definitions](#6-state-machine-definitions)
7. [Claim Lifecycle State Machine](#7-claim-lifecycle-state-machine)
8. [Evidence Lifecycle State Machine](#8-evidence-lifecycle-state-machine)
9. [Human Assertion Lifecycle State Machine](#9-human-assertion-lifecycle-state-machine)
10. [Repository Drift Detection](#10-repository-drift-detection)
11. [Change Classification Framework](#11-change-classification-framework)
12. [Diff Analysis Architecture](#12-diff-analysis-architecture)
13. [Structural Drift Analysis](#13-structural-drift-analysis)
14. [Semantic Drift Analysis](#14-semantic-drift-analysis)
15. [Evidence Invalidation Framework](#15-evidence-invalidation-framework)
16. [Dirty Node Detection](#16-dirty-node-detection)
17. [Orphan Detection](#17-orphan-detection)
18. [Contradiction Detection](#18-contradiction-detection)
19. [Human Override Reconciliation](#19-human-override-reconciliation)
20. [Human Assertion Anchoring Strategy](#20-human-assertion-anchoring-strategy)
21. [Markdown Reconciliation Architecture](#21-markdown-reconciliation-architecture)
22. [Artifact Block Identity System](#22-artifact-block-identity-system)
23. [Claim Identity System](#23-claim-identity-system)
24. [Claim Mutation Rules](#24-claim-mutation-rules)
25. [Claim Merge Rules](#25-claim-merge-rules)
26. [Claim Split Rules](#26-claim-split-rules)
27. [Claim Deletion Rules](#27-claim-deletion-rules)
28. [Claim Resurrection Rules](#28-claim-resurrection-rules)
29. [Confidence Recalculation Framework](#29-confidence-recalculation-framework)
30. [Evidence Recalculation Framework](#30-evidence-recalculation-framework)
31. [Provenance Evolution Rules](#31-provenance-evolution-rules)
32. [Suggested Mutation Framework](#32-suggested-mutation-framework)
33. [Incremental Update Strategy](#33-incremental-update-strategy)
34. [Full Rewrite Strategy](#34-full-rewrite-strategy)
35. [Update Transactions](#35-update-transactions)
36. [Atomicity Guarantees](#36-atomicity-guarantees)
37. [Rollback Architecture](#37-rollback-architecture)
38. [Failure Recovery](#38-failure-recovery)
39. [Update Performance Targets](#39-update-performance-targets)
40. [Future Enterprise Evolution](#40-future-enterprise-evolution)
41. [Final Engineering Verdict](#41-final-engineering-verdict)

---

## 1. UPDATE PHILOSOPHY

Intelligence that does not evolve is technically debt. The purpose of the Update Engine is to continuously synchronize ToMe's Repository Intelligence State (RIS) with the physical reality of the codebase without destroying accumulated human wisdom. Updates must be surgical, deterministic, and fiercely protective of manual overrides.

## 2. WHY UPDATES ARE HARD

Updating a semantic graph is infinitely harder than extracting it.
*   **The Drift Problem:** Code moves, filenames change, but the underlying business intent remains identical.
*   **The Overwrite Problem:** LLMs naturally want to overwrite everything with fresh inferences, destroying manual edits.
*   **The Identification Problem:** If the LLM generates a new list of Capabilities, mapping them to the *existing* Capabilities to update them (rather than duplicating them) requires advanced identity resolution.

## 3. UPDATE ENGINE RESPONSIBILITIES

1. Preserve `HUMAN_ASSERTED` claims.
2. Invalidate stale evidence.
3. Detect structural code diffs.
4. Patch the RIS graph via incremental LLM calls.
5. Guarantee atomic disk writes.

## 4. UPDATE ARCHITECTURE OVERVIEW

The Update Engine operates as a Reconciliation Loop between three actors:
1. **The Codebase:** The source of structural truth.
2. **The RIS (`.ris-state.json`):** The source of semantic truth.
3. **The Artifacts (`*.md`):** The source of human manual truth.

## 5. END-TO-END UPDATE LIFECYCLE

1. **Intake Phase:** Read `.ris-state.json` and `*.md` files.
2. **Reconciliation Phase:** Map Markdown edits back to the RIS.
3. **Diff Phase:** Parse the codebase and calculate the Structural Graph Diff.
4. **Invalidation Phase:** Mark RIS claims as `DIRTY` if their underlying structure changed.
5. **Extraction Phase:** Ask the LLM to recalculate ONLY the `DIRTY` claims.
6. **Merge Phase:** Reattach recalculated claims to the RIS.
7. **Commit Phase:** Atomically write `.ris-state.json` and `.md` files to disk.

---

## 6. STATE MACHINE DEFINITIONS

The intelligence graph relies on strict state machines to manage decay and trust.

### 7. CLAIM LIFECYCLE STATE MACHINE
*   `GENERATED`: Freshly minted by the LLM.
*   `VALIDATED`: Confirmed by structural evidence bounds.
*   `DIRTY`: Structural evidence was modified; requires LLM re-check.
*   `RECALCULATING`: Currently in the LLM execution pipeline.
*   `ORPHANED`: Structural evidence was deleted. Claim is likely false.
*   `ARCHIVED`: Preserved for historical context but inactive.
*   `DELETED`: Physically removed from the JSON.

### 8. EVIDENCE LIFECYCLE STATE MACHINE
*   `ACTIVE`: Edge perfectly links a Claim to an existing Structural Node.
*   `SEVERED`: The Structural Node no longer exists.
*   `CONTRADICTED`: New code contradicts the edge's premise.

### 9. HUMAN ASSERTION LIFECYCLE STATE MACHINE
*   `ASSERTED`: Human overrode LLM text.
*   `ANCHORED`: Bound successfully to the RIS semantic tree.
*   `ORPHANED_HUMAN`: The underlying code vanished, but the human claim is preserved.
*   `CHALLENGED`: LLM found conflicting evidence but is forbidden from modifying the claim.

---

## 10. REPOSITORY DRIFT DETECTION

The Engine calculates drift by comparing the current AST structure to the `RepositoryModel` snapshot from the previous run. It generates a `StructuralDiff`.

## 11. CHANGE CLASSIFICATION FRAMEWORK
1. **Minor Change:** Edits within function bodies. (Ignored by ToMe).
2. **Structural Change:** Added/Removed methods, changed signatures. (Triggers Partial Update).
3. **Topological Change:** Added/Removed files, moved directories. (Triggers Sub-Graph Update).
4. **Massive Refactor:** >20% topological churn. (Triggers Full Rewrite).

## 12. DIFF ANALYSIS ARCHITECTURE
Using Git diffs is insufficient because a file rename in Git looks like a delete + create, which breaks graph edges. The Engine uses AST signature hashing to detect moves and renames, preserving Evidence Edges.

## 13. STRUCTURAL DRIFT ANALYSIS
If `src/auth/login.ts` is moved to `src/auth/session.ts`, the Structural Node ID is updated, and all `EvidenceEdges` pointing to it are re-pointed without marking the parent claims as `DIRTY`.

## 14. SEMANTIC DRIFT ANALYSIS
If the structural diff is a new imported dependency (e.g., `npm install redis`), the Engine marks the `Domain` Node containing that file as `DIRTY` because the semantic context (Tech Stack) has shifted.

---

## 15. EVIDENCE INVALIDATION FRAMEWORK
When a `StructuralNode` is physically deleted (and not renamed), all connected `EvidenceEdges` enter the `SEVERED` state. 

## 16. DIRTY NODE DETECTION
A `Claim` becomes `DIRTY` if >0 but not all of its `EvidenceEdges` are `SEVERED` or modified. The LLM must re-evaluate if the Claim still holds true.

## 17. ORPHAN DETECTION
A `Claim` becomes `ORPHANED` if 100% of its `EvidenceEdges` are `SEVERED`. 

## 18. CONTRADICTION DETECTION

### Resolution to Question F
If Human Assertion says: "We use Redis."
Codebase shows: Redis completely removed.
*   **Behavior:** The Engine cannot delete the `HUMAN_ASSERTED` claim. It transitions the claim to `CHALLENGED`. 
*   **Action:** It generates a `SuggestedMutation` payload.
*   **UI:** The artifact serializer renders the human text, but appends a GitHub warning: `> [!WARNING] ToMe found evidence contradicting this manual assertion. (No Redis dependencies detected).`

---

## 19. HUMAN OVERRIDE RECONCILIATION

### Resolution to Question C: Markdown Reconciliation
Markdown files are plain text. When a user edits `memory.md`, how does ToMe know which Claim they edited?

**The Artifact Block Identity System**
During serialization, the `MemorySerializer` appends an invisible HTML comment to the end of every markdown block (heading/paragraph pair).
```markdown
### 1. Authentication Domain
Handles user registration and login.
<!-- tome-claim-id: uuid-1234-5678 -->
```
During `tome update`:
1. The parser splits the Markdown by these invisible IDs.
2. It hashes the text.
3. If the text hash differs from the hash stored in `.ris-state.json` for `uuid-1234-5678`, ToMe triggers the override.
4. The text block is pushed into the RIS Claim value, marked `HUMAN_ASSERTED`.

---

## 20. HUMAN ASSERTION ANCHORING STRATEGY

### Resolution to Question B
Claim IDs are fragile across `FullRewriteStrategy` events. If we rebuild the RIS from scratch, UUIDs change. How do human assertions survive?

**Semantic Anchors**
When a claim becomes `HUMAN_ASSERTED`, it is assigned a deterministic Semantic Anchor path based on the RIS taxonomy:
`[ArtifactType] : [EntityName] : [AttributeName]`
*Example:* `architect.md : Domain(Billing) : Capability(Charge)`

During a Full Rewrite, the Engine holds all Human Assertions in RAM. Once the new RIS is generated, it applies the Human Assertions by matching the Semantic Anchors to the new RIS nodes, restoring the manual edits perfectly.

---

## 21. MARKDOWN RECONCILIATION ARCHITECTURE
(See Section 19).

## 22. ARTIFACT BLOCK IDENTITY SYSTEM
(See Section 19).

---

## 23. CLAIM IDENTITY SYSTEM

### Resolution to Question A
How is Claim Identity maintained if the LLM changes "Uses Redis" to "Uses Redis and Memcached"?

*   **Rule:** Modification does not destroy identity. The Claim ID remains the same.
*   **Mechanism:** When the LLM is asked to recalculate a `DIRTY` claim, it is passed the existing Claim ID and text. The LLM is instructed to patch the value.
*   **Result:** The value is updated, confidence is recalculated, but the UUID remains stable, preserving cross-artifact links.

## 24. CLAIM MUTATION RULES
LLMs may only mutate `LLM_INFERRED` claims. They may never mutate `HUMAN_ASSERTED` or `OBSERVED` claims.

## 25. CLAIM MERGE RULES
If the LLM detects that two previously separate Services (e.g., `PaymentService` and `SubscriptionService`) have been heavily refactored into a single file, it instructs the Engine to Merge the Claims. The new Claim absorbs the `EvidenceEdges` of both parents.

## 26. CLAIM SPLIT RULES
Conversely, if a monolith file is shattered into microservices, the LLM splits the Domain Claim into multiple child Domains.

## 27. CLAIM DELETION RULES
Claims are never deleted immediately. They sit in the `ORPHANED` state.

## 28. CLAIM RESURRECTION RULES

### Resolution to Question I
If a claim becomes `ORPHANED` (e.g., developer temporarily comments out the Billing code), it sits in `.ris-state.json`. If 2 weeks later the developer uncomments the code, the next `tome update` detects the structural evidence returning. The Engine matches the evidence, and the Claim is resurrected from `ORPHANED` back to `VALIDATED`.
*Constraint:* Resurrection is only possible within the 3-update Garbage Collection window.

---

## 29. CONFIDENCE RECALCULATION FRAMEWORK
When a `DIRTY` claim is recalculated, its confidence score is adjusted based on the new density of Evidence Edges. If evidence was lost, confidence drops.

## 30. EVIDENCE RECALCULATION FRAMEWORK
During an LLM patch, the LLM provides an updated array of `supportingNodes`. The Engine purges the old `EvidenceEdges` for that Claim and instantiates the new ones.

## 31. PROVENANCE EVOLUTION RULES
Mutations push a new `ProvenanceRecord` to the array.
```json
{
  "provenance": [
    { "timestamp": "June 1", "model": "claude-3-5" }, // Original
    { "timestamp": "June 8", "model": "claude-3-5" }  // Recalculated
  ]
}
```

## 32. SUGGESTED MUTATION FRAMEWORK
When the LLM is blocked by a `HUMAN_ASSERTED` claim, it writes a `SuggestedMutation` to `.ris-state.json`. 

---

## 33. INCREMENTAL UPDATE STRATEGY

### Resolution to Question G
*   **Threshold:** If Structural Churn < 20% of files.
*   **Action:** The Engine isolates the `DIRTY` nodes and their immediate neighbors (1 degree of separation).
*   **Extraction:** The LLM is given ONLY the subgraph to patch.
*   **Benefit:** Massive token cost reduction and latency improvement (2-5 seconds).

## 34. FULL REWRITE STRATEGY

### Resolution to Question H
*   **Threshold:** Structural Churn > 20%, or major Domain/Root nodes deleted, or `tome-cli` schema upgrade.
*   **Action:** 
    1. Extract all `HUMAN_ASSERTED` claims to RAM via Semantic Anchors.
    2. Wipe `.ris-state.json`.
    3. Run full extraction pipeline from scratch.
    4. Re-inject `HUMAN_ASSERTED` claims.
*   **Benefit:** Guaranteed cleanup of semantic rot.

---

## 35. UPDATE TRANSACTIONS

### Resolution to Question J
Updates modify three disparate systems: Code, JSON, and Markdown. If the CLI crashes halfway, data corruption occurs.
**Transaction Boundaries:**
1. All calculations occur strictly in RAM.
2. The Engine writes `.tome/.ris-state.tmp.json`.
3. The Engine writes `.tome/tmp_*.md`.
4. If successful, atomic OS-level renames swap the `.tmp` files to the active files.

## 36. ATOMICITY GUARANTEES
An update is binary. It either fully succeeds or it fully aborts. > [!NOTE] **[CORRECTED]** Multi-file transaction atomicity is not guaranteed natively. Guarantees are strictly per-file. `.ris-state.json` is renamed *last*. If the process crashes mid-batch, the `IntegrityValidator` recovers on the next boot by restoring `.ris-state.backup.json` and regenerating inconsistent Markdown.

## 37. ROLLBACK ARCHITECTURE
If an unhandled exception occurs, the Engine aborts and leaves the original `.tome/` directory untouched.
If the JSON state is corrupted by the user manually, the engine detects schema failure on boot and restores from `.ris-state.backup.json`.

## 38. FAILURE RECOVERY
*   **LLM Timeout:** Retries 3 times, then safely aborts transaction.
*   **Diff Engine Crash:** Falls back to Full Rewrite Strategy.

---

## 39. UPDATE PERFORMANCE TARGETS
*   **Incremental Update Latency:** < 5 seconds.
*   **Full Rewrite Latency:** ~45 seconds.
*   **Markdown Reconciliation Hash:** < 50ms.

---

## 40. FUTURE ENTERPRISE EVOLUTION
In Phase 8, the Update Engine will be embedded into CI/CD pipelines (e.g., GitHub Actions). `tome update` will run automatically on every Pull Request, generating a semantic diff for code reviewers: "This PR modifies the Authentication Capability and introduces 2 new Failure Modes."

## 41. FINAL ENGINEERING VERDICT

The Update Engine is the most complex component of ToMe. By establishing invisible HTML comment tracking for Markdown reconciliation, Semantic Anchoring for Full Rewrites, and strict State Machines for Evidence decay, we guarantee that ToMe's intelligence will cleanly evolve with the codebase.

Most importantly, the architecture explicitly defends the primacy of the Developer. Through the `HUMAN_ASSERTED` and `SuggestedMutation` frameworks, ToMe behaves as a respectful pair programmer that never silently overwrites human knowledge.
