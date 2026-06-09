import { LocalFileSystem } from '../adapters/storage/local-fs.js';
import { WorkspaceRootResolver } from '../infrastructure/discovery/workspace-root.js';
import { RepositoryDiscovery } from '../infrastructure/discovery/discovery.js';
import { ParserEngine } from '../infrastructure/parser/engine.js';
import { StorageOrchestrator } from '../infrastructure/storage/orchestrator.js';
import { ResolvedConfiguration, ILogger, IFileSystem, IParserEngine, IStorageOrchestrator } from '../domain/interfaces.js';
import { ConfigurationSchema } from '../domain/schemas.js';
import { ExitCode } from '../domain/constants.js';
import { TomeError } from './errors.js';
import * as path from 'node:path';

class ConsoleLogger implements ILogger {
  debug(msg: string) { console.debug(msg); }
  info(msg: string) { console.info(msg); }
  warn(msg: string) { console.warn(msg); }
  error(msg: string, err?: Error) {
    if (err) {
       console.error(msg, err);
    } else {
       console.error(msg);
    }
  }
}

export interface CliContext {
  workspaceRoot: string;
  config?: ResolvedConfiguration;
  logger: ILogger;
  fileSystem: IFileSystem;
  discovery?: RepositoryDiscovery;
  parser?: IParserEngine;
  storage: IStorageOrchestrator;
}

export async function buildContext(cwd: string, requireConfig: boolean = true): Promise<CliContext> {
  const fs = new LocalFileSystem();
  const logger = new ConsoleLogger();
  const supportedExtensions = ['.ts', '.tsx', '.py', '.pyw'];
  
  // Step 1: Discover workspace root (independent of configuration)
  const rootResolver = new WorkspaceRootResolver(fs);
  const workspaceRoot = await rootResolver.resolve(cwd);
  
  const tomeDirPath = path.join(workspaceRoot, '.tome');
  const configPath = path.join(tomeDirPath, 'config.json');

  // Step 2: Load configuration
  let config: ResolvedConfiguration | undefined;
  
  if (await fs.exists(configPath)) {
    const content = await fs.readFile(configPath);
    config = ConfigurationSchema.parse(JSON.parse(content));
  }

  if (requireConfig && !config) {
     throw new TomeError('Configuration missing. Please run init.', ExitCode.CONFIG_ERROR);
  }

  // Step 3: Construct core services
  const storage = new StorageOrchestrator(fs, tomeDirPath);
  
  let discovery: RepositoryDiscovery | undefined;
  let parser: IParserEngine | undefined;

  // Step 4: Construct config-dependent services
  if (config) {
    discovery = new RepositoryDiscovery(fs, config, supportedExtensions);
    parser = new ParserEngine(fs, logger, config);
  }

  return {
    workspaceRoot,
    config,
    logger,
    fileSystem: fs,
    discovery,
    parser,
    storage
  };
}
