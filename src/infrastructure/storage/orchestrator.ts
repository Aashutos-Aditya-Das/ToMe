import * as path from 'node:path';
import { 
  IStorageOrchestrator, 
  RISGraph, 
  IFileSystem, 
  Claim, 
  EvidenceEdge,
  StorageRIS,
  StorageDomain,
  StorageService,
  StorageCapability,
  StorageWorkflow,
  StorageBusinessRule,
  StorageConstraint,
  StorageDependency,
  StorageRisk,
  StorageIntegration,
  StorageDecision,
  StorageAssumption
} from '../../domain/interfaces.js';
import { RISStateSchema } from '../../domain/schemas.js';
import { MarkdownStore } from '../../adapters/storage/markdown-store.js';

export class StorageOrchestrator implements IStorageOrchestrator {
  private readonly risFileName = '.ris-state.json';
  private readonly lockFileName = '.lock';
  private readonly backupDir = '.backup';
  private readonly backupFileName = '.ris-state.backup.json';
  private readonly markdownStore = new MarkdownStore();

  constructor(
    private readonly fs: IFileSystem,
    private readonly tomeDirPath: string
  ) {}

  async load(): Promise<RISGraph> {
    const risPath = path.join(this.tomeDirPath, this.risFileName);
    
    if (!(await this.fs.exists(risPath))) {
      throw new Error(`DataError: Canonical RIS database not found at ${risPath}`);
    }

    const raw = await this.fs.readFile(risPath);
    const parsed = JSON.parse(raw);
    const storageDto = RISStateSchema.parse(parsed) as unknown as StorageRIS;

    return this.hydrate(storageDto);
  }

  async save(graph: RISGraph): Promise<void> {
    // 1. Dehydration & Validation
    const storageDto = this.dehydrate(graph);
    RISStateSchema.parse(storageDto);

    // 2. Prepare Atomic Sequence
    const artifactContents: Record<string, string> = {}; 
    const artifacts = this.markdownStore.serializeArtifacts(graph, artifactContents);

    try {
      // 3. Write Artifact .tmp files
      for (const artifact of artifacts) {
        const tmpPath = path.join(this.tomeDirPath, `${artifact.fileName}.tmp`);
        await this.fs.writeFile(tmpPath, artifact.content);
      }

      // 4. Rename Artifacts
      for (const artifact of artifacts) {
        const tmpPath = path.join(this.tomeDirPath, `${artifact.fileName}.tmp`);
        const finalPath = path.join(this.tomeDirPath, artifact.fileName);
        await this.fs.rename(tmpPath, finalPath);
      }

      // 5. Write RIS .tmp
      const risTmpPath = path.join(this.tomeDirPath, `${this.risFileName}.tmp`);
      const serializedRis = this.deterministicStringify(storageDto);
      await this.fs.writeFile(risTmpPath, serializedRis);

      // 6. Final RIS Rename (Last)
      const risFinalPath = path.join(this.tomeDirPath, this.risFileName);
      await this.fs.rename(risTmpPath, risFinalPath);

    } catch (err: unknown) {
      // Clean up tmp files on failure
      for (const artifact of artifacts) {
        const tmpPath = path.join(this.tomeDirPath, `${artifact.fileName}.tmp`);
        if (await this.fs.exists(tmpPath)) await this.fs.remove(tmpPath);
      }
      const risTmpPath = path.join(this.tomeDirPath, `${this.risFileName}.tmp`);
      if (await this.fs.exists(risTmpPath)) await this.fs.remove(risTmpPath);
      
      throw err;
    }
  }

  async backup(): Promise<void> {
    const risPath = path.join(this.tomeDirPath, this.risFileName);
    const backupDirPath = path.join(this.tomeDirPath, this.backupDir);
    const backupPath = path.join(backupDirPath, this.backupFileName);

    if (!(await this.fs.exists(risPath))) return;

    if (!(await this.fs.exists(backupDirPath))) {
      await this.fs.mkdir(backupDirPath);
    }
    const content = await this.fs.readFile(risPath);
    await this.fs.writeFile(backupPath, content);
  }

  async restore(): Promise<void> {
    const backupPath = path.join(this.tomeDirPath, this.backupDir, this.backupFileName);
    const risPath = path.join(this.tomeDirPath, this.risFileName);

    if (!(await this.fs.exists(backupPath))) {
      throw new Error(`DataError: Backup file not found at ${backupPath}`);
    }

    const content = await this.fs.readFile(backupPath);
    await this.fs.writeFile(risPath, content);
  }

  async acquireLock(): Promise<void> {
    const lockPath = path.join(this.tomeDirPath, this.lockFileName);
    
    if (await this.fs.exists(lockPath)) {
      const pidStr = await this.fs.readFile(lockPath);
      const pid = parseInt(pidStr, 10);
      
      if (!isNaN(pid) && this.isProcessAlive(pid)) {
        throw new Error(`StorageLockedError: Another ToMe process (PID: ${pid}) is currently updating this repository.`);
      }
    }

    await this.fs.writeFile(lockPath, process.pid.toString());
  }

  async releaseLock(): Promise<void> {
    const lockPath = path.join(this.tomeDirPath, this.lockFileName);
    if (await this.fs.exists(lockPath)) {
      await this.fs.remove(lockPath);
    }
  }

  private isProcessAlive(pid: number): boolean {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  }

  private hydrate(dto: StorageRIS): RISGraph {
    const claimMap = new Map<string, Omit<Claim<unknown>, 'value' | 'evidenceEdges'>>();
    for (const c of dto.claims) {
      claimMap.set(`${c.risEntityId}_${c.attributeName}`, c);
    }

    const edgeMap = new Map<string, EvidenceEdge[]>();
    for (const e of dto.evidenceEdges) {
      const edges = edgeMap.get(e.toClaimId) || [];
      edges.push(e);
      edgeMap.set(e.toClaimId, edges);
    }

    const hydrateClaim = <T>(entityId: string, attr: string, value: T): Claim<T> => {
      const storageClaim = claimMap.get(`${entityId}_${attr}`);
      if (!storageClaim) {
        throw new Error(`DataError: Missing storage claim for ${entityId}.${attr}`);
      }
      return {
        ...storageClaim,
        value,
        evidenceEdges: edgeMap.get(storageClaim.id) || []
      } as Claim<T>;
    };

    return {
      meta: dto.meta,
      domains: dto.domains.map((d: StorageDomain) => ({
        id: d.id,
        name: hydrateClaim(d.id, 'name', d.name),
        description: hydrateClaim(d.id, 'description', d.description)
      })),
      services: dto.services.map((s: StorageService) => ({
        id: s.id,
        name: hydrateClaim(s.id, 'name', s.name),
        description: hydrateClaim(s.id, 'description', s.description),
        domainId: hydrateClaim(s.id, 'domainId', s.domainId),
        isExternal: hydrateClaim(s.id, 'isExternal', s.isExternal)
      })),
      capabilities: dto.capabilities.map((c: StorageCapability) => ({
        id: c.id,
        name: hydrateClaim(c.id, 'name', c.name),
        description: hydrateClaim(c.id, 'description', c.description),
        serviceId: hydrateClaim(c.id, 'serviceId', c.serviceId)
      })),
      workflows: dto.workflows.map((w: StorageWorkflow) => ({
        id: w.id,
        name: hydrateClaim(w.id, 'name', w.name),
        description: hydrateClaim(w.id, 'description', w.description),
        trigger: hydrateClaim(w.id, 'trigger', w.trigger),
        steps: hydrateClaim(w.id, 'steps', w.steps)
      })),
      businessRules: dto.businessRules.map((b: StorageBusinessRule) => ({
        id: b.id,
        name: hydrateClaim(b.id, 'name', b.name),
        description: hydrateClaim(b.id, 'description', b.description),
        condition: hydrateClaim(b.id, 'condition', b.condition),
        enforcement: hydrateClaim(b.id, 'enforcement', b.enforcement)
      })),
      constraints: dto.constraints.map((c: StorageConstraint) => ({
        id: c.id,
        name: hydrateClaim(c.id, 'name', c.name),
        description: hydrateClaim(c.id, 'description', c.description),
        type: hydrateClaim(c.id, 'type', c.type)
      })),
      dependencies: dto.dependencies.map((d: StorageDependency) => ({
        id: d.id,
        name: d.name,
        description: hydrateClaim(d.id, 'description', d.description),
        sourceId: hydrateClaim(d.id, 'sourceId', d.sourceId),
        targetId: hydrateClaim(d.id, 'targetId', d.targetId),
        criticality: hydrateClaim(d.id, 'criticality', d.criticality)
      })),
      risks: dto.risks.map((r: StorageRisk) => ({
        id: r.id,
        name: hydrateClaim(r.id, 'name', r.name),
        description: hydrateClaim(r.id, 'description', r.description),
        impact: hydrateClaim(r.id, 'impact', r.impact),
        likelihood: hydrateClaim(r.id, 'likelihood', r.likelihood),
        mitigation: hydrateClaim(r.id, 'mitigation', r.mitigation)
      })),
      integrations: dto.integrations.map((i: StorageIntegration) => ({
        id: i.id,
        name: hydrateClaim(i.id, 'name', i.name),
        description: hydrateClaim(i.id, 'description', i.description),
        type: hydrateClaim(i.id, 'type', i.type),
        protocol: hydrateClaim(i.id, 'protocol', i.protocol)
      })),
      decisions: dto.decisions.map((d: StorageDecision) => ({
        id: d.id,
        name: hydrateClaim(d.id, 'name', d.name),
        description: hydrateClaim(d.id, 'description', d.description),
        decisionText: hydrateClaim(d.id, 'decisionText', d.decisionText),
        context: hydrateClaim(d.id, 'context', d.context),
        consequences: hydrateClaim(d.id, 'consequences', d.consequences),
        status: hydrateClaim(d.id, 'status', d.status)
      })),
      assumptions: dto.assumptions.map((a: StorageAssumption) => ({
        id: a.id,
        name: hydrateClaim(a.id, 'name', a.name),
        description: hydrateClaim(a.id, 'description', a.description),
        text: hydrateClaim(a.id, 'text', a.text),
        decisionId: hydrateClaim(a.id, 'decisionId', a.decisionId),
        confidence: hydrateClaim(a.id, 'confidence', a.confidence),
        validationCriteria: hydrateClaim(a.id, 'validationCriteria', a.validationCriteria)
      })),
      evidenceNodes: dto.evidenceNodes,
      artifactAnchors: dto.artifactAnchors,
      orphanedAssertions: dto.orphanedAssertions
    };
  }

  private dehydrate(graph: RISGraph): StorageRIS {
    const dto: StorageRIS = {
      meta: graph.meta,
      domains: [],
      services: [],
      capabilities: [],
      workflows: [],
      businessRules: [],
      constraints: [],
      dependencies: [],
      risks: [],
      integrations: [],
      decisions: [],
      assumptions: [],
      claims: [],
      evidenceNodes: graph.evidenceNodes,
      evidenceEdges: [],
      artifactAnchors: graph.artifactAnchors,
      orphanedAssertions: graph.orphanedAssertions
    };

    const processClaim = (claim: Claim<unknown>, entity: Record<string, unknown>) => {
      entity[claim.attributeName] = claim.value;
      const { value, evidenceEdges, ...metadata } = claim;
      dto.claims.push(metadata as Omit<Claim<unknown>, 'value' | 'evidenceEdges'>);
      dto.evidenceEdges.push(...evidenceEdges);
    };

    graph.domains.forEach(d => {
      const sd: Partial<StorageDomain> = { id: d.id };
      processClaim(d.name, sd as Record<string, unknown>);
      processClaim(d.description, sd as Record<string, unknown>);
      dto.domains.push(sd as StorageDomain);
    });

    graph.services.forEach(s => {
      const ss: Partial<StorageService> = { id: s.id };
      processClaim(s.name, ss as Record<string, unknown>);
      processClaim(s.description, ss as Record<string, unknown>);
      processClaim(s.domainId, ss as Record<string, unknown>);
      processClaim(s.isExternal, ss as Record<string, unknown>);
      dto.services.push(ss as StorageService);
    });

    graph.capabilities.forEach(c => {
      const sc: Partial<StorageCapability> = { id: c.id };
      processClaim(c.name, sc as Record<string, unknown>);
      processClaim(c.description, sc as Record<string, unknown>);
      processClaim(c.serviceId, sc as Record<string, unknown>);
      dto.capabilities.push(sc as StorageCapability);
    });

    graph.workflows.forEach(w => {
      const sw: Partial<StorageWorkflow> = { id: w.id };
      processClaim(w.name, sw as Record<string, unknown>);
      processClaim(w.description, sw as Record<string, unknown>);
      processClaim(w.trigger, sw as Record<string, unknown>);
      processClaim(w.steps, sw as Record<string, unknown>);
      dto.workflows.push(sw as StorageWorkflow);
    });

    graph.businessRules.forEach(b => {
      const sb: Partial<StorageBusinessRule> = { id: b.id };
      processClaim(b.name, sb as Record<string, unknown>);
      processClaim(b.description, sb as Record<string, unknown>);
      processClaim(b.condition, sb as Record<string, unknown>);
      processClaim(b.enforcement, sb as Record<string, unknown>);
      dto.businessRules.push(sb as StorageBusinessRule);
    });

    graph.constraints.forEach(c => {
      const sc: Partial<StorageConstraint> = { id: c.id };
      processClaim(c.name, sc as Record<string, unknown>);
      processClaim(c.description, sc as Record<string, unknown>);
      processClaim(c.type, sc as Record<string, unknown>);
      dto.constraints.push(sc as StorageConstraint);
    });

    graph.dependencies.forEach(d => {
      const sd: Partial<StorageDependency> = { id: d.id, name: d.name };
      processClaim(d.description, sd as Record<string, unknown>);
      processClaim(d.sourceId, sd as Record<string, unknown>);
      processClaim(d.targetId, sd as Record<string, unknown>);
      processClaim(d.criticality, sd as Record<string, unknown>);
      dto.dependencies.push(sd as StorageDependency);
    });

    graph.risks.forEach(r => {
      const sr: Partial<StorageRisk> = { id: r.id };
      processClaim(r.name, sr as Record<string, unknown>);
      processClaim(r.description, sr as Record<string, unknown>);
      processClaim(r.impact, sr as Record<string, unknown>);
      processClaim(r.likelihood, sr as Record<string, unknown>);
      processClaim(r.mitigation, sr as Record<string, unknown>);
      dto.risks.push(sr as StorageRisk);
    });

    graph.integrations.forEach(i => {
      const si: Partial<StorageIntegration> = { id: i.id };
      processClaim(i.name, si as Record<string, unknown>);
      processClaim(i.description, si as Record<string, unknown>);
      processClaim(i.type, si as Record<string, unknown>);
      processClaim(i.protocol, si as Record<string, unknown>);
      dto.integrations.push(si as StorageIntegration);
    });

    graph.decisions.forEach(d => {
      const sd: Partial<StorageDecision> = { id: d.id };
      processClaim(d.name, sd as Record<string, unknown>);
      processClaim(d.description, sd as Record<string, unknown>);
      processClaim(d.decisionText, sd as Record<string, unknown>);
      processClaim(d.context, sd as Record<string, unknown>);
      processClaim(d.consequences, sd as Record<string, unknown>);
      processClaim(d.status, sd as Record<string, unknown>);
      dto.decisions.push(sd as StorageDecision);
    });

    graph.assumptions.forEach(a => {
      const sa: Partial<StorageAssumption> = { id: a.id };
      processClaim(a.name, sa as Record<string, unknown>);
      processClaim(a.description, sa as Record<string, unknown>);
      processClaim(a.text, sa as Record<string, unknown>);
      processClaim(a.decisionId, sa as Record<string, unknown>);
      processClaim(a.confidence, sa as Record<string, unknown>);
      processClaim(a.validationCriteria, sa as Record<string, unknown>);
      dto.assumptions.push(sa as StorageAssumption);
    });

    return dto;
  }

  private deterministicStringify(obj: unknown): string {
    const sortObject = (o: unknown): unknown => {
      if (Array.isArray(o)) return o.map(sortObject);
      if (o !== null && typeof o === 'object') {
        const record = o as Record<string, unknown>;
        return Object.keys(record)
          .sort()
          .reduce((acc: Record<string, unknown>, key: string) => {
            acc[key] = sortObject(record[key]);
            return acc;
          }, {});
      }
      return o;
    };

    return JSON.stringify(sortObject(obj), null, 2);
  }
}
