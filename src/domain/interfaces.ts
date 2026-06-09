/**
 * src/domain/interfaces.ts
 * Canonical Port interfaces as defined in TOME_ARCHITECTURE_AMENDMENT_v1 Part VIII.
 */

import { z } from 'zod';
import { 
  ExitCode, 
  DerivationMethod, 
  ClaimStatus, 
  ConfidenceLevel, 
  EvidenceNodeType, 
  EvidenceRelationship 
} from './constants.js';

// ===== LOGGING =====

export interface ILogger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, error?: Error, meta?: any): void;
}

// ===== LLM PROVIDER =====

export interface PromptMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ToMeTool {
  name: string;
  description: string;
  parameters: z.ZodSchema;
}

export interface PromptRequest {
  systemMessage: string;
  userMessages: PromptMessage[];
  tools?: ToMeTool[];
  temperature?: number;
  maxOutputTokens?: number;
}

export interface LLMResult<T> {
  data: T;
  usage: { promptTokens: number; completionTokens: number };
  model: string;
  latencyMs: number;
}

export interface ILLMClient {
  readonly providerId: string;
  generateStructured<T>(prompt: PromptRequest, schema: z.ZodSchema<T>): Promise<LLMResult<T>>;
  countTokens(text: string): Promise<number>;
}

// ===== PARSER =====

export interface ExtractedSymbol {
  id: string;
  name: string;
  type: string;
  fqn: string;
  filePath: string;
  range: { startLine: number; endLine: number };
  content?: string; // Signature only in extraction
}

export interface ASTDependencyEdge {
  sourceFQN: string;
  targetFQN: string;
  type: 'IMPORT' | 'CALL' | 'INHERIT';
}

export interface FileNode {
  path: string;
  symbols: ExtractedSymbol[];
  dependencies: ASTDependencyEdge[];
  checksum: string;
}

export interface RepositoryModel {
  workspaceRoot: string;
  files: Map<string, FileNode>;
  getAllSymbols(): ExtractedSymbol[];
  getSymbolByFQN(fqn: string): ExtractedSymbol | undefined;
}

export interface ILanguageAdapter {
  languageId: string;
  supports(filename: string): boolean;
  extractSymbols(content: string, filePath: string): Promise<ExtractedSymbol[]>;
  extractDependencies(content: string, filePath: string): Promise<ASTDependencyEdge[]>;
}

export interface IParserEngine {
  parseWorkspace(paths: string[]): Promise<RepositoryModel>;
  parseFile(path: string, content: string): Promise<FileNode>;
}

// ===== STORAGE & RUNTIME MODEL =====

export interface EvidenceNode {
  id: string;
  type: EvidenceNodeType;
  referenceId: string;
  summary: string;
}

export interface EvidenceEdge {
  id: string;
  fromEvidenceNodeId: string;
  toClaimId: string;
  weight: number;
  relationship: EvidenceRelationship;
}

export interface ProvenanceRecord {
  timestamp: string;
  tomeVersion: string;
  model: string;
  promptVersion: string;
}

export interface ConfidenceScore {
  level: ConfidenceLevel;
  numericValue: number;
}

export interface Claim<T> {
  id: string;
  risEntityId: string;
  attributeName: string;
  value: T;
  status: ClaimStatus;
  derivation: DerivationMethod;
  confidence: ConfidenceScore;
  provenance: ProvenanceRecord[];
  evidenceEdges: EvidenceEdge[];
  markdownHash?: string;
}

// Runtime Entities (Semantic properties wrapped in Claim<T>)

export interface RuntimeDomain {
  id: string;
  name: Claim<string>;
  description: Claim<string>;
}

export interface RuntimeService {
  id: string;
  name: Claim<string>;
  description: Claim<string>;
  domainId: Claim<string>;
  isExternal: Claim<boolean>; // Semantic inference
}

export interface RuntimeCapability {
  id: string;
  name: Claim<string>;
  description: Claim<string>;
  serviceId: Claim<string>;
}

export interface RuntimeWorkflow {
  id: string;
  name: Claim<string>;
  description: Claim<string>;
  trigger: Claim<string>;
  steps: Claim<string[]>;
}

export interface RuntimeBusinessRule {
  id: string;
  name: Claim<string>;
  description: Claim<string>;
  condition: Claim<string>;
  enforcement: Claim<string>;
}

export interface RuntimeConstraint {
  id: string;
  name: Claim<string>;
  description: Claim<string>;
  type: Claim<'TECHNICAL' | 'BUSINESS' | 'REGULATORY'>; // Semantic inference
}

export interface RuntimeDependency {
  id: string;
  name: string; // Structural
  description: Claim<string>;
  sourceId: Claim<string>; // Semantic relationship
  targetId: Claim<string>; // Semantic relationship
  criticality: Claim<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>; // Semantic judgment
}

export interface RuntimeRisk {
  id: string;
  name: Claim<string>;
  description: Claim<string>;
  impact: Claim<'LOW' | 'MEDIUM' | 'HIGH'>;
  likelihood: Claim<'LOW' | 'MEDIUM' | 'HIGH'>;
  mitigation: Claim<string | undefined>;
}

export interface RuntimeIntegration {
  id: string;
  name: Claim<string>;
  description: Claim<string>;
  type: Claim<'API' | 'DATABASE' | 'EVENT_STREAM' | 'FILE'>;
  protocol: Claim<string>;
}

export interface RuntimeDecision {
  id: string;
  name: Claim<string>;
  description: Claim<string>;
  decisionText: Claim<string>; // Required by RIS Catalog §5
  context: Claim<string>;
  consequences: Claim<string>;
  status: Claim<'PROPOSED' | 'ACCEPTED' | 'DEPRECATED' | 'SUPERSEDED'>;
}

export interface RuntimeAssumption {
  id: string;
  name: Claim<string>;
  description: Claim<string>;
  text: Claim<string>; // Required by RIS Catalog §5
  decisionId: Claim<string>; // Required by RIS Catalog §5
  confidence: Claim<'LOW' | 'MEDIUM' | 'HIGH'>;
  validationCriteria: Claim<string | undefined>;
}

export interface RISGraph {
  meta: { schemaVersion: string; lastUpdated: string; tomeVersion: string };
  domains: RuntimeDomain[];
  services: RuntimeService[];
  capabilities: RuntimeCapability[];
  workflows: RuntimeWorkflow[];
  businessRules: RuntimeBusinessRule[];
  constraints: RuntimeConstraint[];
  dependencies: RuntimeDependency[];
  risks: RuntimeRisk[];
  integrations: RuntimeIntegration[];
  decisions: RuntimeDecision[];
  assumptions: RuntimeAssumption[];
  evidenceNodes: EvidenceNode[];
  artifactAnchors: Record<string, Record<string, string>>;
  orphanedAssertions: Claim<unknown>[];
}

// ===== STORAGE DTO MODELS (On-Disk) =====

export interface StorageDomain {
  id: string;
  name: string;
  description: string;
}

export interface StorageService {
  id: string;
  name: string;
  description: string;
  domainId: string;
  isExternal: boolean;
}

export interface StorageCapability {
  id: string;
  name: string;
  description: string;
  serviceId: string;
}

export interface StorageWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  steps: string[];
}

export interface StorageBusinessRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  enforcement: string;
}

export interface StorageConstraint {
  id: string;
  name: string;
  description: string;
  type: 'TECHNICAL' | 'BUSINESS' | 'REGULATORY';
}

export interface StorageDependency {
  id: string;
  name: string;
  description: string;
  sourceId: string;
  targetId: string;
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface StorageRisk {
  id: string;
  name: string;
  description: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  likelihood: 'LOW' | 'MEDIUM' | 'HIGH';
  mitigation?: string;
}

export interface StorageIntegration {
  id: string;
  name: string;
  description: string;
  type: 'API' | 'DATABASE' | 'EVENT_STREAM' | 'FILE';
  protocol: string;
}

export interface StorageDecision {
  id: string;
  name: string;
  description: string;
  decisionText: string;
  context: string;
  consequences: string;
  status: 'PROPOSED' | 'ACCEPTED' | 'DEPRECATED' | 'SUPERSEDED';
}

export interface StorageAssumption {
  id: string;
  name: string;
  description: string;
  text: string;
  decisionId: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  validationCriteria?: string;
}

export interface StorageRIS {
  meta: { schemaVersion: string; lastUpdated: string; tomeVersion: string };
  domains: StorageDomain[];
  services: StorageService[];
  capabilities: StorageCapability[];
  workflows: StorageWorkflow[];
  businessRules: StorageBusinessRule[];
  constraints: StorageConstraint[];
  dependencies: StorageDependency[];
  risks: StorageRisk[];
  integrations: StorageIntegration[];
  decisions: StorageDecision[];
  assumptions: StorageAssumption[];
  claims: Omit<Claim<unknown>, 'value' | 'evidenceEdges'>[];
  evidenceNodes: EvidenceNode[];
  evidenceEdges: EvidenceEdge[];
  artifactAnchors: Record<string, Record<string, string>>;
  orphanedAssertions: Claim<unknown>[];
}

export interface IStorageOrchestrator {
  load(): Promise<RISGraph>;
  save(graph: RISGraph): Promise<void>;
  backup(): Promise<void>;
  restore(): Promise<void>;
  acquireLock(): Promise<void>;
  releaseLock(): Promise<void>;
}

// ===== FILESYSTEM =====

export interface FileStat {
  size: number;
  modifiedMs: number;
}

export interface IFileSystem {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  mkdir(path: string): Promise<void>;
  readDir(path: string): Promise<string[]>;
  glob(pattern: string, options: { cwd: string; ignore: string[] }): Promise<string[]>;
  rename(oldPath: string, newPath: string): Promise<void>;
  remove(path: string): Promise<void>;
  stat(path: string): Promise<FileStat>;
}

// ===== CONFIGURATION =====

export interface ResolvedConfiguration {
  readonly provider: {
    primary: 'anthropic' | 'openai';
    fallback?: 'anthropic' | 'openai';
  };
  readonly model: string;
  readonly extraction: {
    mode: 'STANDARD';
    maxFiles: number;
    maxCostPerRun: number;
    maxConcurrency: number;
  };
  readonly parser: {
    ignorePatterns: string[];
  };
  readonly storage: {
    preserveOrphansForCycles: number;
  };
  readonly mcp: {
    enabled: boolean;
  };
}

export interface IConfigurationProvider {
  resolve(): Promise<ResolvedConfiguration>;
}

// ===== CORE ENGINE =====

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ExecutionContext {
  cwd: string;
  config: ResolvedConfiguration;
  logger: ILogger;
  fileSystem: IFileSystem;
  llmClient: ILLMClient;
  parser: IParserEngine;
  storage: IStorageOrchestrator;
}

export interface IToMeEngine {
  init(context: ExecutionContext): Promise<void>;
  update(context: ExecutionContext): Promise<void>;
  validate(context: ExecutionContext): Promise<ValidationResult>;
  serve(context: ExecutionContext): Promise<void>;
}
