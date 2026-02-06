'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Policy } from '@/types/policy';
import { useParameterStore } from '@/stores/parameter-store';

interface DuplicateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: Policy;
  onDuplicate: (scopeOverrides: Record<string, string>) => void;
}

export function DuplicateDialog({
  open,
  onOpenChange,
  policy,
  onDuplicate,
}: DuplicateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DuplicateDialogContent
          key={`${policy.id}_${open}`}
          policy={policy}
          onDuplicate={onDuplicate}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

function DuplicateDialogContent({
  policy,
  onDuplicate,
  onOpenChange,
}: {
  policy: Policy;
  onDuplicate: (scopeOverrides: Record<string, string>) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const parameters = useParameterStore((s) => s.parameters);

  const initialOverrides = (() => {
    const init: Record<string, string> = {};
    for (const p of parameters) {
      init[p.key] = String(policy.scope[p.key] ?? '');
    }
    return init;
  })();

  const [overrides, setOverrides] = useState<Record<string, string>>(initialOverrides);

  const handleDuplicate = () => {
    const cleaned: Record<string, string> = {};
    for (const [k, v] of Object.entries(overrides)) {
      if (v.trim()) cleaned[k] = v.trim();
    }
    onDuplicate(cleaned);
    onOpenChange(false);
  };

  const hasChange = Object.entries(overrides).some(
    ([k, v]) => v.trim() !== String(policy.scope[k] ?? '')
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle>Duplicate Policy</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">
        Create a copy of <strong>{policy.name}</strong> with different scope values.
      </p>
      <div className="space-y-3">
        {parameters.map((p) => (
          <div key={p.key} className="space-y-1">
            <Label>{p.name}</Label>
            <Input
              value={overrides[p.key] ?? ''}
              onChange={(e) =>
                setOverrides((prev) => ({ ...prev, [p.key]: e.target.value }))
              }
              placeholder={p.key}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleDuplicate} disabled={!hasChange}>
          Duplicate
        </Button>
      </div>
    </>
  );
}
