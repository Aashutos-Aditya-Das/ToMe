import { jest } from '@jest/globals';
import { Command } from 'commander';
import { makeInitCommand } from '../../../src/cli/commands/init.js';
import { makeGenerateCommand } from '../../../src/cli/commands/generate.js';
import { makeStatusCommand } from '../../../src/cli/commands/status.js';
import { makeDoctorCommand } from '../../../src/cli/commands/doctor.js';
import { TomeError, handleError } from '../../../src/cli/errors.js';
import { ExitCode } from '../../../src/domain/constants.js';
import { run } from '../../../src/cli/index.js';

describe('CLI Commands Registration', () => {
  test('init command is registered', () => {
    const cmd = makeInitCommand();
    expect(cmd.name()).toBe('init');
  });
  
  test('generate command is registered', () => {
    const cmd = makeGenerateCommand();
    expect(cmd.name()).toBe('generate');
  });

  test('status command is registered', () => {
    const cmd = makeStatusCommand();
    expect(cmd.name()).toBe('status');
  });

  test('doctor command is registered', () => {
    const cmd = makeDoctorCommand();
    expect(cmd.name()).toBe('doctor');
  });
});

describe('CLI Routing and Invalid Commands', () => {
  let exitSpy: ReturnType<typeof jest.spyOn>;
  let errorSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(((_code?: string | number | null) => undefined as never));
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('unknown command throws USER_ERROR', async () => {
    await run(['node', 'tome', 'unknown-cmd']);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Error: error: unknown command 'unknown-cmd'"));
    expect(exitSpy).toHaveBeenCalledWith(ExitCode.USER_ERROR);
  });
});

describe('Error Handler', () => {
  let exitSpy: ReturnType<typeof jest.spyOn>;
  let errorSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(((_code?: string | number | null) => undefined as never));
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('handles TomeError specifically', () => {
    const err = new TomeError('test config error', ExitCode.CONFIG_ERROR);
    handleError(err);
    expect(errorSpy).toHaveBeenCalledWith('Error: test config error');
    expect(exitSpy).toHaveBeenCalledWith(ExitCode.CONFIG_ERROR);
  });

  test('handles unexpected RepoError strings', () => {
    const err = new Error('NotARepositoryError: bad repo');
    handleError(err);
    expect(errorSpy).toHaveBeenCalledWith('Unexpected Error: NotARepositoryError: bad repo');
    expect(exitSpy).toHaveBeenCalledWith(ExitCode.REPO_ERROR);
  });

  test('handles completely unknown errors', () => {
    handleError(new Error('Unknown failure'));
    expect(exitSpy).toHaveBeenCalledWith(ExitCode.SYSTEM_ERROR);
  });
});
