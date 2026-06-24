import { Command } from 'commander';
import { createCommand } from '../wrapper.js';
import * as path from 'node:path';

export function makeInitCommand(): Command {
  return createCommand(
    'init',
    'Initialize ToMe in the current repository',
    false, // Does not require config
    async (ctx) => {
      const tomeDir = path.join(ctx.workspaceRoot, '.tome');
      if (await ctx.fileSystem.exists(tomeDir)) {
        ctx.logger.info('ToMe is already initialized.');
        return;
      }

      await ctx.fileSystem.mkdir(tomeDir);
      const defaultConfig = {
        provider: { primary: "gemini" },
        model: "gemini-flash-lite-latest",
        extraction: { mode: "STANDARD", maxFiles: 500, maxCostPerRun: 5, maxConcurrency: 5 },
        parser: { ignorePatterns: ["node_modules", ".git", "dist", "build", "*.min.js", "venv", ".venv", "__pycache__", ".next", ".cache", "vendor", "google-cloud-sdk", "tmp", ".idea", ".vscode"] },
        storage: { preserveOrphansForCycles: 5 },
        mcp: { enabled: true }
      };
      await ctx.fileSystem.writeFile(path.join(tomeDir, 'config.json'), JSON.stringify(defaultConfig, null, 2));
      ctx.logger.info(`Initialized ToMe at ${tomeDir} with default configuration.`);
    }
  );
}
