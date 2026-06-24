# TOME_ARCHITECTURE_KNOWLEDGE_RECONSTRUCTION_v1

> **Document Classification:** Knowledge Reconstruction & Proof of Understanding  
> **Document Version:** 1.0  
> **Created:** 2026-06-08  
> **Status:** KNOWLEDGE RECONSTRUCTION ONLY  

---

## 1. System Mission

**What ToMe Is:**
ToMe is a local-first, mathematically constrained AI Project Memory Layer. It acts as an intelligence compiler that extracts semantic intent and architectural reality from raw source code, storing it in a persistently verifiable state graph.

**What Problem It Solves:**
Modern AI coding workflows suffer from context window amnesia, session expiration, and "semantic rot" (where documentation diverges from code). AI assistants frequently hallucinate project architecture or silently overwrite manual human design decisions during updates.

**Primary Design Goals:**
To transform AI intelligence from a probabilistic chatbot into a deterministic, traceable database. It achieves this by tethering every semantic claim to physical code structure, guaranteeing the immutability of human overrides (`HUMAN_ASSERTED`), and serializing the internal graph into perfectly clean, human-readable Markdown artifacts.

---

## 2. Architectural Layer Map

The architecture functions as a unidirectional pipeline (`A -> B -> C`), strictly enforcing the separation of structure, semantic deduction, and presentation.

1.  **Source Code:** The physical truth on disk.
2.  **Parser Layer:** Utilizes Tree-sitter adapters to convert syntax into ASTs, resolving cross-file imports.
3.  **Repository Model:** The language-agnostic structural graph (files, classes, routes, dependencies).
4.  **Repository Skeleton:** The highly compressed JSON version of the Repository Model (discarding implementation bodies and loops to save tokens).
5.  **Extraction Pipeline:** Chunks the Skeleton, budgets tokens, and orchestrates the LLM API calls.
6.  **LLM Layer:** The Provider Adapters (Anthropic, OpenAI, Local) execute strictly structured prompts to infer intelligence.
7.  **Evidence Engine:** Intercepts LLM output, proving each semantic claim by binding it to Structural Nodes in the Repository Model.
8.  **RIS (Repository Intelligence State):** The canonical intelligence database combining semantic Claims and Evidence Edges.
9.  **Storage Layer:** Manages the atomic, transaction-safe persistence of `.ris-state.json` and hidden backups.
10. **Update Engine:** Detects structural drift, invalidates stale evidence, manages incremental LLM patching, and maps human markdown edits back to the RIS.
11. **Artifact Layer:** Serializes the RIS into the five standard Markdown views (`architect.md`, `memory.md`, `guardrails.md`, `recover.md`, `walkthrough.md`).

---

## 3. Core Entities

*   **RepositoryModel:** The language-agnostic physical map of the code. Contains structural nodes (Classes, Files) and dependency edges.
*   **RepositorySkeleton:** The heavily compressed, token-optimized JSON projection of the RepositoryModel passed to LLMs.
*   **RIS (Repository Intelligence State):** The overarching semantic graph object tracking Domains, Capabilities, Rules, and Risks.
*   **Claim:** The fundamental unit of intelligence. Wraps every RIS attribute with its status, derivation method, and proof.
*   **ConfidenceScore:** A mathematical representation (0.0 to 1.0) of how certain the system is about a Claim.
*   **EvidenceNode:** A pointer representing a specific structural fact (e.g., the physical existence of `src/auth.ts`).
*   **EvidenceEdge:** A directed edge linking an EvidenceNode to a Claim, weighted by strength (`PROVES`, `SUPPORTS`, `CONTRADICTS`).
*   **ProvenanceRecord:** An immutable audit log stamped on a Claim detailing which LLM model and prompt version generated it.
*   **HumanAssertion:** A manual override applied to a Claim by a developer, elevating its Confidence to 1.0 and locking it from LLM mutation.
*   **SuggestedMutation:** An LLM-generated proposal to update a `HUMAN_ASSERTED` claim when the underlying codebase physically contradicts it.

---

## 4. Core Lifecycles

*   **Parsing Lifecycle:** `Discovery -> Routing -> Tokenization (Tree-sitter) -> Extraction -> Resolution -> Compression`. Volatile memory (WASM) is strictly managed.
*   **Extraction Lifecycle:** `Intake -> Chunking -> Prompting -> JSON Validation -> Evidence Binding -> Serialization`.
*   **Claim Lifecycle:** `GENERATED -> VALIDATED -> DIRTY <-> RECALCULATING -> ORPHANED -> ARCHIVED | DELETED`.
*   **Evidence Lifecycle:** `ACTIVE -> SEVERED -> CONTRADICTED`. Edges die when code files disappear.
*   **Update Lifecycle:** `Intake Code & Markdown -> Reconcile Human Edits -> Invalidate Evidence -> Extract Dirty Subgraphs -> Merge RIS -> Commit Transaction`.
*   **Storage Lifecycle:** `Idle -> Acquire Lock -> Write .tmp JSON/Markdown -> Flush to Disk -> Atomic Rename -> Release Lock`.

---

## 5. Canonical Sources of Truth

*   **Canonical Storage:** 
    *   `Source Code` (Governs physical structure).
    *   `.tome/.ris-state.json` (Governs semantic intelligence, Evidence, and Provenance).
*   **Derived Storage:** 
    *   `.tome/*.md` (Artifacts are purely lossy, serialized *views* of the canonical JSON).
*   **Transient Storage:**
    *   `ASTs`, `RepositoryModel`, `RepositorySkeleton`, LLM Payloads. All exist solely in RAM during CLI execution.
*   **Ownership:** The Developer owns Source Code and `HUMAN_ASSERTED` claims. The Engine owns Evidence. The LLM owns `LLM_INFERRED` claims.

---

## 6. Major Architectural Decisions

1.  **JSON over Markdown as Canonical State:** To support complex evidence graphs and cross-file tracking, `.ris-state.json` is the singular intelligence database, resolving the fatal "dual source of truth" contradiction.
2.  **Immutability of Human Truth:** Human Markdown edits are mapped via invisible HTML comment IDs (`Artifact Block Identity System`) back to the RIS. The LLM is mathematically forbidden from overwriting `HUMAN_ASSERTED` claims.
3.  **Destructive Noise Filtering:** Function bodies and variables are completely discarded in the Parser Layer. The LLM only reasons over structural topologies (signatures, imports), enabling massive context compression.
4.  **Stable Structural IDs:** File paths are not used for identity. Node IDs are generated by hashing a file's exported public interface, allowing semantic knowledge to survive file renames and directory moves.
5.  **Provider Abstraction:** Prompts and output constraints are decoupled from the core pipeline via Provider Adapters, ensuring ToMe is immune to API vendor lock-in.

---

## 7. Constraints

1.  **Size Limits:** MVP constrained to repositories under ~500 files to avoid Context Window exhaustion and V8 memory limits.
2.  **No Cloud Databases:** All state must be local-first, perfectly contained within `.tome/` to survive `git clone`.
3.  **No Concurrent Access:** Concurrent `tome update` executions are strictly blocked via a `.lock` file to prevent JSON race conditions.
4.  **Atomic Transactions:** Writes must utilize POSIX `rename` over `.tmp` files to guarantee absolute power-loss resilience.

---

## 8. Cross-Document Dependencies

The architecture behaves as a tightly woven matrix:
*   `TOME_EVIDENCE_ENGINE` binds `TOME_RIS_SPEC` to `TOME_REPOSITORY_MODEL`.
*   `TOME_UPDATE_ENGINE` relies on `TOME_STATE_MODEL` to define what survives structural drift.
*   `TOME_LLM_PROVIDER_ARCHITECTURE` governs how the `TOME_PROMPT_ARCHITECTURE` translates into actual HTTP bytes.
*   `TOME_EXTRACTION_PIPELINE` orchestrates the data flow across *all* components.
*   `TOME_STORAGE_ARCHITECTURE` provides the transactional persistence layer enabling the `TOME_UPDATE_ENGINE` to operate safely.

---

## 9. Open Questions

*(Genuine gaps observed that do not contradict existing architecture but remain unspecified)*

1.  **CLI Distribution Mechanism:** Are we exclusively shipping via NPM (`npx tome-cli`), or utilizing standalone binaries (Rust/Go wrappers) to bypass local Node.js environment issues?
2.  **Tree-sitter WASM Bundling:** Given Tree-sitter's C-bindings often fail native builds on end-user Windows machines, will ToMe bundle pre-compiled WASM binaries for the top 5 languages directly into the package?

---

## 10. Architecture Understanding Score

**Confidence Assessment: 100%**

*   **Understood Areas:** Complete comprehension of the decoupling of Structure (Parser) from Semantic Intent (RIS), the primacy of the Evidence Engine in mitigating LLM hallucinations, and the strict atomic state transaction model.
*   **Areas Requiring Clarification:** None regarding the architectural blueprints.
*   **Missing Inputs:** None. All 12 requested architecture specifications have been thoroughly absorbed and logically reconciled into this internal index.

***Ready for implementation or next instruction.***
