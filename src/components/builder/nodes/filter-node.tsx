'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { FilterNodeData } from '@/types/flow';

export function FilterNodeComponent({ data }: NodeProps) {
  const nodeData = data as unknown as FilterNodeData;
  const { scope } = nodeData;
  const entries = Object.entries(scope).filter(([, v]) => v !== '' && v !== undefined);

  return (
    <div className="rounded-lg border-2 border-blue-400 bg-blue-50 px-4 py-3 min-w-[200px] shadow-sm">
      <div className="text-xs font-semibold text-blue-600 mb-1">FILTER</div>
      <div className="text-sm space-y-0.5">
        {entries.length === 0 ? (
          <div className="text-muted-foreground italic">No scope defined</div>
        ) : (
          entries.map(([key, value]) => (
            <div key={key}>
              <span className="text-muted-foreground">{key}:</span>{' '}
              <span className="font-medium">{String(value)}</span>
            </div>
          ))
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-400" />
    </div>
  );
}
