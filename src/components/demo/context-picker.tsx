'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EvaluationContext } from '@/types/engine';
import { useParameterStore } from '@/stores/parameter-store';

interface ContextPickerProps {
  onStart: (context: EvaluationContext) => void;
}

const DEFAULT_VALUES: Record<string, string> = {
  country: 'BR',
  state: 'SP',
  companyId: 'EMP_X',
};

export function ContextPicker({ onStart }: ContextPickerProps) {
  const { parameters, hydrated, hydrate } = useParameterStore();
  const [policyKey, setPolicyKey] = useState('uber-release');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const initialValues = useMemo(() => {
    if (!hydrated || parameters.length === 0) return {};
    const initial: Record<string, string> = {};
    for (const p of parameters) {
      initial[p.key] = DEFAULT_VALUES[p.key] ?? '';
    }
    return initial;
  }, [hydrated, parameters]);

  const [values, setValues] = useState<Record<string, string>>({});

  // Sync values when initialValues changes (after hydration)
  const [prevInitial, setPrevInitial] = useState(initialValues);
  if (prevInitial !== initialValues) {
    setPrevInitial(initialValues);
    setValues(initialValues);
  }

  const handleStart = () => {
    const scope: Record<string, string | number | boolean> = {};
    for (const [key, val] of Object.entries(values)) {
      if (val.trim()) {
        scope[key] = val.trim();
      }
    }
    onStart({
      scope,
      ...(policyKey.trim() ? { policyKey: policyKey.trim() } : {}),
    });
  };

  if (!hydrated) return null;

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Run Policy Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {parameters.map((p) => (
            <div key={p.key} className="space-y-2">
              <Label>{p.name}</Label>
              <Input
                value={values[p.key] ?? ''}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [p.key]: e.target.value }))
                }
                placeholder={p.key}
              />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Label>Policy Key</Label>
          <Input
            value={policyKey}
            onChange={(e) => setPolicyKey(e.target.value)}
            placeholder="uber-release"
          />
        </div>
        <Button onClick={handleStart} className="w-full">
          Start Questionnaire
        </Button>
      </CardContent>
    </Card>
  );
}
