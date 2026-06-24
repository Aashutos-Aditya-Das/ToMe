import { ExitCode } from '../domain/constants.js';

export class TomeError extends Error {
  constructor(message: string, public readonly exitCode: ExitCode) {
    super(message);
    this.name = 'TomeError';
  }
}

export function handleError(error: unknown): never {
  if (error instanceof TomeError) {
    console.error(`Error: ${error.message}`);
    process.exit(error.exitCode);
  }
  
  if (error instanceof Error) {
    console.error(`Unexpected Error: ${error.message}`);
    if (error.message.includes('RepoError') || error.message.includes('NotARepositoryError')) {
      process.exit(ExitCode.REPO_ERROR);
    }
    if (error.message.includes('DataError')) {
      process.exit(ExitCode.DATA_ERROR);
    }
  }

  console.error('System Error: An unknown error occurred.', error);
  process.exit(ExitCode.SYSTEM_ERROR);
}
