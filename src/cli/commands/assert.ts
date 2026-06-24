import { Command } from 'commander';
import { buildContext } from '../container.js';
import { ClaimStatus, ConfidenceLevel } from '../../domain/constants.js';
import { handleError } from '../errors.js';

export function makeAssertCommand(): Command {
  return new Command('assert')
    .description('Manually override an architectural claim with a human assertion')
    .requiredOption('--claim <id>', 'The ID of the claim to override')
    .requiredOption('--value <value>', 'The new value for the claim')
    .action(async (options) => {
      try {
        const ctx = await buildContext(process.cwd(), true);
        await ctx.storage.acquireLock();
        try {
          const graph = await ctx.storage.load();
          let found = false;

          const updateClaim = (entities: any[]) => {
             for (const entity of entities) {
               for (const [key, value] of Object.entries(entity)) {
                 if (value && typeof value === 'object' && 'id' in value) {
                   const claim = value as any;
                   if (claim.id === options.claim || claim.description?.id === options.claim) {
                     const target = claim.id === options.claim ? claim : claim.description;
                     target.value = options.value;
                     target.derivation = 'HUMAN_ASSERTED';
                     target.status = ClaimStatus.VALIDATED;
                     target.confidence = { level: ConfidenceLevel.HUMAN_ASSERTED, numericValue: 1.0 };
                     found = true;
                   }
                 }
               }
             }
          };

          updateClaim(graph.domains || []);
          updateClaim(graph.services || []);
          updateClaim(graph.capabilities || []);

          if (!found) {
            ctx.logger.error(`Claim ${options.claim} not found.`);
            process.exit(1);
          }

          await ctx.storage.save(graph);
          ctx.logger.info(`Successfully asserted claim ${options.claim} to HUMAN_ASSERTED.`);
        } finally {
          await ctx.storage.releaseLock();
        }
      } catch (err) {
        handleError(err);
      }
    });
}
