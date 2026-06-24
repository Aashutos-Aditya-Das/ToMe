# TOME_PARSER_ARCHITECTURE_v1

> **Document Classification:** Core Parsing & Structural Extraction Specification  
> **Document Version:** 1.0  
> **Created:** 2026-06-08  
> **Status:** APPROVED PARSER CONTRACT  
> **Persistence:** PERMANENT  

---

## TABLE OF CONTENTS

1. [Parser Philosophy](#1-parser-philosophy)
2. [Parsing Objectives](#2-parsing-objectives)
3. [Parser Responsibilities](#3-parser-responsibilities)
4. [Parser Lifecycle](#4-parser-lifecycle)
5. [Parser Pipeline](#5-parser-pipeline)
6. [File Discovery Architecture](#6-file-discovery-architecture)
7. [Language Detection](#7-language-detection)
8. [Tree-sitter Integration Strategy](#8-tree-sitter-integration-strategy)
9. [AST Lifecycle](#9-ast-lifecycle)
10. [Parser Abstraction Layer](#10-parser-abstraction-layer)
11. [Parser Adapter Architecture](#11-parser-adapter-architecture)
12. [Multi-Language Support Strategy](#12-multi-language-support-strategy)
13. [Structural Extraction Rules](#13-structural-extraction-rules)
14. [Symbol Resolution Framework](#14-symbol-resolution-framework)
15. [Import Resolution Architecture](#15-import-resolution-architecture)
16. [Export Resolution Architecture](#16-export-resolution-architecture)
17. [Cross-File Linking](#17-cross-file-linking)
18. [Dependency Graph Construction](#18-dependency-graph-construction)
19. [Structural Graph Construction](#19-structural-graph-construction)
20. [Execution Graph Extraction](#20-execution-graph-extraction)
21. [Node Identity Generation](#21-node-identity-generation)
22. [Stable Structural IDs](#22-stable-structural-ids)
23. [Checksum Generation](#23-checksum-generation)
24. [Structural Hashing](#24-structural-hashing)
25. [Rename Detection](#25-rename-detection)
26. [Move Detection](#26-move-detection)
27. [Duplicate Symbol Resolution](#27-duplicate-symbol-resolution)
28. [Monorepo Parsing Strategy](#28-monorepo-parsing-strategy)
29. [Workspace Detection](#29-workspace-detection)
30. [Package Boundary Detection](#30-package-boundary-detection)
31. [Repository Boundary Rules](#31-repository-boundary-rules)
32. [Configuration File Parsing](#32-configuration-file-parsing)
33. [Environment Variable Detection](#33-environment-variable-detection)
34. [Route Detection](#34-route-detection)
35. [Database Detection](#35-database-detection)
36. [External Integration Detection](#36-external-integration-detection)
37. [Parser State Machines](#37-parser-state-machines)
38. [Parser Error Recovery](#38-parser-error-recovery)
39. [Parser Validation Rules](#39-parser-validation-rules)
40. [Parser Integrity Rules](#40-parser-integrity-rules)
41. [Unsupported Language Handling](#41-unsupported-language-handling)
42. [Incremental Parsing Strategy](#42-incremental-parsing-strategy)
43. [Full Parse Strategy](#43-full-parse-strategy)
44. [Parallel Parsing Architecture](#44-parallel-parsing-architecture)
45. [Memory Management](#45-memory-management)
46. [Performance Targets](#46-performance-targets)
47. [Scaling Strategy](#47-scaling-strategy)
48. [Future Language Expansion Strategy](#48-future-language-expansion-strategy)
49. [Language Agnostic Outputs](#49-language-agnostic-outputs)
50. [Entity Instantiation Strategy](#50-entity-instantiation-strategy)
51. [Cross-Language Import Resolution](#51-cross-language-import-resolution)
52. [Adapter Plug-in System](#52-adapter-plug-in-system)
53. [Parser Versioning](#53-parser-versioning)
54. [Final Engineering Verdict](#54-final-engineering-verdict)

---

## 1. PARSER PHILOSOPHY

The Parser is the anchor of reality. While the LLM operates in the realm of probability, the Parser must operate in the realm of absolute mathematical certainty. If the Parser hallucinates an import edge, the entire semantic intelligence graph above it collapses. Therefore, the Parser prioritizes determinism, immutability, and lossless structural extraction over speed. 

## 2. PARSING OBJECTIVES

1.  Transform language-specific syntax into language-agnostic structural nodes.
2.  Extract 100% of inter-file dependencies (Import/Export edges).
3.  Discard 100% of implementation logic (function bodies) to save tokens.
4.  Generate cryptographically stable IDs that survive file renames and moves.

## 3. PARSER RESPONSIBILITIES

The Parser subsystem is strictly responsible for extracting the **physical structure** of the code. It is explicitly forbidden from semantic deduction. It may state `Class(AuthService) extends Class(BaseService)`, but it may never state `Class(AuthService) handles Domain(Authentication)`.

## 4. PARSER LIFECYCLE

1.  `DISCOVERY`: File tree traversed, ignores applied.
2.  `ROUTING`: Files assigned to specific language adapters based on extensions.
3.  `TOKENIZATION`: Tree-sitter generates AST per file.
4.  `EXTRACTION`: AST simplified into `FileGraph`.
5.  `RESOLUTION`: Cross-file links (imports/exports) are bound.
6.  `COMPRESSION`: Graph flattened into the canonical `RepositoryModel`.

## 5. PARSER PIPELINE

The pipeline follows a map-reduce architecture. 
**Map Phase:** N threads process N files into isolated `FileGraphs`.
**Reduce Phase:** The central `GraphLinker` merges N `FileGraphs` into a single global `StructuralGraph` by resolving dangling import edges.

## 6. FILE DISCOVERY ARCHITECTURE

File discovery utilizes a concurrent walking algorithm. 
It respects a strict hierarchy of exclusion:
1. Hardcoded System Ignores (`.git`, `node_modules`).
2. Version Control Ignores (`.gitignore`).
3. ToMe Overrides (`.tomeignore`).
It yields a deterministic array of absolute file paths sorted alphabetically to ensure stable hashing.

## 7. LANGUAGE DETECTION

Language is detected via:
1.  Extension mapping (`.ts` -> TypeScript).
2.  Shebang parsing (`#!/usr/bin/env python3` -> Python).
3.  Fallback to `UNKNOWN_TEXT` or `BINARY` rejection.

## 8. TREE-SITTER INTEGRATION STRATEGY

ToMe leverages Tree-sitter as the underlying C/WASM parsing engine because it is robust against syntax errors, incredibly fast, and supports S-expressions for uniform querying. Tree-sitter is strictly wrapped behind an Adapter layer; business logic never touches Tree-sitter APIs directly.

## 9. AST LIFECYCLE

The raw Tree-sitter AST is highly volatile memory.
1. Instantiated in memory via WASM call.
2. Traversed exactly once by the Language Adapter using Tree-sitter Query syntax.
3. Relevant tokens copied into TypeScript heap (`RepositoryModel` nodes).
4. Raw Tree-sitter AST immediately explicitly garbage collected to prevent WASM heap exhaustion.

## 10. PARSER ABSTRACTION LAYER

```typescript
export interface IParserEngine {
  parseWorkspace(paths: string[]): Promise<RepositoryModel>;
  parseFile(path: string): Promise<FileNode>;
}

export interface ILanguageAdapter {
  supports(filename: string): boolean;
  extractSymbols(ast: any): ExtractedSymbol[];
  extractDependencies(ast: any): DependencyEdge[];
}
```
The Core Engine knows nothing about TypeScript or Python. It only orchestrates `ILanguageAdapter` instances.

## 11. PARSER ADAPTER ARCHITECTURE

An Adapter maps language-specific AST nodes to canonical `RepositoryModel` nodes.
*Example:* `TypescriptAdapter` maps `TSInterfaceDeclaration` to `RepositoryModel:Interface`. `GoAdapter` maps `TypeSpec(StructType)` to `RepositoryModel:Class`.

## 12. MULTI-LANGUAGE SUPPORT STRATEGY

ToMe ships with "Tier 1" adapters (TypeScript, Python, Go, Rust) tightly coupled to the core. Unsupported languages degrade gracefully (see Section 41). 

## 13. STRUCTURAL EXTRACTION RULES

Only the following structures are extracted from the AST:
* Classes, Interfaces, Enums, Structs, Traits.
* Methods, Functions, Macros (signatures only).
* Imports, Exports, Requires, Uses.
* Top-level constant declarations (configuration objects).

## 14. SYMBOL RESOLUTION FRAMEWORK

Every extracted symbol must be assigned a `FullyQualifiedName` (FQN) to prevent collisions.
Format: `[PackageName]::[FilePath]::[SymbolName]`.
Example: `@app/backend::src/auth.ts::LoginController`.

## 15. IMPORT RESOLUTION ARCHITECTURE

When `FileA` imports `LoginController` from `FileB`, the parser records a dangling edge:
`DanglingEdge(from: FileA, requestedSymbol: 'LoginController', relativePath: './fileB')`.
During the Reduce Phase, the `GraphLinker` normalizes `./fileB` to the absolute FQN of `FileB` and binds the edge to the exported symbol in `FileB`.

## 16. EXPORT RESOLUTION ARCHITECTURE

Adapters must identify public vs private visibility. Only exported/public symbols are added to the global `SymbolTable` used by the `GraphLinker`.

## 17. CROSS-FILE LINKING

The `GraphLinker` operates with O(N) complexity using a global Hash Map of exported FQNs. If a dangling import requests an FQN that is not in the Hash Map, the edge is marked `UNRESOLVED` (indicating an external dependency or an unsupported language file).

## 18. DEPENDENCY GRAPH CONSTRUCTION

Edges of type `IMPORT_EDGE` form the `DependencyGraph`. This is a Directed Acyclic Graph (DAG) (except in languages allowing circular dependencies, which the Linker detects and flags).

## 19. STRUCTURAL GRAPH CONSTRUCTION

Edges of type `CONTAINS_EDGE` form the `StructuralGraph` (Repository -> Packages -> Directories -> Files -> Classes -> Methods).

## 20. EXECUTION GRAPH EXTRACTION

Static invocation parsing (e.g., detecting `userService.login()`) is extracted as an `INVOCATION_EDGE`. Note: Due to dynamic dispatch, this graph is inherently incomplete without runtime analysis, but provides highly valuable probabilistic evidence to the LLM.

## 21. NODE IDENTITY GENERATION

### Resolution to Question 1: Stable Structural IDs
A major problem in code parsing: If `src/auth.ts` is renamed to `src/authentication.ts`, how do we prevent the system from destroying the file and losing all attached human semantic memory?

**Solution: Stable Hashing.**
The Node ID of a file is NOT its path.
The Node ID is a SHA-256 hash of its **Exported Public Interface**.
If `auth.ts` exports `class AuthController { login() }`, its structural identity is derived from that shape. If the file is renamed but the class structure is identical, the ID remains identical. The Path is simply a mutable attribute of the Node, not its Identity.

## 22. STABLE STRUCTURAL IDS
(See Section 21).

## 23. CHECKSUM GENERATION
Every file generates an `ImplementationChecksum` (Hash of the entire file string) and a `StructuralChecksum` (Hash of the AST topology). 

## 24. STRUCTURAL HASHING
If a developer adds a comment or changes a variable inside `login()`, the `ImplementationChecksum` changes, but the `StructuralChecksum` remains identical. The parser does not flag the file as a structural diff, saving massive LLM token overhead.

## 25. RENAME DETECTION
During an update, the Parser compares the old `SymbolTable` to the new `SymbolTable`. If an FQN path changed, but the `StructuralChecksum` of the file remained identical, it logs a `RenameEvent` and preserves all Evidence Graph links.

## 26. MOVE DETECTION
Identical to Rename Detection, but handles directory traversal.

## 27. DUPLICATE SYMBOL RESOLUTION
If two files define and export `class Utils`, the FQN system disambiguates them via their paths.

## 28. MONOREPO PARSING STRATEGY

### Resolution to Question 4: Monorepos
A Monorepo is not a single codebase; it is a federation of packages.
The Parser requires a `WorkspaceDetector` layer. Before parsing files, it scans for `pnpm-workspace.yaml`, `lerna.json`, or root `package.json` workspaces.
It creates a Root `RepositoryNode` containing multiple `PackageNodes`. 
Import Resolution (Section 15) is augmented: if `apps/web` imports `@monorepo/shared`, the Linker resolves this across the `PackageNode` boundary rather than treating it as an external NPM dependency.

## 29. WORKSPACE DETECTION
(See Section 28).

## 30. PACKAGE BOUNDARY DETECTION
Package boundaries act as strict encapsulations. The Parser flags cross-package `IMPORT_EDGES` as high-value architectural seams.

## 31. REPOSITORY BOUNDARY RULES
The Parser stops traversing paths the moment it exits the user's `git` root.

## 32. CONFIGURATION FILE PARSING
Configuration is vital context. The Parser utilizes a `StaticConfigAdapter` (regex or JSON parser) to extract key-value pairs from `docker-compose.yml`, `tsconfig.json`, etc.

## 33. ENVIRONMENT VARIABLE DETECTION
Adapters use static analysis (e.g., looking for `process.env.X` or `os.Getenv("X")`) to extract `EnvironmentVariable` Nodes.

## 34. ROUTE DETECTION
Framework-specific heuristics (e.g., detecting `@Get('/login')` or `app.post()`) map AST nodes to `Route` Entities.

## 35. DATABASE DETECTION
Adapters look for ORM decorators (e.g., `@Entity()`, `gorm:"primaryKey"`) to extract `Database` Entities.

## 36. EXTERNAL INTEGRATION DETECTION
Imports matching high-profile SDKs (e.g., `import Stripe from 'stripe'`) are elevated to `ExternalIntegration` nodes.

## 37. PARSER STATE MACHINES
File Parse State: `DISCOVERED -> QUEUED -> PARSING -> LINKING -> RESOLVED | FAILED`.

## 38. PARSER ERROR RECOVERY

### Resolution to Question 7: Parsing Error Propagation
If the developer is in the middle of writing a file, the AST contains a syntax error.
*   **Behavior:** Tree-sitter creates an `ERROR` node in the AST but successfully parses the rest of the file.
*   **Propagation:** The Adapter logs the error but extracts all valid symbols. The `FileNode` is flagged with `isMalformed: true`.
*   **Impact:** The LLM receives the partial structure. The system never crashes due to a missing semicolon.

## 39. PARSER VALIDATION RULES
A parsed `RepositoryModel` is rejected if it contains zero exported symbols. (This implies a total parsing pipeline failure or an empty repo).

## 40. PARSER INTEGRITY RULES
All `IMPORT_EDGES` must terminate at a valid `NodeID`. If unresolved, they must explicitly terminate at an `ExternalIntegration` node.

## 41. UNSUPPORTED LANGUAGE HANDLING

### Resolution to Question 6: Unsupported Languages
If a user adds an Elixir (`.ex`) file to a TypeScript project, and ToMe lacks an Elixir adapter:
*   **Fallback:** The file is routed to the `FallbackChunkingAdapter`.
*   **Action:** It treats the file as plain text, chunks it by size, and uses regex to find potential imports. It creates a `FileNode` of type `UNKNOWN_LANGUAGE`.
*   **Impact:** The LLM still sees the file's raw text and can deduce its purpose, but the Parser cannot guarantee mathematical structural relationships.

## 42. INCREMENTAL PARSING STRATEGY
If `tome update` detects only `auth.ts` changed (via OS file mod-time or git diff), it only runs Tree-sitter on `auth.ts`. It removes the old `auth.ts` subgraph from memory, splices in the new one, and re-runs the `GraphLinker` only on the affected edges. Time complexity shifts from O(N) to O(1).

## 43. FULL PARSE STRATEGY
Triggered on `tome init` or if the `tome-cli` Parser Engine version updates. Clears all caching and recalculates O(N).

## 44. PARALLEL PARSING ARCHITECTURE
File reading and AST parsing are I/O and CPU bound. Node.js `worker_threads` are utilized. A single master thread coordinates the `SymbolTable`; workers return extracted `FileGraphs` via message passing.

## 45. MEMORY MANAGEMENT
WASM bindings for Tree-sitter must explicitly call `.delete()` on AST objects. The garbage collector cannot see across the WASM boundary, resulting in catastrophic OOM errors on large repos if manual memory management is omitted.

## 46. PERFORMANCE TARGETS
*   **Throughput:** > 1,000 files per second per CPU core.
*   **Latency:** < 1 second for a 500-file repository.
*   **Memory Overhead:** < 500MB peak heap usage.

## 47. SCALING STRATEGY
Future phases will implement binary caching, where `FileGraphs` are serialized to local LevelDB, allowing instantaneous re-loading of unaltered files across VS Code sessions.

## 48. FUTURE LANGUAGE EXPANSION STRATEGY

### Resolution to Question 10: Future Support
The canonical `RepositoryModel` is locked. Adding support for Ruby does NOT require changing the `RepositoryModel`. 
It simply requires authoring `ruby-adapter.ts` which maps Tree-sitter Ruby S-expressions to the existing canonical nodes (`Class`, `Function`, `ImportEdge`). The Intelligence layers remain completely agnostic to the addition.

## 49. LANGUAGE AGNOSTIC OUTPUTS

### Resolution to Question 3: Agnostic Outputs
The LLM never sees "TSClassDeclaration" or "PyDefStatement". It sees:
```json
{
  "entity": "Class",
  "name": "AuthService",
  "methods": ["login", "logout"]
}
```
This forces the LLM to rely on universal software engineering principles rather than language-specific quirks.

## 50. ENTITY INSTANTIATION STRATEGY

### Resolution to Question 8: Entity Instantiation
Entities are instantiated strictly via Factory Patterns inside the Core Engine. Adapters pass DTOs (Data Transfer Objects) to the Factories. This guarantees that all Nodes receive consistent UUID generation and validation.

## 51. CROSS-LANGUAGE IMPORT RESOLUTION

### Resolution to Question 2: Cross-Language Resolving
If a Next.js (TypeScript) frontend calls a Python backend, they share no AST edges.
The Linker resolves this using the `ExecutionGraph` heuristics. If TS has a `Route(GET /api/data)` and Python has a `RouteHandler(GET /api/data)`, the Linker synthesizes a probabilistic `INVOCATION_EDGE` across the language chasm.

## 52. ADAPTER PLUG-IN SYSTEM

### Resolution to Question 5: Tree-sitter Plugs
Adapters are late-bound. The system uses an Inversion of Control (IoC) container. At runtime, it queries `package.json` for installed `tree-sitter-[lang]` modules and dynamically registers the corresponding internal Adapter if the C-binding exists.

## 53. PARSER VERSIONING

### Resolution to Question 9: Parser Versioning
The Parser Engine is versioned separately from the Prompts. If the Parser upgrades from v1 to v2 (e.g., fixing an edge case in Python import parsing), the `StructuralChecksum` of the repository shifts. The Update Engine detects this schema shift and forces a `FullRewriteStrategy`.

## 54. FINAL ENGINEERING VERDICT

The Parser Architecture achieves total determinism. By decoupling the language-specific chaos of ASTs via the Adapter Architecture, isolating file paths from Structural Identity, and employing concurrent WASM memory management, the Parser provides a flawless, math-verified foundation for the probabilistic intelligence LLMs layered above it. It fully resolves all architectural complexities of monorepos, cross-language dependencies, and rename survivability.
