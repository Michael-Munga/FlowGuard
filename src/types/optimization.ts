/** Public optimization contracts. Solver implementation details stay server-side. */

export type PolicyState = "AUTO_EXECUTABLE" | "APPROVAL_REQUIRED" | "BLOCKED_BY_POLICY";

export interface OptimizationCandidate {
  candidateId: string;
  actionType: string;
  targetOrders: string[];
  targetPositions: string[];
  score: number;
  expectedTurnaroundChangeMin: number;
  expectedQueueChangeMin: number;
  expectedRiskChangePts: number;
  constraintStatus: string;
  explanation: string;
}

export interface OptimizationDecision {
  decisionId: string;
  depotId: string;
  createdAt: string;
  solverStatus: string;
  solveTimeMs: number;
  policyState: PolicyState;
  decisionStatus: string;
  selectedCandidate: OptimizationCandidate | null;
  policyReasons: string[];
  isSimulation: boolean;
}

export interface OptimizationRepository {
  solveDepotOptimization(depotId: string, forceNew?: boolean): Promise<OptimizationDecision>;
  getOptimizationDecision(decisionId: string): Promise<OptimizationDecision>;
  getOptimizationCandidates(decisionId: string): Promise<OptimizationCandidate[]>;
  approveOptimizationDecision(decisionId: string, operatorId: string, comments?: string): Promise<OptimizationDecision>;
}
