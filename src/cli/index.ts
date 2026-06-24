#!/usr/bin/env node
import { Command } from 'commander';
import { handleError, TomeError } from './errors.js';
import { makeInitCommand } from './commands/init.js';
import { makeGenerateCommand } from './commands/generate.js';
import { makeUpdateCommand } from './commands/update.js';
import { makeStatusCommand } from './commands/status.js';
import { makeDoctorCommand } from './commands/doctor.js';
import { makeAssertCommand } from './commands/assert.js';
import { makeServeCommand } from './commands/serve.js';
import url from 'node:url';
import { ExitCode } from '../domain/constants.js';

export async function run(argv: string[]) {
  const program = new Command();

  program
    .name('tome')
    .description('ToMe CLI - Repository Intelligence State (RIS) Engine')
    .version('1.0.3')
    .exitOverride()
    .configureOutput({
      writeErr: (str) => {
        throw new TomeError(str.trim(), ExitCode.USER_ERROR);
      }
    });

  program.addCommand(makeInitCommand());
  program.addCommand(makeGenerateCommand());
  program.addCommand(makeUpdateCommand());
  program.addCommand(makeStatusCommand());
  program.addCommand(makeDoctorCommand());
  program.addCommand(makeAssertCommand());
  program.addCommand(makeServeCommand());

  try {
    await program.parseAsync(argv);
  } catch (err) {
    handleError(err);
  }
}

if (import.meta.url.startsWith('file:') && process.argv[1] === url.fileURLToPath(import.meta.url)) {
  run(process.argv).catch(handleError);
}
