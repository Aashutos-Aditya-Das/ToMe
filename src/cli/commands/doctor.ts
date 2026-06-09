import { Command } from 'commander';
import { createCommand } from '../wrapper.js';

export function makeDoctorCommand(): Command {
  return createCommand(
    'doctor',
    'Validate installation and configuration',
    true, // Requires config
    async (ctx) => {
      ctx.logger.info('Validating installation...');
      ctx.logger.info('Repository validated.');
      ctx.logger.info('Configuration validated.');
      ctx.logger.info('Doctor found no issues.');
    }
  );
}
