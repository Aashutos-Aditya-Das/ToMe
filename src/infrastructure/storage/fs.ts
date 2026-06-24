import * as path from 'node:path';

/**
 * Common path constants and utilities for the ToMe storage layer.
 */
export const TOME_DIR = '.tome';
export const RIS_STATE_FILE = '.ris-state.json';
export const LOCK_FILE = '.lock';
export const BACKUP_DIR = '.backup';
export const CACHE_DIR = '.cache';
export const LOGS_DIR = '.logs';

export const ARTIFACT_FILES = [
  'architect.md',
  'memory.md',
  'guardrails.md',
  'recover.md',
  'walkthrough.md'
];

/**
 * Returns the absolute path to the .tome directory.
 */
export function getTomeDirPath(workspaceRoot: string): string {
  return path.join(workspaceRoot, TOME_DIR);
}
