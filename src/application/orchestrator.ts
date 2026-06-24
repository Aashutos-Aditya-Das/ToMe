import { 
  ExecutionContext, 
  IToMeEngine, 
  ValidationResult,
  RISGraph,
  Claim,
  EvidenceNode,
  PromptRequest,
  LLMResult
} from '../domain/interfaces.js';
import { RISStateSchema, Stage1Schema, Stage2Schema, Stage3Schema } from '../domain/schemas.js';
import { EvidenceEngine } from './evidence.js';
import { randomUUID } from 'node:crypto';
import { ClaimStatus, DerivationMethod, ConfidenceLevel, EvidenceNodeType } from '../domain/constants.js';

export class MemoryGenerationOrchestrator implements IToMeEngine {
  async init(context: ExecutionContext): Promise<void> {
    context.logger.info("Initializing ToMe repository...");
    const tomeDir = `${context.cwd}/.tome`;
    if (!(await context.fileSystem.exists(tomeDir))) {
      await context.fileSystem.mkdir(tomeDir);
    }
  }

  async update(context: ExecutionContext): Promise<void> {
    context.logger.info("Starting Full Rewrite Update...");
    await context.storage.acquireLock();
    try {
      // 1. Load existing state if available (for Human Assertions)
      let oldGraph: RISGraph | undefined;
      try {
        oldGraph = await context.storage.load();
      } catch (e) {
        context.logger.debug("No existing RIS graph found, starting fresh.");
      }

      // Preserve Human Assertions
      const humanAssertions = new Map<string, any>();
      if (oldGraph) {
        const extractHuman = (entities: any[]) => {
           for (const entity of entities) {
             for (const [key, value] of Object.entries(entity)) {
               if (value && typeof value === 'object' && 'derivation' in value) {
                 const claim = value as Claim<any>;
                 if (claim.derivation === 'HUMAN_ASSERTED') {
                   humanAssertions.set(`${entity.id}_${key}`, claim);
                 }
               }
             }
           }
        };
        extractHuman(oldGraph.domains);
        extractHuman(oldGraph.services);
        extractHuman(oldGraph.capabilities);
      }

      // 2. Parse Repository
      const allFilesToParse = await context.discovery!.discoverFiles(context.cwd);

      const lastUpdatedMs = oldGraph ? new Date(oldGraph.meta.lastUpdated).getTime() : 0;
      const filesToParse: string[] = [];
      for (const f of allFilesToParse) {
        try {
          const stat = await context.fileSystem.stat(f);
          if (stat.modifiedMs > lastUpdatedMs) {
            filesToParse.push(f);
          }
        } catch (e) {
          filesToParse.push(f); // Fallback if stat fails
        }
      }

      if (filesToParse.length === 0) {
        context.logger.info("No files modified since last update. RIS is up to date.");
        return;
      }

      context.logger.info(`Found ${filesToParse.length} modified files out of ${allFilesToParse.length}. Parsing...`);
      const repoModel = await context.parser.parseWorkspace(filesToParse);

      // 3. Iterative Extraction (Chunking)
      const CHUNK_SIZE = 50;
      const fileEntries = Array.from(repoModel.files.entries());
      const storageRis: any = {
        domains: [], services: [], capabilities: [], workflows: [], businessRules: [],
        constraints: [], dependencies: [], risks: [], integrations: [], decisions: [], assumptions: []
      };

      for (let i = 0; i < fileEntries.length; i += CHUNK_SIZE) {
        const chunk = fileEntries.slice(i, i + CHUNK_SIZE);
        let skeleton = `Repository Skeleton Chunk (${i/CHUNK_SIZE + 1}):\n`;
        for (const [path, fileNode] of chunk) {
          skeleton += `File: ${path}\n`;
          for (const sym of fileNode.symbols) {
             skeleton += `  - ${sym.type} ${sym.name} (ID: ${sym.fqn})\n`;
          }
          if (fileNode.content) {
            skeleton += `\n--- Source Code for ${path} ---\n${fileNode.content}\n-----------------------------------\n\n`;
          }
        }

        // STAGE 1: Domains, Services, Dependencies, Integrations
        const prompt1: PromptRequest = {
          systemMessage: "You are the ToMe Extraction Engine. Stage 1: Analyze the repository skeleton AND the provided Source Code Snippets. Extract Core Domains, Data Models, Backend Services, Dependencies, and Integrations.",
          userMessages: [{ role: 'user', content: `Codebase chunk:\n\n${skeleton}` }],
          temperature: 0.1, maxOutputTokens: 8192
        };
        context.logger.info(`Invoking LLM Stage 1 for chunk ${i/CHUNK_SIZE + 1} of ${Math.ceil(fileEntries.length / CHUNK_SIZE)}...`);
        const result1 = await context.llmClient.generateStructured(prompt1, Stage1Schema);
        const stage1Data = result1.data as any;

        // STAGE 2: Capabilities, Workflows, Risks, Assumptions
        const prompt2: PromptRequest = {
          systemMessage: "You are the ToMe Extraction Engine. Stage 2: Read the Source Code Snippets. Given the following Core Services & Domains, deeply extract all Workflows, Capabilities, Assumptions, and Risks. Be exhaustive. Do not skip workflows (like CSV parsing or Queues).",
          userMessages: [
            { role: 'user', content: `Codebase chunk:\n\n${skeleton}` },
            { role: 'user', content: `Previously Extracted Services:\n${JSON.stringify(stage1Data.services || [], null, 2)}` }
          ],
          temperature: 0.1, maxOutputTokens: 8192
        };
        context.logger.info(`Invoking LLM Stage 2 for chunk ${i/CHUNK_SIZE + 1}...`);
        const result2 = await context.llmClient.generateStructured(prompt2, Stage2Schema);
        const stage2Data = result2.data as any;

        // STAGE 3: Business Rules, Constraints, Decisions
        const prompt3: PromptRequest = {
          systemMessage: "You are the ToMe Extraction Engine. Stage 3: Read the Source Code Snippets. Given the Capabilities and Workflows, extract all explicit Business Rules, Validation Logic, and Technical Constraints. Be highly specific.",
          userMessages: [
            { role: 'user', content: `Codebase chunk:\n\n${skeleton}` },
            { role: 'user', content: `Previously Extracted Capabilities:\n${JSON.stringify(stage2Data.capabilities || [], null, 2)}` }
          ],
          temperature: 0.1, maxOutputTokens: 8192
        };
        context.logger.info(`Invoking LLM Stage 3 for chunk ${i/CHUNK_SIZE + 1}...`);
        const result3 = await context.llmClient.generateStructured(prompt3, Stage3Schema);
        const stage3Data = result3.data as any;

        // Merge chunk results from all 3 stages
        const chunkData = { ...stage1Data, ...stage2Data, ...stage3Data };
        for (const key of Object.keys(storageRis)) {
          if (chunkData[key] && Array.isArray(chunkData[key])) {
             storageRis[key].push(...chunkData[key]);
          }
        }
      }

      // 6. Bind Evidence & Confidence
      const evidenceEngine = new EvidenceEngine(repoModel);
      
      // DiffPatch merge: if oldGraph exists, we append to it, else create new
      const newGraph: RISGraph = oldGraph ? oldGraph : {
         meta: {
            schemaVersion: "1.0",
            lastUpdated: new Date().toISOString(),
            tomeVersion: "1.0.0"
         },
         evidenceNodes: [], artifactAnchors: {}, orphanedAssertions: [],
         domains: [], services: [], capabilities: [], workflows: [], businessRules: [],
         constraints: [], dependencies: [], risks: [], integrations: [], decisions: [], assumptions: []
      };
      newGraph.meta.lastUpdated = new Date().toISOString();

      // Map raw data to hydrated Claims
      const buildClaim = <T>(entityId: string, attrName: string, rawValue: T, evidenceEdges: any[]): Claim<T> => {
         const humanOverride = humanAssertions.get(`${entityId}_${attrName}`);
         if (humanOverride) {
            return humanOverride;
         }

         const edges = evidenceEdges.map(e => ({
            id: randomUUID(),
            fromEvidenceNodeId: e.fromEvidenceNodeId || e.referenceId,
            toClaimId: entityId,
            weight: 0.8,
            relationship: 'SUPPORTS' as any
         }));
         
         const mapNodes = new Map<string, EvidenceNode>();
         edges.forEach(e => mapNodes.set(e.fromEvidenceNodeId, { id: e.fromEvidenceNodeId, type: EvidenceNodeType.CODE_NODE, referenceId: e.fromEvidenceNodeId, summary: '' }));

         const evalResult = evidenceEngine.evaluateClaim(rawValue, DerivationMethod.LLM_INFERRED, edges, mapNodes);

         return {
            id: randomUUID(),
            risEntityId: entityId,
            attributeName: attrName,
            value: rawValue,
            status: evalResult.status,
            derivation: DerivationMethod.LLM_INFERRED,
            confidence: evalResult.confidence,
            provenance: [{ timestamp: new Date().toISOString(), tomeVersion: '1.0', model: context.llmClient.providerId, promptVersion: '1.0' }],
            evidenceEdges: evalResult.validEdges
         };
      };

      const mapEntities = (sourceArray: any[], targetArray: any[], skipClaims: string[] = []) => {
         for (const item of sourceArray || []) {
            const id = item.id || randomUUID();
            const hydratedItem: any = { id };
            // Hydrate string properties into Claims
            for (const key of Object.keys(item)) {
               if (key !== 'id') {
                  if (skipClaims.includes(key)) {
                     hydratedItem[key] = item[key];
                  } else {
                     hydratedItem[key] = buildClaim(id, key, item[key], []);
                  }
               }
            }
            targetArray.push(hydratedItem);
         }
      };

      mapEntities(storageRis.domains, newGraph.domains);
      mapEntities(storageRis.services, newGraph.services);
      mapEntities(storageRis.capabilities, newGraph.capabilities);
      mapEntities(storageRis.workflows, newGraph.workflows);
      mapEntities(storageRis.businessRules, newGraph.businessRules);
      mapEntities(storageRis.constraints, newGraph.constraints);
      mapEntities(storageRis.dependencies, newGraph.dependencies, ['name']);
      mapEntities(storageRis.risks, newGraph.risks);
      mapEntities(storageRis.integrations, newGraph.integrations);
      mapEntities(storageRis.decisions, newGraph.decisions);
      mapEntities(storageRis.assumptions, newGraph.assumptions);

      // 7. Save
      await context.storage.save(newGraph);
      context.logger.info("Repository Intelligence State saved successfully.");

    } finally {
      await context.storage.releaseLock();
    }
  }

  async validate(context: ExecutionContext): Promise<ValidationResult> {
    return { isValid: true, errors: [], warnings: [] };
  }

  async serve(context: ExecutionContext): Promise<void> {
    throw new Error("serve should be handled by the CLI and MCP Server explicitly.");
  }
}
