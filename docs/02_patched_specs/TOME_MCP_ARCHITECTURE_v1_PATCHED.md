# TOME_MCP_ARCHITECTURE_v1

> [!NOTE] **[MVP SCOPE RESTRICTION]** MVP scope for MCP is strictly limited to: Stdio transport, 3 read-only resources, 3 extraction tools, and 1 context prompt. All SSE transport, JWT auth, enterprise governance, multi-agent swarms, and remote hosting features detailed in this document are deferred to Phase 8.

> **[CORPUS PATCH APPLIED]** This document has been patched by `TOME_CORPUS_PATCH_SET_v1` and inherits all definitions from `TOME_ARCHITECTURE_AMENDMENT_v1`.


> **Document Classification:** MCP (Model Context Protocol) Architecture Specification  
> **Document Version:** 1.0  
> **Created:** 2026-06-08  
> **Status:** APPROVED MCP CONTRACT  
> **Persistence:** PERMANENT  

---

## TABLE OF CONTENTS

1. [MCP Philosophy](#1-mcp-philosophy)
2. [Why MCP Exists](#2-why-mcp-exists)
3. [MCP Mission](#3-mcp-mission)
4. [MCP Architectural Position](#4-mcp-architectural-position)
5. [MCP Lifecycle](#5-mcp-lifecycle)
6. [MCP Runtime Model](#6-mcp-runtime-model)
7. [MCP Server Architecture](#7-mcp-server-architecture)
8. [MCP Session Architecture](#8-mcp-session-architecture)
9. [MCP Transport Layer](#9-mcp-transport-layer)
10. [MCP Protocol Layer](#10-mcp-protocol-layer)
11. [MCP Resource Architecture](#11-mcp-resource-architecture)
12. [MCP Tool Architecture](#12-mcp-tool-architecture)
13. [MCP Prompt Architecture](#13-mcp-prompt-architecture)
14. [MCP Context Retrieval](#14-mcp-context-retrieval)
15. [MCP Memory Retrieval](#15-mcp-memory-retrieval)
16. [MCP RIS Exposure Rules](#16-mcp-ris-exposure-rules)
17. [MCP Evidence Exposure Rules](#17-mcp-evidence-exposure-rules)
18. [MCP Artifact Exposure Rules](#18-mcp-artifact-exposure-rules)
19. [MCP Security Model](#19-mcp-security-model)
20. [MCP Authentication](#20-mcp-authentication)
21. [MCP Authorization](#21-mcp-authorization)
22. [MCP Session Isolation](#22-mcp-session-isolation)
23. [MCP Context Isolation](#23-mcp-context-isolation)
24. [Multi-Agent Access](#24-multi-agent-access)
25. [Concurrent Agent Access](#25-concurrent-agent-access)
26. [Agent Coordination](#26-agent-coordination)
27. [Memory Query Framework](#27-memory-query-framework)
28. [Semantic Search Framework](#28-semantic-search-framework)
29. [Knowledge Retrieval Framework](#29-knowledge-retrieval-framework)
30. [Evidence Retrieval Framework](#30-evidence-retrieval-framework)
31. [Provenance Retrieval Framework](#31-provenance-retrieval-framework)
32. [Update Engine Integration](#32-update-engine-integration)
33. [Storage Integration](#33-storage-integration)
34. [Parser Integration](#34-parser-integration)
35. [Provider Integration](#35-provider-integration)
36. [Tool Registration Framework](#36-tool-registration-framework)
37. [Resource Registration Framework](#37-resource-registration-framework)
38. [Prompt Registration Framework](#38-prompt-registration-framework)
39. [Capability Discovery](#39-capability-discovery)
40. [Dynamic Tool Exposure](#40-dynamic-tool-exposure)
41. [Resource Versioning](#41-resource-versioning)
42. [Prompt Versioning](#42-prompt-versioning)
43. [RIS Synchronization](#43-ris-synchronization)
44. [State Synchronization](#44-state-synchronization)
45. [Cache Architecture](#45-cache-architecture)
46. [Session Recovery](#46-session-recovery)
47. [Failure Recovery](#47-failure-recovery)
48. [Protocol Errors](#48-protocol-errors)
49. [Security Threat Model](#49-security-threat-model)
50. [Privacy Rules](#50-privacy-rules)
51. [Enterprise Governance](#51-enterprise-governance)
52. [Audit Logging](#52-audit-logging)
53. [Future Multi-Agent Systems](#53-future-multi-agent-systems)
54. [Future Autonomous Coding Agents](#54-future-autonomous-coding-agents)
55. [Future IDE Integration](#55-future-ide-integration)
56. [Future Cloud MCP](#56-future-cloud-mcp)
57. [Enterprise MCP Roadmap](#57-enterprise-mcp-roadmap)
58. [Performance Targets](#58-performance-targets)
59. [Scaling Targets](#59-scaling-targets)
60. [Final Engineering Verdict](#60-final-engineering-verdict)

---

## 1. MCP PHILOSOPHY
ToMe is not just a CLI tool that generates static Markdown. It is an active, queryable Intelligence Database. The Model Context Protocol (MCP) transforms ToMe from a read-only artifact generator into a live, interactive Memory Server for autonomous agents. AI agents should not need to blindly grep repositories; they should ask ToMe for structural reality.

## 2. WHY MCP EXISTS
Without MCP, external AI agents (like Cursor or Claude Desktop) must waste massive token context scanning raw ASTs or randomly grepping project files. MCP provides a standardized HTTP/Stdio bridge for external LLMs to directly query ToMe's pre-computed Repository Intelligence State (RIS).

## 3. MCP MISSION
Bridge external LLM applications to ToMe's validated semantic graph, ensuring that autonomous agents write code that perfectly aligns with the project's historical human decisions, constraints, and architecture.

## 4. MCP ARCHITECTURAL POSITION
The MCP Server sits as a peer to the CLI. While the CLI manages extraction and graph generation, the MCP Server manages *exposure* of that graph. It holds a read-only lock on the `.ris-state.json`.

## 5. MCP LIFECYCLE
1. **Boot:** `tome serve` invoked by the client application.
2. **Handshake:** MCP capabilities exchanged.
3. **Serving:** Exposes Resources, Tools, and Prompts.
4. **Query:** Client calls a ToMe tool.
5. **Execution:** ToMe reads RIS, returns structured JSON.
6. **Termination:** Stdio pipe closes, process exits.

## 6. MCP RUNTIME MODEL
The MCP layer utilizes the official `@modelcontextprotocol/sdk`. It runs as a persistent Node.js daemon attached to the host IDE or Agent process.

## 7. MCP SERVER ARCHITECTURE
The Server wraps the `StorageOrchestrator` in read-only mode. It holds the active `RISGraph` in memory, allowing sub-10ms response times to complex graph traversal queries.

## 8. MCP SESSION ARCHITECTURE
A session is defined by the lifespan of the Stdio connection. If Cursor connects, a session is instantiated. If Cursor is closed, the session is destroyed. Sessions are entirely stateless.

## 9. MCP TRANSPORT LAYER
*   **Primary:** Stdio Transport. The MCP Server is spawned as a child process of the external agent.
*   **Secondary (Phase 8):** SSE (Server-Sent Events) Transport for distributed agentic architectures.

## 10. MCP PROTOCOL LAYER
Strict adherence to the MCP JSON-RPC 2.0 specification.

---

## 11. MCP RESOURCE ARCHITECTURE
Resources in MCP are files or data blocks exposed to the Agent.
ToMe exposes the following MCP Resources:
*   `tome://artifacts/architect.md`
*   `tome://artifacts/memory.md`
*   `tome://artifacts/guardrails.md`

## 12. MCP TOOL ARCHITECTURE
Tools in MCP allow the Agent to execute logic.
ToMe exposes specific query endpoints as tools:
*   `query_architecture(domain: string)`
*   `query_evidence(claimId: string)`
*   `query_human_overrides()`

## 13. MCP PROMPT ARCHITECTURE
Prompts in MCP are pre-configured instructions exposed to the Agent.
ToMe exposes:
*   `tome-context-injection`: A prompt instructing the external LLM to load ToMe artifacts before writing any code.

---

## Client Interaction Models

### Resolution: How Claude Desktop interacts with ToMe
Claude Desktop uses Stdio Transport.
1. User adds ToMe to `claude_desktop_config.json`: `{"command": "tome", "args": ["serve"]}`.
2. User opens Claude Desktop. It spawns `tome serve`.
3. User types: "Add a new billing endpoint."
4. Claude automatically calls the `query_architecture("billing")` tool.
5. ToMe returns the RIS Capabilities and constraints.
6. Claude writes code compliant with ToMe's architectural reality.

### Resolution: How Cursor interacts with ToMe
1. Cursor connects via native MCP integration.
2. Cursor exposes `tome://artifacts/guardrails.md` as an implicit workspace context file.
3. When the user uses Cmd+K, Cursor silently reads the MCP Resource to ensure the generated code does not violate project invariants.

### Resolution: How VS Code MCP clients interact with ToMe
Similar to Claude Desktop, VS Code extensions (like Roo Code) spawn `tome serve` and register ToMe's query tools directly into the extension's LLM context window.

---

## 14. MCP CONTEXT RETRIEVAL
Context is retrieved by exposing the `RepositorySkeleton` as an MCP Resource (`tome://skeleton`). This allows external agents to instantly understand the topological layout of the repository without crawling the filesystem.

## 15. MCP MEMORY RETRIEVAL
Memory retrieval targets the RIS directly. If an agent wants to know "How does auth work?", it uses the semantic search tool to hit the RIS graph.

## 16. MCP RIS EXPOSURE RULES
The RIS is never exposed as a massive raw JSON dump. It is strictly exposed via filtered, paginated MCP Tools.

## 17. MCP EVIDENCE EXPOSURE RULES

### Resolution: How agents query Evidence
When an agent pulls a Claim, the response includes an array of `EvidenceNodes` (e.g., `["src/auth.ts"]`). If the agent needs to see the exact code, it must explicitly call the ToMe tool: `get_evidence_source(nodeId)`. This prevents token window exhaustion.

## 18. MCP ARTIFACT EXPOSURE RULES
Artifacts are exposed as read-only `Resource` URIs. They cannot be modified via MCP.

---

## 19. MCP SECURITY MODEL
The MCP Server is physically restricted to `read-only` operations on the `.tome/` directory. It is completely powerless to modify source code, overwrite the RIS, or alter configuration.

## 20. MCP AUTHENTICATION
For local Stdio transport, no authentication is required (the OS-level process boundary guarantees identity). For future SSE transport, a Bearer token will be required.

## 21. MCP AUTHORIZATION
All connected agents have `Viewer` access. 

## 22. MCP SESSION ISOLATION
Concurrent sessions do not share cache or state memory, preventing cross-agent context leakage.

## 23. MCP CONTEXT ISOLATION
(See Section 22).

---

## 24. MULTI-AGENT ACCESS
Multiple external agents (e.g., a documentation agent and a coding agent) can connect to the same repository via separate `tome serve` processes.

## 25. CONCURRENT AGENT ACCESS
Because MCP instances only hold *read-only* locks on `.ris-state.json`, an infinite number of `tome serve` instances can run concurrently without data races.

## 26. AGENT COORDINATION
If `tome update` is run by a human on the CLI, it acquires a write-lock. `tome serve` instances will momentarily block new read queries (returning HTTP 423 Locked or JSON-RPC equivalent) until the update finishes, ensuring agents do not read partially overwritten state files.

---

## Agent Query Paradigms

### Resolution: How agents query RIS
Agents use the `query_ris_graph` tool. 
**Input:** `{"entityType": "Domain", "name": "Payment"}`
**Output:** JSON subtree of the Payment Domain, including Capabilities and Constraints.

### Resolution: How agents query Human Assertions
Agents use the `get_human_assertions` tool to request all manual rules imposed by the human developer. The MCP Server specifically highlights Claims flagged with `HUMAN_ASSERTED` so external LLMs know these are absolute laws, not AI suggestions.

### Resolution: How agents discover project architecture
Agents use the `get_repository_skeleton` tool, which returns the lightweight, body-less AST projection. They can then navigate the physical tree instantly.

### Resolution: Preventing hallucinated memory retrieval
If an agent asks for `Domain(Crypto)` and it does not exist in the RIS, the MCP Server explicitly returns `{"error": "DomainNotFound", "message": "This project does not contain a Crypto domain. Do not hallucinate."}`. ToMe enforces truth by blocking speculative graph traversal.

---

## 27. MEMORY QUERY FRAMEWORK
(See query paradigms above).

## 28. SEMANTIC SEARCH FRAMEWORK
The MCP Server implements a basic fuzzy-search algorithm in memory over the `Claim` text, allowing agents to search for "caching strategies" without knowing the exact Domain name.

## 29. KNOWLEDGE RETRIEVAL FRAMEWORK
Exposed via the `Resource` API.

## 30. EVIDENCE RETRIEVAL FRAMEWORK
(See Section 17).

## 31. PROVENANCE RETRIEVAL FRAMEWORK
If an external agent is auditing the code, it can call `get_claim_provenance(id)` to see exactly which previous LLM (e.g., Claude 3 Opus) generated that architectural decision in ToMe.

---

## 32. UPDATE ENGINE INTEGRATION
If a `tome serve` session detects the underlying `.ris-state.json` file hash has changed (because the user ran `tome update` in another terminal), the MCP Server sends a `notifications/resources/updated` event to the Client, forcing the external Agent to invalidate its context window.

## 33. STORAGE INTEGRATION
The MCP Server instantiates `StorageOrchestrator` in `readonly: true` mode.

## 34. PARSER INTEGRATION
The MCP Server does NOT run the Parser. It only reads the pre-computed state.

## 35. PROVIDER INTEGRATION
The MCP Server does NOT contact LLMs. It is entirely deterministic, executing local queries against the local JSON graph.

---

## 36. TOOL REGISTRATION FRAMEWORK
Tools are registered dynamically based on the available Schema version of the RIS.

## 37. RESOURCE REGISTRATION FRAMEWORK
Resources are mapped directly to physical `*.md` files in the `.tome/` directory.

## 38. PROMPT REGISTRATION FRAMEWORK
Prompts are hardcoded into the MCP Server payload to assist external LLMs in structuring their queries to ToMe optimally.

## 39. CAPABILITY DISCOVERY
During the MCP Handshake, ToMe exposes its ability to emit Resource Update notifications.

## 40. DYNAMIC TOOL EXPOSURE
If the repository is a Monorepo, the MCP Server dynamically exposes an additional `switch_workspace(pkg)` tool.

---

## 41. RESOURCE VERSIONING
MCP Resources use the `RISChecksum` as an ETag for caching.

## 42. PROMPT VERSIONING
MCP Prompts are strictly versioned alongside the ToMe CLI version.

## 43. RIS SYNCHRONIZATION
(See Section 32).

## 44. STATE SYNCHRONIZATION
(See Section 32).

## 45. CACHE ARCHITECTURE
The MCP Server holds the entire `RISGraph` in a volatile memory map, avoiding disk I/O on every Agent query.

## 46. SESSION RECOVERY
If the Stdio pipe breaks, the Client simply respawns `tome serve`. No state is lost because the Server is stateless.

## 47. FAILURE RECOVERY
(See Section 46).

## 48. PROTOCOL ERRORS
Handled natively by the `@modelcontextprotocol/sdk`. Returns standardized JSON-RPC error codes.

## 49. SECURITY THREAT MODEL
**Threat:** Malicious Agent attempts to overwrite human constraints.
**Mitigation:** `tome serve` physically lacks the `fs.write` permissions needed to mutate `.tome/`. The architecture is mathematically immune to Agent poisoning.

## 50. PRIVACY RULES
The MCP Server never phones home. All queries happen over local IPC (Inter-Process Communication).

## 51. ENTERPRISE GOVERNANCE
Allows Corporate configurations to disable certain MCP Tools if an organization forbids IDE integration.

## 52. AUDIT LOGGING
The MCP Server writes every Agent query into `.tome/.logs/mcp.log` for debugging Agent hallucinations.

---

## 53. FUTURE MULTI-AGENT SYSTEMS
A Swarm of Agents working on the same codebase will all connect to the same `tome serve` instance, using the RIS as their shared, synchronized memory layer.

## 54. FUTURE AUTONOMOUS CODING AGENTS
When ToMe expands to include automated code-writing capabilities (Phase 9), the MCP layer will serve as the internal bus between the Coding Agent and the Memory Graph.

## 55. FUTURE IDE INTEGRATION
Native JetBrains and Visual Studio plugins communicating via standard MCP.

## 56. FUTURE CLOUD MCP
Remote ToMe instances served securely over HTTPS SSE, allowing cloud-based agents (like Devin) to query the developer's local Repository Intelligence State.

## 57. ENTERPRISE MCP ROADMAP
Integration with centralized Knowledge Graphs, where local MCP queries recursively query corporate architecture databases.

---

## 58. PERFORMANCE TARGETS
*   **Query Latency:** < 50ms for complex graph traversal.
*   **Memory Footprint:** < 30MB overhead per `tome serve` instance.
*   **Event Propagation:** < 100ms from `.ris-state.json` change to Client Notification.

## 59. SCALING TARGETS
Capable of handling > 100 queries per second from highly concurrent autonomous agents.

## 60. FINAL ENGINEERING VERDICT

The ToMe MCP Architecture transforms static files into a high-performance, queryable intelligence layer. By leveraging the industry-standard Model Context Protocol, treating the Server as a strict, read-only cache of the canonical JSON graph, and proactively notifying external agents of state changes, ToMe becomes the foundational memory infrastructure for all future AI development workflows. It mathematically prevents external agents from hallucinating architecture and guarantees they respect human constraints.
