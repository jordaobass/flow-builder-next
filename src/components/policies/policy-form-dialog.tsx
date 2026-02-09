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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Policy } from '@/types/policy';
import { useParameterStore } from '@/stores/parameter-store';

interface PolicyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy?: Policy | null;
  onSave: (policy: Policy) => void;
}

export function PolicyFormDialog({
  open,
  onOpenChange,
  policy,
  onSave,
}: PolicyFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <PolicyFormContent
          key={policy?.id ?? '__new__'}
          policy={policy}
          onSave={onSave}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

const DEFAULT_DECISION_JSON = JSON.stringify(
  {
    rules: [],
    defaultResult: 'ALLOW',
    defaultReason: 'Default allow.',
  },
  null,
  2
);

function PolicyFormContent({
  policy,
  onSave,
  onOpenChange,
}: {
  policy?: Policy | null;
  onSave: (policy: Policy) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const parameters = useParameterStore((s) => s.parameters);

  const initialScopeValues = (() => {
    const sv: Record<string, string> = {};
    for (const p of parameters) {
      if (policy && p.key in policy.scope) {
        sv[p.key] = String(policy.scope[p.key] ?? '');
      }
    }
    return sv;
  })();

  const initialEnabledKeys = (() => {
    if (policy) {
      return new Set(Object.keys(policy.scope));
    }
    return new Set<string>();
  })();

  const [name, setName] = useState(policy?.name ?? '');
  const [key, setKey] = useState(policy?.key ?? '');
  const [scopeValues, setScopeValues] = useState<Record<string, string>>(initialScopeValues);
  const [enabledKeys, setEnabledKeys] = useState<Set<string>>(initialEnabledKeys);
  const [stepsJson, setStepsJson] = useState(
    policy ? JSON.stringify(policy.steps, null, 2) : '[]'
  );
  const [decisionJson, setDecisionJson] = useState(
    policy ? JSON.stringify(policy.decision, null, 2) : DEFAULT_DECISION_JSON
  );
  const [error, setError] = useState('');

  const isEditing = !!policy;

  const toggleScopeKey = (paramKey: string, enabled: boolean) => {
    setEnabledKeys((prev) => {
      const next = new Set(prev);
      if (enabled) {
        next.add(paramKey);
        if (!(paramKey in scopeValues)) {
          setScopeValues((sv) => ({ ...sv, [paramKey]: '' }));
        }
      } else {
        next.delete(paramKey);
      }
      return next;
    });
  };

  const handleSave = () => {
    try {
      const steps = JSON.parse(stepsJson);
      const decision = JSON.parse(decisionJson);

      const scope: Record<string, string | number | boolean> = {};
      for (const k of enabledKeys) {
        const v = scopeValues[k] ?? '';
        if (v.trim()) {
          scope[k] = v.trim();
        }
      }

      const p: Policy = {
        id: policy?.id ?? `pol_${Date.now()}`,
        key: key.trim(),
        name: name.trim(),
        scope,
        steps,
        decision,
      };
      onSave(p);
      onOpenChange(false);
    } catch {
      setError('Invalid JSON in steps or decision fields.');
    }
  };

  const isValid = name.trim() && key.trim();

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'Edit Policy' : 'New Policy'}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Policy" />
          </div>
          <div className="space-y-2">
            <Label>Key</Label>
            <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="my-policy" />
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold">Scope Parameters</Label>
          <p className="text-xs text-muted-foreground mt-0.5 mb-2">Select which parameters are part of this policy&apos;s scope:</p>
          <div className="space-y-2">
            {parameters.map((p) => {
              const isEnabled = enabledKeys.has(p.key);
              return (
                <div key={p.key} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`scope-param-${p.key}`}
                      checked={isEnabled}
                      onCheckedChange={(checked) => toggleScopeKey(p.key, !!checked)}
                    />
                    <Label htmlFor={`scope-param-${p.key}`} className="text-sm cursor-pointer">
                      {p.name} <span className="text-muted-foreground text-xs">({p.key})</span>
                    </Label>
                  </div>
                  {isEnabled && (
                    <Input
                      className="ml-6"
                      value={scopeValues[p.key] ?? ''}
                      onChange={(e) =>
                        setScopeValues((prev) => ({ ...prev, [p.key]: e.target.value }))
                      }
                      placeholder={`Value for ${p.key}...`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Steps (JSON)</Label>
          <Textarea
            value={stepsJson}
            onChange={(e) => setStepsJson(e.target.value)}
            rows={4}
            className="font-mono text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label>Decision (JSON)</Label>
          <Textarea
            value={decisionJson}
            onChange={(e) => setDecisionJson(e.target.value)}
            rows={8}
            className="font-mono text-xs"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </>
  );
}
