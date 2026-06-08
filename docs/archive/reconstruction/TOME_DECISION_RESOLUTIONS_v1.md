# TOME_DECISION_RESOLUTIONS_v1

> **Document Classification:** Founder Strategic Resolution Artifact  
> **Document Version:** 1.0  
> **Created:** 2026-06-08  
> **Status:** ACTIVE — OFFICIAL STRATEGIC DOCTRINE  
> **Persistence:** PERMANENT  
> **Depends On:** TOME_CONTEXT_SEED_v1.md, TOME_FOUNDER_BRAIN_v1.md, TOME_DECISION_ENGINE_v1.md

> [!IMPORTANT]
> This document is the official recommendation layer that sits above implementation. It answers one question definitively: **"What should ToMe actually do?"** 
> 
> The decisions contained herein maximize the probability of startup success, MVP completion, user adoption, long-term defensibility, and category creation while actively minimizing founder burnout, engineering complexity, operational cost, unnecessary infrastructure, and premature scaling.

---

## TABLE OF CONTENTS

1. [Section 1 — Resolution Philosophy](#section-1--resolution-philosophy)
2. [Section 2 — Resolved Product Decisions (D-001 to D-018)](#section-2--resolved-product-decisions)
3. [Section 3 — Resolved Customer Decisions (D-019)](#section-3--resolved-customer-decisions)
4. [Section 4 — Resolved Business Decisions (D-020 to D-022)](#section-4--resolved-business-decisions)
5. [Section 5 — Resolved Competitive Decisions (D-023 to D-024)](#section-5--resolved-competitive-decisions)
6. [Section 6 — Resolved Technology Decisions (D-025 to D-028)](#section-6--resolved-technology-decisions)
7. [Section 7 — Resolved GTM Decisions (D-029)](#section-7--resolved-gtm-decisions)
8. [Section 8 — Resolved Organizational Decisions (D-030)](#section-8--resolved-organizational-decisions)
9. [Section 9 — Resolved Category Decisions (D-031)](#section-9--resolved-category-decisions)
10. [Section 10 — Strategic Prioritization Matrix](#section-10--strategic-prioritization-matrix)
11. [Section 11 — Founder Action List](#section-11--founder-action-list)
12. [Section 12 — Final Verdict](#section-12--final-verdict)

---

# SECTION 1 — RESOLUTION PHILOSOPHY

As the decision-making layer of ToMe, the following strategic doctrine applies to every resolution in this document. These principles override all other considerations. 

### 1. Simplicity Beats Elegance
We are creating a new category (Project Intelligence Layer). If the tool is complex to install, complex to configure, or complex to understand, it will die on the vine. The MVP must feel like magic that happens with zero configuration. Elegance in computer science terms (e.g., building a perfect knowledge graph) must be sacrificed if it compromises simplicity for the end user. 

### 2. Adoption Beats Sophistication
A dumb markdown file that a million developers use is an infrastructure standard. A highly sophisticated local vector database that only 1,000 developers use is a failed startup. We will optimize every decision to reduce the friction of adoption to absolute zero.

### 3. Accuracy Beats Feature Count
If ToMe hallucinates an architectural dependency or forgets a critical business rule, the user will lose trust instantly and uninstall. We will ship 5 files that are 99% accurate rather than 50 files that are 80% accurate. Trust is our only currency.

### 4. Local-First Beats Cloud-First
Developers are paranoid about uploading their source code. Any cloud dependency in Phase 1 creates a massive barrier to entry. We will run locally. We will store keys locally. We will generate files locally. Cloud is for Phase 3+.

### 5. Utility Beats Hype
We will not market ToMe as an "AGI for your codebase." We will market it as a utility that stops you from repeating yourself to AI. We solve an immediate, painful, unglamorous problem.

### 6. Standards Beat Lock-In
We will win by becoming the format everyone else integrates with. If we try to lock users into a proprietary ToMe IDE or ToMe Chat interface, we will be crushed by Cursor and Anthropic. If we make `.tome/` an open standard, we become the Switzerland of AI tooling. 

---

# SECTION 2 — RESOLVED PRODUCT DECISIONS

### D-001 | Repository Memory Location
#### Final Recommendation
**Store memory inside a `.tome/` directory at the root of the user's repository.**
#### Why
It maximizes portability and zero-configuration adoption. When a developer shares a repository, the memory travels with it. It naturally integrates with Git version control, meaning memory changes are automatically diffed, reviewed, and audited just like code changes. It requires no external database setup.
#### Alternatives Rejected
*Global local cache:* Rejected because it breaks portability across machines and teammates. 
*Cloud-only:* Rejected due to privacy concerns and adoption friction.
#### Risks
Users might see `.tome/` as repository pollution. Sensitive business logic might accidentally be committed to public repositories.
#### Reversal Conditions
If large enterprises refuse to adopt due to compliance issues around storing strategic intent in source control, we will introduce a cloud-sync proxy.
#### Confidence
90%

### D-002 | Memory Format
#### Final Recommendation
**Pure Markdown (`.md`) files.**
#### Why
Markdown is the universal language of LLMs. It is natively rendered by GitHub, VS Code, and every other developer tool. Developers can read it, edit it manually if necessary, and immediately understand it. It is the lowest friction format conceivable.
#### Alternatives Rejected
*JSON/YAML:* Machine-readable but hostile to human editing. Hard to read in a PR review.
*Knowledge Graph/Vector DB:* Massive overkill for MVP, high friction.
#### Risks
Markdown is unstructured text. When ToMe tries to incrementally update an existing memory file, regexing and parsing Markdown to find the right section to update is difficult and fragile.
#### Reversal Conditions
If the cost or error rate of incrementally updating Markdown files becomes prohibitive, we will move to Markdown with strict YAML frontmatter, or a hybrid JSON format.
#### Confidence
85%

### D-003 | Memory File Structure
#### Final Recommendation
**The exact 5-file split: `architect.md`, `memory.md`, `guardrails.md`, `recover.md`, `walkthrough.md`.**
#### Why
This is the perfect mapping of the Knowledge Layer Theory to tangible artifacts. A single monolithic file becomes too large to quickly load into a narrow context window, and is intimidating for human developers. Granular files allow an AI agent to load only the specific context it needs (e.g., loading `guardrails.md` before writing new code).
#### Alternatives Rejected
*Monolithic file:* Unmanageable over time. 
*Dynamic N-files:* Too complex for MVP.
#### Risks
Context fragmentation. An AI might need architectural context but only loads the walkthrough. 
#### Reversal Conditions
If telemetry shows that users/AI tools are consistently failing to load the correct file, we will build a unifying index file or an MCP server to handle routing.
#### Confidence
95%

### D-004 | Dynamic vs Fixed Memory Files
#### Final Recommendation
**Fixed strict schema (always exactly 5 files).**
#### Why
Simplicity. For the `.tome` format to become a standard, it must be predictable. Tooling builders need to know exactly what files will be present. 
#### Alternatives Rejected
*Dynamic schema based on repo size:* Too hard to build reliably.
#### Risks
Monorepos (e.g., 5 distinct microservices in one repo) will cram too much disjointed information into a single `architect.md` file, breaking the token limit and creating confusion.
#### Reversal Conditions
When we officially launch enterprise monorepo support (Phase 8), we will introduce scoped directories (e.g., `.tome/services/auth/architect.md`).
#### Confidence
85%

### D-005 | Knowledge Layer Expansion
#### Final Recommendation
**Strictly adhere to Layers 1-6. Reject all expansions for MVP.**
#### Why
Scope creep kills startups. Social, Operational, Security, and Cultural knowledge layers are interesting, but they do not solve the immediate "context amnesia" pain point of an AI writing code today.
#### Alternatives Rejected
*Adding Security/Ops layers:* Rejected to preserve engineering bandwidth.
#### Risks
Enterprise customers might demand security context.
#### Reversal Conditions
If a paying customer demands a Security layer for a $50k contract, we add it. Otherwise, freeze the schema.
#### Confidence
95%

### D-006 | Manual vs Automatic Updates
#### Final Recommendation
**Manual updates via CLI (`tome generate` and `tome update`) for Phase 1.**
#### Why
AI generation is non-deterministic and costs money (API tokens). Automatically triggering memory regeneration on every `git commit` or `git push` could result in unpredictable token bills for the user, and might silently overwrite human corrections in the `.tome/` files. We must establish trust before we establish automation.
#### Alternatives Rejected
*Git Hooks / Background Daemon:* Rejected due to token cost unpredictability and lack of user control.
#### Risks
Memory decay. If the developer forgets to run `tome update`, the AI gets stale context.
#### Reversal Conditions
Once we build our own hosted cloud infrastructure where we control the API costs (Phase 3), we will shift to seamless GitHub Actions / Webhooks for automatic background updates.
#### Confidence
80%

### D-007 | Approval Workflow
#### Final Recommendation
**Auto-write directly to `.tome/` but generate a summary diff in the terminal.**
#### Why
Friction is the enemy. Forcing a developer to manually approve an interactive prompt for every change breaks their flow. Because the files are tracked in Git, the developer gets an implicit approval workflow anyway when they review their `git diff` before committing.
#### Alternatives Rejected
*Interactive CLI prompts / Generating PRs:* Too slow, too much friction for local dev.
#### Risks
AI hallucinates a terrible architectural decision and auto-writes it, which the developer doesn't notice and commits.
#### Reversal Conditions
If users consistently complain about hallucinations poisoning their memory files unnoticed, we will introduce a strict `--interactive` flag as default.
#### Confidence
85%

### D-008 | Regeneration Strategy
#### Final Recommendation
**AST Parsing + Diff-Based LLM Updates.**
#### Why
Full rewriting of memory on every update is too expensive and slow. We must parse the codebase using Tree-sitter (AST) to identify exactly what files changed, pass *only* the diffs to the LLM, and ask the LLM to patch the existing Markdown files. This is the hardest technical challenge, but it is existential. 
#### Alternatives Rejected
*Full LLM Rewrite:* Too expensive.
*Dumb Text Chunking:* Too inaccurate for architecture.
#### Risks
Patching Markdown accurately via LLM is notoriously brittle.
#### Reversal Conditions
If the patching logic fails >10% of the time, we will fall back to full rewrites for small repos (<100 files) and restrict ToMe entirely from larger repos until the patching tech improves.
#### Confidence
70%

### D-009 | Memory Validation Strategy
#### Final Recommendation
**Zero automated semantic validation. Rely on human visual review.**
#### Why
Building an automated system to verify if an AI correctly deduced the business intent of a codebase is practically impossible right now. It is a research problem, not an MVP feature. We must rely on the developer to read the Markdown.
#### Alternatives Rejected
*Automated LLM-as-a-judge linting:* Too expensive, doubles token costs.
#### Risks
High hallucination rates will destroy the product's reputation.
#### Reversal Conditions
When we reach Phase 4 (VS Code Extension), we will add inline UI buttons for "Thumbs Up / Thumbs Down" on specific memory blocks to gather validation data.
#### Confidence
90%

### D-010 | Context Compression Strategy
#### Final Recommendation
**Enforce strict LLM generation prompts to limit output length per file to <2000 words.**
#### Why
If `.tome/` files become 50,000 tokens long, we have just recreated the context exhaustion problem. The LLM prompt generating the memory must be strictly instructed to summarize, abstract, and compress. Memory is about high-level intelligence, not line-by-line documentation.
#### Alternatives Rejected
*Building a local RAG server:* Too heavy for MVP.
#### Risks
Over-compression leads to lost critical details.
#### Reversal Conditions
If context windows of standard models hit 10M+ tokens *and* become incredibly cheap, we can relax the compression constraints.
#### Confidence
80%

### D-011 | Repository Size Limits
#### Final Recommendation
**Hard limit of 500 code files for MVP.**
#### Why
We must guarantee a magical experience. Analyzing a 10,000 file monorepo will take 20 minutes, cost $15 in API fees, and likely fail or hallucinate. By restricting to <500 files, we target the exact sweet spot of solo founders, indie hackers, and early-stage startups where ToMe will shine brightest.
#### Alternatives Rejected
*Unbounded / Pay-what-you-compute:* Results in bad user experience and shock bills.
#### Risks
We alienate enterprise users immediately. (This is acceptable).
#### Reversal Conditions
As we optimize our AST parsing and chunking algorithms, we will raise the limit to 2000, then 5000+.
#### Confidence
95%

### D-012 | Single Repo vs Multi Repo Support
#### Final Recommendation
**Single Repo strictly.**
#### Why
Cross-repo intelligence requires an entirely different architecture (a centralized knowledge graph or cloud proxy). It breaks the local-first `.tome/` paradigm.
#### Alternatives Rejected
*Multi-repo dependency tracking:* Out of scope.
#### Risks
Microservice architectures will only get fragmented memory.
#### Reversal Conditions
Phase 8 Enterprise Launch.
#### Confidence
100%

### D-013 | Local First vs Cloud First
#### Final Recommendation
**Pure Local CLI.**
#### Why
The absolute highest barrier to adoption for a developer tool that reads code is security/privacy. By making ToMe a pure local CLI where the user provides their own Anthropic/OpenAI API key, we completely bypass all security audits, SOC2 requirements, and privacy fears. The code never touches our servers. We have zero cloud infrastructure costs.
#### Alternatives Rejected
*Cloud proxy / SaaS:* Fatal for adoption at this stage.
#### Risks
Monetization is extremely difficult. We cannot charge a monthly SaaS fee easily for a local CLI script.
#### Reversal Conditions
We will build Cloud features (sync, auto-updates) in Phase 3 strictly as an *opt-in premium tier*. The core engine remains local.
#### Confidence
95%

### D-014 | Team Features Timing
#### Final Recommendation
**Delay completely until Phase 6.**
#### Why
Multiplayer software is 10x harder to build than single-player. We must build a single-player tool so good that an individual developer refuses to code without it. Team sync, conflict resolution, and RBAC are distractions.
#### Alternatives Rejected
*Building team sync for launch:* Death by scope creep.
#### Risks
Teams might overwrite each other's `.tome/` files via Git conflicts. (We accept this risk; Git will handle the conflicts).
#### Reversal Conditions
When we hit 10,000 weekly active individual users, we build team features to monetize them.
#### Confidence
90%

### D-015 | Knowledge Graph Timing
#### Final Recommendation
**Do not build a Knowledge Graph.**
#### Why
Markdown is the standard. If we pivot to a complex graph database, we lose our "dumb and simple" competitive advantage. The intelligence of modern LLMs makes rigid graph schemas unnecessary for standard context retrieval.
#### Alternatives Rejected
*Graph DB / Neo4j backend:* Extreme overkill.
#### Risks
We hit a ceiling on how smart ToMe can be about deep architectural relationships.
#### Reversal Conditions
Only if we pivot to becoming an Enterprise Intelligence Platform (Phase 8).
#### Confidence
85%

### D-016 | Predictive Intelligence Timing
#### Final Recommendation
**Kill the feature.**
#### Why
ToMe is a memory layer, not a fortune teller. Predicting technical debt is a fundamentally different product category (static analysis / code quality). It dilutes our core positioning.
#### Alternatives Rejected
*Adding tech-debt prediction:* Scope creep.
#### Risks
None.
#### Reversal Conditions
Never.
#### Confidence
95%

### D-017 | Agent Memory Support
#### Final Recommendation
**Output Markdown and build an MCP (Model Context Protocol) Server.**
#### Why
Agents (Claude Code, Devin) are rapidly adopting MCP to read local context. By exposing `.tome/` via a lightweight local MCP server alongside the standard Markdown files, we natively integrate with every major agent framework overnight with almost zero custom integration work.
#### Alternatives Rejected
*Building custom plugins for Devin/OpenHands:* Unscalable.
#### Risks
MCP standard might change.
#### Reversal Conditions
If MCP fails to gain traction, we fall back to just hoping agents read the `.md` files.
#### Confidence
90%

### D-018 | API Strategy
#### Final Recommendation
**No proprietary API.**
#### Why
The API is the file system. Other tools should simply read the `.tome/` directory. We do not need to build, host, and maintain a REST API for local files.
#### Alternatives Rejected
*Local localhost REST server:* Unnecessary overhead.
#### Risks
None.
#### Reversal Conditions
When we launch Cloud Sync, we will expose a cloud REST/GraphQL API.
#### Confidence
95%

---

# SECTION 3 — RESOLVED CUSTOMER DECISIONS

### D-019 | First Customer Segment

#### Final Recommendation
**The Solo AI-Native Builder (Indie Hackers, Solo Founders, Prototypers).**

#### Exact Persona
- **Role:** Full-stack developer building a SaaS, app, or tool from scratch.
- **Workflow:** Lives in Cursor or Windsurf. Uses Claude 3.5 Sonnet daily. Uses Vercel/Supabase. Skips writing tests to move faster. Has 2-3 active projects.
- **Company Size:** 1-2 people.
- **Purchasing Behavior:** Will pay $20/mo out of pocket if a tool saves them 2 hours a week. Will fiercely reject complex enterprise sales motions.
- **Pain Profile:** They are building so fast using AI that they are literally outrunning their own understanding of their codebase. They suffer from Context Amnesia daily. They open a project they haven't touched in 2 weeks and spend 30 minutes figuring out how their own AI-generated authentication flow works.

#### Why This Segment?
They experience the pain most acutely because they rely on AI for *generation* more than any other segment. They adopt instantly via CLI. They have zero procurement barriers. They are highly vocal on Twitter/X and will drive word-of-mouth growth. 

If we target Enterprise or established teams, we die in security audits, SOC2 compliance, and committee approvals. If we win the Solo AI Builders, we become the default standard for the next generation of startups.

#### Adoption Path
They see a tweet → `npm install -g tome-cli` → Run `tome init` in their repo → Provide their Anthropic API key → Experience magic in 60 seconds → Brag about it on X.

---

# SECTION 4 — RESOLVED BUSINESS DECISIONS

### D-020, D-021, D-022 | Monetization, Pricing, and Open Source

#### Final Recommendation
**The "Open Standard, Paid Convenience" Model.**

#### Open Source Strategy
The `tome-cli` and the core parsing/generation engine will be **Open Source (MIT License)**. 
*Why:* We must establish the `.tome` format as the universal industry standard. If the engine is proprietary, developers will not trust it, and competitors will build an open alternative. By open-sourcing the engine, we make it the default. We win the format war instantly.

#### Monetization Timing
**Monetize at Phase 3 (Cloud Sync & Automation).** Do not attempt to monetize the local CLI. Let the local CLI spread like wildfire for free. 

#### Recommended Pricing Ladder

**Tier 1: Free (The CLI)**
- `tome-cli` running locally.
- Bring Your Own Key (BYOK) for OpenAI/Anthropic.
- Manual updates.
- *Goal:* Maximum market penetration and format standardization.

**Tier 2: ToMe Pro ($15/month)**
- Hosted background updates (we run the compute, no BYOK needed).
- Seamless GitHub App integration (updates memory automatically on PR merges).
- VS Code Extension premium features.
- *Goal:* Convert solo developers who want convenience and zero maintenance.

**Tier 3: ToMe Team ($39/user/month)**
- Cross-developer memory sync.
- Cloud dashboard for architecture visualization.
- Shared organization constraints (guardrails applied across all repos).
- *Goal:* Land and expand into early-stage startups.

**Tier 4: ToMe Enterprise (Custom Pricing)**
- On-premise / VPC deployments.
- Cross-repo dependency mapping (Phase 8).
- *Goal:* Ultimate revenue engine, pursued in Year 3.

---

# SECTION 5 — RESOLVED COMPETITIVE DECISIONS

### D-023, D-024 | Competitive Moats and Category Ownership

#### Final Recommendation
**Own the "Portable Context" Category. Defend via Tool-Agnosticism.**

#### The Threat Landscape
Assume Cursor, Claude Code, GitHub Copilot, and Devin all build native memory within 12 months. 

#### Why ToMe Still Matters
Every incumbent will build memory that is **ecosystem-locked**. 
- Cursor Memory will only work in Cursor.
- Claude Memory will only work in Claude.
- Copilot Memory will only work in Copilot.

Developers do not use just one tool. A developer uses Cursor to write code, Claude web UI to brainstorm architecture, and Devin to run background refactors. If memory is locked to the tool, the developer has amnesia every time they switch interfaces.

**ToMe is the Switzerland of Memory.** 
Because `.tome/` lives in the repo as standard Markdown and is exposed via an MCP server, it is the only memory layer that travels seamlessly between Cursor, Claude, Devin, and the terminal. 

#### The Defensible Position
Our moat is not the generation algorithm (though it will be good). Our moat is the **Format Standard**. Once 100,000 repositories have a `.tome/` directory, ToMe becomes the universal source of truth. If Cursor wants to understand a project, it will be forced to read the `.tome/` files because that is where the developer's historical decisions are stored. We commoditize the IDEs' memory features by standardizing the storage layer beneath them.

---

# SECTION 6 — RESOLVED TECHNOLOGY DECISIONS

### D-025, D-026, D-027, D-028 | Technology Stack & Architecture

#### Final Recommendation
**AST-Guided LLM Generation Pipeline.**

#### Recommended Architecture & Parser Stack
We cannot rely on dumb text RAG. We will use **Tree-sitter** to parse the codebase locally.
1. **Index:** Tree-sitter scans the repo and extracts a skeleton (functions, classes, exports, imports, dependencies) without the noisy implementation details.
2. **Chunk:** This skeleton is compressed into a highly dense "Repository Map".
3. **Generate:** The Repository Map + the raw code of critical files are sent to the LLM to generate the 5 Markdown files.
4. **Update:** On subsequent runs, Tree-sitter detects what changed, and we only send the changed diffs + the existing memory files to the LLM to patch the memory.

#### Language Support Roadmap
- **Launch:** TypeScript, JavaScript, Python. (Covers 80% of our target Solo AI Builders).
- **Month 3:** Go, Rust.
- **Month 6:** Java, C#, Ruby.

#### Model Strategy
- **Hardcode the intelligence to Anthropic Claude 3.5 Sonnet for the MVP.** It is currently the undisputed king of coding and architectural reasoning. Do not waste time building prompt abstractions for inferior models in the MVP. 
- Allow OpenAI GPT-4o as a fallback option via BYOK.

#### Local Model Strategy
**Ignore Local Models for now.** Llama 3 (8B/70B) does not have the architectural reasoning capability required to generate accurate `architect.md` files from a 300-file codebase. Waiting for local models to catch up will slow us down. We are optimizing for accuracy over local-compute ideology.

---

# SECTION 7 — RESOLVED GTM DECISIONS

### D-029 | 12-Month Go-To-Market Recommendation

#### Final Recommendation
**The "Open Source Trojan Horse" Strategy.**

**Months 1-2: Build in Public (The Ideology Phase)**
- Founder tweets daily about the "Re-explanation Tax" and "Architectural Drift."
- Do not show the product. Show the *pain*. Manufacture the vocabulary (e.g., "AI Amnesia").
- Release the `TOME_CONTEXT_SEED_v1.md` as an open-source manifesto.

**Month 3: The CLI Launch (The Tool Phase)**
- Launch the open-source `tome-cli` on GitHub and X.
- Positioning: "Stop repeating yourself to Cursor. `npx tome-cli init`."
- Target 1,000 GitHub stars. Free to use (BYOK).

**Month 5: The VS Code Extension & MCP (The Integration Phase)**
- Launch the VS Code extension that renders `.tome/` files beautifully in the sidebar.
- Launch the MCP server so Claude Code and Devin automatically read ToMe memory.
- Product Hunt Launch: "The Memory Layer for AI Coding."

**Month 8: ToMe Cloud Beta (The Monetization Phase)**
- Launch the $15/mo Pro tier.
- Highlight GitHub Actions integration (zero-maintenance auto-updates).
- Sponsor AI engineering newsletters (ByteByteGo, TLDR, AI developer influencers).

**Month 12: The Team Pivot (The Expansion Phase)**
- Launch Team Sync.
- Shift messaging from "Save yourself time" to "Onboard new developers (and AI agents) instantly."

---

# SECTION 8 — RESOLVED ORGANIZATIONAL DECISIONS

### D-030 | Cofounder & Hiring Strategy

#### Final Recommendation
**Remain a Solo Founder until Product-Market Fit (PMF) is proven via Cloud Revenue. Do not dilute equity or speed for a GTM cofounder.**

#### Why
The founder is a technical builder who ships with AI. With Cursor/Claude, the founder has the output of a 3-person engineering team. A cofounder right now introduces communication overhead and slows down the critical MVP iteration loops.

#### When to Hire / Bring on a Partner
Hire the first engineer ONLY when ToMe Cloud launches and infrastructure maintenance (database, auth, API scaling, payment processing) begins to distract the founder from core parsing/generation algorithm improvements.

#### What Should Never Be Delegated
The LLM Prompts and the Tree-sitter parsing logic. This is the intellectual property and the core quality engine of the company. The founder must own the "brain" of ToMe permanently. Delegate infrastructure, delegate front-end, delegate marketing. Never delegate the intelligence extraction pipeline.

---

# SECTION 9 — RESOLVED CATEGORY DECISIONS

### D-031 | Ultimate Category Position

#### Final Recommendation
**Today: A Developer Tool. Tomorrow: AI Context Infrastructure.**

#### The Reality of Today
We cannot launch calling ourselves an "Operating System." Developers will laugh at us. Today, ToMe is a highly tactical **Developer Tool**. It is a CLI that generates markdown files. We must own this humility to get adopted.

#### The Reality of Tomorrow
The highest-probability long-term category is **AI Context Infrastructure**. 
Just as Vercel owns the infrastructure for deploying frontend code, ToMe will own the infrastructure for serving context to AI models. When an enterprise deploys an autonomous agent to fix a bug in 2028, that agent's first network request will be to the ToMe Context API to pull the `guardrails` and `architect` intelligence. 

We start as a CLI tool to establish the format format (`.tome`). We end as the API that powers the entire AI developer ecosystem.

---

# SECTION 10 — STRATEGIC PRIORITIZATION MATRIX

To ensure the founder does not waste cycles on irrelevant perfectionism, all decisions are ranked by existential importance.

### 🟥 TOP 5 EXISTENTIAL DECISIONS (Do or Die)
1. **D-013 (Local First):** If we launch as a cloud service requiring code uploads, we fail immediately due to privacy rejection.
2. **D-008 (Regeneration Strategy via AST+Diff):** If updating memory requires full rewrites, token costs will bankrupt users and they will churn.
3. **D-002 (Pure Markdown Format):** If we use a proprietary data format, IDEs and Agents will ignore us. Markdown guarantees interoperability.
4. **D-027 (Hardcode to Claude 3.5 Sonnet initially):** Using weaker models will result in hallucinated architecture, destroying trust.
5. **D-022 (Open Source CLI Core):** Without open source, we cannot establish the `.tome` standard before competitors do.

### 🟨 HIGH IMPORTANCE (Core Value Drivers)
6. D-003 (The 5-File Structure)
7. D-011 (Repo limits < 500 files)
8. D-019 (Targeting Solo AI Builders)
9. D-006 (Manual updates for Phase 1)
10. D-017 (MCP Server Integration)

### 🟩 CAN WAIT 2 YEARS (Ignore Completely)
1. D-015 (Knowledge Graph DBs)
2. D-016 (Predictive Tech-Debt Intelligence)
3. D-012 (Multi-Repo / Microservice graphs)
4. D-005 (Security/Ops/Social knowledge layers)
5. D-028 (Local Llama/Ollama model support)

---

# SECTION 11 — FOUNDER ACTION LIST

This is the concrete execution manual. Vague advice has been removed.

### Next 30 Days (The Engine)
- [ ] Build the Tree-sitter parsing script for TypeScript/JavaScript to extract an accurate repository skeleton.
- [ ] Write and rigorously test the LLM prompts for generating `architect.md`, `memory.md`, `guardrails.md`, `recover.md`, and `walkthrough.md` using Claude 3.5 Sonnet.
- [ ] Build a simple Node.js CLI: `npx tome-cli init` that executes the pipeline locally.
- [ ] Test the CLI on 5 of your own personal repositories. Grade the output accuracy.

### Next 90 Days (The Standard)
- [ ] Build the diff-based updater: `npx tome-cli update`. Ensure it only patches what changed.
- [ ] Open-source the CLI on GitHub under MIT license.
- [ ] Write the "AI Amnesia" launch blog post. 
- [ ] Launch on X and HackerNews. Target: 500 early alpha users.

### Next 180 Days (The Integration)
- [ ] Build the VS Code Extension to render `.tome/` files in a dedicated, beautiful sidebar.
- [ ] Implement the MCP (Model Context Protocol) server inside the CLI so Claude Code can auto-read ToMe memory.
- [ ] Begin development of the Cloud Sync backend (Next.js + Supabase) for the upcoming Pro tier.

### Next 365 Days (The Business)
- [ ] Launch ToMe Pro ($15/mo) featuring GitHub Actions integration for zero-maintenance auto-updates.
- [ ] Launch ToMe Team ($39/mo) for cross-developer sync.
- [ ] Reach out to OpenHands, Devin, and other agent teams to create official partnerships around the `.tome` standard.

---

# SECTION 12 — FINAL VERDICT

"If the founder only follows 20% of the recommendations in this document, which 20% would create 80% of ToMe's eventual success?"

**The 20% that matters:**
1. **Be an Open-Source, Local-First CLI.** Protect the user's privacy and wallet by making them use their own API keys locally. This removes all barriers to initial adoption.
2. **Output Pure Markdown.** Do not try to invent a new knowledge graph database. Output markdown that Claude, Cursor, and humans can read natively today.
3. **Target Solo Devs with <500 File Repos.** Ignore the enterprise. Ignore large teams. Solve the pain for the indie hacker whose project is moving so fast they can't remember their own architecture.
4. **Be Tool-Agnostic.** Your only defense against OpenAI or Cursor building this natively is that ToMe is the *only* memory that travels seamlessly between Cursor, the terminal, and the browser.

Execute these four things perfectly, ignore everything else, and ToMe will become the default memory infrastructure of the AI generation. 

***End of Document. Execution Phase Authorized.***
