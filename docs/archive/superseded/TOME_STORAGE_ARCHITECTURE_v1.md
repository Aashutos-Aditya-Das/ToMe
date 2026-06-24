# TOME_STORAGE_ARCHITECTURE_v1

> **Document Classification:** Persistence, Storage & Data Management Architecture Specification  
> **Document Version:** 1.0  
> **Created:** 2026-06-08  
> **Status:** APPROVED STORAGE CONTRACT  
> **Persistence:** PERMANENT  

---

## TABLE OF CONTENTS

1. [Storage Philosophy](#1-storage-philosophy)
2. [Persistence Philosophy](#2-persistence-philosophy)
3. [Storage Architecture Overview](#3-storage-architecture-overview)
4. [Storage Boundaries](#4-storage-boundaries)
5. [Storage Taxonomy](#5-storage-taxonomy)
6. [Canonical Storage Strategy](#6-canonical-storage-strategy)
7. [Persisted vs Transient Data](#7-persisted-vs-transient-data)
8. [Storage Ownership Model](#8-storage-ownership-model)
9. [Local Storage Architecture](#9-local-storage-architecture)
10. [Directory Layout](#10-directory-layout)
11. [File Layout](#11-file-layout)
12. [Hidden State Layout](#12-hidden-state-layout)
13. [Artifact Storage](#13-artifact-storage)
14. [RIS Storage](#14-ris-storage)
15. [Evidence Graph Storage](#15-evidence-graph-storage)
16. [Provenance Storage](#16-provenance-storage)
17. [Human Assertion Storage](#17-human-assertion-storage)
18. [Suggested Mutation Storage](#18-suggested-mutation-storage)
19. [Cache Storage](#19-cache-storage)
20. [Temporary Storage](#20-temporary-storage)
21. [Snapshot Storage](#21-snapshot-storage)
22. [Backup Storage](#22-backup-storage)
23. [Recovery Storage](#23-recovery-storage)
24. [Indexing Architecture](#24-indexing-architecture)
25. [Query Architecture](#25-query-architecture)
26. [Read Path](#26-read-path)
27. [Write Path](#27-write-path)
28. [Update Path](#28-update-path)
29. [State Loading Strategy](#29-state-loading-strategy)
30. [Lazy Loading Strategy](#30-lazy-loading-strategy)
31. [Serialization Strategy](#31-serialization-strategy)
32. [Deserialization Strategy](#32-deserialization-strategy)
33. [JSON Storage Rules](#33-json-storage-rules)
34. [Storage Compression Rules](#34-storage-compression-rules)
35. [Checkpoint Architecture](#35-checkpoint-architecture)
36. [Snapshot Lifecycle](#36-snapshot-lifecycle)
37. [Backup Lifecycle](#37-backup-lifecycle)
38. [Storage State Machines](#38-storage-state-machines)
39. [Transaction Architecture](#39-transaction-architecture)
40. [Atomic Write Guarantees](#40-atomic-write-guarantees)
41. [Rollback Strategy](#41-rollback-strategy)
42. [Crash Recovery](#42-crash-recovery)
43. [Corruption Detection](#43-corruption-detection)
44. [Integrity Validation](#44-integrity-validation)
45. [Checksum Architecture](#45-checksum-architecture)
46. [Concurrent Access Rules](#46-concurrent-access-rules)
47. [File Locking Strategy](#47-file-locking-strategy)
48. [Incremental Storage Updates](#48-incremental-storage-updates)
49. [Full Rewrite Storage Strategy](#49-full-rewrite-storage-strategy)
50. [Garbage Collection](#50-garbage-collection)
51. [Storage Versioning](#51-storage-versioning)
52. [Schema Evolution](#52-schema-evolution)
53. [Migration Framework](#53-migration-framework)
54. [Future SQLite Migration](#54-future-sqlite-migration)
55. [Future LevelDB Migration](#55-future-leveldb-migration)
56. [Future PostgreSQL Migration](#56-future-postgresql-migration)
57. [Cloud Sync Preparation](#57-cloud-sync-preparation)
58. [Storage Telemetry](#58-storage-telemetry)
59. [Storage Performance Targets](#59-storage-performance-targets)
60. [Storage Scaling Strategy](#60-storage-scaling-strategy)
61. [Storage Security Model](#61-storage-security-model)
62. [Storage Privacy Model](#62-storage-privacy-model)
63. [Encryption Strategy](#63-encryption-strategy)
64. [Enterprise Storage Evolution](#64-enterprise-storage-evolution)
65. [Final Engineering Verdict](#65-final-engineering-verdict)

---

## 1. STORAGE PHILOSOPHY
Storage in ToMe must be local-first, transparent, and portable. It must treat the developer's filesystem as a robust database, adhering to ACID principles (Atomicity, Consistency, Isolation, Durability) without the overhead of a dedicated SQL engine in MVP.

## 2. PERSISTENCE PHILOSOPHY
If it costs LLM tokens to generate, it must be persisted. If it can be mathematically derived from code without LLM inference, it should be kept transient or cached statelessly. 

## 3. STORAGE ARCHITECTURE OVERVIEW
The storage architecture consists of two physical planes within the `.tome/` directory:
*   **The Presentation Plane:** Markdown files intended for user/AI consumption.
*   **The State Plane:** Hidden JSON files acting as the system's canonical database.

## 4. STORAGE BOUNDARIES
All ToMe data is confined strictly to the `.tome/` directory within the user's workspace. No global state (e.g., `~/.tome-global-state`) is used for project-specific RIS. This ensures complete project portability via `git clone`.

## 5. STORAGE TAXONOMY
*   **Canonical Database:** `.tome/.ris-state.json`
*   **Views (Derived):** `.tome/*.md`
*   **Volatile Caches:** `.tome/.cache/*`
*   **Backups:** `.tome/.backup/*`

---

## 6. CANONICAL STORAGE STRATEGY

### Resolution to Question 2: Which files are canonical
The file `.tome/.ris-state.json` is the sole canonical source of truth for the intelligence graph. If `.ris-state.json` is lost, the intelligence is lost. 

### Resolution to Question 3: Which files are derived
All Markdown files (`architect.md`, `memory.md`, `guardrails.md`, `recover.md`, `walkthrough.md`) are mathematically derived from `.ris-state.json`. If they are deleted, `tome init` or `tome update` regenerates them flawlessly from the JSON.

## 7. PERSISTED VS TRANSIENT DATA
*   **Persisted:** RIS Nodes, Claims, Evidence Edges, Confidence Scores, Provenance.
*   **Transient:** Abstract Syntax Trees (ASTs), raw file strings, LLM HTTP payloads.

## 8. STORAGE OWNERSHIP MODEL
The `StorageOrchestrator` is the only internal service permitted to hold file handles or write to the `.tome/` directory. No other service may mutate the filesystem.

---

## 9. LOCAL STORAGE ARCHITECTURE

### Resolution to Question 1: What physically exists inside `.tome/`
The complete directory layout:
```text
.tome/
├── architect.md
├── memory.md
├── guardrails.md
├── recover.md
├── walkthrough.md
├── .ris-state.json
├── .backup/
│   └── .ris-state.backup.json
├── .cache/
│   └── ast-cache.bin (future)
└── .logs/
    └── extraction.log
```

## 10. DIRECTORY LAYOUT
(See Section 9).

## 11. FILE LAYOUT
Files are deliberately flat. Markdown views sit at the root of `.tome/` for maximum visibility in IDE file explorers. Hidden state is dot-prefixed to reduce visual noise.

## 12. HIDDEN STATE LAYOUT
Hidden state utilizes raw JSON structure. It does not use compression (e.g., GZIP) in V1, prioritizing debuggability over disk space.

---

## 13. ARTIFACT STORAGE
Artifacts are stored in UTF-8 format. They strictly enforce LF line endings to prevent cross-OS hash calculation mismatches.

## 14. RIS STORAGE

### Resolution to Question 10: Storing large RIS graphs
A massive 2000-file enterprise repository generates an RIS graph too large to fit in a single JSON block without causing `JSON.parse` memory spikes. 
*Solution:* The `.ris-state.json` utilizes a **Normalized Relational JSON Schema**.
Instead of deep nesting, nodes are flat arrays referencing each other via IDs:
```json
{
  "domains": [{ "id": "uuid-1" }],
  "capabilities": [{ "id": "uuid-2", "domainId": "uuid-1" }]
}
```

## 15. EVIDENCE GRAPH STORAGE
Stored directly alongside the RIS entities inside the relational `.ris-state.json` structure, flattened under an `"edges": []` property.

## 16. PROVENANCE STORAGE
Stored directly inside each Claim object.

## 17. HUMAN ASSERTION STORAGE
Stored as a `DerivationMethod: HUMAN_ASSERTED` flag on a Claim in `.ris-state.json`.

## 18. SUGGESTED MUTATION STORAGE
Stored in an isolated `"suggestedMutations": []` array within `.ris-state.json` so they do not pollute the active semantic graph.

---

## 19. CACHE STORAGE

### Resolution to Question 4: Which files are disposable
Everything in `.tome/.cache/` and `.tome/.logs/` is 100% disposable. Deleting these directories has zero impact on the system state, other than a slight latency increase on the next run.

## 20. TEMPORARY STORAGE
Temporary files are written during atomic transactions (e.g., `tmp_architect.md`). They are inherently disposable if the transaction fails.

## 21. SNAPSHOT STORAGE
Before a `FullRewriteStrategy`, the engine creates a snapshot of the old `.ris-state.json`.

## 22. BACKUP STORAGE

### Resolution to Question 7: How backups work
Before *any* mutation to the canonical database, `StorageOrchestrator` copies `.ris-state.json` to `.tome/.backup/.ris-state.backup.json`. If a fatal error occurs, this file acts as the primary recovery mechanism.

## 23. RECOVERY STORAGE
If a rollback is triggered, the system simply deletes `.ris-state.json` and copies `.backup/.ris-state.backup.json` into its place.

---

## 24. INDEXING ARCHITECTURE

### Resolution to Question 11: Maintaining Indexes
Because `.ris-state.json` is a flat relational structure, querying it directly requires O(N) scans. When the JSON is loaded into memory, the `StorageOrchestrator` builds volatile in-memory Hash Maps (e.g., `Map<ClaimId, Claim>`). These indexes are never written to disk; they are rebuilt upon `JSON.parse`.

## 25. QUERY ARCHITECTURE
Queries are executed against the volatile in-memory Hash Maps via strict accessor methods (`getDomainById(id)`). Direct JSON querying is forbidden.

## 26. READ PATH
1. Read `.ris-state.json`.
2. Parse JSON.
3. Build Indexes in RAM.
4. Expose `RISGraph` object to Engine.

## 27. WRITE PATH
1. Accept modified `RISGraph` object.
2. Serialize to Normalized JSON string.
3. Execute Atomic Write Transaction to disk.

## 28. UPDATE PATH
Identical to Write Path, triggered sequentially at the end of the `tome update` lifecycle.

---

## 29. STATE LOADING STRATEGY
State is loaded entirely into RAM on CLI initialization.

## 30. LAZY LOADING STRATEGY
In Phase 1, lazy loading is disabled. The entire JSON payload is small enough (typically < 10MB) to fit comfortably in V8 heap space. In Phase 8 (Enterprise), lazy loading of `EvidenceGraph` subtrees will be implemented via SQLite.

## 31. SERIALIZATION STRATEGY
`JSON.stringify` with deterministic key sorting ensures that the hash of the JSON file only changes if the actual semantic data changes, reducing unnecessary `git` noise.

## 32. DESERIALIZATION STRATEGY
`JSON.parse` wrapped in strict `Zod` schema validation to instantly catch manually corrupted state files.

## 33. JSON STORAGE RULES
JSON properties must be camelCase. UUIDs must be v4. Arrays must not contain null elements.

## 34. STORAGE COMPRESSION RULES
GZIP compression is explicitly rejected for `.ris-state.json` to allow developers to inspect and `git diff` the hidden state file if necessary.

---

## 35. CHECKPOINT ARCHITECTURE

### Resolution to Question 8: How snapshots work
If a user is about to execute a dangerous `tome update --deep`, they can manually run `tome snapshot`. This copies the entire `.tome/` directory into a tarball in `.tome/.backup/snapshot_timestamp.tar.gz`.

## 36. SNAPSHOT LIFECYCLE
Snapshots are retained for 30 days, then pruned by Garbage Collection.

## 37. BACKUP LIFECYCLE
Only the single most recent `.ris-state.backup.json` is preserved to minimize disk bloat.

---

## 38. STORAGE STATE MACHINES
Storage Transaction State: `IDLE -> ACQUIRING_LOCK -> WRITING_TMP -> FLUSHING_TO_DISK -> RENAMING -> RELEASING_LOCK -> SUCCESS | ROLLBACK`.

## 39. TRANSACTION ARCHITECTURE

### Resolution to Question 5: Files in transactions
Both `.ris-state.json` AND all 5 `*.md` files participate in a single atomic transaction. They must always be perfectly synchronized.

## 40. ATOMIC WRITE GUARANTEES

### Resolution to Question 6: Atomic Writes
Node.js `fs.writeFile` is not atomic. 
ToMe writes to `.tmp` files (`.ris-state.tmp.json`, `architect.tmp.md`). 
Once all `.tmp` files are successfully written and flushed to disk (`fs.fdatasyncSync`), ToMe uses the OS-level `fs.renameSync()` to overwrite the target files. `rename` is atomic in POSIX and Windows. This guarantees zero file corruption even during a hard power loss.

## 41. ROLLBACK STRATEGY
If any `.tmp` write fails, the transaction is aborted, and all `.tmp` files are deleted. The original `.tome/` directory remains untouched.

## 42. CRASH RECOVERY

### Resolution to Question 15: Crash Recovery
If the process is killed via `SIGKILL` precisely during the atomic `fs.renameSync` phase, the state might desync. 
On the next `tome` invocation, the `IntegrityValidator` detects a mismatch between `ris_checksum` in the Markdown and the hash of `.ris-state.json`. It triggers a recovery workflow, automatically restoring `.ris-state.backup.json` and regenerating the Markdown.

## 43. CORRUPTION DETECTION

### Resolution to Question 9: Corruption Detection
Corruption is detected via Checksums and Zod. If a Git merge conflict injects `<<<<<<< HEAD` into `.ris-state.json`, `JSON.parse` throws an error. The CLI immediately flags the file as corrupted and advises the user to run `tome restore`.

## 44. INTEGRITY VALIDATION
Run on every CLI boot. Validates schema, checksums, and foreign key relationships (e.g., all `EvidenceEdges` point to valid Claim IDs).

## 45. CHECKSUM ARCHITECTURE
Uses strict `crypto.createHash('sha256')`.

---

## 46. CONCURRENT ACCESS RULES

### Resolution to Question 14: Concurrent Executions
If two developers run `tome update` simultaneously in the same directory (or a CI runner and a human), data races will destroy the JSON.
**Rule:** Concurrent executions are blocked.

## 47. FILE LOCKING STRATEGY
ToMe utilizes a lockfile: `.tome/.lock`. 
When the CLI boots, it attempts to acquire the lock. If the file exists and the PID inside it is active, the CLI throws `StorageLockedError: Another ToMe process is currently updating this repository.`

---

## 48. INCREMENTAL STORAGE UPDATES
The `StorageOrchestrator` receives an array of JSON patch operations (`add`, `replace`, `remove`) rather than deep-cloning the entire JSON tree in RAM, optimizing V8 garbage collection.

## 49. FULL REWRITE STORAGE STRATEGY
The `StorageOrchestrator` accepts a totally fresh `RISGraph` object and overwrites `.ris-state.json` entirely.

## 50. GARBAGE COLLECTION
Runs synchronously at the end of `tome update`. Clears `.tome/.cache/`, `.tome/.backup/snapshots` older than 30 days, and purges `ORPHANED` claims hitting their 4th cycle.

---

## 51. STORAGE VERSIONING
Every `.ris-state.json` carries a `"version": "1.0"` header.

## 52. SCHEMA EVOLUTION

### Resolution to Question 16: Schema Migrations
If ToMe CLI v2.0 requires a new RIS Schema (v2.0):
1. User runs `tome update`.
2. CLI detects `v1.0` state file.
3. CLI loads the `v1_to_v2.ts` migration script.
4. The script maps the old JSON structure to the new JSON structure in RAM.
5. Atomic transaction writes the new `v2.0` JSON and Markdown files.

## 53. MIGRATION FRAMEWORK
Migrations must be sequential (`v1 -> v2 -> v3`). Rollback migrations are strictly unsupported to prevent complex downgrade data loss.

---

## 54. FUTURE SQLITE MIGRATION

### Resolution to Question 12: Evolution beyond JSON
JSON storage hits a scaling ceiling at roughly ~10,000 files / ~50MB of text.
In Phase 8 (Enterprise), `.ris-state.json` will be migrated seamlessly to `.ris-state.db` (SQLite). 
The `StorageOrchestrator` abstraction perfectly insulates the rest of the application from this change. The `Write Path` will change from atomic JSON rewrites to SQL `BEGIN TRANSACTION; COMMIT;`.

## 55. FUTURE LEVELDB MIGRATION
Considered for highly concurrent AST caching, but rejected for the canonical RIS state due to the necessity of relational edge queries.

## 56. FUTURE POSTGRESQL MIGRATION
For massive monorepos managed by remote agents, the `StorageOrchestrator` can be configured to point to a cloud Postgres instance via a simple driver injection.

---

## 57. CLOUD SYNC PREPARATION

### Resolution to Question 13: Cloud Synchronization
Because the entire state is flat and heavily checksummed, cloud syncing is trivial. A background daemon simply uploads `.ris-state.json` to S3 via pre-signed URLs whenever the `RISChecksum` changes. Conflict resolution is handled via the timestamp of the last successful `tome update`.

## 58. STORAGE TELEMETRY
Records total disk space used by `.tome/` and read/write latencies.

## 59. STORAGE PERFORMANCE TARGETS
*   `JSON.parse` latency: < 50ms.
*   Atomic disk flush (JSON + 5 MD files): < 150ms.
*   Max `.tome/` footprint: < 10MB for MVP repos.

## 60. STORAGE SCALING STRATEGY
When JSON exceeds 10MB, implement transparent ZIP compression on the `.ris-state.json` read/write paths as a stopgap before SQLite migration.

---

## 61. STORAGE SECURITY MODEL
ToMe writes files with strict 0o600 permissions where supported, preventing other OS users from reading the hidden intelligence state.

## 62. STORAGE PRIVACY MODEL
The `.tome/` directory is entirely local. No data leaves the machine unless explicit LLM API calls are made, and those payloads are entirely transient.

## 63. ENCRYPTION STRATEGY
At-rest encryption is not supported in MVP. The `.tome/` directory relies on the host OS's filesystem encryption (e.g., BitLocker, FileVault).

## 64. ENTERPRISE STORAGE EVOLUTION
Integration with GitHub artifact storage, allowing CI/CD to build the `.tome` state and attach it to releases, enabling agents to instantly download pre-computed intelligence states instead of parsing from scratch.

---

## 65. FINAL ENGINEERING VERDICT

By implementing a strict Atomic Write-Ahead transaction model utilizing POSIX `rename` semantics, and firmly establishing the `.tome/.ris-state.json` file as the isolated, canonical database, the ToMe Storage Architecture guarantees absolute data durability. The system is immune to power loss corruption, concurrent execution races, and Git merge conflict destruction. The abstraction layers laid out here ensure that the inevitable future migration to SQLite will require zero changes to the LLM or Parser layers.
