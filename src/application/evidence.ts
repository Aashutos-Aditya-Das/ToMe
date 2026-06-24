import { 
  Claim, 
  ConfidenceScore, 
  EvidenceEdge, 
  EvidenceNode, 
  RepositoryModel
} from '../domain/interfaces.js';
import { 
  ClaimStatus, 
  EvidenceNodeType,
  ConfidenceLevel,
  DerivationMethod,
  EvidenceRelationship 
} from '../domain/constants.js';

export class EvidenceEngine {
  constructor(private readonly repo: RepositoryModel) {}

  /**
   * Evaluates a claim and calculates its confidence score based on structural evidence.
   */
  public evaluateClaim<T>(
    value: T, 
    derivation: DerivationMethod, 
    evidenceEdges: EvidenceEdge[], 
    evidenceNodes: Map<string, EvidenceNode>
  ): { status: ClaimStatus; confidence: ConfidenceScore; validEdges: EvidenceEdge[] } {
    
    if (derivation === 'HUMAN_ASSERTED') {
      return {
        status: ClaimStatus.VALIDATED,
        confidence: { level: ConfidenceLevel.HUMAN_ASSERTED, numericValue: 1.0 },
        validEdges: evidenceEdges
      };
    }

    if (derivation === 'OBSERVED_STRUCTURAL') {
      return {
        status: ClaimStatus.VALIDATED,
        confidence: { level: ConfidenceLevel.OBSERVED, numericValue: 1.0 },
        validEdges: evidenceEdges
      };
    }

    // Phantom Node Rule: Filter out evidence edges that point to non-existent code nodes
    const validEdges: EvidenceEdge[] = [];
    for (const edge of evidenceEdges) {
      const node = evidenceNodes.get(edge.fromEvidenceNodeId);
      if (!node) continue;
      
      if (node.type === EvidenceNodeType.CODE_NODE) {
        if (this.repo.getSymbolByFQN(node.referenceId) || this.repo.files.has(node.referenceId)) {
          validEdges.push(edge);
        }
      } else {
        // Assume other node types (dependencies, env vars) exist for now 
        // (In a full implementation, these would be validated against package.json, etc.)
        validEdges.push(edge);
      }
    }

    if (validEdges.length === 0) {
       // The Minimum Support Rule
       return {
         status: ClaimStatus.ORPHANED,
         confidence: { level: ConfidenceLevel.UNVERIFIED, numericValue: 0.0 },
         validEdges: []
       };
    }

    // Calculate score
    let score = 0.5; // Base
    let positiveCount = 0;

    for (const edge of validEdges) {
      if (edge.relationship === EvidenceRelationship.SUPPORTS || edge.relationship === EvidenceRelationship.PROVES) {
         if (positiveCount < 4) { // Capped at +0.4
           score += 0.1;
           positiveCount++;
         }
      } else if (edge.relationship === EvidenceRelationship.CONTRADICTS) {
         score -= 0.2;
      }
    }

    // Clamp
    score = Math.max(0.0, Math.min(0.98, score));

    let level = ConfidenceLevel.UNVERIFIED;
    if (score >= 0.8) level = ConfidenceLevel.HIGH;
    else if (score >= 0.5) level = ConfidenceLevel.MODERATE;
    else if (score >= 0.2) level = ConfidenceLevel.LOW;

    return {
      status: ClaimStatus.VALIDATED,
      confidence: { level, numericValue: score },
      validEdges
    };
  }

  /**
   * Re-evaluates an existing claim against the current repository state
   */
  public reevaluate<T>(claim: Claim<T>, evidenceNodes: Map<string, EvidenceNode>): Claim<T> {
    if (claim.derivation === 'HUMAN_ASSERTED') {
      const result = this.evaluateClaim(claim.value, claim.derivation, claim.evidenceEdges, evidenceNodes);
      // If evidence disappeared but it's human, it becomes CHALLENGED or ORPHANED_HUMAN
      if (result.status === ClaimStatus.ORPHANED) {
         return { ...claim, status: ClaimStatus.ORPHANED_HUMAN };
      }
      return { ...claim, status: ClaimStatus.VALIDATED };
    }

    const result = this.evaluateClaim(claim.value, claim.derivation, claim.evidenceEdges, evidenceNodes);
    return {
      ...claim,
      status: result.status,
      confidence: result.confidence,
      evidenceEdges: result.validEdges
    };
  }
}
