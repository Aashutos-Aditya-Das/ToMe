# TOME_CONTEXT_SEED_v1

> **Document Classification:** Foundational Memory Artifact  
> **Document Version:** 1.0  
> **Created:** 2026-06-08  
> **Status:** ACTIVE — PRIMARY CONTEXT SOURCE  
> **Persistence:** PERMANENT  

> [!CAUTION]
> This document is the foundational strategic context for the ToMe project. All future planning, architecture decisions, implementation decisions, AI conversations, and product strategy discussions depend on this document. Do not delete, truncate, or summarize this file without explicit founder approval. Every section exists for a reason. Every detail is intentional.

---

## TABLE OF CONTENTS

1. [Project Identity](#project-identity)
2. [Project Vision](#project-vision)
3. [Origin Story](#origin-story)
4. [Core Insight — The Knowledge Layer Model](#core-insight--the-knowledge-layer-model)
5. [First Principles Foundation](#first-principles-foundation)
6. [What ToMe Is](#what-tome-is)
7. [What ToMe Is Not](#what-tome-is-not)
8. [MVP Strategy](#mvp-strategy)
9. [Initial Memory System — File Specifications](#initial-memory-system--file-specifications)
10. [Long-Term Evolution Path](#long-term-evolution-path)
11. [Competitive Landscape](#competitive-landscape)
12. [Future Research Areas](#future-research-areas)
13. [Risk Analysis](#risk-analysis)
14. [Unanswered Questions](#unanswered-questions)
15. [Success Criteria](#success-criteria)
16. [North Star — The ToMe Manifesto](#north-star--the-tome-manifesto)

---

## PROJECT IDENTITY

| Field | Value |
|---|---|
| **Project Name** | ToMe |
| **Full Name** | ToMe — AI Project Memory Layer |
| **Tagline** | "Git stores code history. ToMe stores project intelligence." |
| **Category** | Developer Infrastructure / AI Tooling / Knowledge Management |
| **Stage** | Pre-MVP / Concept Validated Through Lived Experience |
| **Founder Archetype** | Technical builder who ships with AI and has experienced the memory problem firsthand |

---

## PROJECT VISION

### The Problem

ToMe is an AI Project Memory Layer.

The central observation behind ToMe is that AI coding assistants are rapidly improving at code generation, but they remain fundamentally weak at preserving project understanding over long periods of time. The intelligence that emerges during a development session — the "why" behind every decision, the architecture that was debated and chosen, the paths that were explored and abandoned — evaporates the moment a session ends, a context window fills, or a developer switches tools.

Current AI development workflows suffer from a compounding set of failures:

| Failure Mode | Description | Impact |
|---|---|---|
| **Context window limitations** | AI models can only hold a finite amount of text in working memory. Large projects exceed this capacity, forcing partial understanding. | The AI operates on incomplete information, producing code that conflicts with unseen parts of the system. |
| **Session expiration** | Chat sessions end. History is lost. The next session starts from zero. | Developers must re-explain project context every time they begin a new conversation. |
| **Account switching** | Developers use multiple accounts, devices, or environments. Context does not transfer between them. | Project understanding becomes fragmented across disconnected sessions. |
| **Model switching** | Developers move between AI models (GPT-4, Claude, Gemini, etc.) depending on task, cost, or capability. No model inherits the understanding built by another. | Every model switch is a hard reset on project understanding. |
| **Loss of architectural understanding** | AI assistants forget the high-level structure of a project once it leaves the context window. | New code may violate architectural boundaries that were previously established and agreed upon. |
| **Loss of business context** | The business rationale behind features — why a feature exists, who it serves, what problem it solves — is rarely encoded in code. AI cannot infer what it was never told. | AI produces technically functional but strategically misaligned code. |
| **Duplicate code generation** | Without memory of what already exists, AI frequently generates functionality that duplicates existing services, utilities, or components. | Codebase bloat, maintenance burden, and subtle inconsistencies between duplicate implementations. |
| **Architectural drift** | Over many sessions, AI-generated code gradually diverges from the original design vision. Small deviations compound into structural incoherence. | The project becomes increasingly difficult to maintain, extend, and reason about. |
| **Repeated onboarding** | Every new AI session requires the developer to perform the equivalent of onboarding a new team member — from scratch. | Massive time waste. The developer becomes a human context shuttle between AI sessions. |
| **Repeated explanations** | Developers find themselves explaining the same constraints, conventions, and decisions over and over across sessions. | Developer fatigue. Reduced willingness to use AI for complex tasks. |
| **Token waste** | Re-transmitting project context consumes tokens that could be spent on actual productive work. | Increased cost. Reduced effective throughput of AI assistance. |
| **Loss of project continuity** | The cumulative effect of all the above: projects lose momentum. The compounding intelligence that should build over time instead resets repeatedly. | Projects stall, degrade, or are abandoned — not because the AI cannot code, but because it cannot remember. |

### The Belief

The founder believes that **project memory will become more important than code generation itself**.

This is a contrarian position in 2026. The dominant narrative in AI development tooling is that the primary bottleneck is code generation quality — smarter models, better completions, faster agents. The venture capital ecosystem, the media, and the major AI labs are all focused on making AI write better code.

ToMe is built on the belief that this narrative is incomplete.

Code generation is a solved-enough problem. Models will continue to improve at writing code. But no amount of code generation quality can compensate for the loss of project understanding. A brilliant coder with amnesia is still ineffective.

### The Reframe

Current AI systems focus on **generating code**.

ToMe focuses on **preserving project intelligence**.

The distinction is critical:

- **Code generation** answers: "What code should I write next?"
- **Project intelligence** answers: "What does this project know about itself?"

ToMe exists to ensure that the second question always has a rich, accurate, and persistent answer.

### Core Statement

> **"Git stores code history. ToMe stores project intelligence."**

Git is the universal system of record for *what changed* in a codebase. But Git does not capture *why* something changed, *what was considered and rejected*, *what the project is trying to become*, or *what the team has learned along the way*. ToMe is the system of record for everything Git cannot capture.

---

## ORIGIN STORY

### The Lived Experience

The founder frequently builds software using AI coding tools — Cursor, Claude, ChatGPT, Copilot, and others. These tools are used not as occasional helpers but as primary development partners for substantial projects.

During these experiences, several recurring frustrations appeared. These frustrations were not occasional annoyances. They were **systematic failures** that grew worse as projects grew larger and development timelines grew longer.

### Frustration 1 — Context Exhaustion

Large projects become difficult to continue after context windows are exhausted. In the early stages of a project, AI assistants perform remarkably well. The entire codebase fits in context. The AI understands every file, every function, every design decision. But as the project grows — 50 files, 100 files, 500 files — the context window fills. The AI begins to lose awareness of distant parts of the system. It makes suggestions that conflict with code it can no longer see. The developer must manually manage what the AI knows, becoming a context curator rather than a builder.

### Frustration 2 — The Re-explanation Tax

Switching to a new AI chat often requires re-explaining the entire project. When a conversation grows too long, when a session times out, or when the developer simply needs a fresh start, a new chat begins with total amnesia. The developer must reconstruct the AI's understanding from scratch: "This is a Next.js app. It has three main services. The authentication uses JWT. The database is PostgreSQL. We decided to use a monorepo because..." This re-explanation tax is paid over and over. It compounds. It is deeply wasteful.

### Frustration 3 — Tool-Switching Amnesia

Switching between AI tools requires repeating project understanding. A developer might use Cursor for code editing, Claude for architectural planning, and ChatGPT for brainstorming. Each tool starts with zero knowledge. The understanding built in one tool does not transfer to another. The developer becomes a manual synchronization layer between disconnected AI systems.

### Frustration 4 — Decision Amnesia

AI assistants often forget previous architectural decisions. In Session 1, the developer and AI agree: "We will use a service layer pattern. Business logic belongs in services, not in API routes." In Session 5, the AI generates business logic directly in an API route. It has forgotten the agreement. The developer must catch the violation, re-explain the convention, and correct the code. Multiply this by dozens of architectural decisions across dozens of sessions.

### Frustration 5 — Duplicate Generation

AI assistants sometimes create duplicate functionality because they no longer remember what already exists. The project already has a `formatDate()` utility. The AI, having lost awareness of the utilities directory, generates a new `formatDateString()` function with nearly identical logic. The codebase accumulates redundancy. Each duplicate is a future maintenance burden and a potential source of inconsistency.

### Frustration 6 — Vision Drift

AI-generated projects gradually drift away from the original design vision. In the first session, the project has a clear, coherent architecture. By the twentieth session, the architecture has been subtly warped by dozens of AI suggestions that were individually reasonable but collectively incoherent. The project no longer feels like it was designed — it feels like it was accumulated.

### Frustration 7 — Analysis Cost

Large codebases become expensive for AI systems to repeatedly analyze. Every time an AI needs to understand the project, it must read and process large amounts of code. This consumes tokens, time, and money. A well-maintained project memory could provide the same understanding at a fraction of the cost.

### The Realization

These frustrations led to a foundational realization:

> **The future bottleneck of AI-assisted development may not be coding ability. The future bottleneck may be memory.**

The AI can already write code. What it cannot do is *remember*. And as projects grow in complexity and development timelines extend from days to months to years, the cost of forgetting will dwarf the cost of coding.

This realization is the genesis of ToMe.

---

## CORE INSIGHT — THE KNOWLEDGE LAYER MODEL

### The Six Layers

Software projects contain several layers of knowledge. These layers form a hierarchy, from the most concrete and easily captured to the most abstract and most frequently lost:

### Layer 1: Code

The literal source code of the project. Functions, classes, modules, configuration files, tests.

- **Preservation status:** Well-preserved. Git, version control, and file systems handle this layer effectively.
- **Current tooling:** Git, GitHub, GitLab, Bitbucket, file systems.
- **Gap:** None significant. This is a solved problem.

### Layer 2: Architecture

The high-level structural organization of the project. How services relate to each other. What patterns are used. How data flows through the system. The boundaries between modules.

- **Preservation status:** Partially preserved. Architecture can sometimes be inferred from code, but inference is expensive, error-prone, and incomplete. Architecture diagrams exist but are rarely maintained. README files capture some architectural intent but decay over time.
- **Current tooling:** README files, architecture diagrams (often outdated), documentation sites (often incomplete), code comments (scattered and inconsistent).
- **Gap:** Significant. Architecture is under-documented and over-inferred.

### Layer 3: Business Intent

The business rationale behind technical decisions. Why a feature exists. Who requested it. What user problem it solves. What business metric it serves. What trade-offs were made and why.

- **Preservation status:** Poorly preserved. Business intent lives in Slack threads, meeting notes, Jira tickets, email chains, and founder's heads. It is rarely encoded in a format that AI systems can consume.
- **Current tooling:** Jira, Linear, Notion, Slack, meeting recordings, tribal knowledge.
- **Gap:** Critical. Business intent is the most important context for making good architectural decisions, and it is the least accessible to AI systems.

### Layer 4: Historical Decisions

The record of decisions made throughout the project's life. What alternatives were considered. Why option A was chosen over option B. What constraints existed at the time of the decision. What assumptions were made.

- **Preservation status:** Very poorly preserved. Decision history lives in the memories of team members. Some teams maintain ADRs (Architecture Decision Records), but this practice is rare and inconsistent. Most decisions are made in conversations that are never recorded.
- **Current tooling:** ADRs (rare), meeting notes (inconsistent), tribal knowledge (fragile).
- **Gap:** Severe. Without decision history, future developers (and AI systems) are condemned to re-litigate settled debates or, worse, unknowingly reverse decisions that were made for good reasons.

### Layer 5: Lessons Learned

The knowledge gained from failures, mistakes, and dead ends. What approaches were tried and failed. What bugs were caused by certain patterns. What performance problems emerged from specific architectural choices. What libraries or tools proved problematic.

- **Preservation status:** Almost never preserved. Lessons learned exist as scar tissue in the minds of developers. When those developers leave, the lessons leave with them. Future developers make the same mistakes, suffer the same failures, and learn the same lessons — at the same cost.
- **Current tooling:** Post-mortems (rare and retrospective), tribal knowledge (extremely fragile).
- **Gap:** Near-total. This is arguably the most valuable layer of knowledge and the most neglected.

### Layer 6: Future Plans

The intended evolution of the project. What features are planned. What architectural changes are anticipated. What technical debt is known and queued for resolution. What the project is trying to become.

- **Preservation status:** Partially preserved, but in scattered and disconnected formats. Roadmaps exist in product management tools but are rarely connected to technical context. Future plans known to the founder or tech lead are often not documented at all.
- **Current tooling:** Roadmap tools, issue trackers, founder's mental model.
- **Gap:** Moderate to significant. Future plans that are not encoded are invisible to AI systems, leading to code that is locally correct but strategically misaligned.

### The Preservation Gap

| Layer | Current Preservation | ToMe Target |
|---|---|---|
| Layer 1: Code | ✅ Fully preserved | Maintained by existing tools |
| Layer 2: Architecture | ⚠️ Partially preserved | Fully captured and maintained |
| Layer 3: Business Intent | ❌ Poorly preserved | Explicitly captured and linked to architecture |
| Layer 4: Historical Decisions | ❌ Very poorly preserved | Recorded with rationale and alternatives |
| Layer 5: Lessons Learned | ❌ Almost never preserved | Systematically captured from failures |
| Layer 6: Future Plans | ⚠️ Partially preserved | Encoded and connected to current state |

**Most tools preserve Layer 1. Some tools partially preserve Layer 2. Very few tools preserve Layers 3–6.**

**ToMe exists to preserve all layers.**

---

## FIRST PRINCIPLES FOUNDATION

### Starting from Zero

To understand why ToMe must exist, it is necessary to reason about software development from first principles — stripping away assumptions about current tools, current workflows, and current industry norms.

### Axiom 1: Software Engineering is Fundamentally a Knowledge Management Problem

The dominant narrative frames software engineering as a *code production* problem. The job of a software engineer is to write code. Better engineers write better code. Better tools help write code faster.

This framing is incomplete.

Software engineering is fundamentally the process of **understanding a problem domain, making decisions about how to represent that domain in executable form, and maintaining the coherence of those decisions over time**. Code is the *output* of this process, not the process itself. The process is knowledge work.

### Axiom 2: Code is Only One Representation of Knowledge

A codebase is a knowledge artifact, but it is a lossy one. Code captures *what* the system does. It does not capture:

- **Why** the system does it that way
- **What alternatives** were considered
- **What constraints** shaped the design
- **What failures** informed the current approach
- **What the system** is intended to become
- **Who the system** serves and why they need it

These forms of knowledge are essential for making good future decisions. Without them, every future decision is made in a partial vacuum.

### Axiom 3: Knowledge Loss Degrades Project Quality

When project knowledge disappears — when a key developer leaves, when a chat session expires, when an AI loses context — the project's quality ceiling drops. Future decisions are made with less information. The probability of mistakes increases. The probability of redundancy increases. The probability of architectural drift increases.

This degradation is not always immediately visible. It manifests slowly, as a gradual loss of coherence. The codebase becomes harder to maintain. New features take longer to build. Bugs become harder to trace. The project feels increasingly brittle.

### Axiom 4: AI Amplifies Both Knowledge Creation and Knowledge Loss

AI coding assistants dramatically accelerate knowledge creation. They help developers explore ideas, prototype solutions, and produce code at unprecedented speed. But they also amplify knowledge loss, because:

- AI sessions are ephemeral by default
- AI context windows are finite
- AI cannot remember across sessions without external aid
- The speed of AI-assisted development means more decisions are made per unit time, each of which needs to be preserved

The faster you build, the faster you forget — unless you have a memory system.

### The Conclusion

> **Project memory should become a first-class artifact.**

Just as code is stored in version control, tested by CI/CD, and reviewed by peers, project memory should be:

- **Stored** in a persistent, accessible format
- **Updated** as the project evolves
- **Validated** for accuracy and completeness
- **Consumed** by both humans and AI systems
- **Treated** with the same importance as the codebase itself

This is the first-principles foundation of ToMe.

---

## WHAT TOME IS

ToMe is a system that occupies a new category in the developer tooling landscape. It is not a code editor. It is not a coding agent. It is not a language model. It is an **intelligence preservation layer** for software projects.

Concretely, ToMe is:

### A Project Memory System

ToMe captures, structures, and maintains the accumulated understanding of a software project. This includes architectural decisions, business context, historical choices, failure knowledge, and strategic direction. The memory persists across sessions, tools, models, and team members.

### A Repository Intelligence System

ToMe analyzes codebases to extract structural understanding — services, APIs, data models, dependencies, patterns, and relationships. This extracted intelligence is maintained as a living document that evolves with the codebase, providing an always-current understanding of the project's technical landscape.

### A Project Onboarding Accelerator

ToMe generates comprehensive project walkthroughs that enable new developers — or new AI sessions — to rapidly achieve productive understanding of a project. Instead of spending hours reading code or re-explaining context, a developer (or AI) can consume the ToMe memory files and begin productive work immediately.

### A Knowledge Preservation Layer

ToMe serves as the persistent knowledge layer that survives the ephemeral nature of AI sessions, developer turnover, and tool migration. Knowledge captured in ToMe outlives any individual conversation, any individual tool, and any individual team member.

### A Project Understanding Engine

ToMe does not merely store static documentation. It understands projects — their structure, their evolution, their intentions, and their constraints. This understanding is represented in structured formats that are consumable by both humans and AI systems.

### A Context Management Layer

ToMe manages the challenge of AI context limitations by providing pre-structured, high-signal project context that can be efficiently loaded into any AI system's context window. Instead of feeding raw code (expensive, noisy, incomplete), developers can feed ToMe memory files (compact, structured, comprehensive).

### A Memory Infrastructure Platform

In its mature form, ToMe aspires to be the infrastructure layer that all AI development tools use for project memory — a standard, a protocol, a universal memory substrate. Just as Git became the universal infrastructure for code storage, ToMe aims to become the universal infrastructure for project intelligence.

---

## WHAT TOME IS NOT

Clarity about what ToMe is *not* is as important as clarity about what it *is*. Misidentification of the product category would lead to incorrect competitive positioning, misallocated engineering effort, and confused messaging.

ToMe is NOT:

### A New IDE

ToMe does not provide a code editing environment. It does not compete with VS Code, JetBrains, Neovim, or any other editor. ToMe operates alongside editors as a complementary layer. The project should integrate with existing editors through extensions, not attempt to replace them.

### A Replacement for Cursor

Cursor is an AI-powered code editor. It excels at in-editor AI assistance. ToMe does not provide in-editor code generation or code completion. ToMe provides the memory layer that could make Cursor (and tools like it) more effective by giving them persistent project context.

### A Replacement for Claude Code

Claude Code is a terminal-based AI coding agent. It excels at executing coding tasks through conversation. ToMe does not execute coding tasks. ToMe provides the project understanding that could make Claude Code sessions more productive and less repetitive.

### A Replacement for ChatGPT

ChatGPT is a general-purpose AI assistant. ToMe is not a general-purpose assistant. ToMe is a specialized system focused exclusively on project memory and intelligence.

### A Replacement for Coding Agents

Autonomous coding agents (Devin, OpenHands, SWE-Agent, etc.) focus on independently executing development tasks. ToMe does not execute tasks. ToMe provides the project understanding that agents need to execute tasks correctly.

### A New Foundation Model

ToMe does not train or serve its own language model. It uses existing models (via APIs) to analyze repositories and generate memory artifacts. The intelligence of ToMe is in its system design, its prompting, its memory structure, and its knowledge representation — not in a proprietary model.

### A New LLM

ToMe is not a language model. It is a system built on top of language models. The value is in the orchestration, the memory format, and the knowledge extraction pipeline — not in the weights of a neural network.

### A Devin Competitor

Devin is an autonomous software engineer. It writes code, debugs, deploys, and executes entire development workflows. ToMe does not write code. ToMe does not debug. ToMe does not deploy. ToMe remembers. Devin and ToMe are complementary — Devin executes, ToMe preserves the intelligence that makes execution coherent over time.

### Strategic Positioning Principle

> **The project should initially integrate with existing ecosystems. The project should avoid competing directly with major AI companies.**

ToMe is additive, not substitutive. It makes existing tools better. It does not replace them. This positioning is both a strategic choice (avoiding competition with well-funded incumbents) and a reflection of the product's nature (memory is a layer, not a destination).

---

## MVP STRATEGY

### Design Philosophy

The MVP must be **intentionally small**.

The temptation in a project with this scope of vision is to build broadly — to attempt cloud features, team collaboration, enterprise governance, and multi-agent orchestration from the start. This temptation must be resisted absolutely.

The MVP exists to validate **one hypothesis and one hypothesis only**:

> **Can structured project memory significantly reduce AI context loss?**

If this hypothesis is validated, the entire product roadmap opens up. If it is not validated, no amount of additional features will save the product.

### What the MVP Should Do

The MVP should:

| Capability | Description | Validation Purpose |
|---|---|---|
| **Analyze repositories** | Read and understand the structure, services, patterns, and dependencies of a codebase | Proves that automated project understanding is feasible |
| **Generate project memory files** | Produce structured memory artifacts that capture architecture, state, guardrails, failure knowledge, and walkthroughs | Proves that project intelligence can be represented in a persistent, structured format |
| **Generate architecture summaries** | Create comprehensive architectural overviews from codebase analysis | Proves that AI can extract and articulate architectural understanding |
| **Generate project walkthroughs** | Produce onboarding-ready project summaries that enable rapid understanding | Proves that memory files can accelerate onboarding for both humans and AI |
| **Preserve project state** | Maintain a living record of what has been completed, what is in progress, and what is planned | Proves that project continuity can be maintained across sessions |
| **Reduce onboarding effort** | Demonstrably reduce the time and effort required to bring a new AI session (or a new developer) up to productive speed | Proves the core value proposition |

### What the MVP Should NOT Include

The MVP should NOT include:

| Excluded Capability | Reason for Exclusion |
|---|---|
| **Autonomous coding** | Out of scope. ToMe remembers; it does not code. Including coding would blur the product identity. |
| **Multi-agent orchestration** | Premature complexity. Multi-agent systems require mature single-agent capabilities first. |
| **Cloud collaboration** | Premature scaling. The single-user experience must be validated before multi-user scenarios. |
| **Enterprise governance** | Enterprise features require product-market fit, sales infrastructure, and compliance expertise that do not exist yet. |
| **Billing systems** | Monetization infrastructure should be built after value is proven, not before. |
| **User management** | Multi-user support adds authentication, authorization, and data isolation complexity that is unnecessary for validation. |
| **Custom IDE development** | Building an IDE would be a massive distraction and would violate the strategic principle of integrating with existing ecosystems. |

### MVP Success Condition

The MVP is successful if a developer can:

1. Point ToMe at a repository
2. Receive generated memory files
3. Use those memory files to provide context to an AI assistant
4. Experience measurably less re-explanation and context loss
5. Feel that the AI assistant "understands" their project better with memory than without

---

## INITIAL MEMORY SYSTEM — FILE SPECIFICATIONS

The MVP should generate the following files. Each file serves a specific purpose in the project memory system. Together, they form a comprehensive, structured representation of project intelligence.

---

### `architect.md`

**Purpose:** Preserve architectural understanding.

**Why this file exists:** Architecture is the most expensive knowledge to reconstruct. When an AI loses awareness of the project's architecture, it makes decisions that violate structural boundaries, duplicate existing services, and introduce inconsistencies. This file provides a persistent architectural reference that any AI session can consume.

**Contents:**

| Section | Description |
|---|---|
| **Services** | Complete enumeration of all services in the project, including their responsibilities, boundaries, and interfaces. Each service should include a brief description of what it does and what it does not do. |
| **APIs** | All API endpoints, including routes, methods, request/response schemas, authentication requirements, and rate limiting. External API integrations should also be documented. |
| **Data Models** | All data models, schemas, and their relationships. Database tables, ORM models, TypeScript interfaces, and any other data structure definitions. Include relationships (one-to-many, many-to-many, etc.). |
| **Folder Structure** | Annotated directory tree showing the purpose of each major directory and the conventions for file placement. This is critical for preventing AI systems from placing new files in incorrect locations. |
| **High-Level Architecture** | A narrative description of the overall system architecture, including the architectural pattern (monolith, microservices, serverless, etc.), the technology stack, the data flow, and the key design decisions that shaped the architecture. |

**Update Frequency:** Should be regenerated or updated whenever significant architectural changes occur.

**Consumption Pattern:** This file should be provided to AI assistants at the beginning of any session involving architectural decisions, new feature development, or code review.

---

### `memory.md`

**Purpose:** Preserve project state.

**Why this file exists:** Without a record of project state, every new session starts from an ambiguous present. The AI does not know what has been completed, what is actively being worked on, or what comes next. This ambiguity leads to duplicated effort, premature optimization, and misaligned priorities. This file provides temporal orientation.

**Contents:**

| Section | Description |
|---|---|
| **Completed Work** | A chronological record of features, fixes, and milestones that have been completed. Each entry should include what was done, when it was done, and any relevant notes about the implementation. |
| **Current Work** | What is actively being developed right now. Includes the current focus, active branches, work-in-progress features, and any blockers. |
| **Pending Work** | What is planned but not yet started. Prioritized backlog of upcoming work, including estimated complexity and dependencies. |
| **Milestones** | Key project milestones — past, present, and future. Each milestone should include its target date (if known), its definition of done, and its current status. |

**Update Frequency:** Should be updated at the end of every significant work session.

**Consumption Pattern:** This file should be provided to AI assistants at the beginning of any session to orient them temporally — to help them understand where the project is in its development lifecycle.

---

### `guardrails.md`

**Purpose:** Reduce duplication and architectural drift.

**Why this file exists:** AI assistants, lacking memory of what already exists, frequently generate code that duplicates existing functionality or violates established conventions. This file acts as a set of constraints — a "do not duplicate" list and a "follow these rules" reference. It is the immune system of the codebase.

**Contents:**

| Section | Description |
|---|---|
| **Existing Services** | A complete inventory of existing services, utilities, helpers, and shared components. For each entry: name, location, purpose, and public interface. The goal is to prevent AI from generating duplicates. |
| **Existing Components** | UI components, shared modules, and reusable abstractions that already exist. Includes their props/parameters, usage examples, and location. |
| **Naming Conventions** | The naming patterns used throughout the project. File naming, function naming, variable naming, component naming, API endpoint naming. Consistency rules. |
| **Reuse Rules** | Explicit instructions about when to reuse existing code vs. when to create new code. Rules about abstraction levels, shared utilities, and common patterns. |
| **Architecture Constraints** | Hard rules about the architecture. "Business logic belongs in the service layer, not in API routes." "Database queries should go through the repository pattern." "No direct DOM manipulation in React components." These constraints prevent architectural drift. |

**Update Frequency:** Should be updated whenever new services, components, or conventions are established.

**Consumption Pattern:** This file should be provided to AI assistants at the beginning of any coding session. It is especially critical when the AI is generating new code, to prevent duplication and ensure adherence to established patterns.

---

### `recover.md`

**Purpose:** Capture failure knowledge.

**Why this file exists:** Failure knowledge is the most valuable and most perishable form of project intelligence. When a developer spends two hours debugging a problem, the knowledge of *what didn't work and why* is immensely valuable — but it is almost never recorded. The next developer (or the next AI session) will spend the same two hours making the same mistakes. This file breaks the cycle by preserving failure knowledge as a persistent resource.

**Contents:**

| Section | Description |
|---|---|
| **Failed Fixes** | Approaches to bug fixes that were attempted but did not work. For each entry: the bug, the attempted fix, why it failed, and what ultimately resolved the issue. |
| **Failed Implementations** | Features or components that were implemented but had to be rolled back or redesigned. For each entry: what was built, why it failed, and what replaced it. |
| **Rejected Approaches** | Architectural or design approaches that were considered but deliberately rejected. For each entry: the approach, the reasoning for rejection, and the alternative that was chosen. |
| **Lessons Learned** | General insights gained from project development. Performance pitfalls, library gotchas, integration challenges, deployment surprises. Any hard-won knowledge that future sessions should know. |

**Update Frequency:** Should be updated whenever a significant failure, rollback, or rejection occurs.

**Consumption Pattern:** This file should be provided to AI assistants when working on areas related to previous failures, or when the AI is about to make a decision in a domain where lessons have been learned.

---

### `walkthrough.md`

**Purpose:** Accelerate onboarding.

**Why this file exists:** The most expensive moment in any AI-assisted development workflow is the beginning — when the AI knows nothing and the developer must reconstruct context from scratch. This file compresses hours of onboarding into minutes by providing a comprehensive, structured project walkthrough that any AI (or human) can consume to achieve rapid productive understanding.

**Contents:**

| Section | Description |
|---|---|
| **Project Summary** | A concise but thorough description of what the project is, what problem it solves, who it serves, and what makes it unique. This section answers the question: "What am I working on?" |
| **Features** | A complete list of the project's features, organized by importance or by module. Each feature includes a brief description, its current status, and its location in the codebase. |
| **Architecture Overview** | A narrative walkthrough of the project's architecture, written for someone encountering the project for the first time. This should be less technical than `architect.md` and more focused on conveying understanding quickly. |
| **Important Files** | A curated list of the most important files in the project — the files that a new developer (or AI session) should read first. For each file: path, purpose, and key contents. |
| **Current Roadmap** | What is being built now, what comes next, and what the long-term direction looks like. This provides strategic orientation. |
| **Known Issues** | A transparent accounting of known bugs, technical debt, performance problems, and unresolved design questions. This prevents AI from wasting time rediscovering known issues. |

**Update Frequency:** Should be regenerated periodically, especially after significant feature additions, architectural changes, or milestone completions.

**Consumption Pattern:** This file should be the first file provided to any new AI session. It is the universal onboarding document — the single file that, when consumed, provides sufficient context to begin productive work.

---

### Memory System Architecture

The five files form an integrated memory system:

```
walkthrough.md    →  "What is this project?"           →  Onboarding
architect.md      →  "How is this project built?"      →  Structure
memory.md         →  "Where is this project now?"      →  State
guardrails.md     →  "What rules must I follow?"       →  Constraints
recover.md        →  "What has gone wrong before?"     →  Failure Knowledge
```

Together, these five files provide an AI assistant with a comprehensive understanding of the project — its identity, its structure, its current state, its constraints, and its history — without requiring the AI to read and process the entire codebase.

---

## LONG-TERM EVOLUTION PATH

The following phases describe the potential evolution of ToMe from its MVP to its full vision. Each phase builds on the previous one. **The project should not attempt later phases until earlier phases are validated.**

### Phase 1: Repository Intelligence

**Focus:** Automated codebase analysis.

**Description:** Build the core capability to analyze a repository and extract structural understanding — services, APIs, data models, dependencies, patterns, folder conventions, and architectural patterns. This is the foundation upon which all memory generation depends. Without accurate repository intelligence, memory files will be inaccurate and untrustworthy.

**Key Deliverables:**
- Repository parsing and analysis engine
- Service detection and boundary identification
- API endpoint extraction
- Data model and schema discovery
- Folder structure analysis and annotation

**Validation Criteria:** ToMe can analyze a medium-complexity repository (50–200 files) and produce an architectural summary that a developer confirms as accurate and comprehensive.

---

### Phase 2: Memory Generation

**Focus:** Automated generation of the five core memory files.

**Description:** Using the repository intelligence from Phase 1, automatically generate `architect.md`, `memory.md`, `guardrails.md`, `recover.md`, and `walkthrough.md`. The generated files should be high-quality, accurate, and immediately useful. This phase transforms raw repository intelligence into structured, consumable project memory.

**Key Deliverables:**
- Memory file generation pipeline
- Template system for consistent memory file formatting
- Quality validation for generated memory
- Incremental update capability (updating existing memory files rather than regenerating from scratch)

**Validation Criteria:** Generated memory files are accurate enough that a developer would share them with a colleague or feed them to an AI assistant without significant manual editing.

---

### Phase 3: Walkthrough Generation

**Focus:** Rich, interactive project walkthroughs.

**Description:** Move beyond static memory files to generate rich walkthroughs that combine narrative explanation with code references, diagrams, and interactive elements. The walkthrough should feel like having a knowledgeable colleague explain the project in person.

**Key Deliverables:**
- Narrative walkthrough generation
- Architecture diagram generation
- Code reference linking
- Interactive walkthrough viewer
- Customizable depth levels (executive summary, developer overview, deep dive)

**Validation Criteria:** A new developer can go from zero knowledge to productive contribution faster with a ToMe walkthrough than with traditional onboarding methods.

---

### Phase 4: VS Code Extension

**Focus:** Integration with the most popular code editor.

**Description:** Bring ToMe's capabilities directly into the editor where developers spend their time. The extension should provide access to project memory, architecture visualization, guardrail enforcement, and onboarding support without leaving the editor.

**Key Deliverables:**
- VS Code extension with sidebar panel
- In-editor memory file viewing and editing
- Architecture visualization
- Guardrail notifications (alerts when code violates established patterns)
- One-click memory update triggered by significant code changes

**Validation Criteria:** Developers use the extension daily and report that it reduces context-switching and improves their AI-assisted development workflow.

---

### Phase 5: GitHub Integration

**Focus:** Memory as a part of the Git workflow.

**Description:** Integrate ToMe with GitHub to make project memory a native part of the development workflow. Memory files could be automatically updated on PR merge, memory diffs could be included in PR reviews, and project intelligence could be surfaced in GitHub issues and discussions.

**Key Deliverables:**
- GitHub App / Action for automated memory updates
- PR-triggered memory regeneration
- Memory diff in PR descriptions ("This PR changes the authentication architecture...")
- GitHub Issues integration (linking issues to relevant memory sections)
- Repository-level memory dashboard

**Validation Criteria:** Teams report that ToMe's GitHub integration improves PR review quality and reduces the time spent on architectural discussions that have already been decided.

---

### Phase 6: Team Memory

**Focus:** Shared project memory across team members.

**Description:** Extend ToMe from a single-developer tool to a team tool. Team members share a common project memory that evolves collaboratively. Memory contributions from different team members are merged, conflicts are resolved, and the team maintains a unified understanding of the project.

**Key Deliverables:**
- Multi-user memory sync
- Memory merge and conflict resolution
- Team knowledge base
- Role-based memory access (different views for different roles)
- Memory contribution tracking (who contributed what knowledge)

**Validation Criteria:** Teams report improved alignment, reduced miscommunication, and faster onboarding of new team members.

---

### Phase 7: AI Memory Infrastructure

**Focus:** Becoming the standard memory layer for AI development tools.

**Description:** Position ToMe as the infrastructure that all AI coding tools use for project memory. Provide APIs, SDKs, and protocols that allow any AI assistant, agent, or IDE to read and write project memory through ToMe. This is the platform play.

**Key Deliverables:**
- Public API for memory read/write
- SDKs for major AI platforms
- Memory protocol specification
- Integration partnerships with AI coding tools
- Memory format standardization

**Validation Criteria:** Multiple third-party AI tools integrate with ToMe's memory layer, and developers benefit from shared memory across tools.

---

### Phase 8: Enterprise Knowledge Platform

**Focus:** Enterprise-grade project intelligence at organizational scale.

**Description:** Extend ToMe to manage project intelligence across an entire organization. Cross-project knowledge sharing, organizational architectural standards, institutional knowledge preservation, compliance and governance of AI-assisted development.

**Key Deliverables:**
- Multi-project memory management
- Cross-project knowledge graph
- Organizational architectural standards enforcement
- Compliance and audit trails for AI-assisted development
- Enterprise SSO, RBAC, and data isolation
- Analytics and reporting on project intelligence health

**Validation Criteria:** Enterprises adopt ToMe as a standard part of their development infrastructure, and ToMe demonstrably reduces institutional knowledge loss.

---

## COMPETITIVE LANDSCAPE

### Direct Competitors

There are no direct competitors building an AI Project Memory Layer as a standalone product category (as of 2026). The closest products operate in adjacent spaces:

### Adjacent Products

| Product | Category | Relationship to ToMe |
|---|---|---|
| **Cursor** | AI-powered code editor | Complementary. Cursor generates code; ToMe preserves the intelligence that makes code generation coherent. Cursor has nascent memory features (`.cursor/rules`) that validate the need for memory. ToMe would provide a far richer, more structured memory layer. |
| **Claude Code** | AI coding agent (terminal) | Complementary. Claude Code executes coding tasks in the terminal; ToMe provides the project context that makes those tasks more effective. Claude's CLAUDE.md file is a primitive version of what ToMe provides comprehensively. |
| **Windsurf** | AI-powered code editor | Complementary. Similar relationship as Cursor. Windsurf has some memory features that validate the market need. |
| **OpenAI Codex** | AI coding agent (cloud) | Complementary. Codex executes tasks in sandboxed environments; ToMe provides the project intelligence that orients those executions. |
| **Devin** | Autonomous AI software engineer | Complementary. Devin is an autonomous agent that executes development tasks; ToMe provides the persistent project memory that an autonomous agent needs to maintain coherence over time. |
| **OpenHands** | Open-source AI coding agent | Complementary. Same relationship as Devin — the agent executes, ToMe remembers. |

### ToMe's Differentiation

ToMe should differentiate through:

| Differentiator | Description |
|---|---|
| **Memory Preservation** | No other tool treats project memory as its primary product. Existing tools offer memory as a side feature. ToMe makes it the entire focus. |
| **Project Continuity** | ToMe enables project continuity across sessions, tools, and team members. No existing tool provides this level of continuity. |
| **Context Portability** | ToMe memory files can be used with any AI tool — Cursor, Claude, ChatGPT, Gemini, or any future tool. Memory is not locked to a single ecosystem. |
| **Knowledge Retention** | ToMe captures and retains knowledge layers (business intent, historical decisions, lessons learned) that no other tool systematically preserves. |
| **Architecture Preservation** | ToMe actively works to prevent architectural drift by maintaining and enforcing architectural understanding across sessions. |

### Strategic Principle

> **ToMe should avoid competing solely on code generation.**

Code generation is a commodity that will be driven to near-zero marginal cost by competition between well-funded AI labs. Competing on code generation means competing with OpenAI, Anthropic, Google, and others — a losing strategy for a startup.

ToMe competes on *memory* — a dimension that the major AI labs are underinvesting in because their business models are built around model intelligence, not project intelligence. This asymmetry is ToMe's strategic advantage.

---

## FUTURE RESEARCH AREAS

The following research domains are relevant to ToMe's long-term evolution. Understanding the state of the art in each area will inform product decisions, technical architecture, and competitive strategy.

### Agent Memory Systems

**What it is:** The study and engineering of memory architectures for autonomous AI agents — how agents store, retrieve, update, and forget information across tasks and time horizons.

**Why it matters for ToMe:** ToMe is fundamentally a memory system for AI agents applied to software development. Advances in agent memory (e.g., episodic memory, semantic memory, procedural memory models) could directly improve ToMe's memory architecture. Conversely, limitations in agent memory research (e.g., the difficulty of knowing what to remember and what to forget) represent challenges ToMe must solve.

### Context Engineering

**What it is:** The practice of designing, curating, and optimizing the information provided to language models within their context windows to maximize output quality.

**Why it matters for ToMe:** ToMe is, at its core, a context engineering system. The memory files ToMe generates are context artifacts — carefully structured information designed to maximize AI understanding within finite context windows. Research on optimal context structuring, information density, attention patterns, and context prioritization directly impacts ToMe's effectiveness.

### Repository Intelligence

**What it is:** Automated analysis of software repositories to extract structural, behavioral, and historical understanding.

**Why it matters for ToMe:** Repository intelligence is the foundation of Phase 1. The quality of ToMe's memory files depends entirely on the quality of its repository analysis. Research on static analysis, dependency graph construction, architectural pattern detection, and code understanding will directly improve ToMe's capabilities.

### Knowledge Graphs

**What it is:** Graph-based representations of knowledge, where entities are nodes and relationships are edges. Knowledge graphs capture semantic relationships between concepts.

**Why it matters for ToMe:** A mature ToMe might represent project intelligence as a knowledge graph rather than as flat markdown files. Entities (services, APIs, developers, decisions, features) connected by relationships (depends-on, decided-by, replaced-by, blocks) would enable powerful querying, reasoning, and visualization capabilities.

### GraphRAG

**What it is:** A retrieval-augmented generation approach that uses knowledge graphs as the retrieval substrate instead of (or in addition to) vector databases.

**Why it matters for ToMe:** GraphRAG could enable ToMe to answer complex, relationship-based questions about projects: "What services depend on the authentication module?" "What decisions were made because of the performance constraints identified in Q3?" "What components would be affected if we changed the data model?" This is a potential future architecture for ToMe's intelligence retrieval.

### Software Architecture Mining

**What it is:** Automated extraction and recovery of software architecture from source code, documentation, and development history.

**Why it matters for ToMe:** Architecture mining is directly relevant to ToMe's `architect.md` generation. Research on architectural pattern detection, module boundary identification, layer detection, and dependency analysis will improve the accuracy and completeness of ToMe's architectural memory.

### Long-Term Agent Memory

**What it is:** Memory systems that enable AI agents to retain and recall information over extended periods — days, weeks, months, or the entire lifecycle of a project.

**Why it matters for ToMe:** Long-term memory is ToMe's primary value proposition. Research on what to remember, how to consolidate memories, how to handle memory drift (memories becoming outdated), and how to organize memories for efficient retrieval is directly relevant. If the major AI labs solve long-term memory natively, ToMe's value proposition changes significantly — this is both a research area and a competitive threat to monitor.

### AI Governance

**What it is:** The frameworks, policies, and mechanisms for ensuring that AI systems operate responsibly, transparently, and in alignment with organizational values.

**Why it matters for ToMe:** As AI agents take on more autonomous development tasks, organizations will need governance over what AI does and why. ToMe's project memory could serve as an audit trail — a record of decisions, rationales, and constraints that enables governance of AI-assisted development. This is particularly relevant for the enterprise evolution (Phase 8).

### Knowledge Management

**What it is:** The organizational discipline of capturing, organizing, sharing, and maintaining knowledge assets.

**Why it matters for ToMe:** ToMe is a knowledge management system specialized for software projects. Decades of research in enterprise knowledge management — taxonomies, ontologies, knowledge lifecycle management, knowledge quality assessment — are applicable to ToMe's design. The failures of past knowledge management systems (e.g., wikis that decay, documentation that becomes outdated) provide lessons about what to avoid.

### Human-AI Collaboration

**What it is:** The study of how humans and AI systems work together effectively, including interface design, trust calibration, role division, and collaborative workflows.

**Why it matters for ToMe:** ToMe operates at the intersection of human and AI understanding. The memory files it generates must be useful to both humans and AI systems. Research on shared mental models, collaborative sensemaking, and human-AI handoffs will inform how ToMe structures and presents project memory for optimal consumption by both audiences.

---

## RISK ANALYSIS

### Technical Risks

| Risk | Description | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| **Memory accuracy** | Generated memory files may contain inaccuracies that mislead AI assistants and developers | Critical | High | Implement memory validation pipelines. Allow human review and correction. Build confidence scoring into memory generation. Prioritize precision over recall — it is better to omit uncertain information than to include inaccurate information. |
| **Memory staleness** | Memory files may become outdated as the codebase evolves, providing stale context that leads to incorrect decisions | High | High | Implement automated staleness detection. Trigger memory updates on significant code changes. Timestamp all memory entries. Build "freshness indicators" into the memory format. |
| **Analysis quality** | Repository analysis may produce incomplete or incorrect structural understanding, especially for complex or unconventional codebases | High | Medium | Support multiple analysis strategies. Allow human correction. Build feedback loops where developers can flag inaccuracies. Start with well-structured repositories and expand capability incrementally. |
| **Scale limitations** | Very large repositories (monorepos, enterprise codebases) may exceed practical analysis and memory generation capabilities | Medium | Medium | Design for incremental analysis. Support scoped analysis (analyze a subdirectory or module). Implement caching and incremental updates. Defer full-scale enterprise support to later phases. |
| **Format fragility** | Markdown-based memory files may prove too rigid or too unstructured for complex project intelligence | Medium | Medium | Design the memory format to be extensible. Plan for migration to more structured formats (JSON, knowledge graphs) if markdown proves insufficient. Keep the format specification documented and versioned. |

### Market Risks

| Risk | Description | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| **Category creation** | "AI Project Memory Layer" is a new category. Developers may not understand the value proposition without education | High | High | Invest in developer education. Create compelling demos that show the before/after of AI-assisted development with and without project memory. Build the product to be so immediately useful that the category explains itself. |
| **Willingness to pay** | Developers may see project memory as a "nice to have" rather than a "must have" and resist paying for it | High | Medium | Validate willingness to pay early. Start with a generous free tier. Focus on professional and team users who experience the most acute pain. Quantify the cost savings (reduced tokens, reduced time, reduced re-explanation). |
| **Adoption friction** | Adding a new tool to a developer's workflow creates friction. Developers are resistant to workflow changes | Medium | High | Minimize adoption friction. Make ToMe work with a single command. Don't require workflow changes — work alongside existing workflows. Provide immediate value on first use. |

### Competition Risks

| Risk | Description | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| **Native memory features** | Major AI tools (Cursor, Claude, etc.) may build native memory features that eliminate ToMe's advantage | Critical | High | Move fast. Build deeper, richer memory than native features can justify. Focus on cross-tool portability (native memory is tool-locked; ToMe memory works everywhere). Build a community and ecosystem around the memory format. Monitor competitor features obsessively. |
| **AI lab investment** | An AI lab (OpenAI, Anthropic, Google) may decide to invest heavily in project memory as a feature | Critical | Medium | Differentiate on depth and specialization. AI labs will build general memory; ToMe builds specialized project memory. Establish brand and category leadership before labs enter. Consider the possibility of being acquired as a positive outcome. |
| **Open source competition** | An open-source project may replicate ToMe's core functionality | Medium | Medium | Move fast. Build a community. Provide hosted services that add value beyond the open-source core. Consider open-sourcing parts of ToMe to build ecosystem lock-in. |

### Execution Risks

| Risk | Description | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| **Scope creep** | The vision is large and the temptation to build beyond MVP scope is strong | High | High | Maintain rigorous scope discipline. Document the MVP boundary clearly (done above). Resist every feature request that does not validate the core hypothesis. Celebrate saying no. |
| **Perfectionism** | The desire to produce perfect memory files may delay shipping | Medium | Medium | Accept that early memory files will be imperfect. Ship, gather feedback, iterate. Perfect is the enemy of shipped. |
| **Solo founder risk** | A single founder has limited bandwidth, no complementary skills backup, and is a single point of failure | High | Medium | Build in public to attract collaborators. Prioritize ruthlessly. Use AI tools to amplify individual productivity. Plan for bringing on co-founder or early hires. |

### Founder Risks

| Risk | Description | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| **Burnout** | The founder is building with AI tools daily and may burn out from the intensity of simultaneous building and vision-setting | Medium | Medium | Set sustainable pace. Celebrate milestones. Take breaks. Remember that ToMe is a marathon, not a sprint. |
| **Context switching** | The founder must switch between coding, product thinking, marketing, fundraising, and strategy — context switching reduces effectiveness | Medium | High | Time-block different activities. Use ToMe's own memory system to maintain context across founder activities. Eat your own dog food. |
| **Vision lock-in** | The founder's strong vision may make them resistant to market feedback that contradicts the vision | Medium | Medium | Actively seek disconfirming evidence. Talk to developers who don't see the value. Build feedback mechanisms into the product. Distinguish between core vision (memory matters) and specific implementation (how memory should work). |

### AI Advancement Risks

| Risk | Description | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| **Infinite context windows** | AI models may achieve effectively unlimited context windows, reducing the need for external memory | Critical | Low-Medium | Even with infinite context, structured memory is more efficient than raw code. Reading 1M lines of code is slower and more expensive than reading a 500-line memory file. The need shifts from "providing context" to "providing *structured* context." |
| **Native long-term memory** | AI models may develop native long-term memory that persists across sessions | High | Medium | Native model memory is model-locked. ToMe memory is portable. Native memory may not capture all six knowledge layers. ToMe's value shifts from "providing memory" to "providing *structured, portable, comprehensive* memory." |
| **Agentic development** | Fully autonomous AI agents may make human-readable memory files less relevant | Medium | Low | Even autonomous agents need memory. The format may change (from human-readable markdown to machine-optimized structures) but the need for persistent project intelligence remains. |

### Product Risks

| Risk | Description | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| **Memory quality floor** | Generated memory may be low-quality for certain types of projects, leading to loss of trust | High | Medium | Start with project types that are well-suited to automated analysis (web applications, APIs). Expand to more complex project types as capabilities mature. Always allow human review and correction. |
| **Overpromising** | Marketing may set expectations higher than the product can deliver, leading to disappointment | Medium | Medium | Be honest about capabilities and limitations. Under-promise, over-deliver. Let the product speak for itself through demos and testimonials. |

### Monetization Risks

| Risk | Description | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| **Free alternative sufficiency** | Manual memory management (hand-written markdown files) may be "good enough" for many developers | Medium | Medium | Make automated memory generation so much better than manual that the comparison is not close. Focus on the time savings and consistency that automation provides. |
| **Pricing model uncertainty** | Unclear whether to charge per-repository, per-user, per-generation, or via subscription | Medium | High | Test multiple pricing models early. Talk to potential customers about willingness to pay. Consider usage-based pricing that aligns cost with value. Start with a generous free tier to drive adoption. |
| **Enterprise sales cycle** | Enterprise customers have long sales cycles, complex procurement, and require features (SSO, RBAC, compliance) that take significant engineering effort | High | High (if pursuing enterprise) | Defer enterprise sales until the product has strong bottom-up adoption. Let enterprise demand pull features rather than pushing enterprise features speculatively. |

---

## UNANSWERED QUESTIONS

The following questions remain open and require investigation, experimentation, or founder decision-making before they can be resolved. Each question has strategic implications for the product's direction.

### Memory Storage & Location

- **Should memory files live inside repositories?**  
  *Arguments for:* Memory travels with the code. Git versioning applies. No external dependencies. Easy to share.  
  *Arguments against:* Adds files to the repo. May be seen as clutter. Public repos would expose project intelligence. Requires `.gitignore` management for sensitive information.

- **Should there be a `.tome/` directory convention?**  
  *If memory lives in the repo, standardizing on a directory convention (like `.github/` or `.vscode/`) would establish a recognizable pattern and simplify tooling.*

- **Should memory be stored externally (cloud) or locally?**  
  *Local-first is simpler and more private. Cloud enables team sync and cross-device access. The answer may differ by phase (local for MVP, cloud for team features).*

### Memory Generation

- **Should memory files be generated automatically or on-demand?**  
  *Automatic generation reduces effort but may produce unwanted updates. On-demand generation requires developer discipline but gives more control.*

- **Should memory updates require approval?**  
  *An approval workflow adds safety (preventing incorrect memory from being committed) but also adds friction. The right balance depends on the use case.*

- **How should incremental updates work?**  
  *When the codebase changes, should ToMe regenerate memory from scratch or incrementally update existing memory? Incremental is more efficient but risks accumulating drift.*

### Memory Quality

- **How should memory quality be measured?**  
  *Possible metrics: developer satisfaction, AI output quality with vs. without memory, accuracy assessments, coverage assessments. No clear standard exists yet.*

- **What information deserves permanent retention vs. expiration?**  
  *Not all knowledge is eternally relevant. Completed milestones, resolved bugs, and superseded decisions may become noise over time. How should memory be pruned without losing important lessons?*

### Representation

- **How should project intelligence be represented?**  
  *Markdown is human-readable but lacks structure. JSON is machine-parsable but hard for humans. YAML is a middle ground. Knowledge graphs are powerful but complex. The right representation may differ by use case or evolve over time.*

- **Should memory files be optimized for human readability or AI consumption?**  
  *The two audiences have different needs. Humans prefer narrative and hierarchy. AI systems may prefer structured data and explicit relationships. Can one format serve both?*

### Integration

- **How should different AI tools consume memory?**  
  *Should memory be injected into system prompts? Provided as file context? Served via API? The consumption pattern affects the memory format and the integration architecture.*

- **Should ToMe provide a standard memory format that AI tools can adopt?**  
  *A standard format would increase portability but requires industry buy-in. Should ToMe push for standardization or adapt to each tool's conventions?*

### Business Model

- **What is the right pricing model?**  
  *Per-repository? Per-user? Per-generation? Subscription? Freemium? The answer depends on usage patterns and willingness-to-pay data that does not yet exist.*

- **Should the core tool be open-source?**  
  *Open source could accelerate adoption and community building but makes monetization harder. A possible model: open-source CLI + paid cloud features.*

- **When should monetization be introduced?**  
  *Too early risks alienating early adopters. Too late risks running out of runway. The founder needs to decide the trigger for introducing paid features.*

---

## SUCCESS CRITERIA

The following metrics define success for ToMe. They are organized by phase, from immediate MVP validation to long-term platform success.

### MVP Success Metrics

| Metric | Target | Measurement Method |
|---|---|---|
| **AI onboarding time reduction** | 50%+ reduction in time spent re-explaining project context to new AI sessions | Before/after comparison: time spent on project explanation with and without ToMe memory files |
| **Repeated explanation reduction** | Developers report significantly fewer instances of re-explaining project decisions, architecture, and conventions to AI | Developer self-report surveys and session analysis |
| **Duplicate code reduction** | Measurable decrease in AI-generated duplicate functionality when guardrails.md is provided | Code analysis comparing duplicate generation rates with and without guardrails.md |
| **Architecture violation reduction** | Measurable decrease in AI-generated code that violates architectural constraints when architect.md and guardrails.md are provided | Manual review of AI-generated code with and without memory files |
| **Developer satisfaction** | Developers report that ToMe memory files make their AI-assisted development experience meaningfully better | NPS scores, qualitative feedback, retention rates |

### Growth Metrics (Post-MVP)

| Metric | Target | Measurement Method |
|---|---|---|
| **Project continuity across tools** | Developers successfully use ToMe memory files across multiple AI tools (e.g., generating memory in Cursor, consuming in Claude Code) | Usage tracking and developer reports |
| **Onboarding acceleration** | New developers reach productive contribution faster with ToMe walkthroughs than with traditional onboarding | Time-to-first-commit comparison |
| **Community adoption** | Growing number of repositories containing `.tome/` directories | GitHub search, community metrics |
| **Integration partnerships** | AI tools actively integrating with ToMe's memory format | Partnership count and integration quality |

### Long-Term Success Metrics

| Metric | Target | Measurement Method |
|---|---|---|
| **Category establishment** | "AI Project Memory Layer" becomes a recognized product category | Industry recognition, analyst coverage, competitor entry |
| **Standard adoption** | ToMe's memory format becomes a de facto standard for project intelligence | Format adoption across tools and communities |
| **Enterprise penetration** | Enterprise organizations adopt ToMe as standard development infrastructure | Enterprise customer count, revenue |
| **Knowledge preservation** | Measurable reduction in institutional knowledge loss during developer turnover | Before/after comparison in organizations using ToMe |

---

## NORTH STAR — THE TOME MANIFESTO

### A Vision of the Future

Imagine a world where every software project carries a persistent memory — a living, structured record of everything the project knows about itself.

Not just code. Not just commit messages. Not just stale wiki pages that no one reads.

A true memory.

A memory that knows the architecture — not just the folder structure, but the *reasoning* behind every structural decision. Why the monolith was split. Why the microservice boundaries were drawn where they were. Why that particular database was chosen over three alternatives.

A memory that knows the business — not just the feature list, but the *intent* behind every feature. Who asked for it. What problem it solves. What metric it moves. What would happen if it were removed.

A memory that knows the failures — not just the bugs that were fixed, but the *approaches that were tried and abandoned*. The refactors that were rolled back. The libraries that caused problems. The performance optimizations that backfired. The hard-won lessons that are too valuable to forget.

A memory that knows the future — not just the backlog, but the *vision*. What the project is trying to become. What the team has agreed to build next. What trade-offs have been consciously accepted in service of long-term goals.

This memory does not live in any single person's head. It does not disappear when a developer leaves the team, when a chat session expires, when a context window fills, or when a company switches from one AI model to another.

This memory is **persistent**. It outlasts any individual AI session. It outlasts any individual model. It outlasts any individual developer. It outlasts any individual team. It belongs to the project itself.

This memory is **portable**. It can be consumed by any AI tool — today's tools and tomorrow's tools that have not yet been invented. It is not locked to any vendor, any platform, any ecosystem.

This memory is **structured**. It is not a wall of text dumped into a prompt. It is organized, layered, and designed for both human understanding and AI consumption. It provides exactly the right information at exactly the right level of detail for the task at hand.

This memory is **living**. It evolves as the project evolves. It grows richer with each development session, each decision, each failure, each success. It is not static documentation that decays — it is a dynamic representation of project intelligence that appreciates over time.

This is the future ToMe is building toward.

A future where project intelligence is a first-class artifact — versioned, maintained, valued, and protected with the same rigor we apply to source code.

A future where switching AI tools is seamless because the project's memory travels with the project, not with the tool.

A future where new developers (human or AI) can achieve deep project understanding in minutes instead of days.

A future where architectural decisions are never forgotten, business context is never lost, and failure knowledge is never wasted.

A future where the quality of AI-assisted development is limited not by the intelligence of the model, but by the richness of the project's memory — and where that memory is always rich.

---

### The Final Word

> **Code explains what a system does.**
>
> **Memory explains why it exists.**
>
> **ToMe exists to preserve that memory.**

---

*This document is the seed. Everything grows from here.*

*TOME_CONTEXT_SEED_v1 — Created 2026-06-08*
