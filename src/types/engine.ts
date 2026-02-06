import { DecisionResult } from './policy';

export interface EvaluationContext {
  scope: Record<string, string | number | boolean>;
  policyKey?: string;
}

export type Answers = Record<string, string | number | boolean>;

export interface EvaluationResult {
  result: DecisionResult;
  reason: string;
  answers: Answers;
  policyId: string;
}
