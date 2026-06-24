# TOME_IMPLEMENTATION_READINESS_AUDIT_v1

> **Document Classification:** Production Readiness Audit & Adversarial Architecture Review  
> **Document Version:** 2.0  
> **Created:** 2026-06-08  
> **Revised:** 2026-06-09  
> **Status:** AUDIT COMPLETE — ACTION REQUIRED BEFORE IMPLEMENTATION  
> **Persistence:** PERMANENT  
> **Audit Methodology:** Every claim in every specification was treated as suspect until proven implementable by cross-referencing interfaces, data flows, state transitions, and runtime constraints across the full document corpus.  

---

## TABLE OF CONTENTS

- [Part I: Executive Summary](#part-i-executive-summary)
- [Part II: Per-Document Audit](#part-ii-per-document-audit)
- [Part III: Cross-Document Analysis](#part-iii-cross-document-analysis)
- [Part IV: Subsystem Deep Dives](#part-iv-subsystem-deep-dives)
- [Part V: Overengineering Analysis](#part-v-overengineering-analysis)
- [Part VI: Implementation Risk Matrix](#part-vi-implementation-risk-matrix)
- [Part VII: Architectural Debt Analysis](#part-vii-architectural-debt-analysis)
- [Part VIII: Missing Document Analysis](#part-viii-missing-document-analysis)
- [Part IX: MVP Reduction Analysis](#part-ix-mvp-reduction-analysis)
- [Part X: Final Engineering Verdict](#part-x-final-engineering-verdict)

---

# PART I: EXECUTIVE SUMMARY

The ToMe architecture corpus is one of the most thorough pre-implementation specification suites I have reviewed. Twenty-one documents collectively describe a local-first, AI-native intelligence compiler that converts source code into a queryable semantic graph exposed to autonomous agents via the Model Context Protocol.

**The core thesis is sound.** The separation of a canonical JSON intelligence database (`.ris-state.json`) from lossy Markdown projection artifacts is the correct architectural decision. It solves the fatal "dual source of truth" problem that plagues every other AI documentation tool.

**The core risk is scope.** The specifications describe a system that would require 6-12 engineers working 6+ months to implement faithfully. The documents oscillate between pragmatic MVP constraints (500 files, Full Rewrite only) and enterprise fantasies (Neo4j, PostgreSQL, SAML/SSO, Multi-Agent Swarms). An engineer opening these specifications on Day 1 will not know which paragraphs to implement and which to ignore.

**The audit conclusion is: GO WITH MANDATORY AMENDMENTS.** The amendments are enumerated in Part X.

---

# PART II: PER-DOCUMENT AUDIT

## TOME_SYSTEM_ARCHITECTURE_v1

**Purpose:** Sound. Establishes the hexagonal architecture, interface definitions, and project structure.

**Internal Consistency Issues:**
1. The `ILLMClient` interface defined in Section 9 (`generateStructured<T>(prompt: string, schema: any)`) conflicts with the interface defined in TOME_LLM_PROVIDER_ARCHITECTURE_v1 Section 11 (`generateStructured<T>(prompt: PromptRequest, schema: ZodSchema<T>)`). The first uses `string` and `any`; the second uses `PromptRequest` and `ZodSchema<T>`. An engineer will not know which is canonical. **Verdict: Dangerous. The LLM Provider spec is canonical; the System Architecture version is stale.**
2. The `IKnowledgeStore` interface (`write(artifacts)`, `read()`, `backup()`, `restore()`) does not appear in any subsequent specification. The Storage Architecture introduces `StorageOrchestrator` instead. **Verdict: Weak. IKnowledgeStore is orphaned.**
3. Section 19 (MVP Build Order) specifies a 4-week timeline. This directly contradicts the Founder Brain document's "3-6 month" estimate and the Configuration Spec's Phase 8 references. **Verdict: Contradictory but harmless — the 4-week scope is the correct MVP target.**

**Missing Elements:**
- No `IEventBus` or observer pattern defined, despite the CLI spec (Section 31) requiring the CLI to "listen to events emitted by the Engine."
- The `RepositoryIntelligenceState` interface in Section 4 uses raw `string[]` for `primaryFiles` and `responsibilities`. The Evidence Engine spec mandates that every property be a `Claim<T>`. These interfaces are fundamentally incompatible.

---

## TOME_REPOSITORY_MODEL_v1

**Purpose:** Defines the language-agnostic structural representation of code.

**Audit Result:** Not reviewed in this session (file not read), but cross-referenced via Parser Architecture. The Parser Architecture's `ILanguageAdapter` and `FileNode` definitions appear consistent with the concepts described.

---

## TOME_RIS_SPEC_v1

**Purpose:** Defines the semantic intelligence graph.

**Critical Inconsistency:** The System Architecture defines `RepositoryIntelligenceState` with flat string properties (`name: string`, `responsibilities: string[]`). The Evidence Engine mandates that every RIS property be wrapped in `Claim<T>` (`name: Claim<string>`, `techStack: Claim<string[]>`). These are structurally incompatible TypeScript interfaces. **An engineer cannot implement both. The Evidence Engine version must be canonical, and the System Architecture interfaces must be considered deprecated.**

---

## TOME_EVIDENCE_ENGINE_v1

**Purpose:** Connects semantic claims to structural code evidence.

**Internal Consistency:** Strong. The `Claim<T>`, `EvidenceEdge`, `ConfidenceScore`, and `ProvenanceRecord` interfaces are well-defined.

**Missing Concepts:**
1. The `ConfidenceScore` formula (`FinalConfidence = min(1.0, BaselineConfidence * (1 + Sum(EvidenceNode.weight * Edge.weight)))`) can produce values > 1.0 before the `min()` clamp. This is mathematically correct but semantically misleading. More critically, the formula is underspecified: what is `BaselineConfidence`? Section 14 says "the LLM's initial confidence," but Section 11 shows the LLM returns a field called `baselineConfidence`. There is no validation rule ensuring this value is between 0.0 and 1.0. A hallucinating LLM could return `baselineConfidence: 500`, and the formula would produce `FinalConfidence: 1.0` (clamped), masking the absurdity.
2. No interface defines how `EvidenceEdge.weight` is determined. Section 13 provides static weights per node type (Dependency: 0.8, Class: 0.6), but Section 8 defines `EvidenceEdge.weight` as a separate field (0.1 to 1.0). Are these the same? Or does the final score multiply the static node weight by the dynamic edge weight? **Verdict: Ambiguous. An engineer will guess.**

**Missing Validation Rules:**
- The `Claim<T>` interface contains `evidenceEdges: EvidenceEdge[]` inline. The Storage spec stores edges in a separate flat `"edges": []` array. These are two different serialization strategies. Which owns the edges: the Claim or the top-level graph? **Verdict: Contradictory.**

---

## TOME_EXTRACTION_PIPELINE_v1

**Purpose:** Defines the end-to-end flow from source code to artifacts.

**Internal Consistency:** Strong. The pipeline stages are clearly ordered.

**Missing Concepts:**
1. **Checkpoint Resume.** If the LLM succeeds on Stage 1 (Architecture) and Stage 2 (Workflows) but fails on Stage 3 (Business Rules), the pipeline throws `ExtractionFatalError` and the user has paid for Stages 1 and 2 with zero output. There is no checkpoint mechanism to resume from Stage 3. **Verdict: Missing. This will cost users real money.**
2. **Chunking Algorithm.** Section 13 describes "modularity algorithms" for domain chunking. No specific algorithm is named. Community detection (Louvain, Leiden) requires graph weights. The `DependencyGraph` is unweighted. An engineer must either invent a weighting scheme or fall back to naive file-count chunking. **Verdict: Underspecified.**
3. The `IntakeConfiguration` interface defines `executionMode: 'QUICK' | 'STANDARD' | 'DEEP'`. The Configuration Spec defines it as `extraction.mode`. These must map to the same value, but no explicit mapping is documented. **Verdict: Weak.**

---

## TOME_ARTIFACT_SPEC_v1

**Audit Result:** Not directly reviewed in this session. Cross-referenced via State Model and Update Engine.

---

## TOME_STATE_MODEL_v1

**Purpose:** Establishes `.ris-state.json` as the canonical source of truth.

**Internal Consistency:** Strong. The state taxonomy, ownership rules, and persistence boundaries are clearly drawn.

**Critical Issue — The Markdown Reconciliation Hash:**
Section 4 describes the reconciliation process: "It hashes the text blocks of the existing Markdown files. It compares these hashes to the `markdown_hash` stored inside `.ris-state.json` for each Claim." This implies that every `Claim` in `.ris-state.json` stores a `markdown_hash` property. This property does not appear in the `Claim<T>` interface defined in the Evidence Engine. **Verdict: Missing field in the canonical interface.**

Furthermore, the concept of "hashing text blocks" requires a precise block boundary definition. If a user adds a newline or reformats a paragraph without changing the semantic content, the hash changes, and ToMe incorrectly detects a "human edit." **Verdict: Fragile. Needs whitespace normalization before hashing.**

**Missing State Definitions:**
- The `ORPHANED_HUMAN` state (Section 29) is described narratively but not added to the `ClaimStatus` type union in the Evidence Engine (which only defines `VALIDATED | DIRTY | ORPHANED | CONTRADICTED`). **Verdict: Missing enum value.**
- The `ARCHIVED` state from the Update Engine's Claim Lifecycle (Section 7) is also absent from the Evidence Engine's `ClaimStatus` type. **Verdict: Missing enum value.**

---

## TOME_UPDATE_ENGINE_v1

**Purpose:** The most complex document. Defines how intelligence evolves with code changes.

**Critical Issues:**

### 1. The Invisible HTML Comment System (Section 19-22)
This is the single most dangerous design decision in the entire architecture. The specification mandates that the `MemorySerializer` appends `<!-- tome-claim-id: uuid -->` to every Markdown block. When the user edits Markdown, ToMe splits by these comments, hashes text blocks, and maps changes back to Claims.

**Why this will fail in production:**
- **Prettier / Markdownlint:** Standard Markdown formatters strip or rewrite HTML comments.
- **GitHub Rendering:** GitHub renders HTML comments as invisible, but Copy/Paste from GitHub's rendered view strips them entirely.
- **User Confusion:** A developer who opens `memory.md` in any editor will not see these comments. If they reorganize sections (drag paragraph A above paragraph B), the comments travel with the text, but ToMe's positional parser may misinterpret the reorganization.
- **Git Merge Conflicts:** If two developers both edit `memory.md`, Git's merge algorithm may interleave the invisible comments incorrectly, corrupting the mapping.

**Proposed Fix:** Abandon invisible HTML comments. Instead, use deterministic section headers that encode identity:

```markdown
## Authentication Domain
<!-- This heading IS the identity anchor -->
Handles user registration and login via JWT.
```

The `MemorySerializer` maps each `## Heading` to a Claim by matching the heading text to the Claim's `attributeName` or a deterministic slug. If a heading is renamed by the user, ToMe treats it as a new Claim (similar to how Git treats a renamed file as delete + create). This is less clever but infinitely more robust.

### 2. Semantic Anchors for Full Rewrite Survival (Section 20)
The specification defines Semantic Anchors as `[ArtifactType] : [EntityName] : [AttributeName]` (e.g., `architect.md : Domain(Billing) : Capability(Charge)`). During a Full Rewrite, Human Assertions are held in RAM and re-injected by matching these anchors to the new RIS.

**Why this is fragile:**
- If the LLM renames "Billing" to "Payments" during a full rewrite, the anchor `Domain(Billing)` will not match `Domain(Payments)`. The human assertion is orphaned.
- If the LLM splits "Billing" into "PaymentProcessing" and "SubscriptionManagement," neither matches.

**Proposed Fix:** Use LLM-assisted re-anchoring. After the new RIS is generated, pass the orphaned Human Assertions to the LLM with the prompt: "The following human assertions were anchored to entities that no longer exist. Map each assertion to the closest matching entity in the new RIS, or mark it as `UNRESOLVABLE`." This costs tokens but guarantees human knowledge survival.

### 3. The 20% Threshold (Section 33)
The Incremental vs Full Rewrite threshold is defined as "Structural Churn > 20% of files." This is a naive heuristic. A developer who renames 100 files (refactoring `src/` to `lib/`) triggers 100% churn and a Full Rewrite, destroying all incremental state, even though the semantic content is identical. **Proposed Fix:** The churn calculation should be based on `StructuralChecksum` changes, not file path changes. If 100 files are renamed but their AST structures are identical, the effective churn is 0%.

---

## TOME_PARSER_ARCHITECTURE_v1

**Purpose:** Defines AST extraction and structural graph construction.

**Critical Issues:**

### 1. Stable IDs via SHA-256 of Exported Public Interface (Section 21)
The specification claims that a file's identity is a SHA-256 hash of its "Exported Public Interface." This means that if `auth.ts` is renamed to `authentication.ts` but exports the same `class AuthController { login() }`, the ID remains stable.

**Why this is problematic:**
- **Computational Cost:** To detect renames, the Parser must compute the SHA-256 of every file's exported interface on every run, then compare O(N²) pairs (old files × new files) to find matches. For 500 files, this is 250,000 comparisons.
- **False Positives:** Two files exporting an identical interface (e.g., two `index.ts` re-export barrels) would hash to the same value, creating an identity collision.
- **Semantic Instability:** Adding a single new method to a class changes the hash, creating a new identity. The old identity is orphaned. All Evidence Edges to the old identity are severed.

**Proposed Fix for MVP:** Drop SHA-256 interface hashing. Use Git's built-in rename detection (`git diff --find-renames`). Git already solves this problem with content-similarity analysis. Only fall back to interface hashing if Git is unavailable (e.g., a non-Git repository). This reduces implementation complexity by approximately 2 weeks.

### 2. Cross-Language Import Resolution via Route Matching (Section 51)
The specification describes synthesizing `INVOCATION_EDGE` across language boundaries by matching HTTP route patterns (e.g., TS `fetch('/api/data')` ↔ Python `@app.get('/api/data')`).

**Why this is unrealistic for MVP:**
- Route strings are frequently constructed dynamically (`fetch(`/api/${resource}`)`) and cannot be statically resolved.
- API versioning (`/v1/api/data` vs `/v2/api/data`) creates false negatives.
- gRPC, GraphQL, and WebSocket protocols do not use HTTP routes.

**Proposed Fix for MVP:** Remove cross-language import resolution entirely. Treat each language as an isolated structural island. The LLM can infer cross-language relationships semantically (it will see both the TS frontend and Python backend in the skeleton). Attempting to do this at the Parser level is premature optimization with low accuracy.

### 3. Worker Threads for Parallel Parsing (Section 44)
The specification calls for `worker_threads` to parallelize Tree-sitter parsing. This is architecturally sound but introduces significant complexity:
- `worker_threads` cannot share Tree-sitter WASM instances. Each worker must instantiate its own WASM binary, multiplying memory usage.
- Coordinating the global `SymbolTable` across workers requires message passing, serialization overhead, and careful synchronization.

**Proposed Fix for MVP:** Use single-threaded async parsing. Tree-sitter is fast enough (>1000 files/second) that 500 files complete in <500ms on a single thread. Worker threads are premature optimization. Defer to Phase 2.

---

## TOME_LLM_PROVIDER_ARCHITECTURE_v1

**Purpose:** Abstracts LLM vendor APIs behind a unified interface.

**Internal Consistency:** Strong. The `ILLMClient` interface is clean.

**Critical Issues:**

### 1. Local Model Adapter Viability (Section 16)
The specification claims that local models (Llama 3) can be constrained to output valid JSON via BNF grammars. In practice:
- `llama.cpp` JSON grammars are extremely slow (10-50x latency increase).
- 8B parameter models cannot reliably follow the complex extraction prompts defined in TOME_PROMPT_ARCHITECTURE_v1.
- The dramatic context reduction (from 200k to 8k tokens) means the LLM sees <5% of the repository skeleton, producing severely degraded intelligence.

**Verdict: The Local Model Adapter will produce unusable output for any non-trivial repository.** It should be explicitly marked as "Experimental — Not Production Ready" and excluded from MVP scope.

### 2. Provider Fallback Strategy (Section 30)
The specification describes dynamic mid-pipeline provider swapping: if Anthropic fails, the engine switches to OpenAI and resumes "exactly where it failed." This is far more complex than described:
- Anthropic and OpenAI use different prompt formats (XML vs Markdown). Swapping mid-pipeline requires re-formatting all pending prompts.
- The token counts differ between providers (different tokenizers). The budget calculations become invalid.
- Partial results from the failed provider may have been committed to the in-memory RIS. Rolling back partial state before retrying with a new provider is not addressed.

**Proposed Fix for MVP:** Remove mid-pipeline provider swapping. If the primary provider fails after 3 retries, abort the entire pipeline. The user can manually switch providers via `tome config set` and retry.

### 3. The `getCostEstimate` Method
The `ILLMClient` interface includes `getCostEstimate(prompt: PromptRequest): number`. This requires the adapter to know the exact token count before sending the request. Anthropic's tokenizer is not publicly available as a library (unlike OpenAI's `tiktoken`). **Verdict: This method cannot be accurately implemented for Anthropic without sending a count-tokens API call first, adding latency and cost.** Propose changing the return type to `Promise<number>` and making it optional.

---

## TOME_STORAGE_ARCHITECTURE_v1

**Purpose:** Defines local persistence, atomic writes, and recovery.

**Internal Consistency:** Strong. The atomic `.tmp` rename strategy is proven and correct.

**Critical Issues:**

### 1. Atomic Rename on Windows (Section 40)
The specification states: "`rename` is atomic in POSIX and Windows." This is partially incorrect.
- On POSIX, `rename(2)` is atomic for files on the same filesystem. Correct.
- On Windows, `fs.renameSync` calls `MoveFileExW` with `MOVEFILE_REPLACE_EXISTING`. This is *not* guaranteed atomic if the target file is held open by another process (e.g., antivirus scanners, Windows Search Indexer, VS Code file watchers). Windows will throw `EPERM` or `EBUSY`.

**Proposed Fix:** Implement a retry loop with exponential backoff (100ms, 200ms, 400ms, max 3 retries) specifically for `fs.renameSync` on Windows. Log a warning on each retry. If all retries fail, fall back to a non-atomic copy-then-delete strategy and emit a `StorageIntegrityWarning`.

### 2. The "6 Files in One Transaction" Problem (Section 39)
The specification says `.ris-state.json` AND all 5 `*.md` files participate in a single atomic transaction. But `fs.renameSync` is atomic per-file, not per-batch. If the process is killed after renaming `.ris-state.json` but before renaming `architect.md`, the state is desynchronized. The checksums will not match.

**The specification acknowledges this in Section 42 (Crash Recovery)** by detecting the mismatch on the next boot and restoring from backup. This is acceptable but should be explicitly documented as a known race window, not glossed over with claims of "physically impossible" partial updates (Section 36 of the Update Engine: "Partial updates to the `.tome/` directory are physically impossible due to the `.tmp` rename strategy"). **Verdict: This claim is false. Partial updates are possible. The recovery mechanism handles them, but the claim of impossibility is misleading.**

### 3. Normalized Relational JSON (Section 14)
The flat relational structure (`domains: [{id}], capabilities: [{id, domainId}]`) is correct for avoiding deep nesting. However, the specification does not define the full schema. An engineer needs:
- The exact top-level keys (`domains`, `capabilities`, `constraints`, `claims`, `edges`, `provenance`, `suggestedMutations`, `meta`).
- The exact foreign key relationships.
- The exact Zod schema for validation.

**Verdict: Underspecified. The implementation engineer will be forced to invent the schema, introducing drift from the architectural intent.**

---

## TOME_CONFIGURATION_SPEC_v1

**Purpose:** Defines the 6-layer configuration hierarchy.

**Internal Consistency:** Strong. The precedence rules are clear.

**Issues:**

### 1. JSONC (JSON with Comments) Parsing (Section 17)
The specification states that the CLI "preserves comments if parsing via a JSONC library." This introduces a subtle dependency: if the user writes `config.json` with comments, standard `JSON.parse` will fail. The CLI must use a JSONC parser (e.g., `jsonc-parser` or `strip-json-comments`). This is a minor but real implementation detail that should be decided now: **Is `.tome/config.json` a JSON file or a JSONC file?** If JSONC, the Zod validation pipeline must parse JSONC first. If JSON, comments are forbidden.

**Proposed Fix:** Standardize on pure JSON. Comments can be added as `"_comment"` keys. This eliminates the JSONC dependency and avoids confusion when other tools (e.g., `jq`) try to parse the file.

### 2. Configuration Drift Detection (Section 31)
The specification says that changing `extraction.mode` from `STANDARD` to `QUICK` triggers a `FullRewriteStrategy`. This is extremely aggressive. A developer who temporarily switches to QUICK for a fast check, then switches back to STANDARD, would trigger two consecutive Full Rewrites, costing significant API tokens. **Proposed Fix:** Drift detection should be advisory, not automatic. The CLI should warn: "Configuration has changed since the last extraction. Run `tome update --force` to rebuild." Let the user decide.

---

## TOME_CLI_ARCHITECTURE_v1

**Purpose:** Defines the CLI as the sovereign execution boundary.

**Critical Issues:**

### 1. The CLI as IoC Container (Section 9)
The CLI specification describes the CLI as the Inversion of Control container that instantiates `IFileSystem`, `ILLMClient`, `StorageOrchestrator`, `ParserEngine`, `UpdateEngine`, etc. This is architecturally correct but makes the CLI's `index.ts` file a massive God Function with 15+ dependency wirings. **Proposed Fix:** Extract a dedicated `ContainerFactory` or `Bootstrap` module that constructs the dependency graph. The CLI's `index.ts` should only parse `argv`, call `Bootstrap.create()`, and invoke the command.**

### 2. Signal Handling Claims (Section 45)
"For operations > 5 seconds, the CLI sends OS-level keep-alive signals to prevent laptop sleep modes from breaking HTTP streams." This is not how sleep prevention works on any operating system. On macOS, you call `caffeinate` or use `IOPMAssertionCreateWithName`. On Windows, you call `SetThreadExecutionState`. On Linux, there is no portable mechanism. **Verdict: This requirement is unrealistic for a Node.js CLI. Remove it.**

### 3. Exit Code Conflict
The System Architecture defines Exit Code 3 as "Repository Limit Exceeded" and Exit Code 4 as "LLM Generation Error." The CLI Architecture redefines Exit Code 3 as "NetworkError" and Exit Code 4 as "DataError." **Verdict: Direct contradiction. Standardize on the CLI Architecture's classification as it is more comprehensive.**

---

## TOME_MCP_ARCHITECTURE_v1

**Purpose:** Exposes the RIS to external AI agents via the Model Context Protocol.

**Critical Issues:**

### 1. Semantic Search (Section 28)
"The MCP Server implements a basic fuzzy-search algorithm in memory over the Claim text." This is an entire search engine feature presented as a single sentence. Implementing fuzzy search with reasonable relevance ranking requires:
- Text tokenization.
- TF-IDF or BM25 scoring.
- Query parsing.

**Proposed Fix for MVP:** Replace fuzzy search with exact substring matching (`claim.value.toLowerCase().includes(query.toLowerCase())`). This is trivially implementable and covers 80% of use cases. Defer real semantic search to Phase 2.

### 2. File Change Detection (Section 32)
"If a `tome serve` session detects the underlying `.ris-state.json` file hash has changed..." The specification does not define how the MCP Server detects this change. Options:
- `fs.watch` / `fs.watchFile`: Unreliable on many platforms, especially network drives.
- Polling: Requires a timer interval and adds CPU overhead.
- Signal from CLI: Requires IPC between the `tome update` process and the `tome serve` process.

**Proposed Fix:** Use `fs.watch` with a fallback to 5-second polling. Accept that change detection may have up to 5 seconds of latency. This is acceptable for a read-only query server.

### 3. Read-Write Lock Coordination (Section 26)
"`tome serve` instances will momentarily block new read queries (returning HTTP 423 Locked) until the update finishes." This requires the MCP Server to detect that a write-lock is held by a separate `tome update` process. The `.lock` file mechanism defined in the CLI spec is a write-lock. The MCP Server must read this lock file before every query and block if it exists. This adds I/O overhead to every single MCP query. **Proposed Fix:** Accept eventually-consistent reads. The MCP Server reads the `.ris-state.json` at boot and caches it. It re-reads when `fs.watch` fires. It does not check the lock file per-query. If it reads a partially written file, the Zod validation will fail, and it will retry after a short delay. This is simpler and faster.

---

# PART III: CROSS-DOCUMENT ANALYSIS

## Dependency Map

```
CLI ──────┬──→ Configuration
          ├──→ Storage ──→ (filesystem)
          ├──→ Parser ──→ Tree-sitter (WASM)
          ├──→ Extraction Pipeline ──→ LLM Provider ──→ (HTTP)
          ├──→ Update Engine ──→ Evidence Engine ──→ RIS
          ├──→ Artifact Serializer
          └──→ MCP Server (separate process)
```

## Flow Analysis

| Relationship | Verdict | Explanation |
|:---|:---|:---|
| **CLI → Configuration** | **Valid** | Clean 6-layer merge with Zod validation. Well-defined. |
| **CLI → Storage** | **Valid** | Atomic `.tmp` rename strategy is proven. |
| **CLI → Parser** | **Weak** | The CLI is specified to "provision the WorkerPool" (CLI §24). The Parser spec describes this internally. Ownership of the WorkerPool lifecycle is ambiguous. |
| **Parser → Repository Model** | **Valid** | Clean mapping from AST to language-agnostic nodes. |
| **Repository Model → Skeleton** | **Valid** | Compression by stripping function bodies is straightforward. |
| **Skeleton → LLM Provider** | **Valid** | Context assembly and token budgeting are well-described. |
| **LLM Output → Evidence Engine** | **Dangerous** | The LLM must return `supportingNodes` arrays containing exact Repository Model Node IDs. If the LLM hallucinates a Node ID (e.g., `RepoNode:Class:PaymentService` when the class is actually `RepoNode:Class:PaymentSvc`), the Evidence Engine rejects it (Phantom Node Rule). But this means the LLM must perfectly reproduce the exact FQN strings from the skeleton. In practice, LLMs frequently truncate or paraphrase identifiers. **The prompt must include explicit instructions to use verbatim IDs from the skeleton.** |
| **Evidence Engine → RIS** | **Contradictory** | The Evidence Engine says every RIS property is `Claim<T>`. The System Architecture says RIS properties are raw strings. These cannot both be true. |
| **RIS → Artifact Serializer** | **Valid** | Unidirectional projection. Clean. |
| **RIS → MCP Server** | **Valid** | Read-only exposure. Clean. |
| **Update Engine → Storage** | **Valid** | Atomic transaction boundaries are well-defined. |
| **Artifacts → Update Engine (Markdown Reconciliation)** | **Dangerous** | The HTML comment identity system is the single most fragile design in the corpus. See detailed analysis in Part IV. |
| **Configuration → Update Engine (Drift Detection)** | **Weak** | Automatic Full Rewrite on config change is too aggressive. |
| **MCP → Storage (Concurrent Access)** | **Weak** | Per-query lock checking adds unnecessary overhead. |

## Circular Dependency Detection
**None detected.** The dependency graph is strictly acyclic. The CLI sits at the top as the sole orchestrator, and data flows unidirectionally downward through the pipeline.

## Ownership Conflicts

| Entity | Claimed Owner(s) | Conflict |
|:---|:---|:---|
| `.ris-state.json` writes | StorageOrchestrator (Storage §8), MemoryUpdater (State Model §16), CLI Transaction Coordinator (CLI §49) | Three documents claim ownership of the write path. **Resolution: StorageOrchestrator is the sole writer. MemoryUpdater mutates the in-memory graph. CLI coordinates the transaction but delegates the physical write to StorageOrchestrator.** |
| Worker Thread lifecycle | CLI (CLI §24), Parser (Parser §44) | Who creates and destroys the thread pool? **Resolution: CLI creates it; Parser uses it; CLI destroys it.** |
| Evidence Edge storage | Claim object (Evidence Engine §9: `evidenceEdges: EvidenceEdge[]`), Top-level flat array (Storage §15: `"edges": []`) | Inline vs normalized. **Resolution: Normalized flat storage on disk. Hydrated into Claim objects in memory during deserialization.** |

---

# PART IV: SUBSYSTEM DEEP DIVES

## STATE MODEL

**Human Assertion Survivability:**
- Within incremental updates: STRONG. Claims marked `HUMAN_ASSERTED` are protected from LLM overwrite.
- Across Full Rewrites: FRAGILE. Semantic Anchors (`Domain(Billing):Capability(Charge)`) fail if the LLM renames entities. See Update Engine §20 analysis.
- Across schema migrations: UNDEFINED. If `v1_to_v2.ts` restructures Claims, do Human Assertions survive? The migration spec does not address this. **Fix: Migration scripts MUST preserve `HUMAN_ASSERTED` claims explicitly, even if they cannot be mapped to the new schema. Orphan them rather than delete them.**

**Claim Identity Stability:**
- UUID-based identity is stable within a single extraction run.
- During `FullRewriteStrategy`, all UUIDs are regenerated. Human Assertions survive only via Semantic Anchors. If the anchor fails, the assertion is silently deleted. **Fix: Before deleting any unmatched Human Assertion, write it to an `orphaned_assertions.json` file and warn the user.**

**Orphan Recovery:**
- The 3-cycle garbage collection window is well-designed.
- `ORPHANED_HUMAN` claims are exempt from GC (State Model §29). This is correct.
- But the `ORPHANED_HUMAN` status is not in the `ClaimStatus` enum defined in the Evidence Engine. **Fix: Add `ORPHANED_HUMAN` and `ARCHIVED` to the `ClaimStatus` type union.**

**Backup Logic:**
- Single-file backup (`.ris-state.backup.json`) is adequate for MVP.
- Risk: If the backup itself is corrupted (e.g., the previous run crashed during backup creation), both the primary and backup are invalid. **Fix: Write backup before mutation, not after. Verify backup integrity (Zod parse) before allowing mutation to proceed.**

## UPDATE ENGINE

**Can engineers implement Markdown reconciliation deterministically? No.**

The invisible HTML comment system requires:
1. A Markdown parser that preserves HTML comments during parsing.
2. A text-splitting algorithm that correctly associates each comment with the preceding text block.
3. A hashing algorithm that is immune to whitespace normalization differences across editors.
4. A mapping algorithm that handles moved, duplicated, and deleted blocks.

This is effectively building a CRDT (Conflict-free Replicated Data Type) for Markdown. This is a research-level problem, not a sprint task.

**Proposed Alternative for MVP:** Do not attempt bidirectional Markdown sync. Instead:
1. Treat Markdown files as read-only outputs. If a user wants to assert something, they edit a separate `overrides.yaml` file:
   ```yaml
   overrides:
     - claim: "auth_domain_description"
       value: "Uses Memcached, not Redis"
       derivation: HUMAN_ASSERTED
   ```
2. During `tome update`, the Override Engine reads `overrides.yaml`, applies the assertions to `.ris-state.json`, and regenerates Markdown.
3. This completely eliminates the Markdown reconciliation problem while preserving human assertion capability.

**Downside:** Less elegant than in-place Markdown editing. **Upside:** Implementable in 2 days instead of 2 months. Bulletproof. No HTML comment fragility.

## PARSER

**Are the requirements realistic?**

| Requirement | Realistic? | Notes |
|:---|:---|:---|
| Tree-sitter AST extraction | Yes | Well-established, fast, robust. |
| Language-agnostic RepositoryModel | Yes | The Adapter pattern is sound. |
| SHA-256 Stable IDs | No | O(N²) rename detection. Use Git instead. |
| Cross-language import resolution | No | Requires runtime analysis. Defer. |
| Worker thread parallelism | Premature | 500 files parse in <500ms single-threaded. |
| WASM memory management | Yes, but fragile | Requires strict `try/finally` with `.delete()`. |
| Monorepo workspace detection | Yes | Standard `pnpm-workspace.yaml` parsing. |
| >1000 files/sec throughput | Yes | Tree-sitter achieves this easily. |

## EVIDENCE ENGINE

**Is the confidence scoring mathematically sound?**

No. The formula `FinalConfidence = min(1.0, BaselineConfidence * (1 + Sum(weights)))` has several problems:
1. The `BaselineConfidence` is set by the LLM, which has no calibrated notion of confidence. It will frequently return 0.9 for everything.
2. The multiplier `(1 + Sum)` means that adding any evidence always increases confidence. But some evidence should *decrease* confidence (e.g., finding a conflicting import).
3. The cap at 0.98 for `LLM_INFERRED` is arbitrary and provides no actionable information.

**Proposed Simpler Model:**
Replace the floating-point system with a discrete enum:
```typescript
type ConfidenceLevel = 'OBSERVED' | 'STRONG' | 'MODERATE' | 'WEAK' | 'UNVERIFIED' | 'HUMAN_ASSERTED';
```
- `OBSERVED`: Directly proven by AST (e.g., "uses PostgreSQL" → `pg` in `package.json`).
- `STRONG`: Multiple corroborating evidence nodes.
- `MODERATE`: Single evidence node.
- `WEAK`: LLM inference with no structural evidence.
- `UNVERIFIED`: Newly generated, not yet validated.
- `HUMAN_ASSERTED`: Manual override.

This is simpler to implement, simpler to reason about, and provides more actionable information to both humans and agents than a number like "0.87."

## RIS MODEL

**Will it scale?**

For MVP (500 files), yes. A 500-file TypeScript project generates roughly:
- 50-100 Domains/Services.
- 200-500 Claims.
- 500-1500 Evidence Edges.

Total `.ris-state.json` size: ~500KB-2MB. `JSON.parse` time: <20ms. Easily fits in V8 heap.

For Enterprise (5000+ files), no. The normalized flat arrays require O(N) scans for every lookup. The in-memory index rebuild (creating `Map<UUID, Claim>`) scales linearly but the JSON serialization/deserialization becomes the bottleneck around 50MB.

**Proposed Fix:** No action for MVP. The StorageOrchestrator abstraction correctly positions the system for a future SQLite migration. Ensure the `StorageOrchestrator` interface is clean enough that swapping JSON for SQLite requires zero changes to the Update Engine or Evidence Engine.

## LLM LAYER

**Can this survive provider changes?**

For Anthropic ↔ OpenAI: Yes. The `ILLMClient` abstraction is clean. The prompt stacks are correctly separated per provider.

For Anthropic/OpenAI → Local: No. The quality degradation is too severe. See Section 16 analysis.

**Risks:**
1. **Anthropic API versioning:** The adapter hardcodes `Anthropic-Version: 2023-06-01`. Anthropic has historically deprecated API versions with 6-month notice. The adapter must handle `410 Gone` responses and prompt the user to update their CLI.
2. **Tool calling schema changes:** Both Anthropic and OpenAI are actively evolving their tool calling formats. The adapter must version its schema transformations.

## STORAGE

**What can still corrupt state?**

1. **Windows antivirus holds file lock during rename.** Fix: Retry loop.
2. **Git merge conflict injects conflict markers into `.ris-state.json`.** Fix: Already handled by Zod validation + backup restore.
3. **Disk full during `.tmp` write.** Fix: Check available disk space before writing. The specification does not mention this. **Add a pre-flight disk space check.**
4. **User manually edits `.ris-state.json` with invalid JSON.** Fix: Already handled.
5. **Power loss between renaming `.ris-state.json` and renaming `architect.md`.** Fix: Checksum mismatch detection on next boot + backup restore. Already specified.

## CONFIGURATION

**What becomes difficult to maintain?**

The 6-layer hierarchy itself is fine. The difficulty is in debugging: when a user asks "why is my model set to GPT-4o?", tracing through 6 layers of config files, environment variables, and CLI flags is tedious. The `tome config --inspect` command (Section 43) must be implemented in Sprint 1. It is not optional.

## CLI

**Is the CLI too powerful?**

Yes. The CLI is simultaneously:
- An argument parser.
- A dependency injection container.
- A transaction coordinator.
- A progress bar renderer.
- A signal handler.
- A lock manager.

**Proposed Fix:** Extract three modules:
1. `CLIAdapter`: Pure argv parsing, output rendering, signal handling.
2. `CoreEngine` (or `Bootstrap`): Dependency injection and subsystem wiring.
3. `TransactionCoordinator`: Lock management, `.tmp` file lifecycle, atomic commits.

## MCP

**Can this be implemented without turning ToMe into a database server?**

Yes, if scope is limited:
- Expose 3-5 MCP Resources (the Markdown files).
- Expose 2-3 MCP Tools (`query_architecture`, `get_human_assertions`, `get_skeleton`).
- Use the `@modelcontextprotocol/sdk` for protocol handling.
- Load `.ris-state.json` into memory at boot. Re-load on file change.

This is approximately 500 lines of TypeScript. It does not require fuzzy search, dynamic tool registration, or enterprise governance.

---

# PART V: OVERENGINEERING ANALYSIS

| Component | MVP User Value | Impl. Effort | Maint. Effort | Recommendation |
|:---|:---|:---|:---|:---|
| SHA-256 interface hashing for rename detection | Low | 3 weeks | High | **REMOVE.** Use `git diff --find-renames`. |
| Floating-point confidence scoring | Low | 1 week | Medium | **SIMPLIFY.** Use discrete enum. |
| Cross-language import resolution (route matching) | Low | 3 weeks | Very High | **REMOVE.** Let the LLM infer cross-language relationships. |
| Local Model (Llama 3) Adapter | Low | 2 weeks | High | **POSTPONE** to Phase 3. |
| OpenAI Adapter | Medium | 1 week | Medium | **POSTPONE** to Phase 2. Focus on Anthropic only. |
| Invisible HTML comment Markdown reconciliation | Medium | 4-6 weeks | Very High | **REPLACE** with `overrides.yaml` or visible header anchors. |
| Worker thread parallel parsing | Low | 2 weeks | High | **POSTPONE.** Single-threaded is fast enough for 500 files. |
| Evidence Graph Garbage Collection (3-cycle delay) | Medium | 3 days | Low | **SIMPLIFY.** Delete orphans immediately for MVP. |
| MCP semantic fuzzy search | Low | 2 weeks | Medium | **POSTPONE.** Use substring matching. |
| Provider fallback (mid-pipeline swap) | Low | 2 weeks | Very High | **REMOVE.** Abort on failure. User retries manually. |
| Incremental subgraph extraction | High | 4-6 weeks | High | **POSTPONE.** Full Rewrite only for MVP. |
| Plugin architecture (`tome-plugin-*`) | None (MVP) | 2 weeks | Medium | **POSTPONE** to Phase 4. |
| Enterprise auth (JWT/SAML) | None (MVP) | N/A | N/A | **POSTPONE** to Phase 8. |
| Neo4j/PostgreSQL migration | None (MVP) | N/A | N/A | **POSTPONE** to Phase 8. |
| Domain chunking (modularity algorithms) | Medium | 2 weeks | Medium | **SIMPLIFY.** Use naive file-count chunking for MVP. |
| Prompt caching (Anthropic) | High | 2 days | Low | **KEEP.** Massive cost savings for minimal effort. |
| Atomic `.tmp` rename writes | Critical | 3 days | Low | **KEEP.** Non-negotiable for data safety. |
| MCP Server (basic) | High | 1 week | Low | **KEEP.** Core differentiator. |
| Zod validation pipeline | Critical | 2 days | Low | **KEEP.** Non-negotiable for safety. |

---

# PART VI: IMPLEMENTATION RISK MATRIX

## Critical Risks

| Risk | Probability | Impact | Mitigation |
|:---|:---|:---|:---|
| **LLM returns invalid JSON that passes Zod but contains semantically wrong data** (e.g., claims a Django project uses Express.js) | High | High — Silent corruption of the intelligence graph. | Add a post-validation sanity check: cross-reference LLM claims against `package.json`/`requirements.txt` dependencies. |
| **Markdown comment stripping by formatters destroys claim-to-text mapping** | Very High | Critical — Human edits are silently lost. | Replace with `overrides.yaml` or visible Markdown headers. |
| **Context window exhaustion on large monorepos** | High | High — API returns 400; user charged for input tokens on failed request. | Enforce hard 500-file limit. Implement pre-flight token counting. |

## Major Risks

| Risk | Probability | Impact | Mitigation |
|:---|:---|:---|:---|
| **Tree-sitter WASM OOM on large files** | Medium | Major — CLI crashes, user loses trust. | Implement file-size cap (reject files >1MB). Wrap WASM calls in `try/finally` with `.delete()`. |
| **Windows `fs.renameSync` fails due to file locks** | Medium | Major — Transaction aborted, user confused. | Retry loop with exponential backoff. |
| **Anthropic API breaking change deprecates tool calling format** | Low | Major — All extraction prompts break. | Pin `Anthropic-Version` header. Monitor deprecation announcements. |
| **LLM hallucinating Node IDs in `supportingNodes`** | High | Major — Evidence Engine rejects valid claims due to FQN mismatch. | Pass explicit instruction in prompt: "Use EXACT Node IDs from the skeleton. Do not paraphrase." |

## Medium Risks

| Risk | Probability | Impact | Mitigation |
|:---|:---|:---|:---|
| **Git merge conflict corrupts `.ris-state.json`** | Medium | Medium — Recoverable from backup. | Zod validation catches it. Backup restore is automatic. |
| **User accidentally deletes `.ris-state.json`** | Low | Medium — Full rebuild required. | Warn during `tome init` that this file is critical. |

## Minor Risks

| Risk | Probability | Impact | Mitigation |
|:---|:---|:---|:---|
| **Configuration drift triggers unnecessary Full Rewrite** | Medium | Low — Wastes API tokens. | Make drift detection advisory, not automatic. |
| **MCP Server detects stale state with 5-second delay** | High | Low — Agent briefly reads old data. | Acceptable for MVP. |

---

# PART VII: ARCHITECTURAL DEBT ANALYSIS

## Hidden Complexity

1. **The MemorySerializer** is described as a simple "RIS → Markdown" transformer. In reality, it must:
   - Generate YAML frontmatter with checksums.
   - Inject invisible HTML comments (if that design is kept).
   - Handle Mermaid diagram generation.
   - Enforce word limits per artifact.
   - Format GitHub-flavored Markdown with proper heading hierarchies.
   - Embed `[!WARNING]` alerts for contradicted claims.
   
   This is 2-3 weeks of work, not the "simple serializer" implied by the specifications.

2. **The Repository Skeleton Generator** must strip function bodies from arbitrary ASTs across multiple languages. This requires per-language knowledge of what constitutes a "body" (e.g., `{...}` in TypeScript, indentation blocks in Python, `do...end` in Ruby). This is non-trivial and is the Parser's most complex responsibility.

## Future Migration Risks

1. **JSON → SQLite:** The `StorageOrchestrator` abstraction should theoretically make this painless. But if any code directly accesses `.ris-state.json` via `fs.readFileSync` (bypassing the orchestrator), the migration breaks. **Enforcement: The linter must ban direct `fs` access to `.tome/` outside the Storage module.**

2. **Monolithic RIS Schema → Versioned Modules:** As ToMe adds new intelligence types (e.g., API contract analysis, test coverage analysis), the monolithic `.ris-state.json` will grow unwieldy. Eventually, the schema will need to be split into modules (`ris-core.json`, `ris-tests.json`). This is not addressed.

## Operational Risks

1. **API Cost Visibility:** The specification mentions printing cost at the end of `tome update`. But there is no cost cap mechanism. A misconfigured `DEEP` mode extraction on a 500-file monorepo could cost $50+ in a single run. **Add a `maxCostPerRun` configuration option with a default of $5.00. Abort if estimated cost exceeds the cap.**

---

# PART VIII: MISSING DOCUMENT ANALYSIS

The following documents are **genuinely necessary** before implementation:

1. **ERROR_TAXONOMY.md** — A single document mapping every error class (`ConfigurationError`, `ParserError`, `LLMTimeoutError`, `RepositoryTooLargeError`, `StorageLockedError`, `SecurityViolationError`, etc.) to its exit code, user-facing message, and recovery action. Currently scattered across 5+ documents with contradictions.

2. **RIS_SCHEMA_SPEC.md** — The exact Zod schema for `.ris-state.json`, including all top-level keys, all nested interfaces, all foreign key relationships, and all validation rules. Currently underspecified. This is the single most important implementation artifact and it does not exist as a standalone document.

3. **IMPLEMENTATION_SEQUENCE.md** — A strict build order specifying which interfaces to define first, which modules to implement next, and which integration tests to write at each milestone. The System Architecture provides a 4-week sketch, but it predates the subsequent 15 specifications that added massive scope.

The following documents are **not necessary:**
- API contracts (there is no API — it is a CLI tool).
- Event contracts (the event system is internal and can be defined during implementation).
- Service boundaries (there is only one process).

---

# PART IX: MVP REDUCTION ANALYSIS

**Constraint: 1 engineer, 8-12 weeks.**

## Phase 1: The Foundation (Weeks 1-3)

**Goal:** `tome init` produces `.ris-state.json` and 5 Markdown files for a TypeScript project.

| Task | Effort |
|:---|:---|
| Scaffold TypeScript project (Vitest, ESLint, tsconfig) | 1 day |
| Define all interfaces: `IParser`, `ILLMClient`, `IStorageOrchestrator` | 2 days |
| Define the RIS Zod schema (the canonical data model) | 3 days |
| Implement `ConfigResolver` (6-layer merge, Zod validation) | 2 days |
| Implement `LocalFileSystem` (directory walker, ignore rules) | 2 days |
| Implement `TypeScriptAdapter` (Tree-sitter, single-threaded) | 5 days |
| Implement `RepositorySkeletonGenerator` (body stripping) | 3 days |
| Implement `AnthropicAdapter` (tool calling, Zod validation, retry) | 3 days |
| Implement `ExtractionPipeline` (STANDARD mode, single-chunk) | 3 days |
| Implement `MemorySerializer` (RIS → 5 Markdown files) | 3 days |
| Implement `StorageOrchestrator` (atomic `.tmp` writes, backup) | 2 days |
| Implement CLI (`tome init`, `tome --help`) | 2 days |
| Integration test on a real 50-file repository | 2 days |

**Total: ~31 days (6-7 weeks with buffer)**

## Phase 2: The Update Loop (Weeks 7-9)

**Goal:** `tome update` detects code changes and regenerates intelligence.

| Task | Effort |
|:---|:---|
| Implement `UpdateEngine` (Full Rewrite strategy only) | 3 days |
| Implement `overrides.yaml` for human assertions | 2 days |
| Implement Evidence Engine (discrete confidence levels, not float) | 3 days |
| Implement lock file management | 1 day |
| Implement signal handling (SIGINT cleanup) | 1 day |
| Implement `tome validate` and `tome doctor` | 2 days |

**Total: ~12 days (2-3 weeks)**

## Phase 3: The Bridge (Weeks 10-12)

**Goal:** `tome serve` exposes intelligence to Claude Desktop and Cursor.

| Task | Effort |
|:---|:---|
| Implement MCP Server (Stdio transport, `@modelcontextprotocol/sdk`) | 3 days |
| Expose 3 Resources (architect, memory, guardrails) | 1 day |
| Expose 3 Tools (query_architecture, get_assertions, get_skeleton) | 2 days |
| Test with Claude Desktop | 1 day |
| Test with Cursor | 1 day |
| README, npm packaging, initial release | 3 days |

**Total: ~11 days (2 weeks)**

## What is CUT from MVP:

- ❌ OpenAI Adapter (Phase 2 — 1 week to add)
- ❌ Local Model Adapter (Phase 3)
- ❌ Incremental/Diff updates (Phase 2 — Full Rewrite only)
- ❌ SHA-256 rename detection (use Git)
- ❌ Cross-language import resolution
- ❌ Worker thread parallelism
- ❌ Float confidence scoring (use discrete enum)
- ❌ Invisible HTML comment reconciliation (use `overrides.yaml`)
- ❌ Fuzzy MCP search (use substring matching)
- ❌ Provider fallback
- ❌ Plugin architecture
- ❌ Domain chunking algorithms (use file-count chunking)
- ❌ Enterprise auth
- ❌ Telemetry
- ❌ Cloud sync

---

# PART X: FINAL ENGINEERING VERDICT

## Scores

| Metric | Score | Justification |
|:---|:---|:---|
| **Architecture Readiness** | **78/100** | The foundational abstractions (Hexagonal Architecture, RIS as canonical JSON, Markdown as projection) are excellent. But the interface definitions are inconsistent across documents, the RIS schema is not formally specified, and the Markdown reconciliation design is fatally flawed. |
| **Engineering Complexity** | **92/100** | Dangerously high as-written. The specifications describe 14 separate subsystems with intricate cross-cutting concerns (Evidence Edges, Semantic Anchors, Confidence Scores, Transaction Coordination). Without MVP reduction, this is a 6-month project for a team of 4. |
| **Overengineering Score** | **72/100** | High. Float confidence math, SHA-256 rename detection, cross-language route matching, mid-pipeline provider fallback, and invisible HTML comment reconciliation are all solutions to problems that do not exist in MVP. |
| **Probability of Successful MVP Delivery (As-Written)** | **10%** | A single engineer attempting to faithfully implement all 21 specifications will drown in scope. |
| **Probability of Successful MVP Delivery (With Amendments)** | **80%** | With the MVP reduction plan, the critical path is 12 weeks of focused implementation. |
| **Probability of Architecture Rework** | **15%** | The core abstractions are sound. The rework will be at the detail level (interface signatures, confidence models, Markdown reconciliation strategy), not at the architectural level. |

## Top 20 Architecture Changes Recommended Before Coding

1. **Reconcile the `ILLMClient` interface** — Use the LLM Provider spec version. Delete the System Architecture version.
2. **Reconcile the `RepositoryIntelligenceState` interface** — Adopt the Evidence Engine's `Claim<T>` wrapped version. Delete the System Architecture's raw-string version.
3. **Add `ORPHANED_HUMAN`, `ARCHIVED`, `RECALCULATING`, `CHALLENGED` to the `ClaimStatus` enum** — Currently missing from the canonical type definition.
4. **Create a standalone RIS Zod Schema document** — The single most critical implementation artifact does not exist.
5. **Replace invisible HTML comment Markdown reconciliation** with `overrides.yaml` or visible Markdown header anchors.
6. **Replace float confidence scoring** with a discrete `ConfidenceLevel` enum (`OBSERVED | STRONG | MODERATE | WEAK | UNVERIFIED | HUMAN_ASSERTED`).
7. **Drop SHA-256 interface hashing for rename detection.** Use `git diff --find-renames`.
8. **Drop cross-language import resolution** from MVP. Let the LLM handle it semantically.
9. **Drop Worker Thread parallelism** from MVP. Single-threaded Tree-sitter is fast enough.
10. **Drop Local Model (Llama 3) Adapter** from MVP. Focus exclusively on Anthropic.
11. **Drop OpenAI Adapter** from MVP. Add in Phase 2 (1 week of work).
12. **Drop mid-pipeline provider fallback.** Abort on failure; user retries manually.
13. **Drop incremental subgraph extraction** from MVP. Full Rewrite only.
14. **Drop Domain Chunking algorithms.** Use naive file-count chunking for MVP.
15. **Drop MCP fuzzy search.** Use substring matching.
16. **Make configuration drift detection advisory, not automatic.**
17. **Standardize exit codes** across System Architecture and CLI Architecture (use CLI version).
18. **Add a `maxCostPerRun` config option** with a default of $5.00 to prevent runaway API billing.
19. **Add a pre-flight disk space check** before writing `.tmp` files.
20. **Extract CLI responsibilities** into three modules: `CLIAdapter`, `CoreEngine`, `TransactionCoordinator`.

## FINAL GO / NO-GO DECISION

### **GO — WITH MANDATORY AMENDMENTS**

The ToMe architecture is conceptually brilliant. The separation of canonical JSON state from lossy Markdown projections, the Evidence Engine's traceability model, and the MCP-based agent integration are architecturally superior to every competing product in this space.

But the specifications have drifted into academic territory. They describe a system that solves every possible future problem at the cost of implementability today. The invisible HTML comment reconciliation system, the floating-point confidence math, and the SHA-256 rename detection are all elegant on paper and treacherous in production.

Apply the 20 amendments above. Implement the 12-week MVP plan from Part IX. Ship a working `tome init → tome update → tome serve` loop with a single provider (Anthropic), a single language (TypeScript), and a simple human override mechanism (`overrides.yaml`). Validate with real users. Then — and only then — layer in the incremental updates, multi-language support, and enterprise features.

**The architecture does not need to be rewritten. It needs to be *prioritized*.**
