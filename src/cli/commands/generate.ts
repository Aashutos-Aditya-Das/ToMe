import { Command } from 'commander';
import { createCommand } from '../wrapper.js';

export function makeGenerateCommand(): Command {
  return createCommand(
    'generate',
    'Generate repository intelligence',
    true, // Requires config
    async (ctx) => {
      ctx.logger.info(`Repository validated. Configuration loaded. Dependencies constructed for ${ctx.workspaceRoot}`);
      // Future: orchestrator.generate()
    }
  );
}
