'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EvaluationContext } from '@/types/engine';
import { Policy } from '@/types/policy';
import { useParameterStore } from '@/stores/parameter-store';
import { usePolicyStore } from '@/stores/policy-store';
import { Play, ArrowLeft } from 'lucide-react';

interface ContextPickerProps {
  onStart: (context: EvaluationContext) => void;
}

export function ContextPicker({ onStart }: ContextPickerProps) {
  const { parameters, hydrated, hydrate } = useParameterStore();
  const { policies } = usePolicyStore();
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [policyKey, setPolicyKey] = useState('');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleSelectPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setPolicyKey(policy.key);
    // Pre-fill scope values from the policy
    const prefilled: Record<string, string> = {};
    for (const p of parameters) {
      const scopeVal = policy.scope[p.key];
      prefilled[p.key] = scopeVal !== undefined ? String(scopeVal) : '';
    }
    setValues(prefilled);
  };

  const handleBack = () => {
    setSelectedPolicy(null);
    setValues({});
    setPolicyKey('');
  };

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

  // Step 2: Show context form for selected policy
  if (selectedPolicy) {
    return (
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="size-7" onClick={handleBack}>
              <ArrowLeft className="size-4" />
            </Button>
            <CardTitle className="text-lg">{selectedPolicy.name}</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Context pre-filled from policy scope. Adjust if needed.
          </p>
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
              placeholder="e.g. uber-release"
            />
          </div>
          <Button onClick={handleStart} className="w-full gap-2">
            <Play className="size-4" />
            Start Questionnaire
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Step 1: Show all policies as selectable demo cards
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select a policy to run its demo questionnaire:
      </p>
      {policies.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No policies found. Create one in the Policies page first.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {policies.map((policy) => {
            const scopeEntries = Object.entries(policy.scope).filter(
              ([, v]) => v !== '' && v !== undefined
            );
            return (
              <Card
                key={policy.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 group"
                onClick={() => handleSelectPolicy(policy)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm leading-snug">
                      {policy.name}
                    </CardTitle>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {policy.key}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Scope tags */}
                  {scopeEntries.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {scopeEntries.map(([key, val]) => (
                        <span
                          key={key}
                          className="inline-flex items-center gap-1 text-xs bg-muted px-1.5 py-0.5 rounded"
                        >
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-medium">{String(val)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Steps count + rules count */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{policy.steps.length} steps</span>
                    <span>{policy.decision.rules.length} rules</span>
                  </div>
                  {/* Run button */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-1.5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    <Play className="size-3" />
                    Run Demo
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
