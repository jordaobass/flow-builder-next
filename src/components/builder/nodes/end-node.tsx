'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { EndNodeData } from '@/types/flow';
import { cn } from '@/lib/utils';

const RESULT_STYLES: Record<string, string> = {
  ALLOW: 'border-green-400 bg-green-50',
  BLOCK: 'border-red-400 bg-red-50',
  REVIEW: 'border-amber-400 bg-amber-50',
};

const RESULT_LABEL_STYLES: Record<string, string> = {
  ALLOW: 'text-green-600',
  BLOCK: 'text-red-600',
  REVIEW: 'text-amber-600',
};

export function EndNodeComponent({ data }: NodeProps) {
  const nodeData = data as unknown as EndNodeData;
  const { result, reason, isDefault } = nodeData;

  return (
    <div
      className={cn(
        'rounded-lg border-2 px-4 py-3 min-w-[200px] shadow-sm',
        RESULT_STYLES[result] ?? 'border-gray-400 bg-gray-50'
      )}
    >
      <Handle type="target" position={Position.Top} />
      <div
        className={cn(
          'text-xs font-semibold mb-1',
          RESULT_LABEL_STYLES[result] ?? 'text-gray-600'
        )}
      >
        {isDefault ? 'DEFAULT' : 'END'} — {result}
      </div>
      <div className="text-sm">{reason}</div>
    </div>
  );
}
