# TOME_RIS_SPEC_v1

> [!IMPORTANT] **[IMPLEMENTATION NOTICE]** 
> This document provides foundational philosophy. For strict schema implementations, interfaces, and file formats, you MUST use `TOME_RIS_SCHEMA_SPEC_v1`. In the event of any conflict, the Schema Spec governs.


> **[CORPUS PATCH APPLIED]** This document has been patched by `TOME_CORPUS_PATCH_SET_v1` and inherits all definitions from `TOME_ARCHITECTURE_AMENDMENT_v1`.


> **Document Classification:** Formal Intelligence Specification  
> **Document Version:** 1.0  
> **Created:** 2026-06-08  
> **Status:** APPROVED INTELLIGENCE CONTRACT  
> **Persistence:** PERMANENT  

---

## TABLE OF CONTENTS

1. [RIS Philosophy](#1-ris-philosophy)
2. [RIS Objectives](#2-ris-objectives)
3. [RIS Design Principles](#3-ris-design-principles)
4. [RIS Lifecycle](#4-ris-lifecycle)
5. [RIS Versioning](#5-ris-versioning)
6. [The 8 Intelligence Layers](#6-the-8-intelligence-layers)
7. [RIS Entity Definitions](#7-ris-entity-definitions)
8. [The Complete RIS Graph](#8-the-complete-ris-graph)
9. [RIS Generation Model](#9-ris-generation-model)
10. [RIS Update Model](#10-ris-update-model)
11. [Uncertainty & Confidence Framework](#11-uncertainty--confidence-framework)
12. [RIS Rules Engine (Integrity, Mutation, Validation, Compression)](#12-ris-rules-engine)
13. [RIS Serialization Matrix](#13-ris-serialization-matrix)
14. [Future RIS Evolution Strategy](#14-future-ris-evolution-strategy)

---

## 1. RIS PHILOSOPHY

The **Repository Intelligence State (RIS)** is the absolute canonical representation of what ToMe "knows" about a software project. 

If the Repository Model (AST → Graph) represents the physical *anatomy* of the codebase, the RIS represents the *mind* of the codebase. It does not answer "What is here?" It answers "Why is it here?", "What does it mean?", and "What happens when it breaks?"

**Philosophy:**
*   **Knowledge over Syntax:** A developer does not think in ASTs. They think in Domains, Capabilities, and Risks. The RIS speaks human intent.
*   **Traceable Inference:** AI hallucinations are fatal. Therefore, every semantic claim the RIS makes must maintain an explicit traceability link back to the underlying structural code (the evidence) and carry a Confidence Score.
*   **Platform Agnosticism:** The RIS must never know that it is destined to become Markdown files. It must remain a pure, abstract intelligence graph capable of powering a neo4j backend, a VS Code extension, or an autonomous agent operating system.

---

## 2. RIS OBJECTIVES

1.  **Semantic Synthesis:** Transform structural graphs into high-level business capabilities and architectural patterns.
2.  **Context Persistance:** Freeze the fleeting context of the original author into an interrogatable, permanent state.
3.  **Boundary Detection:** Automatically identify where one domain ends and another begins.
4.  **Failure Anticipation:** Deduce theoretical failure modes by observing external integration points and data flows.
5.  **Lossless Compression:** Discard all low-level implementation details while perfectly preserving the high-level intent.

---

## 3. RIS DESIGN PRINCIPLES

1.  **Deductive Certainty vs. Inductive Probability:** Structural facts (e.g., "File A imports File B") are 100% certain. Semantic claims (e.g., "File A is the Payment Processor") are probabilistic. The RIS strictly separates truth from deduction.
2.  **Immutability by Origin:** If a human manually corrects a RIS node, that node's derivation flag changes from `LLM_INFERRED` to `HUMAN_ASSERTED`. Future LLM updates are forbidden from overwriting `HUMAN_ASSERTED` nodes without explicit permission.
3.  **Entity Resolution:** If `AuthService` appears in three different execution flows, it must be represented by exactly *one* RIS Node. 

---

## 4. RIS LIFECYCLE

The RIS is not a static document. It is a living intelligence state with four phases:

1.  **Genesis (Blank State):** The RIS is empty.
2.  **Hydration (Inference):** The LLM receives the structural Repository Model. It projects semantic meaning over the graph, instantiating RIS nodes and edges.
3.  **Maturation (Validation):** The RIS is tested against reality (human validation or static linting). Confidence scores converge toward 1.0.
4.  **Reconciliation (Update):** The underlying codebase changes. The RIS detects a drift between its asserted reality and the new physical reality, triggering a probabilistic patching phase.

---

## 5. RIS VERSIONING

The RIS structure itself is heavily versioned via Semantic Versioning.

*   `RIS_SCHEMA_VERSION`: Defines the exact ontology available to the LLM (e.g., v1.5.0 adds the `FailureMode` entity).
*   `RIS_STATE_HASH`: An immutable checksum representing a specific moment in time of the intelligence. If the LLM generates a new RIS, the `STATE_HASH` changes.

When ToMe updates, it may need to perform a `RIS Migration` to move a user's local intelligence from `v1.0` to `v1.1`.

---

## 6. THE 8 INTELLIGENCE LAYERS

The RIS is composed of eight distinct but interconnected layers of understanding.

### Layer 1: Structural Intelligence
*   **Purpose:** The foundation. Knowing physical realities.
*   **Inputs:** Tree-sitter AST, Repository Skeleton.
*   **Outputs:** Physical topology, Dependency graphs.
*   **Evolution:** Highly volatile (changes every commit).
*   **Confidence:** 1.0 (Mathematically provable).

### Layer 2: Architectural Intelligence
*   **Purpose:** Knowing the system design.
*   **Inputs:** Structural Intelligence + LLM Context.
*   **Outputs:** Identification of Monoliths, Microservices, Domain boundaries, Event buses, Database types.
*   **Evolution:** Slow (changes during major refactors).
*   **Confidence:** 0.85 - 0.95.

### Layer 3: Behavioral Intelligence
*   **Purpose:** Knowing what the system *does*.
*   **Inputs:** Architectural Intelligence + Route/Method parsing.
*   **Outputs:** Extracted capabilities ("Handles User Registration", "Generates PDF Reports").
*   **Evolution:** Moderate (changes with feature releases).
*   **Confidence:** 0.90.

### Layer 4: Workflow Intelligence
*   **Purpose:** Knowing *how* the system is used by developers.
*   **Inputs:** Package.json scripts, Makefile, Dockerfiles.
*   **Outputs:** Build sequences, Deployment flows, Environment setup steps.
*   **Evolution:** Slow.
*   **Confidence:** 0.95.

### Layer 5: Decision Intelligence
*   **Purpose:** Knowing *why* things were built this way.
*   **Inputs:** Commit messages, PR descriptions, LLM inference on weird structural anomalies.
*   **Outputs:** Extracted tradeoffs (e.g., "Redis was chosen over Postgres for caching due to latency").
*   **Evolution:** Permanent (Historical).
*   **Confidence:** 0.60 - 0.90.

### Layer 6: Constraint Intelligence
*   **Purpose:** Knowing what is forbidden.
*   **Inputs:** Linter rules, typing systems, LLM architectural analysis.
*   **Outputs:** Guardrails ("Never mutate state here", "All DB calls must use transactions").
*   **Evolution:** Slow.
*   **Confidence:** 0.85.

### Layer 7: Risk Intelligence
*   **Purpose:** Knowing what is dangerous.
*   **Inputs:** External integration points, unguarded network boundaries.
*   **Outputs:** Vulnerabilities, Rate limit hazards, Data loss vectors.
*   **Evolution:** Moderate.
*   **Confidence:** 0.70.

### Layer 8: Recovery Intelligence
*   **Purpose:** Knowing how to survive failure.
*   **Inputs:** Risk Intelligence.
*   **Outputs:** Runbooks, debugging strategies, rollback procedures.
*   **Evolution:** Fast (updated as production incidents occur).
*   **Confidence:** 0.75.

---

## 7. RIS ENTITY DEFINITIONS

The RIS graph is populated exclusively by the following entities.

### 1. Domain
*   **Meaning:** A cohesive bounded context representing a major area of business logic (e.g., "Authentication", "Billing").
*   **Attributes:** `Name`, `Description`, `CriticalityLevel`.
*   **Relationships:** Contains `Capability` and `Service`.

### 2. Capability
*   **Meaning:** A specific business function the Domain performs (e.g., "Charge Credit Card").
*   **Attributes:** `Name`, `Trigger`.
*   **Relationships:** BelongTo `Domain`, ExecutedBy `Service`.

### 3. Service
*   **Meaning:** A specific software component responsible for execution.
*   **Attributes:** `Name`, `TechStack`.
*   **Relationships:** Exposes `APIEndpoint`, Requires `Dependency`.

### 4. Workflow
*   **Meaning:** A human-centric operational sequence.
*   **Attributes:** `Name`, `Steps[]`, `RequiredEnvironment`.
*   **Relationships:** Configures `EnvironmentVariable`.

### 5. Business Rule
*   **Meaning:** A hard constraint dictated by business logic.
*   **Attributes:** `RuleText`.
*   **Relationships:** EnforcedBy `Service`.

### 6. Technical Rule (Guardrail)
*   **Meaning:** A structural or coding standard constraint.
*   **Attributes:** `RuleText`, `Severity` (MUST/SHOULD).
*   **Relationships:** AppliesTo `Domain`.

### 7. Architectural Pattern
*   **Meaning:** The design pattern utilized (e.g., "Event Sourcing", "MVC").
*   **Attributes:** `PatternName`.
*   **Relationships:** Governs `Domain`.

### 8. Dependency
*   **Meaning:** Crucial third-party or internal module.
*   **Attributes:** `Name`, `Version`, `Purpose`.
*   **Relationships:** RequiredBy `Service`.

### 9. Risk
*   **Meaning:** A theoretical or observed vulnerability.
*   **Attributes:** `Description`, `ImpactLevel`, `Likelihood`.
*   **Relationships:** Threatens `Capability`.

### 10. Failure Mode
*   **Meaning:** How a system breaks.
*   **Attributes:** `Symptom`, `RootCause`.
*   **Relationships:** ManifestsFrom `Risk`.

### 11. Recovery Path
*   **Meaning:** The runbook to fix a Failure Mode.
*   **Attributes:** `Steps[]`, `ValidationCheck`.
*   **Relationships:** Mitigates `FailureMode`.

### 12. Constraint
*   **Meaning:** An immovable physical or infrastructure limitation.
*   **Attributes:** `Description` (e.g., "Max 500ms latency allowed").
*   **Relationships:** Limits `Capability`.

### 13. Integration
*   **Meaning:** Connections to the outside world (Stripe, Twilio).
*   **Attributes:** `ProviderName`, `Protocol`.
*   **Relationships:** ExitsFrom `Service`.

### 14. Context Object
*   **Meaning:** A critical data entity flowing through the system (e.g., `User`, `Order`).
*   **Attributes:** `ObjectName`, `CoreFields`.
*   **Relationships:** MutatedBy `Capability`.

### 15. Decision
*   **Meaning:** A logged strategic architectural choice.
*   **Attributes:** `Context`, `DecisionText`, `Tradeoffs`.
*   **Relationships:** Shapes `ArchitecturalPattern`.

### 16. Assumption
*   **Meaning:** A belief held by the author that the code relies upon.
*   **Attributes:** `Text`, `ValidationStatus`.
*   **Relationships:** Underpins `Decision`.

---

## 8. THE COMPLETE RIS GRAPH

The RIS operates as a vast Semantic Graph.

*   **Nodes:** The entities defined in Section 7.
*   **Edges (Predicates):** `Contains`, `Executes`, `Mitigates`, `Threatens`, `Requires`, `Governs`.
*   **Graph Traversal:** By walking the graph, ToMe can answer complex questions. *Example Query:* "If `Stripe API` goes down, what `Capability` fails, what `Business Rule` is violated, and what `Recovery Path` should the developer follow?"

---

## 9. RIS GENERATION MODEL

### Phase 1: Projection
The `Repository Model` (AST Skeleton) is passed to the LLM. The Prompt enforces a strict JSON schema output matching the RIS entities. The LLM acts as the semantic projector, attempting to fit structural nodes into semantic boxes.

### Phase 2: Instantiation
The ToMe Engine receives the JSON payload, validates the schema, and instantiates the internal TypeScript `RISGraph` object.

### Phase 3: Edge Linking
The Engine resolves all string-based references in the JSON (e.g., "DependsOn: Auth_Service") into hard memory pointers between Nodes.

---

## 10. RIS UPDATE MODEL

When code changes, the RIS must evolve probabilistically.

1.  **Diff Ingestion:** ToMe receives the file diffs.
2.  **Structural Invalidation:** Any RIS node pointing to a deleted or heavily modified Structural Node is marked `DIRTY`.
3.  **Semantic Recalculation:** The LLM is invoked *only* on the `DIRTY` subgraph. 
4.  **Graph Patching:** The Engine updates the affected RIS nodes, recalculates confidence scores, and cascades `DIRTY` flags to any dependent semantic nodes.

---

## 11. UNCERTAINTY & CONFIDENCE FRAMEWORK

AI extraction is not perfect. The RIS must acknowledge its own doubt.

Every RIS Fact (Node or Edge) maintains:
1.  **Confidence Score (0.0 - 1.0):** 
    *   `1.0`: Human asserted, or structurally proven.
    *   `0.9`: High probability LLM deduction (e.g., detecting a Database model).
    *   `0.5`: Guessed intent (e.g., inferring a complex business rule).
2.  **Evidence Source:** An array of file paths or structural nodes that led the LLM to this conclusion.
3.  **Derivation Method:** `STRUCTURAL_ANALYSIS`, `LLM_INFERENCE`, or `HUMAN_ASSERTION`.

---

## 12. RIS RULES ENGINE

### Integrity Rules
*   **No Orphans:** Every `Capability` must map to at least one `Service` or `Domain`.
*   **Evidence Binding:** Every `Decision` must point to at least one structural file as evidence.

### Mutation Rules
*   **The Human Override:** If `DerivationMethod == HUMAN_ASSERTION`, the LLM is physically blocked from mutating the node during `tome update`. It can only append a `SuggestedMutation` edge.

### Validation Rules
*   **Cyclic Prevention:** A `Domain` cannot depend on another `Domain` that depends on it. The RIS engine detects semantic cyclic dependencies and warns the user.

### Compression Rules
*   To prevent context bloat, if a `Service` has 50 `Capabilities`, the RIS engine applies a semantic roll-up, compressing them into 5 `CoreCapabilities`.

---

## 13. RIS SERIALIZATION MATRIX

The RIS is useless if humans and agents cannot read it. It must be serialized into the 5 target Markdown files.

### 1. `architect.md`
*   **Extracts from RIS:** `Domain`, `Service`, `Context Object`, `Integration`.
*   **Serialization Logic:** Renders as a hierarchical document. Formats architectural patterns.

### 2. `memory.md`
*   **Extracts from RIS:** `Decision`, `Assumption`, `Business Rule`.
*   **Serialization Logic:** Renders as a chronological history log or decision record.

### 3. `guardrails.md`
*   **Extracts from RIS:** `Technical Rule`, `Constraint`.
*   **Serialization Logic:** Renders as strict MUST/SHOULD bullet points optimized for AI prompt injection.

### 4. `recover.md`
*   **Extracts from RIS:** `Risk`, `Failure Mode`, `Recovery Path`.
*   **Serialization Logic:** Renders as runbooks and troubleshooting checklists.

### 5. `walkthrough.md`
*   **Extracts from RIS:** `Workflow`, `Capability` entry paths.
*   **Serialization Logic:** Renders as a narrative guide for human onboarding.

---

## 14. FUTURE RIS EVOLUTION STRATEGY

The RIS is designed to become the standard intelligence format for the AI coding era.

**Phase 1 (Today):** RIS lives in memory for 10 seconds during `tome init` and immediately dies after serializing to Markdown.
**Phase 2 (Soon):** The RIS graph is exported to a hidden `.tome/ris.json` alongside the Markdown, allowing programmatic agents (like Claude Code) to parse the semantic graph directly instead of reading the Markdown.
**Phase 3 (Long-Term):** The RIS becomes a global open standard (e.g., the `RIS.js` specification). Any IDE, agent, or CI/CD pipeline can query the RIS using Graph-QL or MCP to instantly understand the architectural intent of any repository on earth. 

***End of Formal Intelligence Specification. This document governs all semantic mapping and intelligence generation in ToMe.***
