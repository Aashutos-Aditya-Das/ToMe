import { Command } from 'commander';
import { createCommand } from '../wrapper.js';

export function makeStatusCommand(): Command {
  return createCommand(
    'status',
    'Show repository intelligence status',
    true, // Requires config
    async (ctx) => {
      // The architecture specifies: "Commands must not inspect RISGraph internals."
      // The CLI should just route to a domain service or output generic success information.
      // We will just verify it loads.
      await ctx.storage.load();
      ctx.logger.info(`Status: Valid. RIS Graph loaded successfully.`);
    }
  );
}
