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
      ctx.logger.info(`Initialized ToMe at ${tomeDir}`);
    }
  );
}
