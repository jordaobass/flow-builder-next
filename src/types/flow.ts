import { Node, Edge } from '@xyflow/react';
import { ConditionOperator, DecisionResult, PolicyScope } from './policy';

export interface FilterNodeData {
  scope: PolicyScope;
  [key: string]: unknown;
}

export interface QuestionNodeData {
  questionId: string;
  showWhen?: {
    questionId: string;
    operator: ConditionOperator;
    value: string | number | boolean;
  };
  [key: string]: unknown;
}

export interface ConditionNodeData {
  field: string;
  operator: ConditionOperator;
  value: string | number | boolean;
  [key: string]: unknown;
}

export interface EndNodeData {
  result: DecisionResult;
  reason: string;
  isDefault?: boolean;
  [key: string]: unknown;
}

export type FilterNode = Node<FilterNodeData, 'filter'>;
export type QuestionNode = Node<QuestionNodeData, 'question'>;
export type ConditionNode = Node<ConditionNodeData, 'condition'>;
export type EndNode = Node<EndNodeData, 'end'>;

export type FlowNode = FilterNode | QuestionNode | ConditionNode | EndNode;
export type FlowEdge = Edge;
