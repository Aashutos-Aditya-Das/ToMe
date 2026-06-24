# TOME_REPOSITORY_MODEL_v1

> **Document Classification:** Formal Domain Specification  
> **Document Version:** 1.0  
> **Created:** 2026-06-08  
> **Status:** APPROVED DOMAIN CONTRACT  
> **Persistence:** PERMANENT  

---

## TABLE OF CONTENTS

1. [Purpose of the Repository Model](#1-purpose-of-the-repository-model)
2. [Why ASTs Alone Are Insufficient](#2-why-asts-alone-are-insufficient)
3. [The Intelligence Continuum](#3-the-intelligence-continuum)
4. [Formal Repository Model Philosophy](#4-formal-repository-model-philosophy)
5. [Canonical Entity Definitions](#5-canonical-entity-definitions)
6. [Entity Relationship Model](#6-entity-relationship-model)
7. [Repository Graph Theory](#7-repository-graph-theory)
8. [Architectural Representations](#8-architectural-representations)
9. [Repository Skeleton](#9-repository-skeleton)
10. [Parser Outputs](#10-parser-outputs)
11. [RepositoryModel Versioning Strategy](#11-repositorymodel-versioning-strategy)
12. [Future Evolution Rules](#12-future-evolution-rules)

---

## 1. PURPOSE OF THE REPOSITORY MODEL

The Repository Model is the canonical intermediate representation that exists between raw source code and the Repository Intelligence State (RIS). 

Before ToMe can understand the *meaning* of a repository (e.g., "This service processes payments"), it must first understand the *physics* of the repository (e.g., "This file exports a class that imports a module"). 

The purpose of the Repository Model is to provide a purely structural, mathematically rigorous, language-agnostic map of a software project. It is an abstraction layer that allows the semantic engine (LLMs) to reason over the topology of a codebase without being drowning in the noise of implementation details, language-specific syntax, or irrelevant tokens.

This document serves as the absolute contract between the Parsing Layer (which extracts data) and the Intelligence Layer (which interprets data).

---

## 2. WHY ASTS ALONE ARE INSUFFICIENT

An Abstract Syntax Tree (AST) is a representation of source code constrained by the grammatical rules of a specific programming language. 

ASTs are insufficient for high-level intelligence extraction for the following reasons:

1. **Syntax Overload:** An AST contains every comma, bracket, variable declaration, and loop. 95% of an AST is behavioral implementation (how things are done), which is completely irrelevant to architectural intent (why things exist).
2. **Language Fragmentation:** A Python AST looks fundamentally different from a Rust AST. An intelligence engine cannot be written to understand 20 different grammatical structures.
3. **Lack of Global Context:** An AST represents a *single file*. It does not natively understand that an `import` statement in `file_a.js` maps to an `export` in `file_b.js`. ASTs lack inter-file referential integrity.
4. **Missing Conceptual Boundaries:** ASTs do not know what a "Database" or a "Route" is. They only know what a "ClassDeclaration" or "Decorator" is.

The Repository Model solves this by lifting AST nodes into language-agnostic structural concepts, discarding implementation bodies, and resolving inter-file edges.

---

## 3. THE INTELLIGENCE CONTINUUM

The extraction of intelligence flows through four distinct phases. 

### Phase 1: Source Code
* **Nature:** Raw text strings on a filesystem.
* **Property:** Human-writable, language-specific, executable.
* **Example:** `class AuthController { ... }` in a `.ts` file.

### Phase 2: AST (Abstract Syntax Tree)
* **Nature:** Grammatical tree per file.
* **Property:** Machine-readable, language-specific, extremely noisy.
* **Example:** `ClassDeclaration -> Identifier("AuthController") -> MethodDefinition(...)`

### Phase 3: Repository Model (The Subject of this Document)
* **Nature:** Language-agnostic structural graph of the entire project.
* **Property:** Purely topological. Discards behavior. Contains exact edges between files, modules, and symbols.
* **Example:** `Entity(Type: Class, Name: AuthController, Contains: [Method(login)], Edges: [Calls(UserService)])`

### Phase 4: Repository Intelligence State (RIS)
* **Nature:** Semantic intent and business logic representation.
* **Property:** Intent-driven, probabilistic (derived by AI), architectural.
* **Example:** `"The Authentication Domain utilizes AuthController to handle JWT issuance via the UserService."`

The Repository Model is the bridge that turns Phase 2 into Phase 3.

---

## 4. FORMAL REPOSITORY MODEL PHILOSOPHY

The design of the Repository Model is governed by strict philosophical rules:

1. **Behavioral Ignorance:** The model knows *that* a function exists, what its signature is, and what other functions it calls. The model explicitly does NOT know *how* the function computes its result. The body of the function is discarded.
2. **Language Agnosticism:** There is no concept of "Python" or "TypeScript" within the canonical entities. A Python `def` and a TypeScript `function` are both unified into the `Function` entity. Language-specific quirks must be normalized before entering the model.
3. **Referential Integrity:** If Entity A claims to depend on Entity B, Entity B must exist in the model. Unresolved external dependencies must be explicitly flagged as `ExternalIntegration`.
4. **Graph Primacy:** A codebase is not a hierarchy of folders. It is a directed graph of dependencies. The filesystem hierarchy is merely one subset of edges (`Containment`) within the broader graph.

---

## 5. CANONICAL ENTITY DEFINITIONS

The following entities represent the exhaustive ontology of the Repository Model. No parser is permitted to output an entity that does not exist in this list. No intelligence engine is permitted to expect an entity outside this list.

### 5.1 Repository
* **Purpose:** The absolute root node of the structural universe.
* **Definition:** A bounded collection of source code governed by a single version control origin.
* **Attributes:** `IdentityString`, `RootPath`, `LanguageSignatures`.
* **Relationships:** Contains (`Directory`, `File`, `Package`, `Module`).
* **Examples:** A Git repository representing a web application.

### 5.2 Package
* **Purpose:** Represents distributable or isolated boundaries within a codebase.
* **Definition:** A distinct logical unit that defines its own external dependencies, often published or versioned independently.
* **Attributes:** `PackageName`, `Version`, `ManifestPath` (e.g., `package.json`).
* **Relationships:** Owned by (`Repository`), Contains (`Directory`, `File`, `Module`), Declares (`Dependency`).
* **Examples:** An npm workspace, a Rust crate, a Python poetry module.

### 5.3 Module
* **Purpose:** Represents internal namespaces or logical groupings of code.
* **Definition:** A cohesive boundary of code that encapsulates related functionality, exposing a public API while hiding internal implementation.
* **Attributes:** `ModuleName`, `Visibility` (Public/Private).
* **Relationships:** Owned by (`Package`, `Directory`), Contains (`Class`, `Function`, `Interface`).
* **Examples:** A Python `__init__.py` directory, a Rust `mod`.

### 5.4 Directory
* **Purpose:** Represents filesystem topology.
* **Definition:** A physical grouping of files on a storage medium.
* **Attributes:** `RelativePath`, `DirectoryName`.
* **Relationships:** Contained by (`Directory`, `Repository`), Contains (`File`, `Directory`).
* **Examples:** `src/components/`, `lib/utils/`.

### 5.5 File
* **Purpose:** The atomic unit of physical storage.
* **Definition:** A single text document containing source code.
* **Attributes:** `FileName`, `Extension`, `RelativePath`, `Checksum`.
* **Relationships:** Contained by (`Directory`), Contains (`Class`, `Function`, `Interface`, `Configuration`), HasEdge (`ImportEdge`, `ExportEdge`).
* **Examples:** `auth.service.ts`, `database.go`.

### 5.6 Class
* **Purpose:** Represents object-oriented structural blueprints.
* **Definition:** A definition of state and behavior, serving as a template for instantiation.
* **Attributes:** `ClassName`, `IsAbstract`, `Modifiers` (Public/Private/Protected).
* **Relationships:** Contained by (`File`, `Module`), InheritsFrom (`Class`), Implements (`Interface`), Contains (`Method`).
* **Examples:** `UserController`, `DatabaseConnection`.

### 5.7 Interface
* **Purpose:** Represents behavioral contracts.
* **Definition:** A strict structural definition that concrete entities must satisfy.
* **Attributes:** `InterfaceName`.
* **Relationships:** Contained by (`File`, `Module`), ImplementedBy (`Class`).
* **Examples:** `IRepository`, `UserShape`.

### 5.8 Function
* **Purpose:** Represents stateless or standalone behavior.
* **Definition:** A callable block of logic not bound to a class instance.
* **Attributes:** `FunctionName`, `Signature` (Parameters and Return Type), `IsAsync`.
* **Relationships:** Contained by (`File`, `Module`), HasEdge (`Invocation`).
* **Examples:** `calculateTax()`, `formatDate()`.

### 5.9 Method
* **Purpose:** Represents state-bound behavior.
* **Definition:** A callable block of logic bound to a Class.
* **Attributes:** `MethodName`, `Signature`, `IsStatic`, `IsAsync`, `Visibility`.
* **Relationships:** Owned by (`Class`), HasEdge (`Invocation`).
* **Examples:** `UserController.login()`, `Database.connect()`.

### 5.10 Route
* **Purpose:** Represents external entry boundaries.
* **Definition:** A specific pathway through which external network requests enter the system.
* **Attributes:** `Path` (e.g., `/api/v1/users`), `HTTPMethod` (GET, POST), `Protocol`.
* **Relationships:** HandledBy (`Function`, `Method`), Contained by (`File`).
* **Examples:** `POST /api/login`, `GET /health`.

### 5.11 Service
* **Purpose:** Represents domain logic executors.
* **Definition:** A long-lived entity (class or module) responsible for orchestrating specific business rules.
* **Attributes:** `ServiceName`, `DomainTopic`.
* **Relationships:** InvokedBy (`Route`), Invokes (`Database`, `ExternalIntegration`).
* **Examples:** `PaymentProcessingService`.

### 5.12 Dependency
* **Purpose:** Represents third-party code.
* **Definition:** A package or library imported from outside the `Repository` boundary.
* **Attributes:** `DependencyName`, `VersionConstraint`, `Source` (npm, pip, cargo).
* **Relationships:** DeclaredBy (`Package`), ImportedBy (`File`).
* **Examples:** `react@18.0.0`, `requests>=2.25.0`.

### 5.13 ImportEdge
* **Purpose:** Represents internal symbol resolution.
* **Definition:** A directed edge indicating that File A requires a symbol from File B.
* **Attributes:** `ImportedSymbolName`, `IsTypeOnly`.
* **Relationships:** From (`File`), To (`File`).

### 5.14 ExportEdge
* **Purpose:** Represents public API boundaries of a file.
* **Definition:** A declaration that a symbol is available for `ImportEdge` connections.
* **Attributes:** `ExportedSymbolName`, `IsDefault`.
* **Relationships:** Owned by (`File`), PointsTo (`Class`, `Function`, `Interface`).

### 5.15 DataFlow
* **Purpose:** Represents the movement of state.
* **Definition:** A traced path of a specific data structure passing through multiple methods or functions.
* **Attributes:** `DataTypeShape`.
* **Relationships:** FlowsThrough (`Method`, `Function`).

### 5.16 Event
* **Purpose:** Represents asynchronous decoupling.
* **Definition:** A message broadcast to an unknown number of listeners.
* **Attributes:** `EventName`, `PayloadShape`.
* **Relationships:** EmittedBy (`Function`, `Method`), ListenedToBy (`Function`, `Method`).
* **Examples:** `USER_REGISTERED`, `ORDER_COMPLETED`.

### 5.17 Configuration
* **Purpose:** Represents environment-agnostic setup.
* **Definition:** Static settings defined in code or specific config files.
* **Attributes:** `Key`, `ValueStructure`.
* **Relationships:** Contained by (`File`).
* **Examples:** `webpack.config.js`, `tsconfig.json`.

### 5.18 Environment Variable
* **Purpose:** Represents environment-specific execution state.
* **Definition:** Values injected by the host operating system at runtime.
* **Attributes:** `VariableName`, `IsRequired`.
* **Relationships:** AccessedBy (`File`, `Function`).
* **Examples:** `DATABASE_URL`, `STRIPE_SECRET_KEY`.

### 5.19 EntryPoint
* **Purpose:** Represents the start of execution.
* **Definition:** The file or function where the operating system or runtime initiates the program.
* **Attributes:** `ExecutionType` (CLI, WebServer, Script).
* **Relationships:** Owned by (`File`), Triggers (`Function`).
* **Examples:** `index.js`, `main.go`.

### 5.20 External Integration
* **Purpose:** Represents network egress.
* **Definition:** Code that specifically formats and sends data to a third-party API or service.
* **Attributes:** `IntegrationTarget` (e.g., Stripe, Twilio), `Protocol`.
* **Relationships:** InvokedBy (`Method`, `Service`).
* **Examples:** A Stripe checkout session creator.

### 5.21 Database
* **Purpose:** Represents persistence.
* **Definition:** Code that specifically interacts with a data store.
* **Attributes:** `DatabaseType` (SQL, NoSQL), `TableName`.
* **Relationships:** QueriedBy (`Method`, `Service`).
* **Examples:** An ORM model, a raw SQL execution block.

### 5.22 API Endpoint
* **Purpose:** Represents the logical definition of a route.
* **Definition:** Similar to `Route`, but describes the conceptual API surface rather than the routing implementation.
* **Attributes:** `EndpointName`, `RequestShape`, `ResponseShape`.
* **Relationships:** MappedTo (`Route`).

---

## 6. ENTITY RELATIONSHIP MODEL

The Repository Model is a pure graph.

### 6.1 Nodes
Every instance of an entity defined in Section 5 is a Node in the graph. Every Node possesses a globally unique identifier (UUID or deterministic hash) within the model execution.

### 6.2 Edges
Edges represent the relationships between Nodes. Edges are strictly typed and directed.

#### Edge Types:
* **Ownership / Containment:** Represents strict physical or logical nesting. If the parent is deleted, the child ceases to exist. (e.g., `Directory` Contains `File`, `Class` Owns `Method`).
* **Dependency:** Represents compilation or execution reliance. If Node B changes, Node A might break. (e.g., `File` Imports `Dependency`).
* **Invocation:** Represents runtime execution paths. (e.g., `Method(login)` Invokes `Method(hashPassword)`).
* **Inheritance:** Represents object-oriented structural sharing. (e.g., `Class(Admin)` InheritsFrom `Class(User)`).

---

## 7. REPOSITORY GRAPH THEORY

A parsed codebase is not a single graph, but rather three overlapping graphs occupying the same topology.

### 7.1 Structural Graph
* **Definition:** The physical layout of the code.
* **Edges Used:** Containment, Ownership.
* **Description:** Represents how files are grouped into folders, how classes are grouped into files, and how methods are grouped into classes. This is how a human navigates the codebase in a file explorer.

### 7.2 Dependency Graph
* **Definition:** The compilation and link-time topology.
* **Edges Used:** ImportEdge, ExportEdge, Inheritance, Implements.
* **Description:** Represents what must exist for a specific file to successfully compile or execute. If `A` imports `B`, the edge goes from `A` to `B`. Circular dependencies are detected here.

### 7.3 Execution Graph
* **Definition:** The runtime topology.
* **Edges Used:** Invocation, DataFlow, Event Emission.
* **Description:** Represents what happens when the program runs. An `EntryPoint` triggers a `Route`, which invokes a `Service`, which queries a `Database`. This graph is the most critical for extracting architectural intent.

---

## 8. ARCHITECTURAL REPRESENTATIONS

The Repository Model mathematically describes different software architectures based purely on graph topology.

### 8.1 Monoliths
* **Signature:** A single `Repository` Node containing a single `Package` Node, featuring a single massive, highly-connected Execution Graph with one primary `EntryPoint`.

### 8.2 Modular Monoliths
* **Signature:** A single `Repository` Node containing multiple explicitly bounded `Module` Nodes. Dependency Edges between Modules are sparse and strict, while Dependency Edges within Modules are dense.

### 8.3 Microservices (Monorepo)
* **Signature:** A single `Repository` Node containing multiple `Package` Nodes. There are zero ImportEdges crossing `Package` boundaries. They share no Structural Graph edges below the root. They may share Execution Graph edges via network protocols (identified as `ExternalIntegrations` aimed at internal URLs).

### 8.4 Libraries / SDKs
* **Signature:** A `Package` Node with a massive number of `ExportEdges` on its boundary, but zero `Routes` and zero `EntryPoints`.

### 8.5 CLIs
* **Signature:** An `EntryPoint` designated as CLI, connected directly to `Command` patterns, with heavy usage of `EnvironmentVariables` and zero `Routes`.

### 8.6 SaaS Applications
* **Signature:** Contains distinct Structural sub-graphs for Frontend (high density of `Components` and `DataFlow`) and Backend (high density of `Routes`, `Services`, and `Databases`).

---

## 9. REPOSITORY SKELETON

The concept of the **Repository Skeleton** is the physical serialization of the Repository Model. 

When the parser completes its traversal of the ASTs, it must compress the three graphs (Structural, Dependency, Execution) into a single, dense JSON object: The Skeleton.

### What Survives Parsing:
* All Node Declarations (File names, Class names, Method names).
* All Signatures (Function arguments and return types).
* All Edges (Imports, Exports, Invocations).
* File paths.

### What is Discarded:
* All implementation bodies (the code inside `{ ... }`).
* Inline comments (unless formatted as strict JSDoc/Docstrings attached to signatures).
* Variable assignments inside methods.
* Loops, conditionals, and math operations.

### Why:
If we retain implementation details, the Repository Skeleton will be 100,000+ tokens for a small project, exhausting the LLM's context window. By discarding behavior, we reduce the token footprint by 95%, leaving only the architectural structure intact.

---

## 10. PARSER OUTPUTS

The Parser Layer (e.g., the Tree-sitter adapter) is strictly responsible for outputting a valid Repository Skeleton JSON object that perfectly conforms to the Canonical Entity Definitions defined in Section 5.

The Parser is explicitly forbidden from:
* Guessing semantic intent (e.g., labeling something an `AuthService` just because it has the word 'Auth'). The parser only outputs `Class(AuthService)`. The LLM assigns meaning later.
* Formatting Markdown.
* Executing the code.

---

## 11. REPOSITORYMODEL VERSIONING STRATEGY

The Repository Model is a formal schema. It will evolve. 

* **Versioning Rule:** The schema uses Semantic Versioning (e.g., `v1.0.0`).
* **Major Updates:** Adding new edges that fundamentally change graph resolution, or removing entities. (Requires Parser and LLM Prompt updates).
* **Minor Updates:** Adding new optional Attributes to existing Entities (e.g., adding `IsDeprecated` to `Function`).
* **Storage Requirement:** Every Repository Skeleton generated must stamp its schema version in the JSON header.

---

## 12. FUTURE EVOLUTION RULES

As ToMe scales to support dozens of languages and massive enterprise environments, the Repository Model must remain stable. 

1. **No Language-Specific Entities:** Never add an entity like `PythonDecorator` or `RustMacro`. These concepts must be abstracted into generic behavioral modifiers.
2. **Never Add State:** The model describes the structure of the code, not the runtime memory state of the application. 
3. **The LLM is the Consumer:** Every addition to this model must be evaluated against the question: "Does an LLM need this field to deduce architecture?" If no, leave it out.

***End of Formal Domain Specification. This document governs all parser implementations and RIS generation engines.***
