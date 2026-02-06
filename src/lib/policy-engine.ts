import { Policy, DecisionResult, RuleCondition, PolicyStep } from '@/types/policy';
import { EvaluationContext, Answers } from '@/types/engine';

export function scorePolicyScope(
  context: EvaluationContext,
  policy: Policy
): number {
  let score = 0;
  const { scope } = policy;
  const ctxScope = context.scope;

  for (const key of Object.keys(scope)) {
    const policyVal = scope[key];
    const ctxVal = ctxScope[key];

    if (ctxVal === undefined) {
      // Policy requires this key but context doesn't have it → mismatch
      return -1;
    }

    if (String(policyVal) === String(ctxVal)) {
      score += 1;
    } else {
      // Policy value doesn't match context → mismatch
      return -1;
    }
  }

  return score;
}

export function pickPolicy(
  context: EvaluationContext,
  policies: Policy[]
): Policy | null {
  // If policyKey is specified, filter by it first
  const candidates = context.policyKey
    ? policies.filter((p) => p.key === context.policyKey)
    : policies;

  let bestPolicy: Policy | null = null;
  let bestScore = -1;

  for (const policy of candidates) {
    const score = scorePolicyScope(context, policy);
    if (score > bestScore) {
      bestScore = score;
      bestPolicy = policy;
    }
  }

  return bestScore >= 0 ? bestPolicy : null;
}

function resolveFieldValue(field: string, answers: Answers): unknown {
  // field format: "$answers.q_driver_worked"
  const match = field.match(/^\$answers\.(.+)$/);
  if (match) {
    return answers[match[1]];
  }
  return undefined;
}

function evaluateCondition(
  condition: RuleCondition,
  answers: Answers
): boolean {
  const actual = resolveFieldValue(condition.field, answers);
  const expected = condition.value;

  if (actual === undefined) return false;

  switch (condition.operator) {
    case 'eq':
      return actual === expected;
    case 'neq':
      return actual !== expected;
    case 'gt':
      return Number(actual) > Number(expected);
    case 'lt':
      return Number(actual) < Number(expected);
    case 'gte':
      return Number(actual) >= Number(expected);
    case 'lte':
      return Number(actual) <= Number(expected);
    case 'contains':
      return String(actual).includes(String(expected));
    default:
      return false;
  }
}

export function evaluateDecision(
  policy: Policy,
  answers: Answers
): { result: DecisionResult; reason: string } {
  for (const rule of policy.decision.rules) {
    const { logic, conditions } = rule.when;
    let match: boolean;

    if (logic === 'AND') {
      match = conditions.every((c) => evaluateCondition(c, answers));
    } else {
      match = conditions.some((c) => evaluateCondition(c, answers));
    }

    if (match) {
      return { result: rule.result, reason: rule.reason };
    }
  }

  return {
    result: policy.decision.defaultResult,
    reason: policy.decision.defaultReason,
  };
}

export function getVisibleSteps(
  steps: PolicyStep[],
  answers: Answers
): PolicyStep[] {
  return steps.filter((step) => {
    if (!step.showWhen) return true;
    const actual = answers[step.showWhen.questionId];
    if (actual === undefined) return false;
    switch (step.showWhen.operator) {
      case 'eq':
        return actual === step.showWhen.value;
      case 'neq':
        return actual !== step.showWhen.value;
      default:
        return true;
    }
  });
}
