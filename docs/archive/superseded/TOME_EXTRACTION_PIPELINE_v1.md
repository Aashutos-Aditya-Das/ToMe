# TOME_EXTRACTION_PIPELINE_v1

> **Document Classification:** Repository Intelligence Extraction Specification  
> **Document Version:** 1.0  
> **Created:** 2026-06-08  
> **Status:** APPROVED EXTRACTION PIPELINE  
> **Persistence:** PERMANENT  

---

## TABLE OF CONTENTS

1. [Extraction Mission](#1-extraction-mission)
2. [Pipeline Philosophy](#2-pipeline-philosophy)
3. [End-to-End Pipeline Overview](#3-end-to-end-pipeline-overview)
4. [Repository Intake](#4-repository-intake)
5. [File Discovery](#5-file-discovery)
6. [Ignore Rules](#6-ignore-rules)
7. [Repository Classification](#7-repository-classification)
8. [Parser Stage](#8-parser-stage)
9. [Repository Model Generation](#9-repository-model-generation)
10. [Repository Skeleton Generation](#10-repository-skeleton-generation)
11. [Context Assembly](#11-context-assembly)
12. [Token Budgeting](#12-token-budgeting)
13. [Chunking Architecture](#13-chunking-architecture)
14. [Batching Architecture](#14-batching-architecture)
15. [Parallelization Strategy](#15-parallelization-strategy)
16. [Prompt Routing](#16-prompt-routing)
17. [Extraction Stages](#17-extraction-stages)
18. [RIS Construction](#18-ris-construction)
19. [Evidence Attachment](#19-evidence-attachment)
20. [Validation Pipeline](#20-validation-pipeline)
21. [Repair Pipeline](#21-repair-pipeline)
22. [Serialization Pipeline](#22-serialization-pipeline)
23. [Artifact Generation Pipeline](#23-artifact-generation-pipeline)
24. [Update Pipeline](#24-update-pipeline)
25. [Diff Processing Pipeline](#25-diff-processing-pipeline)
26. [Incremental Extraction](#26-incremental-extraction)
27. [Full Rewrite Strategy](#27-full-rewrite-strategy)
28. [Cost Optimization Strategy](#28-cost-optimization-strategy)
29. [Failure Recovery Strategy](#29-failure-recovery-strategy)
30. [Performance Targets](#30-performance-targets)
31. [Scaling Roadmap](#31-scaling-roadmap)
32. [Final Extraction Verdict](#32-final-extraction-verdict)

---

## 1. EXTRACTION MISSION

The mission of the Extraction Pipeline is to transform unstructured, noisy source code into structured, mathematically verifiable Repository Intelligence State (RIS), and finally serialize it into human-readable Markdown Artifacts. It must do this safely, reliably, deterministically, and cost-effectively, bridging the physical reality of code with the probabilistic realm of LLM inference.

## 2. PIPELINE PHILOSOPHY

1. **Information Destruction:** Intelligence requires losing noise. At every stage before the LLM, we must violently discard implementation details. Tokens spent on generic algorithms are wasted.
2. **Context Parsimony:** LLMs get confused by massive payloads. We pass the smallest possible chunk of data required to make a valid architectural inference.
3. **Pipelined Execution:** Extraction is a linear, directional flow. `A -> B -> C`. Cycles are forbidden.
4. **Resilience over Speed:** An extraction that takes 2 minutes and succeeds is infinitely better than one that takes 10 seconds and crashes on a JSON schema error.

## 3. END-TO-END PIPELINE OVERVIEW

The macro flow of the intelligence compiler:

```text
Source Code
    ↓ (IFileSystem)
AST
    ↓ (Tree-sitter Parser)
Repository Model
    ↓ (Graph Compression)
Repository Skeleton
    ↓ (Context Assembler)
Prompt Stack
    ↓ (ILLMClient)
Evidence Engine
    ↓ (Validation & Binding)
RIS
    ↓ (Memory Serializer)
Artifact Generation (Markdown)
```

---

## 4. REPOSITORY INTAKE

The pipeline begins when the `CLIAdapter` executes `tome init` or `tome update` and hands over control to the `MemoryGenerationOrchestrator`.
The intake phase establishes the Root Directory, checks permissions, and verifies API keys.

```typescript
export interface IntakeConfiguration {
  rootPath: string;
  executionMode: 'QUICK' | 'STANDARD' | 'DEEP';
  maxFilesAllowed: number;
}
```

## 5. FILE DISCOVERY

The system performs a highly concurrent traversal of the physical storage.
- Uses `glob` matching to walk directories.
- Accumulates `FileNode` potentials.

## 6. IGNORE RULES

Filtering is aggressive to protect token budgets.
- **System Ignores:** `.git`, `node_modules`, `dist`, `build`, `vendor`.
- **Binary Rejection:** Images, PDFs, executables.
- **User Ignores:** Parses `.gitignore` and `.tomeignore`.

If `discovered_files > maxFilesAllowed` (e.g., 500), it immediately throws `RepositoryTooLargeError` to prevent runaway token billing.

## 7. REPOSITORY CLASSIFICATION

A fast heuristic pass to determine the project's macro-identity.
- Parses `package.json`, `Cargo.toml`, or `requirements.txt`.
- Output: `PrimaryLanguage`, `Framework` (e.g., Next.js, Django).
- *Purpose:* Informs the `PromptStack` which specialized few-shot examples to load.

---

## 8. PARSER STAGE

Source code is converted into ASTs using `TreeSitterParser`.
- **Parallel Execution:** Files are parsed across worker threads (or async loops) to maximize I/O utilization.
- **Output:** Language-specific grammatical trees.

```typescript
export interface IParser {
  parseFile(filePath: string, content: string): AbstractSyntaxTree;
}
```

## 9. REPOSITORY MODEL GENERATION

The ASTs are mapped into the universal, language-agnostic `RepositoryModel`.
- The `ModelBuilder` traverses the ASTs to identify `Classes`, `Functions`, `Imports`, and `Exports`.
- It creates the `StructuralGraph` and resolves `DependencyEdges` across files.

## 10. REPOSITORY SKELETON GENERATION

The `RepositoryModel` is compressed.
- Function bodies (`{ ... }`) are stripped.
- Only signatures, imports, exports, and class structures remain.
- The output is serialized into a highly dense JSON structure designed exclusively for LLM consumption.

```typescript
export interface RepositorySkeleton {
  files: SkeletonFile[];
  edges: DependencyEdge[];
  checksum: string;
}
```

---

## 11. CONTEXT ASSEMBLY

An LLM cannot process 500 files at once. The `ContextAssembler` slices the `RepositorySkeleton` into digestible pieces.

## 12. TOKEN BUDGETING

Before any LLM call, the `Tokenizer` estimates the cost.
- Uses `tiktoken` (or equivalent heuristic) to count the tokens in the prompt + skeleton.
- If `EstimatedTokens > ContextWindowLimit * 0.8`, it triggers the Chunking Architecture.

## 13. CHUNKING ARCHITECTURE

If the skeleton is too large, it must be chunked mathematically by graph topology, not arbitrarily by file count.
- **Domain Chunking:** We cluster files by highly connected `ImportEdges` using modularity algorithms. A chunk represents a tightly coupled "Module."

## 14. BATCHING ARCHITECTURE

Chunks are grouped into batches to be sent to the LLM. 
- *Constraint:* The LLM has rate limits (RPM/TPM).
- *Strategy:* The `BatchOrchestrator` queues requests and implements leaky-bucket throttling.

## 15. PARALLELIZATION STRATEGY

- **AST Parsing:** Highly parallelized.
- **LLM Extraction:** Parallelized up to the provider's concurrency limit (e.g., 5 concurrent requests). 

---

## 16. PROMPT ROUTING

The `PromptRouter` takes the chunks and selects the correct prompts based on the target extraction stage and the `ExecutionMode`.

### Execution Modes

| Mode | Tokens | API Calls | Accuracy | Use Case |
|---|---|---|---|---|
| **QUICK** | Low | 1-2 | Moderate | Small side projects, immediate sanity checks. Merges stages. |
| **STANDARD** | Medium | 5-10 | High | Default MVP mode. Balances cost and depth. |
| **DEEP** | Extreme | 20+ | Maximum | Phase 8 Enterprise. Evaluates every single function signature. |

---

## 17. EXTRACTION STAGES

The chunks flow through the prompt stack (as defined in `TOME_PROMPT_ARCHITECTURE_v1`):
1. Repo Understanding
2. Architecture Extraction
3. Workflow Extraction
4. Business Rule Extraction
5. Constraint Extraction
6. Risk Extraction
7. Recovery Extraction

*In STANDARD mode, stages 4,5,6,7 may be batched together to save prompt overhead.*

---

## 18. RIS CONSTRUCTION

The LLM returns fragmented JSON schemas (e.g., Array of `Domains`, Array of `Risks`). 
The `RISBuilder` merges these fragmented outputs into a singular, unified `RepositoryIntelligenceState` graph in memory.

## 19. EVIDENCE ATTACHMENT

During RIS construction, the `EvidenceEngine` intercepts the incoming JSON claims. It parses the `supportingNodes` arrays returned by the LLM, verifies those nodes exist in the `RepositorySkeleton`, calculates the `ConfidenceScore`, and binds the `EvidenceEdge` to the `Claim`.

---

## 20. VALIDATION PIPELINE

1. **Zod Parsing:** Does the LLM string conform to the expected TypeScript interface?
2. **Structural Validation:** Do the referenced structural nodes exist?
3. **Semantic Validation:** Are there orphan capabilities without domains?

## 21. REPAIR PIPELINE

If validation fails:
1. Generate `LLMValidationError` containing the exact Zod issue.
2. Trigger the `RepairPrompt`.
3. Feed the original LLM output + the Error string back to the LLM.
4. Retry (Max 3 times).
5. If 3 failures, throw `ExtractionFatalError`.

---

## 22. SERIALIZATION PIPELINE

The validated `RIS` object is passed to the `MemorySerializer`.
The serializer transforms the graph data into five distinct strings representing the Markdown content.

## 23. ARTIFACT GENERATION PIPELINE

The `IKnowledgeStore` takes the markdown strings.
1. Generates the YAML frontmatter (Timestamp, ToMe Version, Code Checksum).
2. Appends the metadata.
3. Writes to `.tome/architect.md`, `.tome/guardrails.md`, etc.

---

## 24. UPDATE PIPELINE (`tome update`)

When running an update, the intake phase calculates the current codebase checksum. It compares it to the frontmatter of `.tome/architect.md`. If identical, it exits early (`Exit 0: No changes`).

## 25. DIFF PROCESSING PIPELINE

If changes exist:
1. Discover modified, added, and deleted files using Git diff or file hashing.
2. Generate a `FileDiff[]` array.

## 26. INCREMENTAL EXTRACTION

If the user is running Phase 2 `DiffPatchStrategy`:
1. Parse only the changed files.
2. Identify the affected domains in the existing RIS.
3. Pass the diff + the isolated chunk of the RIS to the LLM.
4. Patch the RIS.

## 27. FULL REWRITE STRATEGY

For the MVP (and whenever Incremental fails):
1. Run the entire `tome init` pipeline from scratch.
2. Overwrite the `.tome/` directory. 
*Why:* It guarantees zero state corruption.

---

## 28. COST OPTIMIZATION STRATEGY

- **Token Stripping:** Never pass comments or method bodies.
- **Prompt Caching:** Utilize Anthropic's prompt caching by keeping the system prompts and few-shot examples at the top of the context block.
- **Early Exits:** Reject massive auto-generated files (e.g., `package-lock.json`, `swagger.json`) with strict heuristics before they reach the parser.

---

## 29. FAILURE RECOVERY STRATEGY

| Failure Mode | Detection | Mitigation |
|---|---|---|
| **API Timeout** | HTTP 408 | Exponential Backoff (3 retries). |
| **API Rate Limit** | HTTP 429 | Pause thread, resume after header timeout. |
| **Parser Crash** | Try/Catch native | Fallback to Regex Chunking. |
| **OOM (Out of Memory)**| V8 Heap Limit | Abort. Inform user to add `.tomeignore`. |
| **Invalid Schema** | Zod Error | Repair Pipeline. |

---

## 30. PERFORMANCE TARGETS

**Standard Mode (300 Files, React + Node):**
*   **Intake & Discovery:** < 100ms
*   **Parsing (Tree-sitter):** < 2.0s
*   **Skeleton Generation:** < 500ms
*   **LLM Extraction (Network):** 20.0s - 45.0s
*   **Validation & Serialization:** < 500ms
*   **Total Expected Latency:** ~45 seconds.

---

## 31. SCALING ROADMAP

*   **v1.0 (MVP):** Full Rewrite strategy, < 500 files, Standard Mode only.
*   **v2.0:** Incremental Extraction, Diff Patching, Token Caching.
*   **v3.0:** Domain Chunking for Monorepos (>2000 files).
*   **v4.0:** Deep Mode (AST + Implementation body semantic analysis).

---

## 32. FINAL EXTRACTION VERDICT

The ToMe Extraction Pipeline is a highly deterministic machine built around a highly non-deterministic intelligence core. 

By enforcing strict pipelining, destructive noise filtering, mathematical chunking, and isolated validation loops, we ensure that the LLM is only tasked with what it does best: semantic reasoning over structured text. 

The pipeline guarantees that bad data cannot poison the intelligence state, and token costs are aggressively contained. This specification acts as the operational runtime blueprint for the `MemoryGenerationOrchestrator`.
