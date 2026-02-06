'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { QuestionNodeData } from '@/types/flow';
import { useQuestionStore } from '@/stores/question-store';

export function QuestionNodeComponent({ data }: NodeProps) {
  const nodeData = data as unknown as QuestionNodeData;
  const question = useQuestionStore((s) => s.getQuestion(nodeData.questionId));

  return (
    <div className="rounded-lg border bg-white px-4 py-3 min-w-[220px] shadow-sm">
      <Handle type="target" position={Position.Top} />
      <div className="text-xs font-semibold text-gray-500 mb-1">QUESTION</div>
      <div className="text-sm font-medium">
        {question?.label ?? nodeData.questionId}
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        Type: {question?.type ?? 'unknown'} | ID: {nodeData.questionId}
      </div>
      {nodeData.showWhen && (
        <div className="text-xs text-orange-600 mt-1">
          Show when: {nodeData.showWhen.questionId} {nodeData.showWhen.operator}{' '}
          {String(nodeData.showWhen.value)}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
