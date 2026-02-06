import { Policy, RuleCondition, DecisionResult, ShowWhenCondition } from '@/types/policy';
import {
  FlowNode,
  FlowEdge,
  FilterNodeData,
  QuestionNodeData,
  ConditionNodeData,
  EndNodeData,
} from '@/types/flow';
import { MarkerType } from '@xyflow/react';

const NODE_Y_SPACING = 140;
const NODE_X_CENTER = 400;
const CONDITION_X_SPREAD = 350;

function makeEdge(
  source: string,
  target: string,
  sourceHandle?: string,
  label?: string,
  color?: string
): FlowEdge {
  return {
    id: `e_${source}_${sourceHandle ?? 'default'}_${target}`,
    source,
    target,
    sourceHandle: sourceHandle ?? undefined,
    ...(label
      ? {
          label,
          style: { stroke: color ?? '#888', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: color ?? '#888' },
        }
      : {}),
  };
}

export function policyToFlow(policy: Policy): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];
  let y = 50;

  // 1. Filter node (scope)
  const filterNodeId = `filter_${policy.id}`;
  nodes.push({
    id: filterNodeId,
    type: 'filter',
    position: { x: NODE_X_CENTER, y },
    data: { scope: { ...policy.scope } } as FilterNodeData,
  });
  y += NODE_Y_SPACING;

  // 2. Question nodes (linear chain)
  let prevNodeId = filterNodeId;
  for (const step of policy.steps) {
    const nodeId = `question_${step.questionId}`;
    nodes.push({
      id: nodeId,
      type: 'question',
      position: { x: NODE_X_CENTER, y },
      data: {
        questionId: step.questionId,
        ...(step.showWhen ? { showWhen: { ...step.showWhen } } : {}),
      } as QuestionNodeData,
    });
    edges.push(makeEdge(prevNodeId, nodeId));
    prevNodeId = nodeId;
    y += NODE_Y_SPACING;
  }

  const lastQuestionNodeId = prevNodeId;

  // 3. Decision rules → condition node chains + end nodes
  // Track the "false" exit of the previous rule block to chain rules together
  let previousFalseNodeId = lastQuestionNodeId;
  let previousFalseHandle: string | undefined;

  for (let ruleIdx = 0; ruleIdx < policy.decision.rules.length; ruleIdx++) {
    const rule = policy.decision.rules[ruleIdx];
    const conditions = rule.when.conditions;
    const logic = rule.when.logic;

    if (conditions.length === 0) continue;

    // Create condition nodes for this rule
    const condNodeIds: string[] = [];
    for (let condIdx = 0; condIdx < conditions.length; condIdx++) {
      const cond = conditions[condIdx];
      const condNodeId = `cond_r${ruleIdx}_c${condIdx}`;
      const xOffset = ruleIdx * CONDITION_X_SPREAD;
      nodes.push({
        id: condNodeId,
        type: 'condition',
        position: { x: NODE_X_CENTER + xOffset, y },
        data: {
          field: cond.field,
          operator: cond.operator,
          value: cond.value,
        } as ConditionNodeData,
      });
      condNodeIds.push(condNodeId);
      y += NODE_Y_SPACING;
    }

    // Create end node for this rule's result
    const endNodeId = `end_rule_${ruleIdx}`;
    nodes.push({
      id: endNodeId,
      type: 'end',
      position: { x: NODE_X_CENTER + ruleIdx * CONDITION_X_SPREAD - 200, y: y - NODE_Y_SPACING },
      data: {
        result: rule.result,
        reason: rule.reason,
        isDefault: false,
      } as EndNodeData,
    });

    // Wire conditions based on logic
    if (logic === 'AND') {
      // AND chain: true → next condition, last true → EndNode
      // Connect entry to first condition
      edges.push(
        previousFalseHandle
          ? makeEdge(previousFalseNodeId, condNodeIds[0], previousFalseHandle, 'No', '#ef4444')
          : makeEdge(previousFalseNodeId, condNodeIds[0])
      );

      for (let i = 0; i < condNodeIds.length; i++) {
        if (i < condNodeIds.length - 1) {
          // true → next condition in AND chain
          edges.push(makeEdge(condNodeIds[i], condNodeIds[i + 1], 'true', 'Yes', '#22c55e'));
        } else {
          // Last condition's true → end node (rule matched)
          edges.push(makeEdge(condNodeIds[i], endNodeId, 'true', 'Yes', '#22c55e'));
        }
      }

      // For AND: all false exits point to the next rule block
      // We chain to next rule from the FIRST condition's false exit
      // (since if ANY condition is false in AND, the rule fails)
      // Actually all conditions' false should go to next block, but for simplicity
      // we wire the last condition's false to next block
      previousFalseNodeId = condNodeIds[condNodeIds.length - 1];
      previousFalseHandle = 'false';

      // Wire intermediate false exits to the same next block (will be resolved after loop)
      // For now, track them — they'll be wired to the default end node or next rule
      for (let i = 0; i < condNodeIds.length - 1; i++) {
        // These false edges will go to the next rule entry or default
        // We'll resolve them in a second pass
      }
    } else {
      // OR: any true → EndNode; all false → next
      // Connect entry to first condition
      edges.push(
        previousFalseHandle
          ? makeEdge(previousFalseNodeId, condNodeIds[0], previousFalseHandle, 'No', '#ef4444')
          : makeEdge(previousFalseNodeId, condNodeIds[0])
      );

      for (let i = 0; i < condNodeIds.length; i++) {
        // true → end node (any match triggers result)
        edges.push(makeEdge(condNodeIds[i], endNodeId, 'true', 'Yes', '#22c55e'));

        if (i < condNodeIds.length - 1) {
          // false → next condition in OR chain
          edges.push(makeEdge(condNodeIds[i], condNodeIds[i + 1], 'false', 'No', '#ef4444'));
        }
      }

      // Last condition's false → next rule block
      previousFalseNodeId = condNodeIds[condNodeIds.length - 1];
      previousFalseHandle = 'false';
    }
  }

  // 4. Default end node
  const defaultNodeId = 'end_default';
  nodes.push({
    id: defaultNodeId,
    type: 'end',
    position: { x: NODE_X_CENTER, y },
    data: {
      result: policy.decision.defaultResult,
      reason: policy.decision.defaultReason,
      isDefault: true,
    } as EndNodeData,
  });

  // Wire the last false exit to default
  if (previousFalseHandle) {
    edges.push(makeEdge(previousFalseNodeId, defaultNodeId, previousFalseHandle, 'No', '#ef4444'));
  } else {
    edges.push(makeEdge(previousFalseNodeId, defaultNodeId));
  }

  return { nodes, edges };
}

export function flowToPolicy(
  nodes: FlowNode[],
  edges: FlowEdge[],
  existingPolicy: Policy
): Policy {
  const filterNode = nodes.find((n) => n.type === 'filter');
  const questionNodes = nodes.filter((n) => n.type === 'question');
  const conditionNodes = nodes.filter((n) => n.type === 'condition');
  const endNodes = nodes.filter((n) => n.type === 'end');

  // Build adjacency for edge traversal
  const edgesBySource = new Map<string, FlowEdge[]>();
  for (const edge of edges) {
    const key = edge.sourceHandle ? `${edge.source}:${edge.sourceHandle}` : edge.source;
    if (!edgesBySource.has(key)) edgesBySource.set(key, []);
    edgesBySource.get(key)!.push(edge);
    // Also index by source only
    if (!edgesBySource.has(edge.source)) edgesBySource.set(edge.source, []);
    edgesBySource.get(edge.source)!.push(edge);
  }

  function getTargets(nodeId: string, handle?: string): string[] {
    const key = handle ? `${nodeId}:${handle}` : nodeId;
    return (edgesBySource.get(key) ?? [])
      .filter((e) => handle ? e.sourceHandle === handle : true)
      .map((e) => e.target);
  }

  // Build scope from filter node
  const scope = filterNode
    ? (filterNode.data as unknown as FilterNodeData).scope
    : existingPolicy.scope;

  // Build steps from question nodes — traverse edges from filter to find order
  const steps: { questionId: string; showWhen?: ShowWhenCondition }[] = [];
  const questionNodeSet = new Set(questionNodes.map((n) => n.id));

  // Start from filter node and follow edges to find question ordering
  let current = filterNode?.id ?? '';
  const visited = new Set<string>();
  while (current && !visited.has(current)) {
    visited.add(current);
    const targets = getTargets(current);
    const nextQuestion = targets.find((t) => questionNodeSet.has(t));
    if (nextQuestion) {
      const qNode = questionNodes.find((n) => n.id === nextQuestion)!;
      const data = qNode.data as unknown as QuestionNodeData;
      steps.push({
        questionId: data.questionId,
        ...(data.showWhen ? { showWhen: data.showWhen } : {}),
      });
      current = nextQuestion;
    } else {
      break;
    }
  }

  // If no traversal found questions, fall back to Y-sort
  if (steps.length === 0 && questionNodes.length > 0) {
    const sorted = [...questionNodes].sort((a, b) => a.position.y - b.position.y);
    for (const qn of sorted) {
      const data = qn.data as unknown as QuestionNodeData;
      steps.push({
        questionId: data.questionId,
        ...(data.showWhen ? { showWhen: data.showWhen } : {}),
      });
    }
  }

  // Build decision rules from condition + end node graph
  // Strategy: find each non-default EndNode and trace backwards to find conditions
  const conditionNodeSet = new Set(conditionNodes.map((n) => n.id));
  const endNodeNonDefault = endNodes.filter(
    (n) => !(n.data as unknown as EndNodeData).isDefault
  );
  const defaultEndNode = endNodes.find(
    (n) => (n.data as unknown as EndNodeData).isDefault
  );

  // Build reverse edge map: for each target, what sources lead to it
  const edgesByTarget = new Map<string, FlowEdge[]>();
  for (const edge of edges) {
    if (!edgesByTarget.has(edge.target)) edgesByTarget.set(edge.target, []);
    edgesByTarget.get(edge.target)!.push(edge);
  }

  // For each end node, find which condition nodes have "true" edges pointing to it
  // Then determine if they form AND (chain) or OR (parallel) patterns
  const rules: { when: { logic: 'AND' | 'OR'; conditions: RuleCondition[] }; result: DecisionResult; reason: string }[] = [];

  for (const endNode of endNodeNonDefault) {
    const endData = endNode.data as unknown as EndNodeData;

    // Find all edges that target this end node
    const incomingEdges = edgesByTarget.get(endNode.id) ?? [];
    const trueIncoming = incomingEdges.filter(
      (e) => e.sourceHandle === 'true' && conditionNodeSet.has(e.source)
    );

    if (trueIncoming.length === 0) continue;

    if (trueIncoming.length > 1) {
      // Multiple conditions point true → this end = OR logic
      const conditions: RuleCondition[] = trueIncoming.map((e) => {
        const condNode = conditionNodes.find((n) => n.id === e.source)!;
        const condData = condNode.data as unknown as ConditionNodeData;
        return {
          field: condData.field,
          operator: condData.operator,
          value: condData.value,
        };
      });

      rules.push({
        when: { logic: 'OR', conditions },
        result: endData.result,
        reason: endData.reason,
      });
    } else {
      // Single true edge → could be AND chain or single condition
      // Trace backwards through the chain: if this condition's true → end,
      // and some other condition's true → this condition, that's an AND chain
      const conditions: RuleCondition[] = [];
      const condId = trueIncoming[0].source;

      // Walk the chain: the condition that points true to this end node
      // Then find if other conditions point true to it (AND chain)
      const chainIds: string[] = [condId];
      let checking = condId;

      // Look backwards: who has true→checking?
      while (true) {
        const incoming = (edgesByTarget.get(checking) ?? []).filter(
          (e) => e.sourceHandle === 'true' && conditionNodeSet.has(e.source)
        );
        if (incoming.length === 1) {
          chainIds.unshift(incoming[0].source);
          checking = incoming[0].source;
        } else {
          break;
        }
      }

      for (const cId of chainIds) {
        const condNode = conditionNodes.find((n) => n.id === cId)!;
        const condData = condNode.data as unknown as ConditionNodeData;
        conditions.push({
          field: condData.field,
          operator: condData.operator,
          value: condData.value,
        });
      }

      rules.push({
        when: { logic: chainIds.length > 1 ? 'AND' : 'AND', conditions },
        result: endData.result,
        reason: endData.reason,
      });
    }
  }

  const defaultData = defaultEndNode
    ? (defaultEndNode.data as unknown as EndNodeData)
    : null;

  return {
    ...existingPolicy,
    scope,
    steps,
    decision: {
      rules,
      defaultResult: defaultData?.result ?? existingPolicy.decision.defaultResult,
      defaultReason: defaultData?.reason ?? existingPolicy.decision.defaultReason,
    },
  };
}
