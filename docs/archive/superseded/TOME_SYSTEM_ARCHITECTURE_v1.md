# TOME_SYSTEM_ARCHITECTURE_v1

> **Document Classification:** Engineering System Architecture Blueprint  
> **Document Version:** 1.0  
> **Created:** 2026-06-08  
> **Status:** APPROVED FOR IMPLEMENTATION  
> **Persistence:** PERMANENT  

---

## TABLE OF CONTENTS

1. [Section 1 — System Overview](#section-1--system-overview)
2. [Section 2 — Core Architectural Principles](#section-2--core-architectural-principles)
3. [Section 3 — Complete Component Map](#section-3--complete-component-map)
4. [Section 4 — Repository Intelligence State (RIS)](#section-4--repository-intelligence-state-ris)
5. [Section 5 — Code Analysis Pipeline](#section-5--code-analysis-pipeline)
6. [Section 6 — Memory Artifact Architecture](#section-6--memory-artifact-architecture)
7. [Section 7 — Memory Generation Pipeline](#section-7--memory-generation-pipeline)
8. [Section 8 — Update Architecture](#section-8--update-architecture)
9. [Section 9 — LLM Architecture](#section-9--llm-architecture)
10. [Section 10 — Storage Architecture](#section-10--storage-architecture)
11. [Section 11 — CLI Architecture](#section-11--cli-architecture)
12. [Section 12 — MCP Architecture](#section-12--mcp-architecture)
13. [Section 13 — Configuration Architecture](#section-13--configuration-architecture)
14. [Section 14 — Error Handling Architecture](#section-14--error-handling-architecture)
15. [Section 15 — Security Architecture](#section-15--security-architecture)
16. [Section 16 — Performance Architecture](#section-16--performance-architecture)
17. [Section 17 — Testing Architecture](#section-17--testing-architecture)
18. [Section 18 — Project Structure](#section-18--project-structure)
19. [Section 19 — MVP Build Order](#section-19--mvp-build-order)
20. [Section 20 — Architecture Decision Records (ADR)](#section-20--architecture-decision-records-adr)
21. [Final Section — System Architecture Verdict](#final-section--system-architecture-verdict)

---

# SECTION 1 — SYSTEM OVERVIEW

**What is ToMe?**
ToMe is a stateless, local-first data processing engine written in TypeScript (Node.js). It ingests source code, extracts syntactic structure via Abstract Syntax Trees (AST), enriches that structure with semantic intent using a Large Language Model (LLM), and serializes the resulting intelligence into standardized Markdown files. It exposes this intelligence to external agents via the Model Context Protocol (MCP).

### High-Level Architecture Diagram
```text
                          +---------------------------------------------------+
                          |                  CLI ADAPTER                      |
                          |  (tome init, tome update, .tomerc, env vars)      |
                          +-------------------------+-------------------------+
                                                    | (Commands)
+-------------------+     +-------------------------v-------------------------+     +-------------------+
|                   |     |                   CORE DOMAIN                     |     |                   |
| IFileSystem       |---->|  +---------------------------------------------+  |<----| ILLMClient        |
| (LocalFilesystem) |     |  |          MemoryGenerationOrchestrator       |  |     | (AnthropicAdapter)|
|                   |     |  +----------------------+----------------------+  |     |                   |
+-------------------+     |                         |                         |     +-------------------+
                          |  +----------------------v----------------------+  |
+-------------------+     |  |               RIS Builder                   |  |     +-------------------+
|                   |     |  +----------------------+----------------------+  |     |                   |
| IParser           |---->|                         |                         |---->| IKnowledgeStore   |
| (TreeSitterParser)|     |  +----------------------v----------------------+  |     | (MarkdownStore)   |
|                   |     |  |              Memory Serializer              |  |     |                   |
+-------------------+     |  +---------------------------------------------+  |     +-------------------+
                          +-------------------------+-------------------------+
                                                    | (Queries)
                          +-------------------------v-------------------------+
                          |                 MCP ADAPTER                       |
                          |      (Claude Code, Cursor, Devin, etc.)           |
                          +---------------------------------------------------+
```

**Boundaries:**
- **Inbound:** File system reads, CLI arguments, MCP requests.
- **Outbound:** File system writes (`.tome/`), Network egress (LLM API only).

---

# SECTION 2 — CORE ARCHITECTURAL PRINCIPLES

1. **Hexagonal Architecture (Ports and Adapters):**
   *Why:* Isolates the core domain logic from the volatility of file systems, parsers, and LLM providers.
   *Enforcement:* The `core/` directory cannot import from `adapters/` or `infrastructure/`. Dependencies are injected via interfaces.
2. **Dependency Inversion:**
   *Why:* Core business logic should not depend on low-level modules (e.g., Tree-sitter binaries). Both should depend on abstractions (`IParser`).
3. **Stateless Generation:**
   *Why:* Eliminates complex database migrations, daemon processes, and local state corruption.
   *Enforcement:* The `ToMeEngine` class maintains no memory between CLI invocations. Everything required to run must be passed as an argument or read from disk at runtime.
4. **RIS-Centric Design:**
   *Why:* Prevents the engine from manipulating fragile Markdown text directly.
   *Enforcement:* All domain logic functions take `RepositoryIntelligenceState` objects as input and return `RepositoryIntelligenceState` or `ArtifactDefinition` objects as output.
5. **Local First:**
   *Why:* Absolute privacy.
   *Enforcement:* The only allowed network module is the HTTP client implementing `ILLMClient`. No telemetry.
6. **Markdown Export Boundary:**
   *Why:* Interoperability with the developer ecosystem.
   *Enforcement:* The `MarkdownFileStore` adapter is the *only* component allowed to format text as Markdown.

---

# SECTION 3 — COMPLETE COMPONENT MAP

### Core Domain (The Brain)
- `ToMeEngine`: The primary facade. Bootstraps dependencies and routes commands.
- `MemoryGenerationOrchestrator`: The conductor. Manages the lifecycle of a `tome init` or `tome update` command.
- `RepositoryAnalyzer`: Traverses directories, applies ignore rules, and orchestrates the parser.
- `RISBuilder`: Merges parsed AST data with LLM semantic outputs to form the Repository Intelligence State.
- `MemoryUpdater`: Handles the diff logic between current RIS and new codebase state.
- `MemorySerializer`: Converts the RIS into the 5 target artifact domains (Architect, Memory, Guardrails, Recover, Walkthrough).

### Interfaces (Ports)
- `IParser`: Contract for extracting syntax. `parse(files) => SyntaxSkeleton`.
- `ILLMClient`: Contract for AI generation. `generate(prompt) => LLMResponse`.
- `IKnowledgeStore`: Contract for saving memory. `save(artifacts) => void`.
- `IConfigurationProvider`: Contract for config. `getConfig() => ToMeConfig`.
- `IFileSystem`: Contract for disk I/O. `read(path) => string`.

### Adapters (Implementations)
- `TreeSitterParser`: Implements `IParser`. Uses native C-bindings to traverse code.
- `AnthropicAdapter`: Implements `ILLMClient`. Calls Claude 3.5 Sonnet API.
- `OpenAIAdapter`: Implements `ILLMClient`. Calls GPT-4o API.
- `MarkdownFileStore`: Implements `IKnowledgeStore`. Writes `.md` files with YAML frontmatter.
- `LocalFileSystem`: Implements `IFileSystem`. Uses Node `fs`.
- `CLIAdapter`: Maps `process.argv` to `ToMeEngine` commands.
- `MCPAdapter`: Exposes `IKnowledgeStore.read()` to standard MCP transports.

---

# SECTION 4 — REPOSITORY INTELLIGENCE STATE (RIS)

**What is RIS?**
The Repository Intelligence State is the internal typed representation of the codebase's semantic meaning. It bridges the gap between raw syntax (AST) and human narrative (Markdown).

**How it differs:**
- *AST:* Knows that `class Auth` exists and has `function login()`.
- *RIS:* Knows that `class Auth` handles "JWT Authentication via Supabase."
- *Memory Files:* Markdown text explaining "We use Supabase for Auth."

### Domain Models (TypeScript)

```typescript
export interface RepositoryIntelligenceState {
  version: string; // e.g. "1.0.0"
  checksum: string; // Hash of the code state that generated this RIS
  architecture: ArchitecturalDomain[];
  decisions: StrategicDecision[];
  guardrails: EngineeringGuardrail[];
  dependencies: ExternalDependency[];
  walkthrough: WorkflowPath[];
}

export interface ArchitecturalDomain {
  id: string; // e.g. "auth-service"
  name: string;
  description: string;
  primaryFiles: string[];
  responsibilities: string[];
  dependsOn: string[]; // IDs of other domains
}

export interface StrategicDecision {
  id: string;
  context: string;
  decision: string;
  consequences: string[];
}

export interface EngineeringGuardrail {
  rule: string;
  reason: string;
  enforcementLevel: 'MUST' | 'SHOULD';
  antiPatterns: string[];
}
```

**Lifecycle:**
1. Code parsed → `SyntaxSkeleton` generated.
2. `SyntaxSkeleton` passed to LLM → LLM returns JSON matching `RIS` interfaces.
3. Domain merges JSON into `RepositoryIntelligenceState` object.
4. `MemorySerializer` takes `RIS` and maps it to Markdown strings.
5. `IKnowledgeStore` writes Markdown + YAML metadata to disk.

**Versioning:**
The RIS schema is versioned. If ToMe updates its internal model in v2.0, migrations occur at the RIS level before re-serializing to Markdown.

---

# SECTION 5 — CODE ANALYSIS PIPELINE

### Flow Diagram
1. **File Discovery:** `IFileSystem` globs the directory. Honors `.gitignore` and `.tomeignore`.
2. **Filtering:** Enforces `< 500` file limit. Rejects binaries, images, `.git`.
3. **Parser Stage:** `TreeSitterParser` processes files in parallel.
4. **Symbol Extraction:** Extracts exports, imports, class signatures, and function signatures. Drops implementation bodies (to save tokens).
5. **Repository Skeleton:** A compressed JSON map of the repo structure.
6. **LLM Enrichment:** The Skeleton is sent to the LLM. *Prompt:* "Analyze this repository structure. Extract the core architectural domains and business rules into the following JSON schema..."

### Failure Modes & Recovery
- *Parser Failure (Tree-sitter binary missing):* Fallback to `RegexChunkingParser` (regex-based signature extraction).
- *Too Many Files (>500):* Throw `RepositoryTooLargeError`. Halt pipeline. Do not charge tokens.
- *LLM Context Exceeded:* Implement multi-pass chunking. Batch domains and reduce to a unified RIS.

---

# SECTION 6 — MEMORY ARTIFACT ARCHITECTURE

The 5 artifacts represent the final serialization of the RIS.

### Artifact Definitions
1. **`architect.md` (System Design)**
   - *Source RIS:* `RIS.architecture`, `RIS.dependencies`
   - *Structure:* Component map, data flow, tech stack.
   - *Max Size:* 2000 words.
2. **`memory.md` (Strategic Context)**
   - *Source RIS:* `RIS.decisions`
   - *Structure:* "Why" decisions were made.
   - *Max Size:* 2000 words.
3. **`guardrails.md` (Rules)**
   - *Source RIS:* `RIS.guardrails`
   - *Structure:* Bulleted MUST/SHOULD rules. Prompt-optimized for AI consumption.
   - *Max Size:* 1000 words.
4. **`recover.md` (Troubleshooting)**
   - *Source RIS:* Generated dynamically via LLM vulnerability analysis.
   - *Structure:* Known failure modes and runbooks.
   - *Max Size:* 1500 words.
5. **`walkthrough.md` (Onboarding)**
   - *Source RIS:* `RIS.walkthrough`
   - *Structure:* Chronological read path for a new developer.
   - *Max Size:* 1500 words.

**Quality Constraints:**
Each file must contain a YAML Frontmatter block containing the `RIS.checksum` and `generation_timestamp`.

---

# SECTION 7 — MEMORY GENERATION PIPELINE (`tome init`)

### Sequence Flow
```text
CLI          ToMeEngine          Analyzer          LLMClient          Serializer          KnowledgeStore
 |                |                 |                  |                   |                     |
 |---init()------>|                 |                  |                   |                     |
 |                |---analyze()---->|                  |                   |                     |
 |                |                 |---parse()------->| (Extract syntax)  |                     |
 |                |<--Skeleton------|                  |                   |                     |
 |                |                 |                  |                   |                     |
 |                |----------generateRIS()------------>| (LLM API Call)    |                     |
 |                |<---------RIS JSON------------------|                   |                     |
 |                |                 |                  |                   |                     |
 |                |-------------------------serialize(RIS)---------------->|                     |
 |                |<------------------------Markdown[]---------------------|                     |
 |                |                 |                  |                   |                     |
 |                |------------------------------------------save()----------------------------->|
 |<--Success------|                 |                  |                   |                     |
```

---

# SECTION 8 — UPDATE ARCHITECTURE (`tome update`)

**Change Detection:**
ToMe calculates a checksum of the codebase (ignoring `.tome/`). It compares this to the `checksum` in the existing `.tome/architect.md` frontmatter.

### The UpdateStrategy Interface
```typescript
export interface UpdateStrategy {
  execute(currentRIS: RepositoryIntelligenceState, codeDiff: FileDiff[]): RepositoryIntelligenceState;
}
```

**Implementations:**
1. **`FullRewriteStrategy`:** (Default for MVP). If code changed, parse the whole repo again, generate a new RIS, and overwrite the files. (Costly, but 100% accurate).
2. **`DiffPatchStrategy`:** (Phase 2). Pass *only* the `FileDiff[]` and the `currentRIS` to the LLM. *Prompt:* "Given this RIS and this code diff, return a patched RIS."

**Rollback Behavior:**
Before `tome update` writes to disk, `MarkdownFileStore` backs up `.tome/` to a temporary buffer. If the LLM call fails or returns malformed JSON, the buffer is restored.

---

# SECTION 9 — LLM ARCHITECTURE

```typescript
export interface ILLMClient {
  generateStructured<T>(prompt: string, schema: any): Promise<T>;
  generateText(prompt: string): Promise<string>;
}
```

**Prompt Architecture:**
Prompts are isolated in `domain/prompts/`. They must not contain hardcoded formatting.
- `SYSTEM_PROMPT`: establishes persona ("You are an expert Principal Engineer...").
- `EXTRACTION_PROMPT`: Defines the JSON schema for RIS.

**Token Budgeting & Rate Limits:**
- The engine computes a rough token estimate before calling `ILLMClient`. If `estimated_tokens > model.max_context`, it throws `ContextExhaustedError`.
- `AnthropicAdapter` implements exponential backoff for `429 Too Many Requests`.

**Configuration:**
```json
{
  "llm": {
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20240620",
    "maxTokens": 8192
  }
}
```

---

# SECTION 10 — STORAGE ARCHITECTURE

```typescript
export interface IKnowledgeStore {
  write(artifacts: MemoryArtifact[]): void;
  read(): MemoryArtifact[];
  backup(): void;
  restore(): void;
}
```

### Directory Layout
```text
/my-project
  /.tome
    architect.md
    memory.md
    guardrails.md
    recover.md
    walkthrough.md
```

**YAML Frontmatter Specification:**
```yaml
---
tome_version: "1.0.0"
checksum: "sha256-hash-of-code-state"
last_updated: "2026-06-08T12:00:00Z"
model: "claude-3-5-sonnet-20240620"
---
```
*Why:* This satisfies the "Memory Quality Feedback Loop" amendment by providing deterministic provenance.

---

# SECTION 11 — CLI ARCHITECTURE

Powered by a lightweight framework like `Commander.js` or `yargs`.

### Commands
- `tome init`: Scans repo, builds RIS, generates `.tome/`.
- `tome update`: Runs diff engine, patches RIS, rewrites `.tome/`.
- `tome validate`: Checks `.tome/` Markdown for missing frontmatter or broken links.
- `tome doctor`: Checks API keys, parser binaries, and `.tomeignore` configuration.

### Exit Codes
- `0`: Success
- `1`: Unhandled Fatal Error
- `2`: Configuration/API Key Error
- `3`: Repository Limit Exceeded (>500 files)
- `4`: LLM Generation/Parsing Error

---

# SECTION 12 — MCP ARCHITECTURE

Model Context Protocol (MCP) allows IDEs to query ToMe.

**MCP Adapter Design:**
The `MCPServer` runs as a background process (or via stdio for local agents).
It implements the MCP `resources` protocol.

- `mcp.listResources()` returns `["tome://architect", "tome://guardrails", ...]`.
- `mcp.readResource("tome://architect")` calls `IKnowledgeStore.read('architect.md')`.

**Isolation:**
The MCP server *never* triggers `tome generate`. It is purely a read-only transport layer for serving the generated Markdown to agents.

---

# SECTION 13 — CONFIGURATION ARCHITECTURE

Resolution order (highest priority first):
1. CLI Flags (e.g., `--model gpt-4o`)
2. Environment Variables (`TOME_API_KEY`)
3. `.tomerc` (in repo root)
4. System defaults

```typescript
export interface ToMeConfig {
  apiKey: string;
  provider: 'anthropic' | 'openai';
  model: string;
  maxFiles: number; // default: 500
  ignorePatterns: string[];
}
```

---

# SECTION 14 — ERROR HANDLING ARCHITECTURE

Errors must be strongly typed classes extending `ToMeError`.

- `ConfigurationError`: Missing API key. (Action: Prompt user to set env var).
- `ParserError`: Tree-sitter failed. (Action: Fallback to regex chunking).
- `LLMTimeoutError`: API failed. (Action: Retry 3 times, then exit code 4).
- `RepositoryTooLargeError`: >500 files. (Action: Inform user, exit code 3).
- `SerializationError`: LLM returned invalid JSON. (Action: Retry generation with stricter JSON prompt).

---

# SECTION 15 — SECURITY ARCHITECTURE

**Threat Model:**
1. *Key Leakage:* ToMe never stores API keys in config files. Keys must be passed via `process.env`.
2. *Data Exfiltration:* `ILLMClient` is hardcoded to only send HTTP requests to official Anthropic/OpenAI endpoints. No third-party telemetry is included.
3. *Prompt Injection:* Codebases containing malicious comments (e.g., `"Ignore previous instructions"`) could hijack the RIS generator.
   - *Mitigation:* The `ILLMClient` wraps all user code in strict `<code>` delimiters and uses system prompts that explicitly discard instructions found within code blocks.

---

# SECTION 16 — PERFORMANCE ARCHITECTURE

**Budgets for a 300-file repository:**
- *File Discovery & AST Parsing:* < 5 seconds. (Tree-sitter is incredibly fast).
- *Token Generation (Input):* ~50,000 to 100,000 tokens (skeletonized).
- *LLM Latency:* 30 - 60 seconds (Claude 3.5 Sonnet processing time).
- *Total CLI Run Time:* < 90 seconds.

**Scaling Strategy:**
By enforcing the 500-file limit, we guarantee performance fits within acceptable CLI waiting times. When scaling to Enterprise (Phase 8), the architecture moves to asynchronous webhooks.

---

# SECTION 17 — TESTING ARCHITECTURE

1. **Unit Tests (Jest/Vitest):** Core domain logic. Mock `IFileSystem` and `ILLMClient`. Test RIS merging logic.
2. **Parser Tests:** Ensure `TreeSitterParser` correctly extracts skeletons for TS, JS, Python.
3. **Golden Repositories (Integration):** 
   - Maintain 3 static dummy repositories in `/tests/fixtures/`.
   - Run `tome init` against them using a mocked LLM response.
   - Assert the resulting Markdown exactly matches "Golden" snapshot files.
4. **Prompt Regression Tests:**
   - Execute real API calls against Anthropic nightly to ensure prompt outputs haven't drifted into malformed JSON.

---

# SECTION 18 — PROJECT STRUCTURE

```text
/tome-core
  /src
    /domain
      models.ts           # RIS Interfaces
      orchestrator.ts     # MemoryGenerationOrchestrator
      ris-builder.ts      # Merging AST + LLM logic
      serializer.ts       # RIS -> Markdown logic
    /application
      config.ts           # ConfigurationProvider
      errors.ts           # Typed Error classes
    /adapters
      /llm
        anthropic.ts      # AnthropicAdapter
      /parser
        tree-sitter.ts    # TreeSitterParser
      /storage
        markdown-store.ts # MarkdownFileStore
    /infrastructure
      fs.ts               # LocalFileSystem
    /cli
      index.ts            # Commander.js entrypoint
    /mcp
      server.ts           # MCP Adapter
  /tests
    /fixtures
    /unit
    /integration
```

---

# SECTION 19 — MVP BUILD ORDER

To ensure the fastest path to validation, implement in this strict sequence:

**Week 1: The Skeleton**
- Scaffold project structure.
- Define `RIS` interfaces and `IParser`, `ILLMClient`, `IKnowledgeStore` contracts.
- Implement `LocalFileSystem` and `MarkdownFileStore`.
- Implement `ConfigurationProvider`.

**Week 2: The Parser & The Brain**
- Implement `TreeSitterParser` (Support TS/JS only for Week 2).
- Implement `AnthropicAdapter` using the official SDK.
- Draft the `SYSTEM_PROMPT` and `EXTRACTION_PROMPT`.

**Week 3: The Orchestrator**
- Wire up `ToMeEngine` and `MemoryGenerationOrchestrator`.
- Implement `RISBuilder` and `MemorySerializer`.
- Get `tome init` working end-to-end on a test repository.

**Week 4: Polish & Delivery**
- Implement `tome update` (using `FullRewriteStrategy`).
- Implement the `MCPServer` wrapper.
- Comprehensive error handling and CLI UX (spinners, chalk formatting).
- Alpha Release.

---

# SECTION 20 — ARCHITECTURE DECISION RECORDS (ADR)

*The system contains the following immutable ADRs derived from the Architect Review phase:*
- **ADR-001 (Hexagonal Architecture):** Required to isolate the Core from CLI/Cloud transitions.
- **ADR-002 (RIS):** Required to prevent regex-based Markdown manipulation.
- **ADR-003 (Markdown Artifacts):** Required for IDE/Agent interoperability.
- **ADR-004 (Local First):** Required for absolute security and trust.
- **ADR-005 (BYOK):** Required to avoid backend infrastructure costs during MVP.

---

# FINAL SECTION — SYSTEM ARCHITECTURE VERDICT

**Can this architecture be implemented by One Founder + AI within a 3-6 month timeline?**
**YES.** 

The Hexagonal Architecture confines the complexity. By punting diff-based updates to Phase 2, relying on BYOK, and strictly bounding the repository size to <500 files, the engineering scope is radically compressed. A senior engineer leveraging AI coding tools can build this exact architecture in 4 to 6 weeks.

**Hardest Technical Challenge:**
Tuning the LLM Extraction Prompt to reliably return the complex `RepositoryIntelligenceState` JSON schema without hallucinating or exhausting token limits.

**Biggest Implementation Risk:**
Tree-sitter native C-bindings failing to compile on end-user machines during `npm install -g tome-cli`.

**First Validation Milestone (End of Week 3):**
Running `tome init` on a 50-file React codebase and successfully generating the 5 `.tome/` Markdown files with accurate architectural representations.

### AUTHORIZATION

The architectural blueprints are complete, sound, and fully aligned with the strategic resolutions.

**I formally authorize the transition into:**
`IMPLEMENTATION_PHASE_v1`
