# TOME_LLM_PROVIDER_ARCHITECTURE_v1

> **[CORPUS PATCH APPLIED]** This document has been patched by `TOME_CORPUS_PATCH_SET_v1` and inherits all definitions from `TOME_ARCHITECTURE_AMENDMENT_v1`.


> **Document Classification:** AI Provider Integration & Execution Architecture Specification  
> **Document Version:** 1.0  
> **Created:** 2026-06-08  
> **Status:** APPROVED PROVIDER CONTRACT  
> **Persistence:** PERMANENT  

---

## TABLE OF CONTENTS

1. [LLM Philosophy](#1-llm-philosophy)
2. [Provider Abstraction Philosophy](#2-provider-abstraction-philosophy)
3. [Why Providers Must Be Decoupled](#3-why-providers-must-be-decoupled)
4. [Provider Lifecycle](#4-provider-lifecycle)
5. [Request Lifecycle](#5-request-lifecycle)
6. [Completion Lifecycle](#6-completion-lifecycle)
7. [Prompt Execution Lifecycle](#7-prompt-execution-lifecycle)
8. [Structured Output Architecture](#8-structured-output-architecture)
9. [Tool Calling Architecture](#9-tool-calling-architecture)
10. [Provider Interface Contracts](#10-provider-interface-contracts)
11. [ILLMClient Definition](#11-illmclient-definition)
12. [Provider Adapter Architecture](#12-provider-adapter-architecture)
13. [Anthropic Adapter](#13-anthropic-adapter)
14. [OpenAI Adapter](#14-openai-adapter)
15. [Gemini Adapter](#15-gemini-adapter)
16. [Local Model Adapter](#16-local-model-adapter)
17. [Future Provider Expansion Strategy](#17-future-provider-expansion-strategy)
18. [Model Capability Registry](#18-model-capability-registry)
19. [Model Selection Framework](#19-model-selection-framework)
20. [Prompt Routing Framework](#20-prompt-routing-framework)
21. [Provider Routing Engine](#21-provider-routing-engine)
22. [Context Window Management](#22-context-window-management)
23. [Token Budgeting](#23-token-budgeting)
24. [Cost Tracking](#24-cost-tracking)
25. [Usage Accounting](#25-usage-accounting)
26. [Rate Limit Management](#26-rate-limit-management)
27. [Retry Architecture](#27-retry-architecture)
28. [Timeout Handling](#28-timeout-handling)
29. [Provider Failure Recovery](#29-provider-failure-recovery)
30. [Fallback Provider Strategy](#30-fallback-provider-strategy)
31. [Prompt Caching Architecture](#31-prompt-caching-architecture)
32. [Response Validation](#32-response-validation)
33. [Structured JSON Enforcement](#33-structured-json-enforcement)
34. [Tool Calling Validation](#34-tool-calling-validation)
35. [Repair Prompt Integration](#35-repair-prompt-integration)
36. [Streaming Support](#36-streaming-support)
37. [Non-Streaming Support](#37-non-streaming-support)
38. [Parallel Request Orchestration](#38-parallel-request-orchestration)
39. [Concurrency Controls](#39-concurrency-controls)
40. [Security Boundaries](#40-security-boundaries)
41. [API Key Management](#41-api-key-management)
42. [Privacy Rules](#42-privacy-rules)
43. [Offline Mode](#43-offline-mode)
44. [Local Inference Strategy](#44-local-inference-strategy)
45. [Benchmarking Across Providers](#45-benchmarking-across-providers)
46. [Provider Versioning](#46-provider-versioning)
47. [Provider Capability Detection](#47-provider-capability-detection)
48. [Provider Quirks Isolation](#48-provider-quirks-isolation)
49. [Prompt Compatibility Matrix](#49-prompt-compatibility-matrix)
50. [Claude Optimized Prompt Stack](#50-claude-optimized-prompt-stack)
51. [OpenAI Optimized Prompt Stack](#51-openai-optimized-prompt-stack)
52. [Local Model Prompt Stack](#52-local-model-prompt-stack)
53. [Future Multi-Provider Evolution](#53-future-multi-provider-evolution)
54. [Final Engineering Verdict](#54-final-engineering-verdict)

---

## 1. LLM PHILOSOPHY
LLMs are highly volatile, non-deterministic reasoning engines that serve as the cognitive core of ToMe. We do not trust them. We constrain them. The LLM is treated as an unreliable API endpoint that occasionally returns brilliant architectural deductions and frequently returns invalid JSON.

## 2. PROVIDER ABSTRACTION PHILOSOPHY
No single LLM vendor has a permanent monopoly on intelligence. The model landscape shifts monthly. ToMe must never be hardcoded to Anthropics's `messages` API or OpenAI's `chat/completions` API. The abstraction must be airtight.

## 3. WHY PROVIDERS MUST BE DECOUPLED
If ToMe's extraction pipeline is tightly coupled to Claude's specific XML-tagging quirks, switching to GPT-4o will result in cascading validation failures. Decoupling ensures ToMe survives the AI vendor wars.

## 4. PROVIDER LIFECYCLE
1. `REGISTER`: App load, detects available adapters.
2. `INIT`: User executes `tome init`, loads API key.
3. `VALIDATE`: Pings provider to verify key and quota.
4. `EXECUTE`: Translates prompts to provider payload.
5. `TERMINATE`: Flushes telemetry and costs.

## 5. REQUEST LIFECYCLE
1. Prompt selected from internal stack.
2. Bound with Context (Skeleton).
3. Transformed by `ILLMClient` into Provider Payload.
4. Sent via HTTP.

## 6. COMPLETION LIFECYCLE
1. Raw HTTP response received.
2. Provider Adapter normalizes the response into a unified `ToMeCompletion` object.
3. Passed to the Zod Validation Pipeline.

## 7. PROMPT EXECUTION LIFECYCLE
`Formulate -> Route -> Execute -> Validate -> Parse -> (Repair if needed) -> Commit`.

## 8. STRUCTURED OUTPUT ARCHITECTURE

### Resolution to Question 3: Enforcing Structured JSON
LLMs are prompt-resistant when generating bare JSON. ToMe forces compliance via Provider-native JSON constraints.
*   **OpenAI:** Utilizes `response_format: { type: "json_schema" }`.
*   **Anthropic:** Utilizes Tool Calling (forcing the LLM to output JSON arguments to a required tool).
*   **Local Models:** Utilizes grammar-constrained generation (e.g., Llama.cpp JSON grammars).
*   **Fallback:** If native constraints fail, prompts instruct the LLM to wrap output in ` ```json ` blocks, which ToMe extracts via Regex.

## 9. TOOL CALLING ARCHITECTURE

### Resolution to Question 4: Tool Calling Standardization
Providers have wildly different Tool Calling specs.
ToMe defines an internal `ToMeTool` interface:
```typescript
export interface ToMeTool {
  name: string;
  description: string;
  parameters: ZodSchema;
}
```
The Provider Adapter translates `ToMeTool` into the specific format required by the provider (e.g., JSON Schema for OpenAI, or Anthropics's input schema format).

## 10. PROVIDER INTERFACE CONTRACTS
The Core Engine relies solely on interfaces. It does not know HTTP exists.

## 11. ILLMCLIENT DEFINITION
```typescript
export interface ILLMClient {
  id: string;
  generateStructured<T>(prompt: PromptRequest, schema: ZodSchema<T>): Promise<T>;
  stream?(prompt: PromptRequest): AsyncIterable<string>;
  getCostEstimate(prompt: PromptRequest): number;
}
```

## 12. PROVIDER ADAPTER ARCHITECTURE
Adapters implement `ILLMClient`. They map internal `PromptRequest` objects (which contain system messages, user messages, and context blocks) into the vendor-specific HTTP JSON body.

## 13. ANTHROPIC ADAPTER
Maps `System` messages to the top-level `system` string. Prefers XML tagging for context injection. Enforces JSON via required tool selection.

## 14. OPENAI ADAPTER
Maps to the standard `messages` array. Uses standard Markdown headers instead of XML. Uses Structured Outputs feature natively.

## 15. GEMINI ADAPTER
Maps to Google's content format. Leverages Gemini's massive context window for caching when handling monorepos.

## 16. LOCAL MODEL ADAPTER

### Resolution to Question 8: Local Model Integration
ToMe integrates with local models (Llama 3, Mistral) via the `LocalModelAdapter`, which talks to the `llama.cpp` server API or Ollama.
*   **Constraint:** Local models struggle with complex instruction following.
*   **Strategy:** The adapter forces JSON outputs using strict grammar files (BNF). Prompt contexts are dramatically reduced to fit standard 8k/16k local memory limits.

## 17. FUTURE PROVIDER EXPANSION STRATEGY

### Resolution to Question 10: Adding Providers without Changing Core
To add "xAI Grok":
1. Write `GrokAdapter implements ILLMClient`.
2. Register it in `ProviderRegistry`.
3. The ToMe extraction pipeline doesn't change a single line of code.

## 18. MODEL CAPABILITY REGISTRY
Tracks what models can do.
```json
{
  "claude-3-5-sonnet": { "context": 200000, "supportsTools": true, "costPer1k": 0.003 },
  "llama-3-8b-local": { "context": 8192, "supportsTools": false, "costPer1k": 0.0 }
}
```

## 19. MODEL SELECTION FRAMEWORK
User configures `tome.config.json` with `primary_provider` and `fallback_provider`.

## 20. PROMPT ROUTING FRAMEWORK
The `ToMeEngine` asks the `PromptRegistry` for a prompt. The registry returns the prompt optimized for the active provider.

## 21. PROVIDER ROUTING ENGINE

### Resolution to Question 1: Provider Switching
ToMe switches providers transparently:
1. `tome init --provider=openai`
2. Engine loads `OpenAIAdapter`.
3. Engine requests `OpenAIPrompts` from the Stack.
4. Extraction pipeline executes exactly as normal.

## 22. CONTEXT WINDOW MANAGEMENT
The `Tokenizer` is provider-aware. Anthropic uses different token calculation algorithms than OpenAI (tiktoken). The Adapter exposes `countTokens(text)`.

## 23. TOKEN BUDGETING
If a chunk exceeds the model's capability, the Adapter throws `ContextExhaustionError`, signaling the Core Engine to trigger chunk splitting.

## 24. COST TRACKING

### Resolution to Question 7: Token Cost Measurement
Every `ToMeCompletion` returns `usage: { prompt_tokens, completion_tokens }`. The Core Engine maintains a running ledger in memory. At the end of `tome update`, it prints: `Update Cost: $0.04 (Anthropic)`.

## 25. USAGE ACCOUNTING
Telemetry is locally saved in `.tome/logs/usage.json` for budget tracking across the month.

## 26. RATE LIMIT MANAGEMENT
Adapters parse HTTP `429 Too Many Requests` headers. They extract the `Retry-After` seconds and pause the worker thread, preventing unhandled promise rejections.

## 27. RETRY ARCHITECTURE

### Resolution to Question 6: Retries
Retries occur at two layers:
1.  **Network Layer:** Handled by the Adapter. 502/503 errors trigger Exponential Backoff (1s, 2s, 4s).
2.  **Semantic Layer:** Handled by the Repair Pipeline. If the JSON schema is invalid, ToMe reprompts the LLM.

## 28. TIMEOUT HANDLING
Adapters enforce a strict `90s` timeout per network call to prevent zombie Node processes.

## 29. PROVIDER FAILURE RECOVERY

### Resolution to Question 5: Provider Outages
If `Anthropic` returns HTTP 500 for 3 consecutive retries, the `ILLMClient` throws `ProviderUnavailableError`.

## 30. FALLBACK PROVIDER STRATEGY
If `ProviderUnavailableError` is caught, and the user has a fallback configured (e.g., `openai`), the `ToMeEngine` dynamically swaps the Adapter, routes to the `OpenAI` prompt stack, and resumes the extraction pipeline exactly where it failed.

## 31. PROMPT CACHING ARCHITECTURE
Adapters for Anthropic and Gemini utilize Prompt Caching endpoints. The Repository Skeleton (which represents 90% of the token payload) is passed as a cached block to eliminate latency and cost during multi-step extractions.

## 32. RESPONSE VALIDATION
Raw output is sanitized (markdown blocks stripped).

## 33. STRUCTURED JSON ENFORCEMENT
(See Section 8).

## 34. TOOL CALLING VALIDATION
Ensures the LLM did not hallucinate tool names or omit required parameters.

## 35. REPAIR PROMPT INTEGRATION
When validation fails, the `RepairPrompt` is invoked using the *same* Provider Adapter.

## 36. STREAMING SUPPORT
Currently unsupported for Extractions. May be utilized in Phase 8 for interactive CLI feedback.

## 37. NON-STREAMING SUPPORT
All extractions operate in blocking `generateStructured` calls.

## 38. PARALLEL REQUEST ORCHESTRATION
The orchestrator limits `Promise.all` concurrency based on the Provider's documented Tier limits (e.g., max 2 concurrent requests for OpenAI Tier 1, max 50 for Tier 5).

## 39. CONCURRENCY CONTROLS
Semaphore-based locking inside the HTTP client.

## 40. SECURITY BOUNDARIES
Source code never touches ToMe's servers. It flows directly from the user's machine to the Provider (e.g., Anthropic).

## 41. API KEY MANAGEMENT
Loaded via `.env`, CLI prompts, or global `~/.tome-config`. Never saved in `.tome/`.

## 42. PRIVACY RULES
ToMe explicitly passes headers to opt out of data training (e.g., `Anthropic-Beta: opt-out`).

## 43. OFFLINE MODE
If the user is completely offline, `tome update` aborts unless `LocalModelAdapter` is active.

## 44. LOCAL INFERENCE STRATEGY
Relies on heavy Domain Chunking. A 500-file repo must be parsed into 50 separate 8k-token chunks for a Local Llama model, increasing execution time but preserving offline privacy.

## 45. BENCHMARKING ACROSS PROVIDERS
The Core Engine runs tests against all adapters to ensure the extraction quality remains >80% regardless of the vendor.

## 46. PROVIDER VERSIONING
Adapters hardcode API versions (e.g., `Anthropic-Version: 2023-06-01`) to prevent silent provider upgrades from breaking parsing logic.

## 47. PROVIDER CAPABILITY DETECTION
At runtime, ToMe checks if the model supports `Tools`, `JSON_Mode`, or `Caching`.

## 48. PROVIDER QUIRKS ISOLATION

### Resolution to Question 9: Quirks Isolation
OpenAI famously struggles to return empty JSON arrays (`[]`) when requested, often inventing hallucinated array items instead.
*   **Isolation:** The `OpenAIAdapter` runs a post-processing heuristic. If it detects a hallucinated "N/A" string in an array, it physically strips it before passing the JSON back to the Core Engine. The Core Engine never knows the quirk occurred.

## 49. PROMPT COMPATIBILITY MATRIX
Different models require different prompts. The `PromptRegistry` manages this.

## 50. CLAUDE OPTIMIZED PROMPT STACK

### Resolution to Question 2: Prompt Differences
*   **Claude Prompts:** Use deep XML trees (`<context>`, `<file>`). Claude respects `<scratchpad>` for chain-of-thought before generating the final JSON tool call.

## 51. OPENAI OPTIMIZED PROMPT STACK
*   **OpenAI Prompts:** Use Markdown headings (`# Context`, `## File`). Requires chain-of-thought to be included as a standard JSON property (`"reasoning": "..."`) before the final output array.

## 52. LOCAL MODEL PROMPT STACK
*   **Local Prompts:** Extremely brief instructions. Heavy reliance on few-shot examples (show, don't tell) due to weak instruction-following capabilities.

## 53. FUTURE MULTI-PROVIDER EVOLUTION
The system is ready for "Mixture of Experts" routing. Stage 2 (Architecture Extraction) might be routed to Claude 3.5 Sonnet, while Stage 6 (Risk Extraction) is routed to OpenAI o1-preview, seamlessly merging the results into the RIS graph.

## 54. FINAL ENGINEERING VERDICT

By creating a rigid `ILLMClient` abstraction layer, decoupling Prompt Stacks by model, and enforcing JSON schema normalization inside the Adapters, ToMe is insulated against AI vendor lock-in. The architecture guarantees that no matter what model the developer chooses (from Claude to Local Llama), the resulting Repository Intelligence State and Markdown artifacts will be structurally identical, traceable, and deterministic.
