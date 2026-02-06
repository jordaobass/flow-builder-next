'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { ConditionNodeData } from '@/types/flow';
import { useQuestionStore } from '@/stores/question-store';

const OPERATOR_LABELS: Record<string, string> = {
  eq: '=',
  neq: '!=',
  gt: '>',
  lt: '<',
  gte: '>=',
  lte: '<=',
  contains: 'contains',
};

export function ConditionNodeComponent({ data }: NodeProps) {
  const nodeData = data as unknown as ConditionNodeData;
  const { field, operator, value } = nodeData;

  // Try to resolve field to a question label
  const questionId = field.replace(/^\$answers\./, '');
  const question = useQuestionStore((s) => s.getQuestion(questionId));
  const fieldLabel = question?.label ?? questionId;

  return (
    <div className="rounded-lg border-2 border-purple-400 bg-purple-50 px-4 py-3 min-w-[220px] shadow-sm">
      <Handle type="target" position={Position.Top} className="!bg-purple-400" />
      <div className="text-xs font-semibold text-purple-600 mb-1">CONDITION</div>
      <div className="text-sm font-medium">
        {fieldLabel} {OPERATOR_LABELS[operator] ?? operator} {String(value)}
      </div>
      <div className="flex justify-between mt-2 text-xs">
        <span className="text-green-600 font-medium">True</span>
        <span className="text-red-600 font-medium">False</span>
      </div>
      <Handle
        type="source"
        position={Position.Left}
        id="true"
        className="!bg-green-500"
        style={{ top: '85%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="!bg-red-500"
        style={{ top: '85%' }}
      />
    </div>
  );
}
