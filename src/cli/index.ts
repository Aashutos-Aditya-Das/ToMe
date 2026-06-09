import { Command } from 'commander';
import { handleError, TomeError } from './errors.js';
import { makeInitCommand } from './commands/init.js';
import { makeGenerateCommand } from './commands/generate.js';
import { makeStatusCommand } from './commands/status.js';
import { makeDoctorCommand } from './commands/doctor.js';
import url from 'node:url';
import { ExitCode } from '../domain/constants.js';

export async function run(argv: string[]) {
  const program = new Command('tome')
    .version('1.0.0')
    .description('ToMe: Stateless, local-first repository intelligence engine')
    .exitOverride()
    .configureOutput({
      writeErr: (str) => {
        throw new TomeError(str.trim(), ExitCode.USER_ERROR);
      }
    });

  program.addCommand(makeInitCommand());
  program.addCommand(makeGenerateCommand());
  program.addCommand(makeStatusCommand());
  program.addCommand(makeDoctorCommand());

  // Handle unknown commands gracefully by leveraging standard Commander behavior
  // or explicitly if needed. By default, exitOverride with configureOutput handles it.

  try {
    await program.parseAsync(argv);
  } catch (err) {
    handleError(err);
  }
}

// If executed directly
if (import.meta.url.startsWith('file:') && process.argv[1] === url.fileURLToPath(import.meta.url)) {
  run(process.argv).catch(handleError);
}
