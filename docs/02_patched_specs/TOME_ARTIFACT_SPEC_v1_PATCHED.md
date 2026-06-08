# TOME_ARTIFACT_SPEC_v1

> [!IMPORTANT] **[IMPLEMENTATION NOTICE]** 
> This document provides foundational philosophy. For strict schema implementations, interfaces, and file formats, you MUST use `TOME_RIS_SCHEMA_SPEC_v1`. In the event of any conflict, the Schema Spec governs.


> **[CORPUS PATCH APPLIED]** This document has been patched by `TOME_CORPUS_PATCH_SET_v1` and inherits all definitions from `TOME_ARCHITECTURE_AMENDMENT_v1`.


> **Document Classification:** Memory Artifact Specification  
> **Document Version:** 1.0  
> **Created:** 2026-06-08  
> **Status:** APPROVED ARTIFACT CONTRACT  
> **Persistence:** PERMANENT  

---

## TABLE OF CONTENTS

1. [Artifact Philosophy](#1-artifact-philosophy)
2. [Artifact Design Goals](#2-artifact-design-goals)
3. [Artifact Lifecycle](#3-artifact-lifecycle)
4. [Artifact Metadata Standards](#4-artifact-metadata-standards)
5. [Artifact Versioning](#5-artifact-versioning)
6. [Serialization Rules](#6-serialization-rules)
7. [Markdown Standards](#7-markdown-standards)
8. [YAML Frontmatter Standards](#8-yaml-frontmatter-standards)
9. [Evidence Embedding Strategy](#9-evidence-embedding-strategy)
10. [Compression Rules](#10-compression-rules)
11. [Human Editability Rules](#11-human-editability-rules)
12. [AI Consumption Rules](#12-ai-consumption-rules)
13. [Cross-Artifact Linking](#13-cross-artifact-linking)
14. [Update Rules](#14-update-rules)
15. [Artifact Validation Rules](#15-artifact-validation-rules)
16. [Artifact Migration Rules](#16-artifact-migration-rules)
17. [Artifact Specifications & Examples](#17-artifact-specifications--examples)
    - [architect.md](#architectmd)
    - [memory.md](#memorymd)
    - [guardrails.md](#guardrailsmd)
    - [recover.md](#recovermd)
    - [walkthrough.md](#walkthroughmd)
18. [Artifact Schema Objects](#18-artifact-schema-objects)
19. [RIS ↔ Artifact Mapping](#19-ris--artifact-mapping)
20. [Artifact Quality Metrics](#20-artifact-quality-metrics)

---

## 1. ARTIFACT PHILOSOPHY

The Repository Intelligence State (RIS) is a mathematical graph. Humans do not read graphs; they read stories. AI agents do not natively query graphs; they read context windows. 

The Memory Artifacts are the physical serialization of the RIS. They are the boundary where pure intelligence becomes consumable knowledge. 

If the artifacts are poorly formatted, too long, or unstructured, the entire extraction pipeline's effort is wasted. The artifacts must be treated as a strict UI/UX layer for both human eyeballs and LLM context parsing.

## 2. ARTIFACT DESIGN GOALS

1. **Dual Readability:** Every artifact must be instantly readable by a junior developer onboarding on Day 1, and simultaneously optimized for an AI Agent to extract rules without hallucinating.
2. **Dense but Scannable:** Use headings, bullet points, and tables. Paragraphs should rarely exceed three sentences.
3. **Immutability of Form:** The schema and layout of the Markdown files must be completely predictable. Tooling must be able to regex or split the files reliably if needed.
4. **Stateful Provenance:** Every artifact must carry cryptographic proof of its origin via YAML frontmatter to support the Evidence Engine.

## 3. ARTIFACT LIFECYCLE

1. **Serialization:** The `MemorySerializer` traverses the RIS and projects specific domains into specific files.
2. **Commit:** The files are written to `.tome/` and committed to Git by the user.
3. **Consumption:** Humans read them via GitHub/VS Code. Agents read them via MCP.
4. **Invalidation:** A code change alters the underlying checksum.
5. **Regeneration:** The `tome update` command parses the old Markdown (to detect Human Assertions), updates the RIS, and re-serializes the Markdown.

## 4. ARTIFACT METADATA STANDARDS

Every artifact must contain state. We do not use hidden JSON files for state tracking to ensure that if a user copies `.tome/` to another machine, the state travels with it. Metadata is strictly stored in YAML Frontmatter.

## 5. ARTIFACT VERSIONING

Artifacts are versioned independently of the `tome-cli`.
- `schema_version: 1.0` dictates the markdown layout and expected headers.
- If ToMe v2.0 introduces a new layout for `architect.md`, it increments to `schema_version: 2.0`.

## 6. SERIALIZATION RULES

1. **No Hallucinated Formatting:** The serializer must strictly follow the defined templates. The LLM does not write the Markdown layout; the LLM outputs JSON, and the TypeScript engine formats the Markdown.
2. **Deterministic Output:** If the RIS is identical, the generated Markdown must be byte-for-byte identical. Keys must be sorted alphabetically before rendering.

## 7. MARKDOWN STANDARDS

*   **Syntax:** GitHub Flavored Markdown (GFM).
*   **Headings:** Strict hierarchy (`#`, `##`, `###`). No skipped levels.
*   **Emphasis:** Use `**bold**` for critical domain names, `_italic_` for nuances.
*   **Code:** Inline code `` ` `` for file names, variable names, and classes. Code blocks ` ``` ` for examples.
*   **Alerts:** Use GitHub standard alerts: `> [!NOTE]`, `> [!WARNING]`, `> [!IMPORTANT]`.

## 8. YAML FRONTMATTER STANDARDS

Every `.tome/*.md` file must begin with:

```yaml
---
tome_schema_version: "1.0"
artifact_type: "architect"
last_generated: "2026-06-08T12:00:00Z"
ris_checksum: "sha256-1234567890abcdef"
code_checksum: "sha256-abcdef1234567890"
model: "claude-3-5-sonnet-20240620"
---
```

## 9. EVIDENCE EMBEDDING STRATEGY

To keep artifacts readable, we do not embed raw Evidence Graphs in the Markdown.
Instead, we use **Source Links**.
Whenever a capability or rule is stated, it is followed by an inline reference: 
`*Source: [src/auth.ts]*` 
This allows humans to instantly verify the claim without cluttering the document.

## 10. COMPRESSION RULES

*   **Roll-ups:** If a Domain has 20 capabilities, the serializer must roll them up into 3-5 macro-capabilities.
*   **Truncation:** If the generated file exceeds the size limit (e.g., 2000 words), the serializer drops the lowest-confidence claims first until it fits the budget.

## 11. HUMAN EDITABILITY RULES

If a human edits the Markdown, the changes must survive the next `tome update`.
*   The `MemoryUpdater` hashes each section of the Markdown.
*   If the section hash drifts from the expected RIS hash, the Engine flags the section as `HUMAN_ASSERTED`.
*   The serializer is forbidden from overwriting `HUMAN_ASSERTED` text.

## 12. AI CONSUMPTION RULES

*   **No Fluff:** Remove conversational text like "Here is an overview of the architecture."
*   **Imperative Tone:** Guardrails must be written as "DO X" or "NEVER DO Y". AI follows imperatives better than suggestions.

## 13. CROSS-ARTIFACT LINKING

Artifacts must cross-reference each other using relative Markdown links.
*Example:* `architect.md` might say: "For deployment instructions, see [walkthrough.md](./walkthrough.md)."

## 14. UPDATE RULES

Updates are destructive to LLM-generated text, but non-destructive to `HUMAN_ASSERTED` text. The serializer operates on a Block-level (Header to Header) diffing mechanism.

## 15. ARTIFACT VALIDATION RULES

`tome validate` parses the `.tome/` directory and fails if:
1. YAML Frontmatter is missing or malformed.
2. Mandatory sections (defined in this spec) are missing.
3. Cross-artifact links are broken (404).

## 16. ARTIFACT MIGRATION RULES

If the user upgrades `tome-cli` and the `schema_version` changes, the CLI automatically runs a migration script that pulls the old Markdown into the RIS and pushes out the new Markdown layout.

---

## 17. ARTIFACT SPECIFICATIONS & EXAMPLES

### architect.md

*   **Purpose:** Defines the macro structure, domains, and data flows of the system.
*   **Exact Sections:** 
    1. System Overview
    2. Core Domains
    3. External Integrations
    4. Key Data Flows
*   **Ordering:** Strict. Overview first, Flows last.
*   **Mandatory Fields:** System Overview, Core Domains.
*   **Optional Fields:** External Integrations.
*   **Evidence References:** Inline file paths.
*   **Size Limits:** 2000 words.

**Example:**
```markdown
---
tome_schema_version: "1.0"
artifact_type: "architect"
last_generated: "2026-06-08T12:00:00Z"
ris_checksum: "a1b2"
code_checksum: "c3d4"
---

# System Architecture

## System Overview
This is a modular monolith serving a multi-tenant SaaS application. It uses React for the frontend and Node.js/Express for the backend.

## Core Domains

### 1. Authentication Domain
Handles user registration, login, and JWT issuance.
*   **Capabilities:** Login, Password Reset, MFA Verification.
*   **Primary Files:** `src/services/auth.ts`, `src/controllers/auth.ts`

### 2. Billing Domain
Manages subscription states and payment processing.
*   **Capabilities:** Stripe Checkout, Webhook Processing.
*   **Primary Files:** `src/services/billing.ts`

## External Integrations
*   **Stripe:** Subscription management via `stripe-node`.
*   **SendGrid:** Transactional emails.

## Key Data Flows
*   **User Registration:** `POST /api/users` -> `UserController` -> `AuthService` -> `Postgres (users table)`
```

---

### memory.md

*   **Purpose:** Logs historical decisions, tradeoffs, and implicit assumptions.
*   **Exact Sections:**
    1. Strategic Context
    2. Key Architectural Decisions
    3. Implicit Assumptions
*   **Size Limits:** 2000 words.

**Example:**
```markdown
---
tome_schema_version: "1.0"
artifact_type: "memory"
last_generated: "2026-06-08T12:00:00Z"
ris_checksum: "e5f6"
code_checksum: "g7h8"
---

# Project Memory & Decisions

## Strategic Context
This project prioritizes speed of delivery over horizontal scalability. It is designed to run on a single large VPS.

## Key Architectural Decisions

### Decision 1: PostgreSQL over MongoDB
*   **Context:** The data model requires strict relational integrity (Users <-> Subscriptions).
*   **Tradeoff:** Harder to scale horizontally, but guarantees ACID compliance for billing.
*   **Evidence:** `src/db/schema.sql`

### Decision 2: Local Auth instead of Auth0
*   **Context:** To minimize third-party SaaS dependencies during MVP.
*   **Tradeoff:** Increased maintenance burden for security patches.

## Implicit Assumptions
*   **Traffic:** The system assumes less than 1,000 concurrent users. No Redis caching layer is implemented.
```

---

### guardrails.md

*   **Purpose:** Enforces strict technical and business rules to prevent AI or human errors.
*   **Exact Sections:**
    1. MUST Rules
    2. NEVER Rules
    3. Known Anti-Patterns
*   **Enforcement Guidance:** Written in strict imperative tone.
*   **Size Limits:** 1000 words.

**Example:**
```markdown
---
tome_schema_version: "1.0"
artifact_type: "guardrails"
last_generated: "2026-06-08T12:00:00Z"
ris_checksum: "i9j0"
code_checksum: "k1l2"
---

# Engineering Guardrails

> [!IMPORTANT]
> These rules must be strictly adhered to during all code generation and refactoring.

## MUST Rules
*   **MUST** use parameterized queries for all raw SQL execution in `src/db/`.
*   **MUST** wrap all Stripe API calls in a `try/catch` block and log to Sentry.
*   **MUST** use `Zod` schemas to validate all incoming HTTP request bodies.

## NEVER Rules
*   **NEVER** mutate the `req.user` object directly; create a cloned copy.
*   **NEVER** commit secrets or `.env` files.
*   **NEVER** bypass the `AuthMiddleware` for any route under `/api/admin/*`.

## Known Anti-Patterns
*   Do not put business logic inside Express controllers. Always delegate to `src/services/`.
```

---

### recover.md

*   **Purpose:** Provides runbooks for when the system breaks.
*   **Exact Sections:**
    1. High-Risk Components
    2. Known Failure Modes
    3. Recovery Runbooks
*   **Size Limits:** 1500 words.

**Example:**
```markdown
---
tome_schema_version: "1.0"
artifact_type: "recover"
last_generated: "2026-06-08T12:00:00Z"
ris_checksum: "m3n4"
code_checksum: "o5p6"
---

# Recovery & Troubleshooting

## High-Risk Components
*   **Stripe Webhooks:** If the webhook endpoint fails, user subscriptions will drift from Stripe state.
*   **Database Migrations:** Prisma migrations on production can lock the users table.

## Known Failure Modes

### Failure: "Webhook Signature Verification Failed"
*   **Cause:** The `STRIPE_WEBHOOK_SECRET` environment variable is missing or mismatched.
*   **Detection:** Sentry alerts throwing `StripeSignatureVerificationError`.

## Recovery Runbooks

### Runbook 1: Resyncing Stripe Data
1. Check Stripe Dashboard for failed webhook events.
2. Verify `STRIPE_WEBHOOK_SECRET` in production `.env`.
3. Run the CLI sync script: `npm run sync:stripe`.
```

---

### walkthrough.md

*   **Purpose:** Narrative onboarding guide for new developers.
*   **Exact Sections:**
    1. Getting Started
    2. Architecture Tour
    3. Adding a New Feature (Example)
*   **Size Limits:** 1500 words.

**Example:**
```markdown
---
tome_schema_version: "1.0"
artifact_type: "walkthrough"
last_generated: "2026-06-08T12:00:00Z"
ris_checksum: "q7r8"
code_checksum: "s9t0"
---

# Developer Walkthrough

## Getting Started
Welcome to the codebase. To get the system running locally:
1. `npm install`
2. `cp .env.example .env`
3. `docker-compose up -d` (starts Postgres)
4. `npm run dev`

## Architecture Tour
If you are tracing a request, start at `src/routes.ts`. 
The routing layer passes data to `src/controllers/`, which validates input using Zod.
The controller then invokes a class in `src/services/` where the actual business logic resides.

## Adding a New Feature
To add a new API endpoint:
1. Define the Zod schema in `src/schemas/`.
2. Create the service method in `src/services/`.
3. Wire the route in `src/routes.ts`.
4. Ensure you follow the rules in [guardrails.md](./guardrails.md).
```

---

## 18. ARTIFACT SCHEMA OBJECTS

TypeScript interfaces that govern the serialization boundary.

```typescript
export interface ArtifactMetadata {
  tome_schema_version: string;
  artifact_type: 'architect' | 'memory' | 'guardrails' | 'recover' | 'walkthrough';
  last_generated: string;
  ris_checksum: string;
  code_checksum: string;
  model: string;
}

export interface MemoryArtifact {
  metadata: ArtifactMetadata;
  contentBlocks: ContentBlock[];
}

export interface ContentBlock {
  headingLevel: number;
  headingText: string;
  body: string;
  sourceNodes?: string[]; // Used for evidence rendering
  isHumanAsserted: boolean;
}

export interface ArtifactReference {
  targetArtifact: string;
  anchor?: string;
  displayText: string;
}
```

---

## 19. RIS ↔ ARTIFACT MAPPING

How internal Intelligence maps to External Documents:

| RIS Entity | Target Artifact | Serialization Strategy |
| :--- | :--- | :--- |
| `Domain`, `Service` | `architect.md` | Nested Hierarchy (Domain -> Service) |
| `Integration` | `architect.md` | Bulleted List |
| `Decision`, `Assumption`| `memory.md` | Chronological/Thematic Blocks |
| `BusinessRule` | `memory.md` | Bulleted List under Context |
| `TechnicalRule`, `Constraint`| `guardrails.md` | MUST/NEVER Bullet Lists |
| `Risk`, `FailureMode` | `recover.md` | Risk Matrix Layout |
| `RecoveryPath` | `recover.md` | Numbered Runbook Lists |
| `Workflow` | `walkthrough.md` | Narrative Paragraphs |

---

## 20. ARTIFACT QUALITY METRICS

The serialization pipeline evaluates the Markdown against 4 metrics before committing to disk:

1. **Readability (Flesch-Kincaid):** Must score appropriate for technical documentation. Reject overly dense LLM prose.
2. **Compression Ratio:** `Total Codebase Tokens / Artifact Tokens`. Target is >50x compression.
3. **Traceability:** Percentage of claims backed by inline source links. Target: >80%.
4. **Completeness:** Ensure all 5 files exist, and no mandatory headers are missing.

***End of Memory Artifact Specification. This document governs all physical outputs of the ToMe platform.***
