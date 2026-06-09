/**
 * src/domain/claim.ts
 * Runtime logic for the Claim<T> object.
 */

import { Claim, ProvenanceRecord } from './interfaces.js';
import { ClaimStatus, DerivationMethod, ConfidenceLevel } from './constants.js';

/**
 * Creates a fresh Claim object with an initial provenance record.
 */
export function createClaim<T>(
  entityId: string,
  attribute: string,
  value: T,
  metadata: { model: string; promptVersion: string; tomeVersion: string },
  derivation: DerivationMethod = DerivationMethod.LLM_INFERRED
): Claim<T> {
  const initialProvenance: ProvenanceRecord = {
    timestamp: new Date().toISOString(),
    tomeVersion: metadata.tomeVersion,
    model: metadata.model,
    promptVersion: metadata.promptVersion,
  };

  return {
    id: crypto.randomUUID(),
    risEntityId: entityId,
    attributeName: attribute,
    value,
    status: ClaimStatus.GENERATED,
    derivation,
    confidence: {
      level: ConfidenceLevel.UNVERIFIED,
      numericValue: 0.0,
    },
    provenance: [initialProvenance],
    evidenceEdges: [],
  };
}
