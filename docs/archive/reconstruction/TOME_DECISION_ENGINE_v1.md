# TOME_DECISION_ENGINE_v1

> **Document Classification:** Founder Strategic Decision Artifact  
> **Document Version:** 1.0  
> **Created:** 2026-06-08  
> **Status:** ACTIVE — STRATEGIC OPERATING SYSTEM  
> **Persistence:** PERMANENT  
> **Depends On:** TOME_CONTEXT_SEED_v1.md, TOME_FOUNDER_BRAIN_v1.md  

> [!CAUTION]
> This document captures every major decision that will determine the future shape of ToMe before implementation begins. The goal is not to make all decisions immediately, but to expose them. It prevents accidental company formation through hidden assumptions. All future builders, investors, advisors, employees, and AI systems must reference this document to understand what is decided, what is open, and what assumptions are being tested.

---

## TABLE OF CONTENTS

1. [Section 1 — Purpose of the Decision Engine](#section-1--purpose-of-the-decision-engine)
2. [Section 2 — Decision Framework](#section-2--decision-framework)
3. [Section 3 — Master Decision Index](#section-3--master-decision-index)
4. [Section 4 — Product Decisions](#section-4--product-decisions)
5. [Section 5 — Customer Decisions](#section-5--customer-decisions)
6. [Section 6 — Business Model Decisions](#section-6--business-model-decisions)
7. [Section 7 — Competitive Decisions](#section-7--competitive-decisions)
8. [Section 8 — Technology Decisions](#section-8--technology-decisions)
9. [Section 9 — Go-To-Market Decisions](#section-9--go-to-market-decisions)
10. [Section 10 — Organizational Decisions](#section-10--organizational-decisions)
11. [Section 11 — Future Category Decisions](#section-11--future-category-decisions)
12. [Section 12 — Assumptions Register](#section-12--assumptions-register)
13. [Section 13 — Unknowns Register](#section-13--unknowns-register)
14. [Section 14 — Critical Decisions Roadmap](#section-14--critical-decisions-roadmap)
15. [Section 15 — Founder Recommendations](#section-15--founder-recommendations)

---

# SECTION 1 — PURPOSE OF THE DECISION ENGINE

Strategic decisions must be separated from implementation. When they are not, implementation details become de facto strategic decisions. 

**The Danger of Implicit Assumptions**
Founders carry hundreds of implicit assumptions. "Of course we'll use a SaaS model." "Of course it will be an open-source CLI." "Of course we'll use embeddings." When these assumptions remain implicit, they cannot be debated, tested, or invalidated. They become invisible constraints on the company's future. 

**The Danger of AI-Generated Architecture**
In the era of AI-assisted development, there is a new and profound danger: AI systems making strategic decisions automatically. If an AI agent is asked to "build the memory generation pipeline," it will invent a database schema, choose a file parsing strategy, and decide how diffs are calculated. Without an explicit decision engine, the AI's default choices become the company's architecture. The founder abdicates strategy to statistical probability.

**Conscious Tradeoffs**
Every startup is a collection of tradeoffs. Speed vs. completeness. Security vs. convenience. Integration vs. standalone. This document exists to force conscious choice. By explicitly listing every decision, tradeoff, and assumption, the founder ensures that the company is built by design, not by default. 

This document is the firewall between Founder Brain and implementation. It translates philosophical convictions into structural constraints.

---

# SECTION 2 — DECISION FRAMEWORK

## Decision Status Types

| Status | Definition |
|---|---|
| **DECIDED** | The decision is finalized and ready for implementation. |
| **LEANING** | The founder has a preferred direction but remains open to counter-evidence before finalizing. |
| **OPEN** | No preferred direction yet. Requires active investigation, research, or prototyping. |
| **BLOCKED** | Cannot be decided until a prerequisite decision is made or external information is obtained. |
| **INVALIDATED** | An option that was previously considered but explicitly rejected. |

## Decision Confidence Scale

| Confidence | Meaning |
|---|---|
| **90–100%** | Absolute conviction. Would require overwhelming evidence to reverse. |
| **70–89%** | Strong preference. The default path, but open to strong counterarguments. |
| **50–69%** | Best guess based on current (incomplete) information. Acknowledged high risk of being wrong. |
| **0–49%** | Active uncertainty. The decision is essentially a coin flip or purely speculative. |

## Decision Impact Levels

| Impact | Definition |
|---|---|
| **Existential** | Getting this wrong kills the company. |
| **High** | Determines major product trajectory, market position, or revenue. Hard to reverse. |
| **Medium** | Important structural or technical choices. Reversible but expensive. |
| **Low** | Implementation details that can be easily changed later without strategic damage. |

## Decision Triggers

Decisions are anchored to temporal or milestone triggers. When does the decision *must* be made?
- **Before MVP**
- **Before Alpha**
- **Before Beta**
- **Before Public Launch**
- **Before Monetization**
- **Before Team Expansion**
- **Before Enterprise Launch**
- **Before Platform Phase**

---

# SECTION 3 — MASTER DECISION INDEX

| ID | Title | Category | Status | Confidence | Impact | Trigger |
|---|---|---|---|---|---|---|
| **D-001** | Repository Memory Location | Product | LEANING | 80% | High | Before MVP |
| **D-002** | Memory Format | Product | LEANING | 75% | High | Before MVP |
| **D-003** | Memory File Structure | Product | DECIDED | 70% | High | Before MVP |
| **D-004** | Dynamic vs Fixed Memory Files | Product | DECIDED | 85% | Medium | Before Alpha |
| **D-005** | Knowledge Layer Expansion | Product | DECIDED | 90% | Medium | Before Beta |
| **D-006** | Manual vs Automatic Updates | Product | LEANING | 60% | High | Before Beta |
| **D-007** | Approval Workflow | Product | LEANING | 70% | Medium | Before Public Launch |
| **D-008** | Regeneration Strategy | Product | OPEN | 40% | High | Before MVP |
| **D-009** | Memory Validation Strategy | Product | OPEN | 30% | High | Before Beta |
| **D-010** | Context Compression Strategy | Product | BLOCKED | 50% | High | Before Public Launch |
| **D-011** | Repository Size Limits | Product | OPEN | 50% | Medium | Before Alpha |
| **D-012** | Single Repo vs Multi Repo | Product | DECIDED | 90% | High | Before Enterprise |
| **D-013** | Local First vs Cloud First | Product | DECIDED | 85% | Existential | Before MVP |
| **D-014** | Team Features Timing | Product | LEANING | 75% | High | Before Monetization |
| **D-015** | Knowledge Graph Timing | Product | OPEN | 40% | High | Before Platform Phase |
| **D-016** | Predictive Intelligence Timing | Product | BLOCKED | 20% | Medium | Before Platform Phase |
| **D-017** | Agent Memory Support | Product | LEANING | 60% | High | Before Public Launch |
| **D-018** | API Strategy | Product | LEANING | 70% | High | Before Platform Phase |
| **D-019** | First Customer Segment | Customer | LEANING | 65% | Existential | Before Alpha |
| **D-020** | Monetization Trigger | Business | OPEN | 40% | Existential | Before Public Launch |
| **D-021** | Pricing Model | Business | OPEN | 30% | High | Before Monetization |
| **D-022** | Open Source Strategy | Business | LEANING | 60% | Existential | Before Public Launch |
| **D-023** | Standard Format Ownership | Competitive | LEANING | 70% | Existential | Before Beta |
| **D-024** | Response to IDE Native Memory | Competitive | OPEN | 40% | Existential | Before Public Launch |
| **D-025** | Core Parsing Engine | Tech | OPEN | 30% | High | Before MVP |
| **D-026** | Language Support Strategy | Tech | LEANING | 80% | Medium | Before MVP |
| **D-027** | LLM Provider Abstraction | Tech | DECIDED | 95% | High | Before MVP |
| **D-028** | Local vs Cloud Models | Tech | OPEN | 50% | High | Before Beta |
| **D-029** | Initial Distribution Channel | GTM | LEANING | 70% | High | Before Public Launch |
| **D-030** | Cofounder vs Solo | Org | LEANING | 60% | Existential | Before Monetization |
| **D-031** | Ultimate Category Position | Category | LEANING | 60% | Existential | Before Platform Phase |

---

# SECTION 4 — PRODUCT DECISIONS

### D-001 Repository Memory Location
**Question:** Where should the generated memory artifacts reside?
**Context:** They can live in the repository (e.g., `.tome/`), in a global local config (e.g., `~/.tome/`), or exclusively in the cloud.
**Options:** 
1. In-repo (`.tome/`) 
2. Global local cache
3. Cloud-only
**Pros:** In-repo is portable, version-controlled with Git, and requires no external dependency. 
**Cons:** In-repo creates clutter, increases repo size, and risks exposing sensitive business intent if the repo is public.
**Risks:** If developers view `.tome/` as polluting their repository, they won't adopt it. If sensitive data leaks, ToMe becomes a security liability.
**Dependencies:** .gitignore handling strategy.
**Validation Experiments:** A/B test early users with in-repo vs global local cache.
**Current Lean:** In-repo (`.tome/`). 
**Confidence:** 80%. 
**Decision Trigger:** Before MVP.

### D-002 Memory Format
**Question:** What file format represents project intelligence?
**Context:** Markdown is human-readable; JSON/YAML is machine-readable; Knowledge Graphs are semantically rich.
**Options:** 
1. Pure Markdown (`.md`)
2. Markdown with YAML frontmatter
3. JSON/YAML only
4. SQLite / Local Vector DB
**Pros:** Markdown is easily readable by developers and natively supported by all IDEs and Git providers. LLMs consume Markdown exceptionally well.
**Cons:** Markdown lacks rigid structure, making it harder for ToMe to parse its own files later for incremental updates.
**Risks:** Format fragility. If ToMe needs to parse its own memory to update it, regexing Markdown is a nightmare.
**Dependencies:** Regeneration Strategy (D-008).
**Validation Experiments:** Build a prototype updater that tries to merge new intelligence into an existing `.md` file vs a `.json` file.
**Current Lean:** Pure Markdown (`.md`) for the MVP, potentially moving to Markdown with YAML metadata.
**Confidence:** 75%.
**Decision Trigger:** Before MVP.

### D-003 Memory File Structure
**Question:** How is memory divided?
**Context:** The Founder Brain identifies 5 core files: `architect`, `memory`, `guardrails`, `recover`, `walkthrough`.
**Options:** 
1. Monolithic `tome.md`
2. The exact 5-file split
3. N-files based on repo size (e.g., one memory file per service)
**Pros:** 5 files categorize the 6 knowledge layers perfectly. It maps to distinct AI failure modes.
**Cons:** Adding 5 files to a repo is a heavier footprint than 1 file.
**Risks:** Context fragmentation if an AI assistant only loads one file but needs context from another.
**Dependencies:** Context Compression Strategy (D-010).
**Validation Experiments:** N/A (already established through lived experience).
**Current Lean:** The exact 5-file split.
**Confidence:** 70%.
**Decision Trigger:** Before MVP.

### D-004 Dynamic vs Fixed Memory Files
**Question:** Should ToMe dynamically create new memory files based on project needs, or stick to a strict schema?
**Context:** A large microservices repo might need `architect-auth.md` and `architect-payments.md`.
**Options:** 
1. Fixed strict schema (always 5 files)
2. Dynamic schema (N files based on heuristics)
**Pros:** Fixed schema is predictable for AI tools to load.
**Cons:** Fixed schema does not scale to monorepos.
**Risks:** Monorepos will break the fixed schema limitation quickly.
**Dependencies:** Repository Size Limits (D-011).
**Current Lean:** Fixed schema for MVP. Complexity is the enemy of launch.
**Confidence:** 85%.
**Decision Trigger:** Before Alpha.

### D-005 Knowledge Layer Expansion
**Question:** Will ToMe support layers 7-10 (Social, Operational, Security, Cultural) in the MVP?
**Context:** Founder Brain considered these but deferred them.
**Current Lean:** No. MVP strictly adheres to Layers 1-6.
**Confidence:** 90%.
**Decision Trigger:** Before Beta.

### D-006 Manual vs Automatic Updates
**Question:** How is memory kept fresh?
**Context:** Memory decays. Do we update it on every commit, on a schedule, or only when the user runs `tome update`?
**Options:** 
1. Fully manual (`tome generate` CLI)
2. Git hooks (post-commit / pre-push)
3. Background watcher daemon
4. Cloud CI/CD pipeline
**Pros:** Manual is safe and predictable. Automatic prevents decay.
**Cons:** Manual guarantees eventual decay. Automatic consumes massive token costs and may overwrite human edits.
**Risks:** If automatic updates cost $5 in API fees per day, developers will uninstall it.
**Dependencies:** Pricing Model (D-021), LLM Provider Abstraction (D-027).
**Validation Experiments:** Build manual first, observe how fast it goes stale for beta users.
**Current Lean:** Manual for MVP, shifting to Git hooks for Beta.
**Confidence:** 60%.
**Decision Trigger:** Before Beta.

### D-007 Approval Workflow
**Question:** Does memory generation require human approval before being written to disk?
**Context:** AI hallucinations in memory files are dangerous.
**Options:** 
1. Auto-write to `.tome/`
2. Write to a `.tome-draft/` directory or interactive CLI prompt
3. Generate Git branch and PR
**Current Lean:** Auto-write for MVP (to reduce friction), but generate a diff for the user to review. 
**Confidence:** 70%.
**Decision Trigger:** Before Public Launch.

### D-008 Regeneration Strategy
**Question:** When updating, does ToMe rewrite from scratch or incrementally diff?
**Context:** Rewriting from scratch is expensive but easy. Incremental updates are cheap but extremely hard to build reliably.
**Options:** 
1. Full AST parse + full LLM rewrite every time
2. Diff-based LLM updates
3. Abstract syntax tree matching
**Pros:** Full rewrite guarantees no drift between code and memory.
**Cons:** Prohibitively expensive on 500-file repositories.
**Risks:** MVP dies if it costs $10 to update memory for a medium repo.
**Dependencies:** Core Parsing Engine (D-025).
**Current Lean:** OPEN. This is the hardest technical problem in Phase 2.
**Confidence:** 40%.
**Decision Trigger:** Before MVP.

### D-009 Memory Validation Strategy
**Question:** How does ToMe know if its generated memory is actually correct?
**Current Lean:** OPEN. We lack a rigorous mathematical or automated way to verify semantic architecture. Relies purely on human visual review for MVP.
**Confidence:** 30%.
**Decision Trigger:** Before Beta.

### D-010 Context Compression Strategy
**Question:** When an AI tool reads `.tome/`, how do we ensure it doesn't blow up the context window?
**Context:** If all 5 memory files total 100k tokens, we've recreated the context exhaustion problem.
**Options:** 
1. Enforce strict length limits during generation
2. Build a ToMe Context Server (MCP) that serves only relevant chunks
**Current Lean:** BLOCKED. Depends on how large the files actually get in real-world testing.
**Confidence:** 50%.
**Decision Trigger:** Before Public Launch.

### D-011 Repository Size Limits
**Question:** What is the maximum repo size ToMe MVP will support?
**Options:** <100 files, <500 files, Unbounded.
**Current Lean:** OPEN. Will test bounds during development.

### D-012 Single Repo vs Multi Repo Support
**Question:** Does ToMe handle cross-repo intelligence (microservices)?
**Current Lean:** DECIDED. Single repo only for Phases 1-5. Cross-repo is Phase 8+ (Enterprise).
**Confidence:** 90%.
**Decision Trigger:** Before Enterprise.

### D-013 Local First vs Cloud First
**Question:** Does ToMe require a cloud backend to generate memory?
**Context:** Code privacy is paramount for developers.
**Options:** 
1. Pure local CLI (API keys stored locally, hits OpenAI/Anthropic directly)
2. Cloud proxy CLI (hits ToMe servers, which hit LLMs)
3. Full Cloud SaaS (GitHub app)
**Pros:** Pure local requires zero backend infrastructure, has zero latency, and zero privacy liability for the founder.
**Cons:** Pure local is harder to monetize (no SaaS gate).
**Risks:** Cloud-first will face immediate enterprise security objections.
**Current Lean:** Pure local CLI for MVP. (DECIDED).
**Confidence:** 85%.
**Decision Trigger:** Before MVP.

### D-014 Team Features Timing
**Question:** When does ToMe handle multi-developer sync and conflict resolution?
**Current Lean:** Post-Monetization. The solo developer must love it first.
**Confidence:** 75%.
**Decision Trigger:** Before Monetization.

### D-015 Knowledge Graph Timing
**Question:** When does ToMe transition from Markdown to an actual graph database?
**Current Lean:** OPEN. Only if Markdown proves completely inadequate.
**Confidence:** 40%.
**Decision Trigger:** Before Platform Phase.

### D-016 Predictive Intelligence Timing
**Question:** When does ToMe start predicting technical debt?
**Current Lean:** BLOCKED. Distraction from core memory retention.
**Confidence:** 20%.
**Decision Trigger:** Before Platform Phase.

### D-017 Agent Memory Support
**Question:** Does ToMe build specific integrations for Devin/OpenHands, or just output Markdown and assume they read it?
**Current Lean:** LEANING toward relying on standard Markdown. The beauty of Markdown is we don't *need* custom integrations.
**Confidence:** 60%.
**Decision Trigger:** Before Public Launch.

### D-018 API Strategy
**Question:** Does ToMe offer an API for other tools to query project memory?
**Current Lean:** LEANING yes, but as a Phase 7 feature. 
**Confidence:** 70%.
**Decision Trigger:** Before Platform Phase.

---

# SECTION 5 — CUSTOMER DECISIONS

### D-019 First Customer Segment
**Question:** Who is the exact target persona for the MVP?
**Options:**
1. Solo AI developers (Indie hackers)
2. Startup teams (Seed/Series A)
3. Open source maintainers
4. Enterprise architects
**Analysis:**
- **Solo AI developers:** Experience the highest pain (they use AI for *everything*), adopt easiest, pay worst.
- **Startup teams:** High pain (rapid iteration, high turnover), pay better, moderate adoption friction.
- **Enterprise:** Highest willingness to pay, highest friction, impossible for a solo founder MVP.
**Risks:** If we target solo developers, we might build a tool that teams can't use. If we target teams, we might build a tool that is too heavy for solo adoption.
**Current Lean:** Solo AI developers. Prove the core thesis on the most bleeding-edge users. 
**Confidence:** 65%.
**Decision Trigger:** Before Alpha.

---

# SECTION 6 — BUSINESS MODEL DECISIONS

### D-020 Monetization Trigger
**Question:** When does ToMe start charging money?
**Options:**
1. Day 1 (paid CLI tool)
2. Post-Beta (freemium)
3. Post-Cloud Integration (charge for sync/team features)
**Risks:** Charging Day 1 kills viral open-source adoption. Waiting too long starves the company.
**Current Lean:** OPEN. 
**Confidence:** 40%.
**Decision Trigger:** Before Public Launch.

### D-021 Pricing Model
**Question:** How does ToMe extract value?
**Options:**
1. Per-seat SaaS subscription (e.g., $20/mo)
2. Usage-based (markup on token costs for generation)
3. One-time license (like early Sketch/Sublime)
4. Free open-source core, paid enterprise cloud
**Risks:** Developer tools are notoriously difficult to monetize via SaaS unless they host critical infrastructure (like Vercel) or provide proprietary models (like GitHub Copilot).
**Current Lean:** OPEN. Heavily leaning toward Free OSS Core + Paid Cloud Sync/GitHub Actions.
**Confidence:** 30%.
**Decision Trigger:** Before Monetization.

### D-022 Open Source Strategy
**Question:** Is the core ToMe engine open source?
**Options:**
1. Fully closed source
2. Open core (MIT/Apache)
3. Source-available (BSL)
**Pros:** Open source drives maximum top-of-funnel adoption, establishes the `.tome` format as a standard, and reduces security fears.
**Cons:** Vulnerable to cloning by major players. Harder to monetize the CLI.
**Risks:** If OpenAI clones an open-source ToMe, they can integrate it directly into their ecosystem, bypassing us completely.
**Current Lean:** Open core. The parsing and generation logic should be open to establish the standard.
**Confidence:** 60%.
**Decision Trigger:** Before Public Launch.

---

# SECTION 7 — COMPETITIVE DECISIONS

### D-023 Standard Format Ownership
**Question:** Does ToMe attempt to control the `.tome` specification, or donate it to a foundation?
**Context:** If we want `.tome` to be the "Git of memory", it must be trusted.
**Options:**
1. Proprietary standard
2. Open standard controlled by ToMe Inc.
3. Donated standard (e.g., Linux Foundation)
**Current Lean:** Open standard controlled by ToMe Inc for now.
**Confidence:** 70%.
**Decision Trigger:** Before Beta.

### D-024 Response to IDE Native Memory
**Question:** What happens if Cursor launches `.cursor/memory` that does exactly what ToMe does, but natively integrated?
**Context:** This is the highest existential risk.
**Options:**
1. Pivot to supporting only non-Cursor IDEs
2. Compete on memory quality and depth
3. Pivot to a GitHub-native strategy (PR reviews, CI/CD memory)
**Current Lean:** OPEN. The defense is cross-tool portability. Cursor memory only works in Cursor. ToMe memory works everywhere. 
**Confidence:** 40%.
**Decision Trigger:** Before Public Launch.

---

# SECTION 8 — TECHNOLOGY DECISIONS

### D-025 Core Parsing Engine
**Question:** How does ToMe actually read the codebase to understand it?
**Options:**
1. Dumb text chunks (RAG style)
2. Tree-sitter (AST parsing)
3. Language Server Protocol (LSP) integration
**Pros:** Tree-sitter gives perfect structural understanding without needing to compile the code (unlike LSP). Dumb text is too inaccurate for architecture extraction.
**Cons:** Tree-sitter requires maintaining grammars for every language.
**Risks:** Poor parsing leads to poor memory generation.
**Current Lean:** OPEN, but heavily leaning toward Tree-sitter + LLM summarization.
**Confidence:** 30%.
**Decision Trigger:** Before MVP.

### D-026 Language Support Strategy
**Question:** Does the MVP support all languages, or just one?
**Options:**
1. Language agnostic (pass everything to LLM)
2. TypeScript/JavaScript only
3. Python and TS only
**Current Lean:** TypeScript/JavaScript only for MVP. Focus on the most common web stack to ensure ultra-high quality architecture extraction.
**Confidence:** 80%.
**Decision Trigger:** Before MVP.

### D-027 LLM Provider Abstraction
**Question:** Is ToMe hardcoded to Claude/OpenAI, or model-agnostic?
**Options:**
1. Hardcoded to Claude 3.5 Sonnet (best coding model currently)
2. Bring-your-own-key (BYOK) multi-model
**Current Lean:** DECIDED. Bring-your-own-key via standard API integrations (OpenAI compatible + Anthropic).
**Confidence:** 95%.
**Decision Trigger:** Before MVP.

### D-028 Local vs Cloud Models
**Question:** Will ToMe support local models (Ollama, Llama 3) for memory generation to guarantee absolute privacy?
**Options:**
1. Cloud LLMs only
2. Local + Cloud
**Current Lean:** OPEN. Local models currently lack the reasoning depth required to extract architectural intelligence accurately, but they are improving.
**Confidence:** 50%.
**Decision Trigger:** Before Beta.

---

# SECTION 9 — GO-TO-MARKET DECISIONS

### D-029 Initial Distribution Channel
**Question:** How do developers discover ToMe?
**Options:**
1. Twitter/X build-in-public
2. Product Hunt launch
3. SEO / Content marketing
4. Integrations (VS Code extension marketplace)
**Risks:** "If you build it, they will come" is a fallacy.
**Current Lean:** Integrations + Build in public. The VS Code extension marketplace is a massive distribution engine.
**Confidence:** 70%.
**Decision Trigger:** Before Public Launch.

---

# SECTION 10 — ORGANIZATIONAL DECISIONS

### D-030 Cofounder vs Solo
**Question:** Does the founder seek a technical or GTM cofounder?
**Context:** Founder Brain acknowledges the solo founder single-point-of-failure risk.
**Options:**
1. Remain solo indefinitely
2. Bring on a GTM cofounder before launch
3. Bring on a technical cofounder to scale the engine
**Risks:** Solo founders burn out. Cofounder conflict kills startups.
**Current Lean:** Remain solo through MVP validation. Re-evaluate at monetization phase.
**Confidence:** 60%.
**Decision Trigger:** Before Monetization.

---

# SECTION 11 — FUTURE CATEGORY DECISIONS

### D-031 Ultimate Category Position
**Question:** Is ToMe a feature, a product, or a platform?
**Options:**
1. A developer tool (like Prettier or ESLint)
2. An infrastructure platform (like GitHub or Vercel)
3. An Agent Operating System
**Context:** If ToMe becomes the standard memory layer, it is effectively the context-engine for all future AI agents. It becomes an Agent OS.
**Current Lean:** LEANING toward infrastructure platform. 
**Confidence:** 60%.
**Decision Trigger:** Before Platform Phase.

---

# SECTION 12 — ASSUMPTIONS REGISTER

This register extracts implicit and explicit assumptions from the Founder Brain. If any of these are proven false, the strategic foundation of ToMe is compromised.

### A-001: The "Re-explanation Tax" is widely felt.
- **Why believed:** Personal lived experience of the founder.
- **Evidence supporting:** Developer complaints on Twitter/Reddit regarding context limits.
- **Evidence against:** Many developers just use AI for small snippets where context isn't an issue.
- **How to test:** User interviews; landing page copy testing.
- **If wrong:** The problem is niche. Market size is too small.
- **Confidence:** 85%

### A-002: Context windows will not solve the memory problem.
- **Why believed:** Processing 10M tokens is slow, expensive, and noisy. Information != Understanding.
- **Evidence supporting:** RAG exists because giant context windows are inefficient.
- **Evidence against:** Google Gemini 1.5 Pro's 2M context window performs remarkably well on raw code dumps.
- **How to test:** Benchmark ToMe memory files vs raw code dumps in Gemini 1.5 Pro. Compare output quality, speed, and cost.
- **If wrong:** ToMe's core value proposition is eradicated by foundation model progress.
- **Confidence:** 70%

### A-003: LLMs can accurately extract architecture from code.
- **Why believed:** Anecdotal success using Claude to analyze repos.
- **Evidence supporting:** Existing code-to-diagram tools leveraging LLMs.
- **Evidence against:** LLMs hallucinate complex dependencies in spaghetti code.
- **How to test:** Run Phase 1 parser on 5 diverse open-source repos and have senior engineers grade the output.
- **If wrong:** ToMe will generate inaccurate memory, destroying developer trust instantly.
- **Confidence:** 60%

### A-004: Developers will actually read/use `.tome/` files.
- **Why believed:** Developers crave onboarding documentation.
- **Evidence supporting:** High usage of `README.md` and `.cursor/rules`.
- **Evidence against:** Developers famously ignore documentation.
- **How to test:** Telemetry in the VS Code extension measuring how often memory files are opened.
- **If wrong:** ToMe becomes a write-only database.
- **Confidence:** 65%

### A-005: AI tools will consume standard Markdown easily.
- **Why believed:** Markdown is ubiquitous in training data.
- **Evidence supporting:** LLMs generate and parse Markdown natively.
- **Evidence against:** Some agents require specific JSON schemas for context tooling.
- **How to test:** Feed `architect.md` to Devin, Cursor, and Claude, and verify they apply the rules correctly.
- **If wrong:** We must pivot to JSON/YAML formats.
- **Confidence:** 90%

### A-006: Code generation will commoditize.
- **Why believed:** Historical trajectory of foundation models.
- **Evidence supporting:** OpenAI, Anthropic, Google, and Meta all produce top-tier coding models.
- **Evidence against:** OpenAI might achieve AGI, maintaining a permanent moat.
- **How to test:** Wait and observe market pricing and benchmark convergence.
- **If wrong:** The thesis that "memory is the wedge" weakens; code generation remains king.
- **Confidence:** 80%

---

# SECTION 13 — UNKNOWNS REGISTER

This is an inventory of critical missing information.

1. **Willingness to Pay:** We do not know if developers will pay for memory generation out of their own pockets, or if this is an enterprise-only sale.
2. **Token Economics:** We do not know the exact API cost to generate the 5 memory files for a 100-file repository. If it costs $5.00, it's dead. If it costs $0.05, it scales.
3. **Update Frequency Tolerances:** We do not know how stale memory can get before it negatively impacts AI output. Does it break after 1 week? 1 month?
4. **Competitor Roadmaps:** We do not know what Cursor or GitHub Copilot have on their 6-month internal roadmaps regarding project memory.
5. **Agent Ecosystem Standards:** We do not know if a consortium (like LangChain or LlamaIndex) will introduce a standard memory protocol that makes `.tome` redundant.
6. **Hallucination Rate:** We do not know the baseline hallucination rate for architecture extraction.

---

# SECTION 14 — CRITICAL DECISIONS ROADMAP

### Before MVP (The "Prove It Works" Phase)
- D-001: Repository Memory Location
- D-002: Memory Format
- D-003: Memory File Structure
- D-008: Regeneration Strategy
- D-013: Local First vs Cloud First
- D-025: Core Parsing Engine
- D-026: Language Support Strategy
- D-027: LLM Provider Abstraction

### Before Alpha (The "Prove It Scales" Phase)
- D-004: Dynamic vs Fixed Memory Files
- D-011: Repository Size Limits
- D-019: First Customer Segment

### Before Beta (The "Prove It's Accurate" Phase)
- D-005: Knowledge Layer Expansion
- D-006: Manual vs Automatic Updates
- D-009: Memory Validation Strategy
- D-023: Standard Format Ownership
- D-028: Local vs Cloud Models

### Before Public Launch (The "Prove It Spreads" Phase)
- D-007: Approval Workflow
- D-010: Context Compression Strategy
- D-017: Agent Memory Support
- D-020: Monetization Trigger
- D-022: Open Source Strategy
- D-024: Response to IDE Native Memory
- D-029: Initial Distribution Channel

### Before Monetization (The "Prove It's Valuable" Phase)
- D-014: Team Features Timing
- D-021: Pricing Model
- D-030: Cofounder vs Solo

### Before Enterprise / Platform Phase (The "Infrastructure" Phase)
- D-012: Single Repo vs Multi Repo
- D-015: Knowledge Graph Timing
- D-016: Predictive Intelligence Timing
- D-018: API Strategy
- D-031: Ultimate Category Position

---

# SECTION 15 — FOUNDER RECOMMENDATIONS

Acting as a product strategist and systems thinker, examining the Founder Brain objectively, the following recommendations are made:

### Top 10 Decisions That Matter Most (Get these right)
1. **D-013 (Local First vs Cloud):** Dictates the entire early adoption curve. Stick to Local First.
2. **D-002 (Memory Format):** Dictates cross-tool compatibility. Markdown is the right choice.
3. **D-008 (Regeneration Strategy):** Dictates unit economics. You must figure out cheap incremental updates.
4. **D-022 (Open Source Strategy):** Dictates standard adoption. Open Core is highly recommended.
5. **D-019 (First Customer):** Dictates product shape. Focus on Solo AI developers first.
6. **D-006 (Automatic vs Manual Updates):** Dictates memory decay.
7. **D-025 (Parsing Engine):** Dictates accuracy. Do not rely on pure text chunks.
8. **D-001 (Location):** `.tome/` in-repo is the best path for visibility.
9. **D-024 (Response to IDEs):** Your moat is portability. Never compromise on it.
10. **D-021 (Pricing Model):** Must align with the token economics.

### Top 10 Decisions That Can Wait (Ignore these for now)
1. D-015 (Knowledge Graph)
2. D-016 (Predictive Intelligence)
3. D-012 (Multi-Repo Support)
4. D-014 (Team Sync Features)
5. D-018 (API Strategy)
6. D-005 (Knowledge Layers 7-10)
7. D-031 (Ultimate Category Position)
8. D-007 (Complex Approval Workflows)
9. D-028 (Local Model Support)
10. Enterprise Sales Strategy

### Top Existential Risks & Strategic Advantages
**Greatest Risk:** Foundation models expanding context to 10M+ tokens *and* achieving near-zero latency, rendering offline structured memory obsolete.
**Mitigation:** Prove that ToMe memory provides *business intent* and *historical decisions* (Layers 3 & 4) that are literally not present in the code, meaning infinite context still can't find them.

**Greatest Strategic Advantage:** The complete neglect of the "Knowledge Preservation" category by major AI labs. They are building engines; you are building the steering wheel. Maintain strict tool-agnosticism to become the Switzerland of AI developer tools.

### Top Experiment to Run Immediately
**The Benchmark Test:** Take an existing, complex, 50-file open-source project. Manually write the perfect 5 ToMe memory files for it. Pass the memory files + a feature request to Claude. Then pass the raw codebase + the same request to Claude. Measure time to success, code accuracy, and token cost. If the ToMe method does not win by a massive margin, the core thesis is invalid. Do this before writing a single line of the parsing engine.

---
*TOME_DECISION_ENGINE_v1 — Created 2026-06-08*
*Operating System Online.*
