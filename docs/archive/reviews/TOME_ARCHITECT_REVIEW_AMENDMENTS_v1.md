# TOME_ARCHITECT_REVIEW_AMENDMENTS_v1

> **Document Classification:** Architectural Review Amendments  
> **Document Version:** 1.0  
> **Created:** 2026-06-08  
> **Status:** FINAL PRE-ARCHITECTURE REVIEW  
> **Persistence:** PERMANENT  
> **Depends On:** TOME_ARCHITECT_REVIEW_v1

> [!CAUTION]
> This document acts as an amendment layer on top of TOME_ARCHITECT_REVIEW_v1. Its purpose is to resolve a small number of remaining architectural concerns that could create long-term lock-in, reduce optionality, or unnecessarily constrain future evolution. Once accepted, System Architecture may commence.

---

## TABLE OF CONTENTS

1. [Required Amendment 1 — Local-First vs Zero-Cloud Clarification](#required-amendment-1--local-first-vs-zero-cloud-clarification)
2. [Required Amendment 2 — Markdown Law Clarification](#required-amendment-2--markdown-law-clarification)
3. [Required Amendment 3 — Knowledge Graph Position Reassessment](#required-amendment-3--knowledge-graph-position-reassessment)
4. [Required Amendment 4 — MCP Dependency Risk Analysis](#required-amendment-4--mcp-dependency-risk-analysis)
5. [Required Amendment 5 — Repository Intelligence Layer Formalization](#required-amendment-5--repository-intelligence-layer-formalization)
6. [Required Amendment 6 — Product Constraints vs Architectural Constraints](#required-amendment-6--product-constraints-vs-architectural-constraints)
7. [Required Amendment 7 — Memory Quality Feedback Loop Reservation](#required-amendment-7--memory-quality-feedback-loop-reservation)
8. [Architectural Flexibility Scorecard](#architectural-flexibility-scorecard)
9. [Architect Final Readiness Verdict](#architect-final-readiness-verdict)

---

# REQUIRED AMENDMENT 1
## Local-First vs Zero-Cloud Clarification

**Context:** AC-005 mandated "Zero Cloud Dependencies" to secure the local-first privacy guarantee. 

**Architectural Analysis:** 
Conflating "Local First" with "Zero Cloud" is an architectural hazard. If the architecture is physically incapable of utilizing cloud networks, we eliminate our own monetization path (Cloud SaaS Proxy) and team synchronization features (Phase 6). Privacy and user trust are maintained by *Network Sovereignty*, not the physical absence of network requests. The user must be the sovereign authority over where data flows.

**Resolution:**
The architecture must *default* to zero ToMe cloud dependencies, but it must be completely network-capable. 

**Revised Constraint (Replaces AC-005):**
**AC-005-AMENDED: Network Sovereignty.**
The Core Engine must be capable of executing entirely offline (assuming a local LLM or direct third-party API connection). However, the network layer must support configurable proxy routing. ToMe infrastructure dependencies must remain strictly opt-in via configuration. The architecture preserves privacy by defaulting to local connections, but preserves optionality by utilizing injectable network adapters.

---

# REQUIRED AMENDMENT 2
## Markdown Law Clarification

**Context:** The Architect Verdict stated: "Markdown is law."

**Architectural Analysis:**
If "Markdown is law" is applied universally, it infects the internal domain model. If the Core Engine parses code and immediately tries to manipulate raw Markdown strings in memory to figure out how to update `architect.md`, the codebase will devolve into unmaintainable regex spaghetti. 

**Resolution:**
Markdown is an *Export Format*, not an *Internal State*. 

**Revised Architectural Doctrine:**
**The Boundary of Markdown:**
1. **User-Facing Representation:** Strict Markdown. This is what the user reads, edits, and commits.
2. **Internal Representation:** Strongly-typed objects (e.g., `MemoryState`, `ArchitecturalNode`, `DependencyEdge`). The engine reasons over graphs and trees, never raw text.
3. **Serialization Boundaries:** The Storage Adapter is responsible for flattening the Internal Representation into Markdown during the `write` phase, and re-hydrating the Internal Representation from Markdown (plus diffs) during the `read` phase. 

Markdown governs the artifacts. Structured types govern the architecture.

---

# REQUIRED AMENDMENT 3
## Knowledge Graph Position Reassessment

**Context:** Previous decisions explicitly killed the Knowledge Graph in favor of Markdown.

**Architectural Analysis:**
"Never" is a dangerous word in systems architecture. While building a Neo4j backend for a CLI MVP is a massive mistake, hardcoding the system so that it *cannot* support a graph database later limits Phase 8 (Enterprise Multi-Repo). We do not need a graph database today, but we need the *shape* of our architecture to allow one tomorrow.

**Resolution:**
Optionality must be preserved at the Storage Interface level.

**Revised Architectural Doctrine:**
The architecture will define an `IKnowledgeStore` interface. For the next two years, the only implementation of this interface will be `MarkdownFileStore` (which writes `.md` files to `.tome/`). However, by forcing the Core Engine to interface with `IKnowledgeStore` rather than calling `fs.writeFileSync` directly, we preserve the ability to seamlessly introduce `Neo4jKnowledgeStore` for enterprise clients later without changing a single line of business logic.

---

# REQUIRED AMENDMENT 4
## MCP Dependency Risk Analysis

**Context:** We resolved to build an MCP Server to integrate with Claude Code, Devin, and Cursor.

**Architectural Analysis:**
MCP (Model Context Protocol) is a new, volatile standard pushed heavily by Anthropic. If MCP wins, we ride the wave. If MCP is deprecated or fractured by competitors (e.g., OpenAI releases an incompatible standard), any deep architectural coupling to MCP will require a massive rewrite.

**Resolution:**
MCP is a Delivery Adapter, not Core Infrastructure. 

**Protocol-Neutral Doctrine:**
The Core Engine must remain completely ignorant of MCP, JSON-RPC, HTTP, or CLI environments. The engine simply returns raw `ProjectContext` objects. The `MCPServerAdapter` will translate `ProjectContext` into the specific JSON-RPC format required by the MCP standard. If MCP dies and is replaced by "Protocol X", we simply write a `ProtocolXAdapter` and discard the MCP adapter. The core survives unchanged.

---

# REQUIRED AMENDMENT 5
## Repository Intelligence Layer Formalization

**Context:** The pipeline assumes Tree-sitter extracts data, passes it to the LLM, and writes Markdown.

**Architectural Analysis:**
Passing raw AST data directly to an LLM alongside previous Markdown memory is inefficient and prone to hallucination. The architecture requires a formal intermediate representation to hold the "understood state" of the codebase before it is serialized to Markdown.

**Resolution:**
Introduce the **Repository Intelligence State (RIS)**.

**Revised Architectural Doctrine:**
The pipeline requires an explicit intermediate model:
1. **Code Repository** → (Tree-sitter Parser) → **Syntax Skeleton**
2. **Syntax Skeleton + LLM Extraction** → **Repository Intelligence State (RIS)**
3. **Repository Intelligence State (RIS)** → (Serializer) → **Markdown Memory**

The RIS is an in-memory data structure (e.g., a JSON-like object representing recognized domains, boundaries, and rules). 
*Why:* When a developer makes a small change, we don't ask the LLM to rewrite the Markdown. We update the RIS, ask the LLM to validate the delta, and then re-serialize the affected portion of the RIS to Markdown. This protects future diff-based updates from becoming brittle text-replacement operations.

---

# REQUIRED AMENDMENT 6
## Product Constraints vs Architectural Constraints

**Context:** The product resolution set a hard limit of < 500 files for a repository.

**Architectural Analysis:**
Enforcing a 500-file limit by hardcoding `if (files.length > 500)` into the core parsing loop is a violation of separation of concerns. It bakes a Go-To-Market and MVP pricing constraint into the physics of the system. The architecture itself should theoretically scale to 10,000 files if given enough compute.

**Resolution:**
The limit belongs in configuration, not in architecture.

**Revised Guidance:**
The Core Engine must handle pagination, batching, and stream processing of files, assuming an unbounded repository size. The limit must be injected via a `ConfigProvider` interface (`max_files_allowed = 500`). This ensures the MVP constraint is respected to prevent OOM/token burn, but allows us to instantly scale to Enterprise limits simply by changing a configuration value, rather than re-engineering the parsing engine.

---

# REQUIRED AMENDMENT 7
## Memory Quality Feedback Loop Reservation

**Context:** We rely entirely on human visual review for memory validation. 

**Architectural Analysis:**
In the future, we will need to measure memory decay, hallucination rates, and prompt quality. We cannot do this if our generated artifacts are just plain text without any provenance or tracking mechanisms. We must reserve a space for metadata now, even if we do nothing with it.

**Resolution:**
Reserve a non-intrusive metadata block in the artifact serialization.

**Revised Architectural Doctrine:**
Every generated Markdown file must support an optional YAML Frontmatter block (or a hidden HTML comment at the EOF). 
Example:
```yaml
---
tome_version: 1.0.0
generation_timestamp: 2026-06-08T00:00:00Z
model_used: claude-3-5-sonnet
checksum: 8f9a2b...
---
```
We do not build telemetry or cloud sync yet. But by establishing this schema boundary in the architecture *today*, we reserve the right to inject quality scores, user validation booleans, or deterministic update hashes in the future without breaking backwards compatibility.

---

# ARCHITECTURAL FLEXIBILITY SCORECARD

Evaluating the amended architecture's readiness for long-term evolution.

| Subsystem | Flexibility Score (1-10) | Lock-In Risk | Future Evolution Difficulty | Recommendations |
| :--- | :--- | :--- | :--- | :--- |
| **Storage (Markdown vs Graph)** | 9 | Low | Low | IKnowledgeStore interface abstracts away file-system lock-in. |
| **Parsing (Tree-sitter)** | 7 | Medium | Medium | Must ensure fallback chunking exists if C-bindings fail. |
| **LLM Integration (Claude)** | 10 | Low | Low | Abstracted ILLMClient ensures we can swap to OpenAI/Local models instantly. |
| **Knowledge Representation** | 8 | Low | Medium | The formalization of the RIS (Repository Intelligence State) solves text-fragility. |
| **Memory Generation** | 7 | Medium | High | Diff-based updates remain the hardest technical challenge. Keep strategy patterns available. |
| **Context Serving (MCP)** | 9 | Low | Low | MCP is treated purely as a Delivery Adapter. Zero core lock-in. |
| **Delivery Layer (CLI vs Cloud)** | 10 | Low | Low | Hexagonal architecture allows the Core to run in a CLI, a VS Code extension, or a Cloud worker. |

---

# ARCHITECT FINAL READINESS VERDICT

**"Is ToMe ready for System Architecture?"**

**YES.**

The strategic foundation is solid. The architectural constraints have been stress-tested. The amendments in this document have successfully removed the remaining structural traps (conflating Markdown view with internal state, conflating Local-First with physical network limits, and risking protocol lock-in with MCP).

### Remaining Known Risks (Accepted)
1. **Tree-sitter Distribution:** Distributing native binaries in a Node CLI will cause some installation friction. We accept this in exchange for AST accuracy.
2. **Diff-Patching LLM Reliability:** Updating existing files incrementally via LLM is inherently probabilistic. We accept this, mitigating it via the Repository Intelligence State (RIS) and fallback rewrite strategies.

### Authorizations
The conceptual phase is formally concluded. The constraints are locked.

I explicitly authorize the transition into technical design.
Proceed to generate: **TOME_SYSTEM_ARCHITECTURE_v1**.
