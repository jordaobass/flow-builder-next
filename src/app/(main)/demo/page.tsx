'use client';

import { useEffect, useState } from 'react';
import { useQuestionStore } from '@/stores/question-store';
import { usePolicyStore } from '@/stores/policy-store';
import { ContextPicker } from '@/components/demo/context-picker';
import { FlowModal } from '@/components/demo/flow-modal';
import { ResultDisplay } from '@/components/demo/result-display';
import { pickPolicy } from '@/lib/policy-engine';
import { EvaluationContext, EvaluationResult } from '@/types/engine';
import { Policy } from '@/types/policy';

export default function DemoPage() {
  const { hydrate: hydrateQuestions, hydrated: questionsHydrated } =
    useQuestionStore();
  const {
    policies,
    hydrate: hydratePolicies,
    hydrated: policiesHydrated,
  } = usePolicyStore();

  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    hydrateQuestions();
    hydratePolicies();
  }, [hydrateQuestions, hydratePolicies]);

  const handleStart = (context: EvaluationContext) => {
    setError('');
    setResult(null);
    const policy = pickPolicy(context, policies);
    if (!policy) {
      setError(
        `No policy found matching context: ${JSON.stringify(context)}`
      );
      return;
    }
    setSelectedPolicy(policy);
    setModalOpen(true);
  };

  const handleDone = (evalResult: EvaluationResult) => {
    setResult(evalResult);
    setModalOpen(false);
  };

  const handleReset = () => {
    setResult(null);
    setSelectedPolicy(null);
    setError('');
  };

  if (!questionsHydrated || !policiesHydrated) return null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-700">Step 4</span>
          <h2 className="text-2xl font-bold">Demo</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your context values below. The engine will find the best matching policy
          and run its questionnaire. At the end you&apos;ll see the decision: <strong>ALLOW</strong>, <strong>BLOCK</strong>, or <strong>REVIEW</strong>.
        </p>
      </div>

      {result ? (
        <ResultDisplay result={result} onReset={handleReset} />
      ) : (
        <ContextPicker onStart={handleStart} />
      )}

      {error && (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm max-w-md">
          {error}
        </div>
      )}

      {selectedPolicy && (
        <FlowModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          policy={selectedPolicy}
          onDone={handleDone}
        />
      )}
    </div>
  );
}
