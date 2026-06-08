# TOME_CONFIGURATION_SPEC_v1

> **[CORPUS PATCH APPLIED]** This document has been patched by `TOME_CORPUS_PATCH_SET_v1` and inherits all definitions from `TOME_ARCHITECTURE_AMENDMENT_v1`.


> **Document Classification:** Configuration Architecture Specification  
> **Document Version:** 1.0  
> **Created:** 2026-06-08  
> **Status:** APPROVED CONFIGURATION CONTRACT  
> **Persistence:** PERMANENT  

---

## TABLE OF CONTENTS

1. [Configuration Philosophy](#1-configuration-philosophy)
2. [Configuration Ownership Model](#2-configuration-ownership-model)
3. [Configuration Lifecycle](#3-configuration-lifecycle)
4. [Configuration Hierarchy](#4-configuration-hierarchy)
5. [Global Configuration](#5-global-configuration)
6. [Repository Configuration](#6-repository-configuration)
7. [User Configuration](#7-user-configuration)
8. [Environment Configuration](#8-environment-configuration)
9. [Runtime Configuration](#9-runtime-configuration)
10. [CLI Override Configuration](#10-cli-override-configuration)
11. [Configuration Precedence Rules](#11-configuration-precedence-rules)
12. [Configuration Resolution Engine](#12-configuration-resolution-engine)
13. [Configuration Validation Pipeline](#13-configuration-validation-pipeline)
14. [Configuration Schemas](#14-configuration-schemas)
15. [Configuration Versioning](#15-configuration-versioning)
16. [Configuration Migration Strategy](#16-configuration-migration-strategy)
17. [Configuration Persistence Rules](#17-configuration-persistence-rules)
18. [Configuration Security Rules](#18-configuration-security-rules)
19. [API Key Handling](#19-api-key-handling)
20. [Secrets Management](#20-secrets-management)
21. [Provider Configuration](#21-provider-configuration)
22. [LLM Model Selection Configuration](#22-llm-model-selection-configuration)
23. [Extraction Configuration](#23-extraction-configuration)
24. [Parser Configuration](#24-parser-configuration)
25. [Storage Configuration](#25-storage-configuration)
26. [Artifact Configuration](#26-artifact-configuration)
27. [Update Engine Configuration](#27-update-engine-configuration)
28. [MCP Configuration](#28-mcp-configuration)
29. [Future Enterprise Configuration](#29-future-enterprise-configuration)
30. [Configuration Checksums](#30-configuration-checksums)
31. [Configuration Drift Detection](#31-configuration-drift-detection)
32. [Configuration Transactions](#32-configuration-transactions)
33. [Configuration Recovery](#33-configuration-recovery)
34. [Invalid Configuration Handling](#34-invalid-configuration-handling)
35. [Corruption Recovery](#35-corruption-recovery)
36. [Backward Compatibility Rules](#36-backward-compatibility-rules)
37. [Forward Compatibility Rules](#37-forward-compatibility-rules)
38. [Multi-Repository Configuration](#38-multi-repository-configuration)
39. [Monorepo Configuration](#39-monorepo-configuration)
40. [Workspace Configuration](#40-workspace-configuration)
41. [Configuration State Machines](#41-configuration-state-machines)
42. [Configuration Integrity Rules](#42-configuration-integrity-rules)
43. [Configuration Auditability](#43-configuration-auditability)
44. [Configuration Telemetry](#44-configuration-telemetry)
45. [Future Cloud Configuration](#45-future-cloud-configuration)
46. [Final Engineering Verdict](#46-final-engineering-verdict)

---

## 1. CONFIGURATION PHILOSOPHY

Configuration in ToMe is not a collection of arbitrary JSON files; it is the absolute steering wheel of the Intelligence Compiler. Misconfiguration of an LLM provider or an extraction depth setting can cost a user hundreds of dollars in API fees or silently corrupt the Repository Intelligence State (RIS). Therefore, configuration must be deterministic, mathematically validated, strongly typed, securely isolated, and hierarchically resolvable.

## 2. CONFIGURATION OWNERSHIP MODEL

*   **The Developer** owns the intents (`.tome/config.json`, environment variables).
*   **The Configuration Engine** owns the *Resolved State*.
*   **The Core Subsystems** (Parser, Extraction Pipeline, Storage) are strictly readers. They never mutate configuration; they only subscribe to the `ResolvedConfigurationObject` injected at runtime.

## 3. CONFIGURATION LIFECYCLE

1.  **Boot:** The CLI is invoked.
2.  **Discovery:** The Engine scans physical locations (Global, Repo, Env).
3.  **Parsing:** Raw text is evaluated into untyped objects.
4.  **Validation:** Zod schemas reject invalid keys or types.
5.  **Resolution:** The Precedence Tree merges objects into a single truth.
6.  **Injection:** The `ResolvedConfigurationObject` is frozen and passed to the execution subsystems.

## 4. CONFIGURATION HIERARCHY

ToMe evaluates configuration across six distinct physical and ephemeral layers. A value in Layer 1 is overwritten by a value in Layer 2, all the way up to Layer 6.

1.  **System Defaults** (Hardcoded in CLI).
2.  **Global User Configuration** (`~/.tome/config.json`).
3.  **Repository Configuration** (`<repo>/.tome/config.json`).
4.  **Environment Variables** (e.g., `TOME_MODEL=claude-3-5`).
5.  **Dotenv Files** (`<repo>/.env`).
6.  **CLI Override Flags** (e.g., `--model=claude-3-5`).

## 5. GLOBAL CONFIGURATION
*   **Location:** `~/.tome/config.json` (Linux/Mac) or `%USERPROFILE%\.tome\config.json` (Windows).
*   **Purpose:** Stores user preferences that span multiple repositories (e.g., preferred API keys, default UI themes for generated artifacts).

## 6. REPOSITORY CONFIGURATION
*   **Location:** `.tome/config.json` at the root of the user's active Git repository.
*   **Purpose:** Project-specific tuning. E.g., instructing the Parser to ignore specific legacy directories, or configuring the LLM to use a cheaper model for a low-priority side project.

## 7. USER CONFIGURATION
Synonymous with Global Configuration, but explicitly delineates OS-level user profiles from Workspace-level domains.

## 8. ENVIRONMENT CONFIGURATION
The system intercepts any environment variable prefixed with `TOME_`. 
*   `TOME_API_KEY` maps to `config.providers.default.apiKey`.
*   `TOME_MAX_CONCURRENCY` maps to `config.extraction.maxConcurrency`.

## 9. RUNTIME CONFIGURATION
In-memory state calculated dynamically after Resolution. For example, `config.runtime.coresAvailable` is populated by `os.cpus().length` and cannot be hardcoded by the user.

## 10. CLI OVERRIDE CONFIGURATION
Flags passed directly to the execution command hold the highest authority.
`tome update --depth=QUICK` instantly overrides both the Repo Config and the Global Config for that specific transaction.

## 11. CONFIGURATION PRECEDENCE RULES

```typescript
const resolvedConfig = deepMerge(
  Defaults,
  GlobalConfig,
  RepoConfig,
  EnvConfig,
  DotEnvConfig,
  CLIOverrides
);
```
Arrays are *replaced*, not concatenated, during deep merge to prevent infinite growth of ignore lists.

## 12. CONFIGURATION RESOLUTION ENGINE
The internal component (`ConfigResolver`) responsible for executing the deep merge. It operates completely synchronously during the 100ms CLI boot sequence.

## 13. CONFIGURATION VALIDATION PIPELINE
After resolution, the merged object is passed through strict Zod schemas.
If the user wrote `"maxFiles": "two hundred"` in `.tome/config.json`, the Zod pipeline throws a fatal `ConfigValidationError` before the Parser Engine is allowed to boot.

## 14. CONFIGURATION SCHEMAS
```typescript
export const ToMeConfigSchema = z.object({
  version: z.string(),
  provider: ProviderSchema,
  extraction: ExtractionSchema,
  parser: ParserSchema,
  artifacts: ArtifactsSchema
});
```

## 15. CONFIGURATION VERSIONING
Every `.tome/config.json` must declare `"version": "1.0"`.

## 16. CONFIGURATION MIGRATION STRATEGY
If ToMe v2 requires a new configuration format, the CLI parses the v1 file, applies a translation matrix in memory, writes out the new v2 config file, and issues a standard-out warning to the developer.

## 17. CONFIGURATION PERSISTENCE RULES
The CLI command `tome config set provider.model "claude-3-5"` writes deterministically to `.tome/config.json`. It formats with 2 spaces and preserves comments if parsing via a JSONC (JSON with comments) library.

## 18. CONFIGURATION SECURITY RULES
Configuration files are generally committed to Git. Therefore, they **must never** contain secrets.

## 19. API KEY HANDLING
API keys (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) are explicitly forbidden from existing in `.tome/config.json` or `~/.tome/config.json`. If the Zod schema detects them there, it throws a `SecurityViolationError`.

## 20. SECRETS MANAGEMENT
Keys must be loaded exclusively via:
1.  Environment Variables.
2.  `.env` files (which are strictly added to `.gitignore` during `tome init`).
3.  OS Keychain integrations (Phase 8 Enterprise).

---

## 21. PROVIDER CONFIGURATION
Determines which LLM vendor to hit.
```json
"provider": {
  "default": "anthropic",
  "fallback": "openai"
}
```

## 22. LLM MODEL SELECTION CONFIGURATION
Determines the specific model weight and parameters.
```json
"models": {
  "anthropic": "claude-3-5-sonnet-20240620",
  "temperature": 0.0
}
```

## 23. EXTRACTION CONFIGURATION
Dictates token budgeting.
```json
"extraction": {
  "mode": "STANDARD",
  "maxTokensPerChunk": 100000,
  "maxConcurrency": 3
}
```

## 24. PARSER CONFIGURATION
Dictates what code is analyzed.
```json
"parser": {
  "maxFiles": 500,
  "ignorePatterns": ["**/dist", "**/*.min.js"]
}
```

## 25. STORAGE CONFIGURATION
Manages JSON compression and history.
```json
"storage": {
  "preserveOrphansForCycles": 3,
  "snapshotRetentionDays": 30
}
```

## 26. ARTIFACT CONFIGURATION
Controls the Markdown output formats.
```json
"artifacts": {
  "theme": "github-dark",
  "includeMermaidDiagrams": true
}
```

## 27. UPDATE ENGINE CONFIGURATION
Controls graph reconciliation thresholds.
```json
"update": {
  "incrementalThresholdPercent": 20,
  "autoAcceptHumanOverrides": true
}
```

## 28. MCP CONFIGURATION
Governs Model Context Protocol endpoints (Phase 3).
```json
"mcp": {
  "enabled": true,
  "allowedServers": ["local-postgres-mcp"]
}
```

---

## 29. FUTURE ENTERPRISE CONFIGURATION
Allows corporate teams to enforce global guardrails (e.g., `remotePolicyUrl: "https://corp.dev/tome-policy.json"`) which overrides local developer configs.

## 30. CONFIGURATION CHECKSUMS
The resolved configuration object is hashed. This hash is embedded into the `.ris-state.json` file.

## 31. CONFIGURATION DRIFT DETECTION
If a developer changes the `extraction.mode` from `STANDARD` to `QUICK`, the Configuration Checksum changes. The Update Engine detects this, realizes the previous semantic graph was built with different parameters, and may trigger a `FullRewriteStrategy` to ensure data consistency.

## 32. CONFIGURATION TRANSACTIONS
When updating config via the CLI (`tome config set`), the write is atomic.

## 33. CONFIGURATION RECOVERY
If `.tome/config.json` is corrupted (invalid JSON syntax), the CLI does not crash the project. It falls back to System Defaults, warns the user, and ignores the corrupted file.

## 34. INVALID CONFIGURATION HANDLING
Caught by the Validation Pipeline (Section 13). Triggers a hard CLI exit with a descriptive error before any tokens are billed.

## 35. CORRUPTION RECOVERY
(See Section 33).

## 36. BACKWARD COMPATIBILITY RULES
If an older config key (e.g., `max_files` instead of `maxFiles`) is detected, the Zod pipeline utilizes `.transform()` to silently map it to the modern key in memory.

## 37. FORWARD COMPATIBILITY RULES
Unrecognized keys are preserved but ignored. The CLI does not strip them during a `config set` operation, ensuring future CLI versions are not broken by older CLI version writes.

## 38. MULTI-REPOSITORY CONFIGURATION
By relying heavily on the Global `~/.tome/config.json`, developers ensure 90% of their preferences apply to all their repositories instantly.

## 39. MONOREPO CONFIGURATION
In a massive monorepo, a developer might only want ToMe to analyze the `apps/backend` package.
The `.tome/config.json` supports a `workspaceRoot` property, allowing the Parser to treat a subdirectory as the absolute physical boundary.

## 40. WORKSPACE CONFIGURATION
(See Section 39).

## 41. CONFIGURATION STATE MACHINES
Config State is strictly linear: `UNINITIALIZED -> DISCOVERING -> MERGING -> VALIDATING -> FROZEN`.

## 42. CONFIGURATION INTEGRITY RULES
Once `FROZEN`, the `ResolvedConfigurationObject` is wrapped in `Object.freeze()`. Any internal subsystem that attempts to mutate the configuration at runtime will trigger a V8 `TypeError`, crashing the program to prevent silent, unpredictable behavior.

## 43. CONFIGURATION AUDITABILITY
Running `tome config --inspect` prints the final `ResolvedConfigurationObject` and specifies exactly which layer (Global, Repo, Env) provided each value.

## 44. CONFIGURATION TELEMETRY
Anonymous opt-in telemetry tracks which LLM providers and extraction modes are most popular, aiding future prompt stack optimization.

## 45. FUTURE CLOUD CONFIGURATION
Allows a team lead to push a synchronized `.tome/config.json` from a central ToMe Dashboard to all developers' machines.

## 46. FINAL ENGINEERING VERDICT

By enforcing a strict 6-layer precedence hierarchy, isolating sensitive API keys from version-controlled JSON files, and mathematically freezing the resolved object before execution begins, the ToMe Configuration Architecture eliminates the erratic behavior common in node-based CLI tools. 

The configuration is treated not as a suggestion, but as an absolute, deterministic contract that governs the physics of the entire extraction and intelligence engine.
