# TOME_ARCHITECT_REVIEW_v1

> **Document Classification:** Architectural Review & Constraint Analysis  
> **Document Version:** 1.0  
> **Created:** 2026-06-08  
> **Status:** PRE-ARCHITECTURE REVIEW  
> **Persistence:** PERMANENT  
> **Depends On:** TOME_CONTEXT_SEED_v1, TOME_FOUNDER_BRAIN_v1, TOME_DECISION_ENGINE_v1, TOME_DECISION_RESOLUTIONS_v1

> [!CAUTION]
> This document acts as the final strategic and technical filter before System Architecture begins. Its sole purpose is to prevent premature architectural lock-in, expose fragile assumptions, and establish hard technical constraints that will protect ToMe over the next 5 years.

---

## TABLE OF CONTENTS

1. [Section 1 — Review Methodology](#section-1--review-methodology)
2. [Section 2 — Decision Audit](#section-2--decision-audit)
3. [Section 3 — Dangerous Lock-In Analysis](#section-3--dangerous-lock-in-analysis)
4. [Section 4 — Model Strategy Review](#section-4--model-strategy-review)
5. [Section 5 — Knowledge Representation Review](#section-5--knowledge-representation-review)
6. [Section 6 — API & Platform Review](#section-6--api--platform-review)
7. [Section 7 — Pricing & Business Assumptions Review](#section-7--pricing--business-assumptions-review)
8. [Section 8 — Future Optionality Framework](#section-8--future-optionality-framework)
9. [Section 9 — Architectural Constraints Register](#section-9--architectural-constraints-register)
10. [Section 10 — Final Architect Verdict](#section-10--final-architect-verdict)

---

# SECTION 1 — REVIEW METHODOLOGY

Strategic decisions (what the company wants to do) do not perfectly map 1:1 to architectural decisions (how the software is structured). If we naively hardcode every strategic resolution into the core engine, the architecture will shatter the moment the strategy pivots.

The role of the architecture is to **enable the current strategy while preserving the option to abandon it.**

We categorize constraints as follows:

*   **Hard Constraints:** Decisions that are so fundamental to the product's physics that changing them requires rewriting the entire system. These must be isolated at the edges of the system if possible, or designed around with extreme rigor.
*   **Soft Constraints:** Decisions we are making today for GTM or MVP reasons, but which the architecture must allow us to change later (e.g., supporting only single-repo).
*   **Reversible Decisions (Two-Way Doors):** Things we can change with a pull request in an afternoon (e.g., the exact LLM prompt used to generate the walkthrough).
*   **Irreversible Decisions (One-Way Doors):** Things that, once shipped to 10,000 users, become a permanent liability (e.g., the file format of `.tome/`).

**The Danger of Freezing Assumptions Too Early:**
If the architecture assumes that context windows will always be small, we might over-engineer a complex RAG system that becomes obsolete in 12 months. If we assume Tree-sitter is the only way to parse, we might lock ourselves out of future LSP advancements. We must build abstract interfaces for the most volatile components.

---

# SECTION 2 — DECISION AUDIT

### D-001 | Repository Memory Location (`.tome/` in-repo)
*   **Resolution:** `.tome/` at root.
*   **Architect Assessment:** Safe for MVP, but structurally dangerous if hardcoded deeply. Enterprise users will demand custom paths or global caching.
*   **Recommended Status:** **KEEP FLEXIBLE**
*   **Architect Commentary:** The core engine must take `storage_provider` as an interface. The default implementation is `LocalFileStorage(path=".tome")`, but the architecture must trivially support `GlobalFileStorage(path="~/.tome")` without touching core logic.

### D-002 | Memory Format (Pure Markdown)
*   **Resolution:** Pure Markdown (`.md`).
*   **Architect Assessment:** Highly volatile. While pure markdown is great for humans, relying on regex/string-matching to update it incrementally is a computer science nightmare.
*   **Recommended Status:** **DELAY (Partial Lock)**
*   **Architect Commentary:** Lock the *output* format as Markdown for the user, but the architecture must allow for an internal structured representation (JSON/AST) during the generation phase before flattening to Markdown. Do not build an engine that only thinks in text blocks.

### D-003 | Memory File Structure (The 5 Files)
*   **Resolution:** `architect`, `memory`, `guardrails`, `recover`, `walkthrough`.
*   **Architect Assessment:** Hardcoding exactly 5 filenames across the entire codebase is an anti-pattern.
*   **Recommended Status:** **KEEP FLEXIBLE**
*   **Architect Commentary:** Define a schema registry. The engine should loop over `List[MemoryArtifactDef]`. If we want to add `security.md` next year, it should require changing 1 config file, not 50 lines of core logic.

### D-004 | Dynamic vs Fixed Memory Files
*   **Resolution:** Fixed schema.
*   **Architect Assessment:** Good strategic constraint.
*   **Recommended Status:** **LOCK**
*   **Architect Commentary:** Enforce this at the schema validation layer. If the engine detects rogue files in `.tome/`, it ignores them.

### D-005 | Knowledge Layer Expansion
*   **Resolution:** Layers 1-6 only.
*   **Architect Assessment:** Matches D-003.
*   **Recommended Status:** **LOCK**

### D-006 | Manual vs Automatic Updates
*   **Resolution:** Manual CLI for MVP.
*   **Architect Assessment:** Excellent. Removes stateful daemon complexity.
*   **Recommended Status:** **LOCK**
*   **Architect Commentary:** The core generation function `generate_memory()` must be a pure, stateless function. How it is triggered (CLI, Webhook, Daemon) is the responsibility of the delivery layer, not the engine.

### D-007 | Approval Workflow
*   **Resolution:** Auto-write + CLI diff summary.
*   **Architect Assessment:** Safe.
*   **Recommended Status:** **LOCK**

### D-008 | Regeneration Strategy
*   **Resolution:** AST Parsing + Diff-Based LLM Updates.
*   **Architect Assessment:** This is the most dangerous technical assumption in the company. Diff-based LLM updates are notoriously brittle. If it fails, the MVP fails.
*   **Recommended Status:** **REVISIT LATER**
*   **Architect Commentary:** The architecture MUST support a `StrategyPattern` for updates. Start with `FullRewriteStrategy`. Implement `DiffPatchStrategy` iteratively. Do not hard-couple the entire codebase to the diffing assumption.

### D-009 | Memory Validation Strategy
*   **Resolution:** Human review only.
*   **Architect Assessment:** Saves engineering time.
*   **Recommended Status:** **LOCK**

### D-010 | Context Compression Strategy
*   **Resolution:** Strict LLM output length limits.
*   **Architect Assessment:** Prompts are cheap to change.
*   **Recommended Status:** **KEEP FLEXIBLE**

### D-011 | Repository Size Limits
*   **Resolution:** < 500 files.
*   **Architect Assessment:** Necessary for MVP stability.
*   **Recommended Status:** **LOCK**
*   **Architect Commentary:** Implement a hard circuit breaker at startup: `if file_count > 500: raise MaxSizeError`. Do not let the user burn $20 on tokens only to crash OOM.

### D-012 | Single Repo vs Multi Repo
*   **Resolution:** Single Repo strictly.
*   **Architect Assessment:** Excellent constraint.
*   **Recommended Status:** **LOCK**

### D-013 | Local First vs Cloud First
*   **Resolution:** Pure local CLI.
*   **Architect Assessment:** The defining constraint of the product.
*   **Recommended Status:** **LOCK**
*   **Architect Commentary:** The architecture must contain zero cloud dependencies. No telemetry that sends PII. No remote database connections.

### D-014 - D-016 | Team Features, Graph DBs, Predictive Tech
*   **Resolution:** Delayed/Killed.
*   **Recommended Status:** **LOCK**

### D-017 | Agent Memory Support (MCP)
*   **Resolution:** Implement an MCP Server.
*   **Architect Assessment:** MCP is a new, volatile protocol.
*   **Recommended Status:** **KEEP FLEXIBLE**
*   **Architect Commentary:** The MCP server must be a thin wrapper around the core engine. Do not let MCP types bleed into the core domain models.

### D-018 | API Strategy
*   **Resolution:** No API, files are the API.
*   **Architect Assessment:** Safe and robust.
*   **Recommended Status:** **LOCK**

### D-019 - D-022 | Customer and Business Decisions
*   **Recommended Status:** **KEEP FLEXIBLE**
*   **Architect Commentary:** Architecture doesn't care about pricing, but it *does* care about licensing. Ensure the open-source CLI core is decoupled from any future closed-source cloud sync logic.

### D-025 | Core Parsing Engine
*   **Resolution:** Tree-sitter.
*   **Architect Assessment:** Tree-sitter is fast but complex to compile across OS targets (Windows/Mac/Linux) for Node.js/Python CLI tools.
*   **Recommended Status:** **KEEP FLEXIBLE**
*   **Architect Commentary:** Abstract the parser behind an `IParser` interface. If Tree-sitter binaries cause installation nightmares for the CLI MVP, we must be able to swap it out for a naive regex/AST parser without rewriting the app.

### D-026 | Language Support
*   **Resolution:** TS/JS/Python initially.
*   **Recommended Status:** **LOCK**

### D-027 | LLM Provider Abstraction
*   **Resolution:** Hardcoded to Claude 3.5 Sonnet conceptually, but BYOK.
*   **Architect Assessment:** Never hardcode a specific model API in 2026.
*   **Recommended Status:** **KEEP FLEXIBLE**
*   **Architect Commentary:** Use standard LLM interfaces (e.g., LiteLLM or similar patterns). The user provides Anthropic keys today, but GPT-5 tomorrow.

---

# SECTION 3 — DANGEROUS LOCK-IN ANALYSIS

### 1. Model Lock-In (Anthropic)
*   **The Danger:** Anthropic deprecates Claude 3.5 Sonnet, or changes their pricing, or OpenAI releases a model 10x better and cheaper.
*   **The Protection:** The core `LLMClient` must be an interface. All prompts must be abstracted so they can be swapped per model. 

### 2. File Format Lock-In (Markdown fragility)
*   **The Danger:** If ToMe relies on parsing its *own* generated `.md` files to figure out what to update next time, any manual user edit to the Markdown might break the parsing logic.
*   **The Protection:** The `.tome/` files should contain a hidden metadata block (e.g., HTML comment `<!-- tome-checksum: 12345 -->`) to track state, or we must maintain a separate `.tome/state.json` that tracks internal AST mapping while presenting clean Markdown to the user.

### 3. Parser Lock-In (Tree-sitter binaries)
*   **The Danger:** Distributing native C-bindings (Tree-sitter) via `npm install -g` often fails on obscure Windows or Linux environments. If the CLI fails to install, adoption dies.
*   **The Protection:** Graceful degradation. If Tree-sitter fails to load, fall back to a simpler heuristic text chunker. Do not hard-crash the CLI.

---

# SECTION 4 — MODEL STRATEGY REVIEW

**Official Architecture Stance:**
ToMe must be Multi-Model at the infrastructure level, but Single-Model (Claude) optimized at the Prompt level for MVP.

*   **Configurable:** The API Base URL, API Key, Model Name, and Max Tokens must be strictly injected via environment variables or `.tomerc`.
*   **Abstracted:** Do not use Anthropic-specific SDK features (like Cache headers) in the core domain logic without an abstraction layer. If we use Prompt Caching, wrap it so it doesn't break when OpenAI is used.
*   **Hardcoded:** Nothing. Do not hardcode "claude-3-5-sonnet-20240620" into the source code. Put it in `defaultConfig.json`.

---

# SECTION 5 — KNOWLEDGE REPRESENTATION REVIEW

**The Dual-Representation Architecture:**
The decision to use pure Markdown is a *User Experience* decision. It must NOT dictate the *Internal Architecture*.

If the internal engine only passes strings around, we will fail at incremental updates (D-008). 

**The Solution:**
1.  **Internal State:** The architecture must represent the project as a strongly typed internal object: `ProjectKnowledgeGraph` or `RepositoryAST`. 
2.  **Synthesis Engine:** The LLM takes code diffs and updates the `ProjectKnowledgeGraph` in memory (likely via structured JSON responses).
3.  **Serialization Layer:** The final step is flattening the `ProjectKnowledgeGraph` into the 5 Markdown files.

Markdown is the *view*. JSON/AST is the *model*. Do not mix them.

---

# SECTION 6 — API & PLATFORM REVIEW

**Current Requirement:** No REST API. Just files.
**Immediate Future Requirement:** MCP Server.

**Architecture Protection:**
The core application must be written as a library, NOT just a CLI script.
*   **Bad:** `index.ts` reads files, calls LLM, writes files, exits.
*   **Good:** `ToMeEngine` class that takes `IFileSystem` and `ILLMClient`. The CLI is just a thin `cli.ts` wrapper around `ToMeEngine`. The MCP Server is just a thin `mcp.ts` wrapper around `ToMeEngine`.

This guarantees we can embed ToMe into a VS Code Extension, an MCP server, or a cloud backend later without rewriting the logic.

---

# SECTION 7 — PRICING & BUSINESS ASSUMPTIONS REVIEW

**The Assumption:** Users will bring their own Anthropic keys (BYOK).
**The Risk:** Most junior developers do not have Anthropic API billing set up. They use Claude Pro (web) or Cursor (subscription). 

**Architecture Implication:**
If BYOK causes a 90% drop-off in the onboarding funnel, we will immediately need to route traffic through a ToMe-hosted proxy server where we pay the API costs (and charge a SaaS fee).

**The Protection:**
The `LLMClient` must support a `proxy_url` configuration from Day 1. Even in the local-first MVP, the architecture must support pointing the LLM requests to `api.tome.dev` instead of `api.anthropic.com` by simply flipping a config switch.

---

# SECTION 8 — FUTURE OPTIONALITY FRAMEWORK

To preserve optionality for the next 5 years, the architecture must adhere to the **Hexagonal Architecture (Ports and Adapters)** pattern.

*   **Core Domain:** The logic of extracting, updating, and structuring project memory.
*   **Ports (Interfaces):** `IFileSystem`, `ILLMProvider`, `IParser`, `IConfigProvider`.
*   **Adapters (Implementations):** `LocalFileSystem`, `AnthropicLLM`, `TreeSitterParser`, `DotEnvConfig`.

If we want to move to the Cloud (Phase 3), we swap `LocalFileSystem` for `S3FileSystem`.
If we want to support Llama 3 locally, we swap `AnthropicLLM` for `OllamaLLM`.
The Core Domain remains 100% untouched.

---

# SECTION 9 — ARCHITECTURAL CONSTRAINTS REGISTER

| ID | Constraint | Reason | Priority | Status |
| :--- | :--- | :--- | :--- | :--- |
| **AC-001** | **Hexagonal Core** | Prevents CLI/Cloud lock-in. | P0 | MUST HAVE |
| **AC-002** | **Stateless Generation** | Prevents complex daemon management. | P0 | MUST HAVE |
| **AC-003** | **Dual Representation** | Markdown for users, structured AST for internal engine. | P0 | MUST HAVE |
| **AC-004** | **Circuit Breaker (>500 files)** | Prevents massive token burns and OOM errors. | P1 | MUST HAVE |
| **AC-005** | **Zero Cloud Dependencies** | Secures the local-first privacy guarantee. | P0 | MUST HAVE |
| **AC-006** | **Abstracted LLM Client** | Prevents Anthropic/OpenAI lock-in. | P1 | MUST HAVE |
| **AC-007** | **Graceful Parser Degradation** | Prevents installation failures if C-bindings break. | P2 | SHOULD HAVE |
| **AC-008** | **Proxy-Ready Network Layer** | Allows immediate pivot to SaaS proxy if BYOK fails. | P1 | SHOULD HAVE |

---

# SECTION 10 — FINAL ARCHITECT VERDICT

If the implementation team ignores everything else, they must obey these 10 Architectural Commandments:

1.  **Thou shalt not mix the view (Markdown) with the model (Internal JSON/AST).**
2.  **Thou shalt write a library, not a script. The CLI is merely a consumer.**
3.  **Thou shalt not hardcode API providers, models, or base URLs.**
4.  **Thou shalt not read or write to the filesystem outside of an injected interface.**
5.  **Thou shalt crash gracefully with clear token limits before bankrupting the user.**
6.  **Thou shalt assume diff-based LLM updating will fail, and build full-rewrite fallbacks.**
7.  **Thou shalt rely on zero external network services other than the LLM endpoint.**
8.  **Thou shalt make installation (npm/binary) completely frictionless—no C++ compilers required.**
9.  **Thou shalt not invent new file formats; Markdown is law.**
10. **Thou shalt optimize for extreme accuracy over extreme speed. Waiting 60 seconds is fine; hallucinating architecture is fatal.**

***End of Pre-Architecture Review. Proceed to System Architecture.***
