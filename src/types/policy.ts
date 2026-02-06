export type DecisionResult = 'ALLOW' | 'BLOCK' | 'REVIEW';

export type ConditionOperator = 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';

export type PolicyScope = Record<string, string | number | boolean>;

export interface ShowWhenCondition {
  questionId: string;
  operator: ConditionOperator;
  value: string | number | boolean;
}

export interface PolicyStep {
  questionId: string;
  showWhen?: ShowWhenCondition;
}

export interface RuleCondition {
  field: string; // e.g. "$answers.q_driver_worked"
  operator: ConditionOperator;
  value: string | number | boolean;
}

export interface RuleGroup {
  logic: 'AND' | 'OR';
  conditions: RuleCondition[];
}

export interface DecisionRule {
  when: RuleGroup;
  result: DecisionResult;
  reason: string;
}

export interface PolicyDecision {
  rules: DecisionRule[];
  defaultResult: DecisionResult;
  defaultReason: string;
}

export interface Policy {
  id: string;
  key: string;
  name: string;
  scope: PolicyScope;
  steps: PolicyStep[];
  decision: PolicyDecision;
}
