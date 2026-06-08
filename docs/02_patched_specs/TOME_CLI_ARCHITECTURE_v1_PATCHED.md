# TOME_CLI_ARCHITECTURE_v1

> **[CORPUS PATCH APPLIED]** This document has been patched by `TOME_CORPUS_PATCH_SET_v1` and inherits all definitions from `TOME_ARCHITECTURE_AMENDMENT_v1`.


> **Document Classification:** Command-Line Architecture Specification  
> **Document Version:** 1.0  
> **Created:** 2026-06-08  
> **Status:** APPROVED CLI CONTRACT  
> **Persistence:** PERMANENT  

---

## TABLE OF CONTENTS

1. [CLI Philosophy](#1-cli-philosophy)
2. [CLI Responsibilities](#2-cli-responsibilities)
3. [CLI Layer Boundaries](#3-cli-layer-boundaries)
4. [Command Execution Model](#4-command-execution-model)
5. [Command Routing Architecture](#5-command-routing-architecture)
6. [Command Lifecycle](#6-command-lifecycle)
7. [Invocation Lifecycle](#7-invocation-lifecycle)
8. [Process Lifecycle](#8-process-lifecycle)
9. [CLI Runtime Architecture](#9-cli-runtime-architecture)
10. [CLI State Management](#10-cli-state-management)
11. [Command Registry](#11-command-registry)
12. [Command Discovery](#12-command-discovery)
13. [Command Metadata System](#13-command-metadata-system)
14. [Command Validation](#14-command-validation)
15. [Command Authorization](#15-command-authorization)
16. [Execution Context](#16-execution-context)
17. [Global Flags](#17-global-flags)
18. [Repository Context Detection](#18-repository-context-detection)
19. [Workspace Detection](#19-workspace-detection)
20. [User Context Detection](#20-user-context-detection)
21. [Configuration Loading](#21-configuration-loading)
22. [Storage Integration](#22-storage-integration)
23. [Update Engine Integration](#23-update-engine-integration)
24. [Parser Integration](#24-parser-integration)
25. [Extraction Integration](#25-extraction-integration)
26. [Artifact Integration](#26-artifact-integration)
27. [MCP Integration](#27-mcp-integration)
28. [Provider Integration](#28-provider-integration)
29. [Logging Architecture](#29-logging-architecture)
30. [Telemetry Architecture](#30-telemetry-architecture)
31. [Output Rendering System](#31-output-rendering-system)
32. [Interactive Mode](#32-interactive-mode)
33. [Non-Interactive Mode](#33-non-interactive-mode)
34. [TTY Detection](#34-tty-detection)
35. [Progress Reporting](#35-progress-reporting)
36. [Structured Output Mode](#36-structured-output-mode)
37. [JSON Output Mode](#37-json-output-mode)
38. [Error Handling Architecture](#38-error-handling-architecture)
39. [Error Classification](#39-error-classification)
40. [Exit Codes](#40-exit-codes)
41. [Retry Behavior](#41-retry-behavior)
42. [Recovery Behavior](#42-recovery-behavior)
43. [Lock Management](#43-lock-management)
44. [Concurrent Execution Protection](#44-concurrent-execution-protection)
45. [Long Running Operations](#45-long-running-operations)
46. [Signal Handling](#46-signal-handling)
47. [SIGINT/SIGTERM Strategy](#47-sigintsigterm-strategy)
48. [Crash Recovery](#48-crash-recovery)
49. [Transaction Coordination](#49-transaction-coordination)
50. [Command State Machines](#50-command-state-machines)
51. [Plugin Architecture](#51-plugin-architecture)
52. [Extension Points](#52-extension-points)
53. [Future Command Marketplace](#53-future-command-marketplace)
54. [Security Boundaries](#54-security-boundaries)
55. [Permission Model](#55-permission-model)
56. [Future Remote Execution](#56-future-remote-execution)
57. [Future Agent Execution](#57-future-agent-execution)
58. [Enterprise CLI Evolution](#58-enterprise-cli-evolution)
59. [Performance Targets](#59-performance-targets)
60. [Final Engineering Verdict](#60-final-engineering-verdict)

---

## 1. CLI PHILOSOPHY
The Command-Line Interface is not just a wrapper for ToMe; it is the absolute sovereign execution boundary. It dictates the physics of the process, shielding the delicate internal subsystems (Parser, Extraction Pipeline, Update Engine) from the chaotic reality of the host operating system. The CLI must be strictly deterministic, stateless between invocations, and violently protective against concurrent execution.

## 2. CLI RESPONSIBILITIES
1. Process lifecycle management (boot, signal handling, graceful exit).
2. Input sanitization and argument parsing.
3. Subsystem orchestration and dependency injection.
4. Terminal UI rendering (spinners, colors, errors).
5. File locking and concurrency prevention.

## 3. CLI LAYER BOUNDARIES
The CLI layer is strictly separated from the Core Engine. The CLI handles `stdout`, `stderr`, and `process.exit()`. The Core Engine does not know the terminal exists. If the Core Engine throws an error, it is the CLI's responsibility to format it for human consumption.

## 4. COMMAND EXECUTION MODEL
Every command follows a strictly defined interface pattern (Command Pattern). Commands are stateless objects executed by the `CommandRouter`.

## 5. COMMAND ROUTING ARCHITECTURE
Arguments (`process.argv`) are parsed using a hardened library (e.g., `commander` or `yargs`). The parsed AST is passed to the `Router`, which matches the verb (`init`, `update`, `config`) to a registered Command class.

## 6. COMMAND LIFECYCLE
1. `REGISTER`: Command metadata loaded.
2. `VALIDATE`: Arguments checked against Zod schemas.
3. `PRE-EXECUTE`: Lock acquisition, Config resolution.
4. `EXECUTE`: Subsystem orchestration.
5. `POST-EXECUTE`: Lock release, Telemetry flush.

## 7. INVOCATION LIFECYCLE
From the moment the user types `tome update` to the moment the prompt returns. The invocation is entirely ephemeral. No variables persist in Node.js memory after the process exits.

## 8. PROCESS LIFECYCLE
The Node.js `process` object is heavily monkey-patched during Boot:
* `unhandledRejection` and `uncaughtException` are intercepted to guarantee lock release and `.tmp` file cleanup before exiting.

## 9. CLI RUNTIME ARCHITECTURE
The CLI acts as the Inversion of Control (IoC) container. It instantiates the `IFileSystem`, `ILLMClient`, and `StorageOrchestrator`, wiring them together before handing control to the `UpdateEngine`.

## 10. CLI STATE MANAGEMENT
The CLI holds no business state. Its only state is "Execution Status" (e.g., `isShuttingDown: boolean`, `currentPhase: 'PARSING'`).

## 11. COMMAND REGISTRY
A strict dictionary mapping command strings to class constructors. Unknown commands trigger a unified `HelpRenderer` output.

## 12. COMMAND DISCOVERY
Commands are auto-discovered at build time to populate the `tome --help` menu, ensuring documentation never drifts from code capability.

## 13. COMMAND METADATA SYSTEM
Every command defines a `name`, `description`, `aliases`, `flags`, and `examples`.

## 14. COMMAND VALIDATION
If a user runs `tome init --depth=INFINITY`, the Command Validation layer rejects the input instantly, returning exit code `1`, without ever initializing the Core Engine.

## 15. COMMAND AUTHORIZATION
While MVP requires no RBAC, Phase 8 will introduce Enterprise Auth, requiring valid JWTs to execute commands against secured repositories.

## 16. EXECUTION CONTEXT
A frozen dependency-injected object passed to every command:
```typescript
interface ExecutionContext {
  cwd: string;
  config: ResolvedConfigurationObject;
  logger: Logger;
}
```

## 17. GLOBAL FLAGS
Flags that apply to all commands: `--verbose`, `--json`, `--dry-run`, `--force`.

## 18. REPOSITORY CONTEXT DETECTION
Before execution, the CLI verifies `cwd`. It walks up the directory tree looking for `.git`. If found, that becomes the absolute boundary. If not found, it throws `NotARepositoryError`.

## 19. WORKSPACE DETECTION
Detects monorepo boundaries (e.g., `pnpm-workspace.yaml`).

## 20. USER CONTEXT DETECTION
Loads OS-level user data for telemetry and Global Configuration resolution.

## 21. CONFIGURATION LOADING
(Defined in `TOME_CONFIGURATION_SPEC_v1`). The CLI is the sole orchestrator of the `ConfigResolver`.

## 22. STORAGE INTEGRATION
The CLI instantiates the `StorageOrchestrator`. It passes the `ExecutionContext.cwd` so the Storage layer knows exactly where `.tome/` lives.

## 23. UPDATE ENGINE INTEGRATION
The CLI instantiates the `UpdateEngine` and passes it the `StorageOrchestrator`. The CLI acts as the progress-bar listener, observing events emitted by the Engine.

## 24. PARSER INTEGRATION
The CLI provisions the `WorkerPool` required for parallel Tree-sitter parsing and passes it to the `ParserEngine`.

## 25. EXTRACTION INTEGRATION
The CLI bridges the `ParserEngine` outputs to the `ExtractionPipeline`.

## 26. ARTIFACT INTEGRATION
The CLI invokes the `MemorySerializer` when the Update Engine emits `SUCCESS`.

## 27. MCP INTEGRATION
(Phase 3). The CLI spins up a secondary background process via `tome serve` that exposes the RIS over the Model Context Protocol to the IDE.

## 28. PROVIDER INTEGRATION
The CLI reads the `ResolvedConfigurationObject` and instantiates the correct `AnthropicAdapter` or `OpenAIAdapter`.

## 29. LOGGING ARCHITECTURE
The CLI manages two logging streams:
1. `stdout/stderr`: Formatted for human eyes (spinners, colors).
2. `.tome/.logs/execution.log`: Highly verbose JSONL format for post-mortem debugging.

## 30. TELEMETRY ARCHITECTURE
Anonymous usage ping sent to ToMe servers (if opted-in) tracking invocation duration and failure codes.

## 31. OUTPUT RENDERING SYSTEM
The CLI strictly separates UI strings from business logic. Subsystems emit events (`Extracting Domain X`); the Output Renderer decides how to display that (e.g., updating a terminal spinner).

## 32. INTERACTIVE MODE
If `tome init` is run without flags, it launches an interactive questionnaire via `inquirer` to build the initial `config.json`.

## 33. NON-INTERACTIVE MODE
If running in CI/CD, the CLI skips all prompts and assumes defaults.

## 34. TTY DETECTION
The CLI detects `process.stdout.isTTY`. If `false` (e.g., piped to a file or running in Jenkins), it automatically disables color codes and spinners, falling back to plain text.

## 35. PROGRESS REPORTING
Utilizes a layered spinner architecture.
`[✔] Parsed 500 files`
`[⠧] Extracting Architecture (2/5 domains)...`

## 36. STRUCTURED OUTPUT MODE
If invoked with `--json`, the CLI suppresses ALL human-readable output and spinners. It outputs a single, perfectly valid JSON string to `stdout` upon completion.

## 37. JSON OUTPUT MODE
(See Section 36). Critical for automated AI agents invoking ToMe via terminal shells.

## 38. ERROR HANDLING ARCHITECTURE
Errors are never simply thrown. They cascade up to the `CommandRouter`, which passes them to the `ErrorRenderer`.

## 39. ERROR CLASSIFICATION
Errors are strongly typed:
* `UserError` (Invalid flags, Bad config) -> Exit Code 1.
* `SystemError` (OOM, Permission Denied) -> Exit Code 2.
* `NetworkError` (Anthropic 503) -> Exit Code 3.
* `DataError` (Corrupt `.ris-state.json`) -> Exit Code 4.

## 40. EXIT CODES
The CLI strictly obeys POSIX standard exit codes to integrate flawlessly with `bash` scripts and CI runners.

## 41. RETRY BEHAVIOR
The CLI does not retry core logic; it delegates retry mechanics to the Subsystems (e.g., the `ProviderAdapter` retries HTTP). The CLI only retries acquiring the File Lock if another process is currently releasing it.

## 42. RECOVERY BEHAVIOR
If the `ErrorRenderer` catches a `DataError`, it automatically suggests the recovery command: `Run 'tome restore' to rollback state.`

## 43. LOCK MANAGEMENT

### Resolution: Concurrent Execution Protection
The CLI creates a `.tome/.lock` file upon `PRE-EXECUTE`. It writes the current process ID (PID) inside.
If another `tome` process boots, it reads the `.lock`. If the PID is active in the OS process table, it aborts immediately.

## 44. CONCURRENT EXECUTION PROTECTION
(See Section 43).

## 45. LONG RUNNING OPERATIONS
For operations > 5 seconds, the CLI sends OS-level keep-alive signals to prevent laptop sleep modes from breaking HTTP streams.

## 46. SIGNAL HANDLING
The CLI intercepts `SIGINT` (Ctrl+C) and `SIGTERM`.

## 47. SIGINT/SIGTERM STRATEGY
When Ctrl+C is pressed, the CLI does NOT instantly exit.
1. It intercepts the signal.
2. It prints `[!] Graceful shutdown initiated. Cleaning up...`
3. It instructs the `StorageOrchestrator` to delete all `.tmp` files.
4. It deletes the `.lock` file.
5. It exits.

## 48. CRASH RECOVERY
If the CLI receives `SIGKILL` (cannot be intercepted), the `.lock` file and `.tmp` files remain. The NEXT `tome` invocation detects the stale lock (PID dead) and automatically triggers a cleanup routine before booting.

## 49. TRANSACTION COORDINATION
The CLI is the final arbiter of transactions, coordinating the rollback sequence if a subsystem throws midway.

## 50. COMMAND STATE MACHINES
Each Command operates sequentially through strict lifecycle phases, ensuring predictability.

## 51. PLUGIN ARCHITECTURE
(Phase 4). The CLI will dynamically `require()` Node packages prefixed with `tome-plugin-*`, allowing the community to build custom artifact renderers or custom Language Adapters.

## 52. EXTENSION POINTS
Plugins can hook into specific CLI events (e.g., `onBeforeSerialize`, `onAfterParse`).

## 53. FUTURE COMMAND MARKETPLACE
Infrastructure to support downloading community extraction prompts via the CLI.

## 54. SECURITY BOUNDARIES
The CLI strips environment variables and file paths from telemetry payloads.

## 55. PERMISSION MODEL
The CLI explicitly checks read/write permissions on the `.tome/` directory before executing to prevent mid-flight `EACCES` crashes.

## 56. FUTURE REMOTE EXECUTION
Phase 8: `tome sync` will proxy extraction payloads to cloud instances, relying on the CLI purely as a thin client for local Git status.

## 57. FUTURE AGENT EXECUTION
Agents will invoke ToMe via the CLI using the `--json` flag. The CLI is explicitly engineered to be as friendly to AI agents as it is to humans.

## 58. ENTERPRISE CLI EVOLUTION
Support for SAML/SSO login via the CLI to access remote corporate prompt registries.

## 59. PERFORMANCE TARGETS
*   **Boot Time:** < 50ms to print `--help`.
*   **Shutdown Time:** < 100ms for graceful cleanup.
*   **Memory Footprint:** The CLI overhead is < 20MB (excluding Subsystem execution).

## 60. FINAL ENGINEERING VERDICT
The ToMe CLI Architecture guarantees absolute transactional safety. By rigorously enforcing File Locks, monkey-patching process signals for graceful `.tmp` cleanup, and implementing a strict `--json` output mode for Agent integrators, the CLI elevates ToMe from a simple script into a robust, enterprise-grade executable. It serves as the impenetrable armor protecting the delicate semantic intelligence core.
