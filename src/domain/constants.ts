/**
 * src/domain/constants.ts
 * Shared constants: Exit codes, Lifecycle states, Confidence levels, Derivation methods.
 * Authoritative source: TOME_ARCHITECTURE_AMENDMENT_v1
 */

/**
 * Unified Exit Code Table
 */
export enum ExitCode {
  SUCCESS = 0,
  USER_ERROR = 1,
  CONFIG_ERROR = 2,
  REPO_ERROR = 3,
  PROVIDER_ERROR = 4,
  DATA_ERROR = 5,
  SYSTEM_ERROR = 6,
}

/**
 * Claim Derivation Methods
 */
export enum DerivationMethod {
  OBSERVED_STRUCTURAL = 'OBSERVED_STRUCTURAL',
  LLM_INFERRED = 'LLM_INFERRED',
  HUMAN_ASSERTED = 'HUMAN_ASSERTED',
}

/**
 * Claim Lifecycle Status
 */
export enum ClaimStatus {
  GENERATED = 'GENERATED',
  VALIDATED = 'VALIDATED',
  DIRTY = 'DIRTY',
  RECALCULATING = 'RECALCULATING',
  ORPHANED = 'ORPHANED',
  ORPHANED_HUMAN = 'ORPHANED_HUMAN',
  CHALLENGED = 'CHALLENGED',
  CONTRADICTED = 'CONTRADICTED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Confidence Levels
 */
export enum ConfidenceLevel {
  HUMAN_ASSERTED = 'HUMAN_ASSERTED',
  OBSERVED = 'OBSERVED',
  HIGH = 'HIGH',
  MODERATE = 'MODERATE',
  LOW = 'LOW',
  UNVERIFIED = 'UNVERIFIED',
}

/**
 * Evidence Node Types
 */
export enum EvidenceNodeType {
  CODE_NODE = 'CODE_NODE',
  DEPENDENCY = 'DEPENDENCY',
  ENV_VAR = 'ENV_VAR',
  CONFIG_FILE = 'CONFIG_FILE',
  HUMAN_INPUT = 'HUMAN_INPUT',
}

/**
 * Evidence Edge Relationships
 */
export enum EvidenceRelationship {
  PROVES = 'PROVES',
  SUPPORTS = 'SUPPORTS',
  CONTRADICTS = 'CONTRADICTS',
}
