import { Command } from 'commander';
import { CliContext, buildContext } from './container.js';
import { handleError } from './errors.js';

type CommandAction = (ctx: CliContext, options: Record<string, unknown>) => Promise<void>;

export function createCommand(name: string, description: string, requireConfig: boolean, action: CommandAction): Command {
  return new Command(name)
    .description(description)
    .action(async (options: Record<string, unknown>) => {
      try {
        const ctx = await buildContext(process.cwd(), requireConfig);
        await action(ctx, options);
      } catch (err) {
        handleError(err);
      }
    });
}
